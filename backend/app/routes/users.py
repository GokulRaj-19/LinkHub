"""User profile management API blueprint."""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.user import User
from app.utils.audit import log_audit
from app.utils.decorators import get_authenticated_user
from app.utils.helpers import error_response

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user_profile():
    """Fetch profile of authenticated user."""
    user = get_authenticated_user()
    if not user:
        return error_response("User not found or inactive.", 404)
    return jsonify(user.to_dict())


@users_bp.route("/me", methods=["PATCH"])
@jwt_required()
def update_profile():
    """Update user full name, email, or password."""
    user = get_authenticated_user()
    if not user:
        return error_response("User not found or inactive.", 404)

    data = request.get_json() or {}
    if "full_name" in data and data["full_name"]:
        user.full_name = data["full_name"].strip()

    if "email" in data and data["email"]:
        new_email = data["email"].strip().lower()
        if new_email != user.email:
            if User.query.filter_by(email=new_email).first():
                return error_response("An account with this email already exists.", 409)
            user.email = new_email

    if "password" in data and data["password"]:
        user.set_password(data["password"])

    db.session.commit()
    log_audit(user.id, "UPDATE_PROFILE", "USER", user.id)
    return jsonify(user.to_dict())


@users_bp.route("/me/theme", methods=["PATCH"])
@jwt_required()
def update_theme():
    """Update selected interface theme token."""
    user = get_authenticated_user()
    if not user:
        return error_response("User not found or inactive.", 404)

    data = request.get_json() or {}
    theme = (data.get("theme") or "").strip().lower()
    valid_themes = {"sketch", "brand", "dark", "hc"}
    if theme not in valid_themes:
        return error_response(f"Invalid theme. Must be one of: {', '.join(valid_themes)}", 400)

    user.theme = theme
    db.session.commit()
    log_audit(user.id, "UPDATE_THEME", "USER", user.id, {"theme": theme})
    return jsonify({"theme": user.theme, "user": user.to_dict()})
