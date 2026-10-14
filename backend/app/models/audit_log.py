"""Audit log database model."""
from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.extensions import db
from app.models.types import FK_TYPE, PK_TYPE


class AuditLog(db.Model):
    """System-wide audit trail record."""

    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(
        FK_TYPE, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    target_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    target_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(50), default="127.0.0.1", nullable=True)
    details: Mapped[dict | None] = mapped_column(JSON, default=dict, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    user = relationship("User", foreign_keys=[user_id])

    def to_dict(self) -> dict:
        """Serialize audit log record."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": self.user.full_name if self.user else "System",
            "user_email": self.user.email if self.user else None,
            "action": self.action,
            "target_type": self.target_type,
            "target_id": self.target_id,
            "ip_address": self.ip_address or "127.0.0.1",
            "details": self.details or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
