"""Team member management API blueprint."""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.task import Task
from app.models.team import Team, TeamInvite, TeamMembership
from app.models.user import User
from app.utils.audit import log_audit
from app.utils.decorators import get_authenticated_user
from app.utils.helpers import error_response

team_members_bp = Blueprint("team_members", __name__, url_prefix="/api/teams")


@team_members_bp.route("/<int:team_id>/members", methods=["POST"])
@jwt_required()
def add_member_by_email(team_id: int):
    """Add member by email or store invitation record (leader only)."""
    user = get_authenticated_user()
    team = db.session.get(Team, team_id)
    if not team or (team.lead_id != user.id and user.role != "admin"):
        return error_response("Only the squad leader can add members.", 403)

    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return error_response("Valid email address is required.", 400)

    target_user = User.query.filter_by(email=email).first()
    if target_user:
        if TeamMembership.query.filter_by(team_id=team.id, user_id=target_user.id).first():
            return error_response("User is already a member of the squad.", 409)

        membership = TeamMembership(team_id=team.id, user_id=target_user.id, role="member")
        db.session.add(membership)
        db.session.commit()
        log_audit(user.id, "ADD_MEMBER", "TEAM", team.id, {"email": email, "user_id": target_user.id})
        return jsonify({"status": "added", "user": target_user.to_dict()}), 201

    invite = TeamInvite.query.filter_by(team_id=team.id, email=email).first()
    if not invite:
        invite = TeamInvite(team_id=team.id, email=email, status="pending")
        db.session.add(invite)
    else:
        invite.status = "pending"

    db.session.commit()
    log_audit(user.id, "INVITE_MEMBER", "TEAM", team.id, {"email": email})
    return jsonify({"status": "invited", "message": f"Invitation queued for {email}."}), 202


@team_members_bp.route("/<int:team_id>/members/<int:target_user_id>", methods=["DELETE"])
@jwt_required()
def remove_member(team_id: int, target_user_id: int):
    """Remove member and unassign open tasks (leader only)."""
    user = get_authenticated_user()
    team = db.session.get(Team, team_id)
    if not team or (team.lead_id != user.id and user.role != "admin"):
        return error_response("Only the squad leader can remove members.", 403)

    if team.lead_id == target_user_id:
        return error_response("A team leader cannot leave until leadership is transferred.", 400)

    membership = TeamMembership.query.filter_by(team_id=team.id, user_id=target_user_id).first()
    if not membership:
        return error_response("Member not found in this squad.", 404)

    open_tasks = Task.query.filter(
        Task.team_id == team.id,
        Task.assigned_to == target_user_id,
        Task.status != "done",
    ).all()
    for t in open_tasks:
        t.assigned_to = None
        t.unassigned_flag = True

    db.session.delete(membership)
    db.session.commit()
    log_audit(user.id, "REMOVE_MEMBER", "TEAM", team.id, {"removed_user_id": target_user_id})
    return jsonify({"success": True, "message": "Member removed successfully."})
