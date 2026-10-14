"""Categories API blueprint."""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.category import Category
from app.models.saved_link import SavedLink
from app.models.team import Team
from app.utils.audit import log_audit
from app.utils.decorators import get_authenticated_user
from app.utils.helpers import error_response

categories_bp = Blueprint("categories", __name__, url_prefix="/api/categories")


@categories_bp.route("", methods=["GET"])
@jwt_required()
def get_categories():
    """List categories for user or team workspace."""
    user = get_authenticated_user()
    if not user:
        return error_response("Unauthorized.", 401)

    team_id = request.args.get("team_id") or request.args.get("teamId")
    if team_id:
        categories = Category.query.filter_by(team_id=int(team_id)).all()
    else:
        categories = Category.query.filter_by(user_id=user.id).all()

    return jsonify([c.to_dict() for c in categories])


@categories_bp.route("", methods=["POST"])
@jwt_required()
def create_category():
    """Create a new personal or team-scoped category."""
    user = get_authenticated_user()
    if not user:
        return error_response("Unauthorized.", 401)

    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    color = (data.get("color") or "#7048E0").strip()
    team_id = data.get("team_id") or data.get("teamId")

    if not name:
        return error_response("Category name is required.", 400)

    if team_id:
        team = db.session.get(Team, int(team_id))
        if not team:
            return error_response("Team not found.", 404)
        if team.lead_id != user.id and user.role != "admin":
            return error_response("Only team leaders can create team categories.", 403)
        dup = Category.query.filter_by(team_id=int(team_id), name=name).first()
    else:
        dup = Category.query.filter_by(user_id=user.id, name=name).first()

    if dup:
        return error_response(f'Category "{name}" already exists.', 409)

    category = Category(
        user_id=None if team_id else user.id,
        team_id=int(team_id) if team_id else None,
        name=name,
        color=color,
    )
    db.session.add(category)
    db.session.commit()
    log_audit(user.id, "CREATE_CATEGORY", "CATEGORY", category.id, {"name": name})
    return jsonify(category.to_dict()), 201


@categories_bp.route("/<int:cat_id>", methods=["PATCH"])
@jwt_required()
def update_category(cat_id: int):
    """Rename or update color of a category."""
    user = get_authenticated_user()
    category = db.session.get(Category, cat_id)
    if not category:
        return error_response("Category not found.", 404)

    if category.team_id:
        team = db.session.get(Team, category.team_id)
        if not team or (team.lead_id != user.id and user.role != "admin"):
            return error_response("Only the team leader can modify this category.", 403)
    elif category.user_id != user.id and user.role != "admin":
        return error_response("You do not have permission to modify this category.", 403)

    data = request.get_json() or {}
    if "name" in data and data["name"]:
        clean_name = data["name"].strip()
        if category.team_id:
            dup = Category.query.filter(
                Category.id != cat_id,
                Category.team_id == category.team_id,
                Category.name == clean_name,
            ).first()
        else:
            dup = Category.query.filter(
                Category.id != cat_id,
                Category.user_id == user.id,
                Category.name == clean_name,
            ).first()
        if dup:
            return error_response(f'Category "{clean_name}" already exists.', 409)
        category.name = clean_name

    if "color" in data and data["color"]:
        category.color = data["color"].strip()

    db.session.commit()
    return jsonify(category.to_dict())


@categories_bp.route("/<int:cat_id>", methods=["DELETE"])
@jwt_required()
def delete_category(cat_id: int):
    """Delete category, enforcing link relocation if dependent links exist."""
    user = get_authenticated_user()
    category = db.session.get(Category, cat_id)
    if not category:
        return error_response("Category not found.", 404)

    if category.user_id and category.user_id != user.id and user.role != "admin":
        return error_response("Unauthorized to delete this category.", 403)

    dependent_links = SavedLink.query.filter_by(
        category_id=cat_id, is_deleted=False
    ).all()
    data = request.get_json(silent=True) or {}
    move_to_id = request.args.get("move_to") or data.get("move_to") or data.get("moveToCategoryId")

    if dependent_links and not move_to_id:
        count = len(dependent_links)
        return jsonify({
            "error": True,
            "hasDependentLinks": True,
            "linkCount": count,
            "message": (
                f"Cannot delete: {count} link(s) belong to this category. "
                "Select a replacement category to move them first."
            ),
        }), 400

    if move_to_id:
        target_cat = db.session.get(Category, int(move_to_id))
        if not target_cat:
            return error_response("Target replacement category not found.", 404)
        SavedLink.query.filter_by(category_id=cat_id).update(
            {"category_id": target_cat.id}, synchronize_session="fetch"
        )
        db.session.commit()

    db.session.delete(category)
    db.session.commit()
    log_audit(user.id, "DELETE_CATEGORY", "CATEGORY", cat_id)
    return jsonify({"success": True, "message": "Category deleted successfully."})
