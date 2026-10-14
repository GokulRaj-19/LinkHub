"""Admin operations and audit log export API blueprint."""
import csv
import io
from flask import Blueprint, Response, jsonify, request
from app.models.audit_log import AuditLog
from app.utils.decorators import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/logs", methods=["GET"])
@admin_required()
def get_audit_logs():
    """Retrieve audit logs with optional filtering by action or user."""
    action = request.args.get("action", "").strip()
    user_id = request.args.get("user_id")

    query = AuditLog.query.order_by(AuditLog.created_at.desc())
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    if user_id:
        query = query.filter_by(user_id=int(user_id))

    logs = query.limit(200).all()
    return jsonify([log.to_dict() for log in logs])


@admin_bp.route("/logs/export", methods=["GET"])
@admin_required()
def export_audit_logs():
    """Export audit log trail as CSV file download."""
    action = request.args.get("action", "").strip()
    user_id = request.args.get("user_id")

    query = AuditLog.query.order_by(AuditLog.created_at.desc())
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    if user_id:
        query = query.filter_by(user_id=int(user_id))

    logs = query.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Timestamp", "User ID", "User Name", "User Email", "Action", "Target Type", "Target ID", "IP Address", "Details"])

    for log in logs:
        writer.writerow([
            log.id,
            log.created_at.isoformat() if log.created_at else "",
            log.user_id or "",
            log.user.full_name if log.user else "System",
            log.user.email if log.user else "",
            log.action,
            log.target_type or "",
            log.target_id or "",
            log.ip_address or "",
            str(log.details or {}),
        ])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit_logs.csv"},
    )
