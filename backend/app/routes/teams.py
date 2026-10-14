"""Team and squad management API blueprint."""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.team import Team, TeamMembership
from app.models.user import User
from app.utils.audit import log_audit
from app.utils.decorators import get_authenticated_user
from app.utils.helpers import error_response, generate_team_code
from app.utils.rate_limit import (
    check_join_rate_limit,
    record_failed_join,
    reset_failed_joins,
)

teams_bp = Blueprint("teams", __name__, url_prefix="/api/teams")


@teams_bp.route("", methods=["POST"])
@jwt_required()
def create_team():
    """Create team, assign creator as leader, and generate 8-char join code."""
    user = get_authenticated_user()
    if not user:
        return error_response("Unauthorized.", 401)

    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip()
    if not name:
        return error_response("Team name is required.", 400)

    code = generate_team_code()
    while Team.query.filter_by(team_code=code).first():
        code = generate_team_code()

    team = Team(
        name=name,
        description=description,
        lead_id=user.id,
        team_code=code,
        code_active=True,
    )
    db.session.add(team)
    db.session.flush()

    membership = TeamMembership(team_id=team.id, user_id=user.id, role="lead")
    db.session.add(membership)
    db.session.commit()

    log_audit(user.id, "CREATE_TEAM", "TEAM", team.id, {"name": team.name})
    return jsonify(team.to_dict()), 201


@teams_bp.route("/mine", methods=["GET"])
@jwt_required()
def get_my_teams():
    """List all teams the current user belongs to or leads."""
    user = get_authenticated_user()
    if not user:
        return error_response("Unauthorized.", 401)

    memberships = TeamMembership.query.filter_by(user_id=user.id).all()
    team_ids = [m.team_id for m in memberships]
    teams = Team.query.filter(Team.id.in_(team_ids)).all() if team_ids else []

    res = []
    for team in teams:
        mem = next((m for m in memberships if m.team_id == team.id), None)
        count = TeamMembership.query.filter_by(team_id=team.id).count()
        leader = db.session.get(User, team.lead_id)
        data = team.to_dict()
        data["my_role"] = mem.role if mem else "member"
        data["lead_name"] = leader.full_name if leader else "Unknown"
        data["member_count"] = count
        res.append(data)

    return jsonify(res)


@teams_bp.route("/<int:team_id>", methods=["GET"])
@jwt_required()
def get_team_detail(team_id: int):
    """Retrieve team squad overview with member roster."""
    user = get_authenticated_user()
    team = db.session.get(Team, team_id)
    if not team:
        return error_response("Team not found.", 404)

    membership = TeamMembership.query.filter_by(team_id=team.id, user_id=user.id).first()
    if not membership and user.role != "admin":
        return error_response("Forbidden: You are not a member of this team.", 403)

    members = [m.to_dict() for m in team.memberships]
    leader = db.session.get(User, team.lead_id)

    data = team.to_dict()
    data["is_leader"] = team.lead_id == user.id
    data["my_role"] = membership.role if membership else ("admin" if user.role == "admin" else None)
    data["lead_name"] = leader.full_name if leader else "Unknown"
    data["members"] = members
    data["member_count"] = len(members)
    return jsonify(data)


@teams_bp.route("/join", methods=["POST"])
@jwt_required()
def join_team():
    """Join squad using 8-character uppercase code with rate-limit protection."""
    user = get_authenticated_user()
    if not user:
        return error_response("Unauthorized.", 401)

    if not check_join_rate_limit(user.id):
        return error_response("Too many failed join attempts. Please wait 1 minute.", 429)

    data = request.get_json() or {}
    raw_code = (data.get("team_code") or data.get("code") or "").strip().upper()
    if not raw_code:
        record_failed_join(user.id)
        return error_response("Team code is required.", 400)

    team = Team.query.filter_by(team_code=raw_code, code_active=True).first()
    if not team:
        record_failed_join(user.id)
        return error_response("Invalid or disabled team code.", 404)

    existing = TeamMembership.query.filter_by(team_id=team.id, user_id=user.id).first()
    if existing:
        return jsonify({
            "alreadyMember": True,
            "team": team.to_dict(),
            "message": f'You are already a member of "{team.name}".',
        }), 200

    membership = TeamMembership(team_id=team.id, user_id=user.id, role="member")
    db.session.add(membership)
    db.session.commit()
    reset_failed_joins(user.id)

    log_audit(user.id, "JOIN_TEAM", "TEAM", team.id, {"team_name": team.name})
    return jsonify({
        "alreadyMember": False,
        "team": team.to_dict(),
        "message": f'Successfully joined "{team.name}"!',
    }), 200


@teams_bp.route("/<int:team_id>/code/regenerate", methods=["POST"])
@jwt_required()
def regenerate_team_code(team_id: int):
    """Generate a new join code and invalidate previous code (leader only)."""
    user = get_authenticated_user()
    team = db.session.get(Team, team_id)
    if not team or (team.lead_id != user.id and user.role != "admin"):
        return error_response("Only the squad leader can regenerate the code.", 403)

    new_code = generate_team_code()
    while Team.query.filter_by(team_code=new_code).first():
        new_code = generate_team_code()

    team.team_code = new_code
    team.code_active = True
    db.session.commit()
    log_audit(user.id, "REGENERATE_CODE", "TEAM", team.id, {"new_code": new_code})
    return jsonify({"team_code": new_code})


@teams_bp.route("/<int:team_id>/code", methods=["PATCH"])
@jwt_required()
def toggle_team_code(team_id: int):
    """Enable or disable team code joining (leader only)."""
    user = get_authenticated_user()
    team = db.session.get(Team, team_id)
    if not team or (team.lead_id != user.id and user.role != "admin"):
        return error_response("Only the squad leader can modify code settings.", 403)

    data = request.get_json() or {}
    if "code_active" in data:
        team.code_active = bool(data["code_active"])
    else:
        team.code_active = not team.code_active

    db.session.commit()
    return jsonify({"code_active": team.code_active, "team_code": team.team_code})
