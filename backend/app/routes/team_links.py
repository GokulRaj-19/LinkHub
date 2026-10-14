"""Team workspace shared links API blueprint."""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.saved_link import SavedLink
from app.models.team import Team, TeamMembership
from app.models.team_link import TeamLink
from app.utils.audit import log_audit
from app.utils.decorators import get_authenticated_user
from app.utils.helpers import error_response, normalize_url

team_links_bp = Blueprint("team_links", __name__, url_prefix="/api/teams")


@team_links_bp.route("/<int:team_id>/links", methods=["GET"])
@jwt_required()
def get_team_links(team_id: int):
    """List shared links within a team workspace."""
    user = get_authenticated_user()
    team = db.session.get(Team, team_id)
    if not team:
        return error_response("Team not found.", 404)

    is_member = TeamMembership.query.filter_by(team_id=team.id, user_id=user.id).first()
    if not is_member and user.role != "admin":
        return error_response("Forbidden: You are not a member of this team.", 403)

    links = TeamLink.query.filter_by(team_id=team.id, is_deleted=False).order_by(
        TeamLink.created_at.desc()
    ).all()
    return jsonify([l.to_dict() for l in links])


@team_links_bp.route("/<int:team_id>/links", methods=["POST"])
@jwt_required()
def create_team_link(team_id: int):
    """Share a link to the team space."""
    user = get_authenticated_user()
    team = db.session.get(Team, team_id)
    if not team:
        return error_response("Team not found.", 404)

    is_member = TeamMembership.query.filter_by(team_id=team.id, user_id=user.id).first()
    if not is_member and user.role != "admin":
        return error_response("Forbidden: You are not a member of this team.", 403)

    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    raw_url = (data.get("url") or "").strip()
    category_id = data.get("category_id") or data.get("categoryId")

    if not title or not raw_url:
        return error_response("Title and URL are required.", 400)

    norm_url = normalize_url(raw_url)
    link = TeamLink(
        team_id=team.id,
        category_id=int(category_id) if category_id else None,
        added_by=user.id,
        title=title,
        url=norm_url,
    )
    db.session.add(link)
    db.session.commit()
    log_audit(user.id, "CREATE_TEAM_LINK", "TEAM_LINK", link.id, {"title": title, "team_id": team.id})
    return jsonify(link.to_dict()), 201


@team_links_bp.route("/links/<int:link_id>/copy", methods=["POST"])
@jwt_required()
def copy_to_my_links(link_id: int):
    """Copy a shared team link into current user's personal vault."""
    user = get_authenticated_user()
    t_link = db.session.get(TeamLink, link_id)
    if not t_link or t_link.is_deleted:
        return error_response("Team link not found.", 404)

    # Check if already exists in user's personal vault
    existing = SavedLink.query.filter_by(
        user_id=user.id, url=t_link.url, is_deleted=False
    ).first()
    if existing:
        return jsonify({"alreadySaved": True, "link": existing.to_dict()}), 200

    personal_link = SavedLink(
        user_id=user.id,
        category_id=None,
        title=t_link.title,
        url=t_link.url,
        note="Saved from team workspace",
        tag="team",
        source_link_id=t_link.id,
    )
    db.session.add(personal_link)
    db.session.commit()
    return jsonify({"alreadySaved": False, "link": personal_link.to_dict()}), 201
