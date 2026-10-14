"""Audit logging utility."""
from flask import has_request_context, request
from app.extensions import db
from app.models.audit_log import AuditLog


def log_audit(
    user_id: int | None,
    action: str,
    target_type: str | None = None,
    target_id: str | int | None = None,
    details: dict | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    """Record an audit trail event."""
    client_ip = ip_address
    if not client_ip and has_request_context():
        client_ip = (
            request.headers.get("X-Forwarded-For", request.remote_addr)
            or "127.0.0.1"
        )
        if "," in client_ip:
            client_ip = client_ip.split(",")[0].strip()

    log_entry = AuditLog(
        user_id=user_id,
        action=action,
        target_type=target_type,
        target_id=str(target_id) if target_id is not None else None,
        ip_address=client_ip or "127.0.0.1",
        details=details or {},
    )
    db.session.add(log_entry)
    db.session.commit()
    return log_entry
