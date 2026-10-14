"""Team tasks and Kanban API blueprint."""
from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.task import Task
from app.models.team import Team, TeamMembership
from app.utils.audit import log_audit
from app.utils.decorators import get_authenticated_user
from app.utils.helpers import error_response

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api")


@tasks_bp.route("/teams/<int:team_id>/tasks", methods=["GET"])
@jwt_required()
def get_team_tasks(team_id: int):
    """List all Kanban tasks for the team workspace."""
    user = get_authenticated_user()
    team = db.session.get(Team, team_id)
    if not team:
        return error_response("Team not found.", 404)

    is_member = TeamMembership.query.filter_by(team_id=team.id, user_id=user.id).first()
    if not is_member and user.role != "admin":
        return error_response("Forbidden: You are not a member of this team.", 403)

    tasks = Task.query.filter_by(team_id=team.id).order_by(Task.created_at.desc()).all()
    return jsonify([t.to_dict() for t in tasks])


@tasks_bp.route("/teams/<int:team_id>/tasks", methods=["POST"])
@jwt_required()
def create_team_task(team_id: int):
    """Create and assign a squad task (leader only) with idempotency protection."""
    user = get_authenticated_user()
    team = db.session.get(Team, team_id)
    if not team or (team.lead_id != user.id and user.role != "admin"):
        return error_response("Only the squad leader can create and assign tasks.", 403)

    data = request.get_json() or {}
    idempotency_key = data.get("idempotency_key")
    if idempotency_key:
        existing = Task.query.filter_by(idempotency_key=str(idempotency_key)).first()
        if existing:
            return jsonify(existing.to_dict()), 200

    title = (data.get("title") or "").strip()
    if not title:
        return error_response("Task title is required.", 400)

    assigned_to = data.get("assigned_to")
    if assigned_to:
        target_id = int(assigned_to)
        is_member = TeamMembership.query.filter_by(team_id=team.id, user_id=target_id).first()
        if not is_member:
            return error_response("Tasks can only be assigned to current members of this squad.", 400)
    else:
        target_id = None

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    task = Task(
        team_id=team.id,
        title=title,
        description=(data.get("description") or "").strip(),
        priority=data.get("priority") or "medium",
        status="in_progress",
        progress=0,
        assigned_to=target_id,
        created_by=user.id,
        assigned_date=(data.get("assigned_date") or today).strip(),
        due_date=(data.get("due_date") or "").strip(),
        member_notes=(data.get("member_notes") or "").strip(),
        idempotency_key=str(idempotency_key) if idempotency_key else None,
    )
    db.session.add(task)
    db.session.commit()

    log_audit(user.id, "CREATE_TASK", "TASK", task.id, {"title": task.title, "assigned_to": target_id})
    return jsonify(task.to_dict()), 201


@tasks_bp.route("/tasks/<int:task_id>", methods=["PATCH"])
@jwt_required()
def update_task(task_id: int):
    """Update task status, progress, or properties with role-based checks."""
    user = get_authenticated_user()
    task = db.session.get(Task, task_id)
    if not task:
        return error_response("Task not found.", 404)

    team = db.session.get(Team, task.team_id)
    is_leader = team and (team.lead_id == user.id or user.role == "admin")
    is_assignee = task.assigned_to == user.id

    if not is_leader and not is_assignee:
        return error_response("Forbidden: You do not have permission to update this task.", 403)

    data = request.get_json() or {}

    # Status & Progress update allowed for assignee and leader
    if "status" in data:
        st = data["status"]
        if st in ("todo", "in_progress", "done"):
            task.status = st
            if st == "done":
                task.progress = 100
            elif task.progress == 100:
                task.progress = 50

    if "progress" in data:
        p = max(0, min(100, int(data["progress"] or 0)))
        task.progress = p
        if p == 100:
            task.status = "done"
        elif task.status == "done" and p < 100:
            task.status = "in_progress"

    if "member_notes" in data:
        task.member_notes = (data["member_notes"] or "").strip()

    # Field modifications reserved for leader
    if is_leader:
        if "title" in data and data["title"]:
            task.title = data["title"].strip()
        if "description" in data:
            task.description = (data["description"] or "").strip()
        if "priority" in data:
            task.priority = data["priority"]
        if "due_date" in data:
            task.due_date = (data["due_date"] or "").strip()
        if "assigned_date" in data:
            task.assigned_date = (data["assigned_date"] or "").strip()
        if "assigned_to" in data:
            target_id = int(data["assigned_to"]) if data["assigned_to"] else None
            if target_id:
                is_mem = TeamMembership.query.filter_by(team_id=team.id, user_id=target_id).first()
                if not is_mem:
                    return error_response("Tasks can only be assigned to members of this squad.", 400)
            task.assigned_to = target_id
            task.unassigned_flag = False

    db.session.commit()
    log_audit(user.id, "UPDATE_TASK", "TASK", task.id, {"status": task.status, "progress": task.progress})
    return jsonify(task.to_dict())


@tasks_bp.route("/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id: int):
    """Delete a task (leader only)."""
    user = get_authenticated_user()
    task = db.session.get(Task, task_id)
    if not task:
        return error_response("Task not found.", 404)

    team = db.session.get(Team, task.team_id)
    if not team or (team.lead_id != user.id and user.role != "admin"):
        return error_response("Only the squad leader can delete tasks.", 403)

    db.session.delete(task)
    db.session.commit()
    log_audit(user.id, "DELETE_TASK", "TASK", task_id)
    return jsonify({"success": True, "message": "Task deleted successfully."})
