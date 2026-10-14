"""Personal link vault API blueprint."""
from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from sqlalchemy import or_
from app.extensions import db
from app.models.saved_link import SavedLink
from app.utils.audit import log_audit
from app.utils.decorators import get_authenticated_user
from app.utils.helpers import error_response, normalize_url

links_bp = Blueprint("links", __name__, url_prefix="/api/links")


@links_bp.route("", methods=["GET"])
@jwt_required()
def get_links():
    """Retrieve personal vault links with search, filtering, and sorting."""
    user = get_authenticated_user()
    if not user:
        return error_response("Unauthorized.", 401)

    search = request.args.get("search", "").strip()
    category_id = request.args.get("category_id") or request.args.get("categoryId")
    tag = request.args.get("tag", "").strip()
    starred = request.args.get("starred", "").lower() in ("true", "1")
    sort_by = request.args.get("sort", "newest").strip().lower()

    query = SavedLink.query.filter_by(user_id=user.id, is_deleted=False)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                SavedLink.title.ilike(pattern),
                SavedLink.url.ilike(pattern),
                SavedLink.tag.ilike(pattern),
                SavedLink.note.ilike(pattern),
            )
        )
    if category_id:
        query = query.filter_by(category_id=int(category_id))
    if tag:
        query = query.filter(SavedLink.tag.ilike(f"%{tag}%"))
    if starred:
        query = query.filter_by(is_starred=True)

    links = query.all()

    # Rule: Pinned links sort first (most recently pinned first)
    pinned = [l.to_dict() for l in links if l.is_pinned]
    pinned.sort(key=lambda x: x.get("pinned_at") or "", reverse=True)

    unpinned = [l.to_dict() for l in links if not l.is_pinned]
    if sort_by == "title":
        unpinned.sort(key=lambda x: x.get("title", "").lower())
    elif sort_by in ("clicks", "most_clicked"):
        unpinned.sort(key=lambda x: x.get("click_count", 0), reverse=True)
    else:
        unpinned.sort(key=lambda x: x.get("created_at") or "", reverse=True)

    return jsonify({"pinned": pinned, "unpinned": unpinned, "all": pinned + unpinned})


@links_bp.route("", methods=["POST"])
@jwt_required()
def create_link():
    """Create a new bookmark in the user's personal vault."""
    user = get_authenticated_user()
    if not user:
        return error_response("Unauthorized.", 401)

    data = request.get_json() or {}
    raw_url = data.get("url", "")
    title = (data.get("title") or "").strip()
    if not raw_url or not title:
        return error_response("URL and title are required.", 400)

    norm_url = normalize_url(raw_url)
    existing = SavedLink.query.filter_by(
        user_id=user.id, url=norm_url, is_deleted=False
    ).first()
    if existing:
        return error_response("This URL already exists in your vault.", 409)

    is_pinned = bool(data.get("is_pinned", False))
    now = datetime.now(timezone.utc)
    link = SavedLink(
        user_id=user.id,
        category_id=int(data["category_id"]) if data.get("category_id") else None,
        title=title,
        url=norm_url,
        note=(data.get("note") or "").strip(),
        tag=(data.get("tag") or "").strip(),
        is_starred=bool(data.get("is_starred", False)),
        is_pinned=is_pinned,
        pinned_at=now if is_pinned else None,
        source_link_id=data.get("source_link_id"),
    )
    db.session.add(link)
    db.session.commit()
    log_audit(user.id, "CREATE_LINK", "LINK", link.id, {"title": link.title})
    return jsonify(link.to_dict()), 201


@links_bp.route("/<int:link_id>", methods=["PATCH", "PUT"])
@jwt_required()
def update_link(link_id: int):
    """Update bookmark properties in personal vault."""
    user = get_authenticated_user()
    link = SavedLink.query.filter_by(id=link_id, user_id=user.id, is_deleted=False).first()
    if not link:
        return error_response("Link not found.", 404)

    data = request.get_json() or {}
    if "url" in data and data["url"]:
        norm_url = normalize_url(data["url"])
        dup = SavedLink.query.filter(
            SavedLink.id != link.id,
            SavedLink.user_id == user.id,
            SavedLink.url == norm_url,
            SavedLink.is_deleted == False,
        ).first()
        if dup:
            return error_response("This URL already exists in your vault.", 409)
        link.url = norm_url

    if "title" in data:
        link.title = data["title"].strip()
    if "note" in data:
        link.note = (data["note"] or "").strip()
    if "tag" in data:
        link.tag = (data["tag"] or "").strip()
    if "category_id" in data:
        link.category_id = int(data["category_id"]) if data["category_id"] else None
    if "is_starred" in data:
        link.is_starred = bool(data["is_starred"])
    if "is_pinned" in data:
        new_pinned = bool(data["is_pinned"])
        if new_pinned and not link.is_pinned:
            link.pinned_at = datetime.now(timezone.utc)
        elif not new_pinned:
            link.pinned_at = None
        link.is_pinned = new_pinned

    db.session.commit()
    return jsonify(link.to_dict())


@links_bp.route("/<int:link_id>", methods=["DELETE"])
@jwt_required()
def delete_link(link_id: int):
    """Soft delete bookmark from vault."""
    user = get_authenticated_user()
    link = SavedLink.query.filter_by(id=link_id, user_id=user.id).first()
    if not link:
        return error_response("Link not found.", 404)

    link.is_deleted = True
    db.session.commit()
    log_audit(user.id, "DELETE_LINK", "LINK", link.id)
    return jsonify({"success": True, "message": "Link deleted successfully."})


@links_bp.route("/<int:link_id>/star", methods=["PATCH"])
@jwt_required()
def toggle_star(link_id: int):
    """Toggle star status on a link."""
    user = get_authenticated_user()
    link = SavedLink.query.filter_by(id=link_id, user_id=user.id, is_deleted=False).first()
    if not link:
        return error_response("Link not found.", 404)

    link.is_starred = not link.is_starred
    db.session.commit()
    return jsonify(link.to_dict())


@links_bp.route("/<int:link_id>/pin", methods=["PATCH"])
@jwt_required()
def toggle_pin(link_id: int):
    """Toggle pin status on a link."""
    user = get_authenticated_user()
    link = SavedLink.query.filter_by(id=link_id, user_id=user.id, is_deleted=False).first()
    if not link:
        return error_response("Link not found.", 404)

    link.is_pinned = not link.is_pinned
    link.pinned_at = datetime.now(timezone.utc) if link.is_pinned else None
    db.session.commit()
    return jsonify(link.to_dict())


@links_bp.route("/<int:link_id>/click", methods=["POST"])
@jwt_required()
def track_click(link_id: int):
    """Increment click counter for opened link."""
    user = get_authenticated_user()
    link = SavedLink.query.filter_by(id=link_id, user_id=user.id, is_deleted=False).first()
    if not link:
        return error_response("Link not found.", 404)

    link.click_count += 1
    db.session.commit()
    return jsonify({"click_count": link.click_count, "link": link.to_dict()})
