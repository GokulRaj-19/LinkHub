"""Team Kanban task database model."""
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.extensions import db
from app.models.types import FK_TYPE, PK_TYPE


class Task(db.Model):
    """Team task item tracked across Kanban lifecycle."""

    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    team_id: Mapped[int] = mapped_column(
        FK_TYPE, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, default="", nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="todo", nullable=False)
    priority: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)
    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    assigned_to: Mapped[int | None] = mapped_column(
        FK_TYPE, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_by: Mapped[int] = mapped_column(
        FK_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    assigned_date: Mapped[str | None] = mapped_column(String(50), default="", nullable=True)
    due_date: Mapped[str | None] = mapped_column(String(50), default="", nullable=True)
    member_notes: Mapped[str | None] = mapped_column(Text, default="", nullable=True)
    unassigned_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    idempotency_key: Mapped[str | None] = mapped_column(
        String(100), unique=True, nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    team = relationship("Team", back_populates="tasks")
    assignee = relationship("User", foreign_keys=[assigned_to])
    creator = relationship("User", foreign_keys=[created_by])

    def to_dict(self) -> dict:
        """Serialize task to dictionary."""
        return {
            "id": self.id,
            "team_id": self.team_id,
            "title": self.title,
            "description": self.description or "",
            "status": self.status,
            "priority": self.priority,
            "progress": self.progress,
            "assigned_to": self.assigned_to,
            "created_by": self.created_by,
            "assigned_date": self.assigned_date or "",
            "due_date": self.due_date or "",
            "member_notes": self.member_notes or "",
            "unassigned_flag": self.unassigned_flag,
            "idempotency_key": self.idempotency_key,
            "assignee_name": self.assignee.full_name if self.assignee else "Unassigned",
            "assignee_email": self.assignee.email if self.assignee else "",
            "creator_name": self.creator.full_name if self.creator else "Unknown",
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
