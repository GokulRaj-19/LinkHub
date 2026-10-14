"""Authentication API blueprint."""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    set_access_cookies,
    unset_jwt_cookies,
)
from app.extensions import db
from app.models.category import Category
from app.models.team import TeamInvite, TeamMembership
from app.models.user import User
from app.utils.audit import log_audit
from app.utils.decorators import get_authenticated_user
from app.utils.helpers import error_response

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user account."""
    data = request.get_json() or {}
    full_name = (data.get("full_name") or data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    theme = (data.get("theme") or "sketch").strip()

    if not full_name or not email or not password:
        return error_response("Full name, email, and password are required.", 400)

    if User.query.filter_by(email=email).first():
        return error_response("An account with this email already exists.", 409)

    user = User(
        full_name=full_name,
        email=email,
        theme=theme,
        role="user",
        is_active=True,
    )
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    # Create starter categories for personal vault
    work_cat = Category(user_id=user.id, name="Work", color="#7048E0")
    learn_cat = Category(user_id=user.id, name="Learning", color="#28A8E0")
    db.session.add_all([work_cat, learn_cat])

    # Auto-accept pending team invitations for this email
    pending_invites = TeamInvite.query.filter_by(email=email, status="pending").all()
    for invite in pending_invites:
        invite.status = "accepted"
        membership = TeamMembership(team_id=invite.team_id, user_id=user.id, role="member")
        db.session.add(membership)

    db.session.commit()

    token = create_access_token(identity=str(user.id))
    log_audit(user.id, "REGISTER", "USER", user.id, {"email": user.email})

    resp = jsonify({
        "message": "Registration successful.",
        "user": user.to_dict(),
        "token": token,
    })
    set_access_cookies(resp, token)
    return resp, 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate existing user credentials."""
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return error_response("Email and password are required.", 400)

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return error_response("Invalid email or password.", 401)

    if not user.is_active:
        return error_response("Account is inactive. Please contact support.", 403)

    token = create_access_token(identity=str(user.id))
    log_audit(user.id, "LOGIN", "USER", user.id, {"email": user.email})

    resp = jsonify({
        "message": "Login successful.",
        "user": user.to_dict(),
        "token": token,
    })
    set_access_cookies(resp, token)
    return resp, 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required(optional=True)
def logout():
    """Clear session authentication cookies."""
    user = get_authenticated_user()
    if user:
        log_audit(user.id, "LOGOUT", "USER", user.id)

    resp = jsonify({"message": "Successfully logged out.", "success": True})
    unset_jwt_cookies(resp)
    return resp, 200
