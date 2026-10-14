"""Team, membership and invitation database models."""
from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.extensions import db
from app.models.types import FK_TYPE, PK_TYPE


class Team(db.Model):
    """Team workspace entity."""

    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, default="", nullable=True)
    lead_id: Mapped[int] = mapped_column(FK_TYPE, ForeignKey("users.id"), nullable=False)
    team_code: Mapped[str] = mapped_column(
        String(32), unique=True, nullable=False, index=True
    )
    code_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    leader = relationship("User", foreign_keys=[lead_id])
    memberships = relationship(
        "TeamMembership", back_populates="team", cascade="all, delete-orphan"
    )
    invites = relationship(
        "TeamInvite", back_populates="team", cascade="all, delete-orphan"
    )
    tasks = relationship(
        "Task", back_populates="team", cascade="all, delete-orphan"
    )
    links = relationship(
        "TeamLink", back_populates="team", cascade="all, delete-orphan"
    )

    def to_dict(self) -> dict:
        """Serialize team to JSON-safe dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description or "",
            "lead_id": self.lead_id,
            "team_code": self.team_code,
            "code_active": self.code_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class TeamMembership(db.Model):
    """Associates users with teams and assigns team-level roles."""

    __tablename__ = "team_memberships"
    __table_args__ = (
        UniqueConstraint("team_id", "user_id", name="uq_team_membership_team_user"),
    )

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    team_id: Mapped[int] = mapped_column(
        FK_TYPE, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(
        FK_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(String(20), default="member", nullable=False)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    team = relationship("Team", back_populates="memberships")
    user = relationship("User", back_populates="memberships")

    def to_dict(self) -> dict:
        """Serialize membership."""
        return {
            "id": self.id,
            "team_id": self.team_id,
            "user_id": self.user_id,
            "role": self.role,
            "name": self.user.full_name if self.user else "Member",
            "email": self.user.email if self.user else "",
            "joined_at": self.joined_at.isoformat() if self.joined_at else None,
        }


class TeamInvite(db.Model):
    """Pending email invitations to join a team."""

    __tablename__ = "team_invites"
    __table_args__ = (
        UniqueConstraint("team_id", "email", name="uq_team_invite_team_email"),
    )

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    team_id: Mapped[int] = mapped_column(
        FK_TYPE, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    team = relationship("Team", back_populates="invites")

    def to_dict(self) -> dict:
        """Serialize invite."""
        return {
            "id": self.id,
            "team_id": self.team_id,
            "email": self.email,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
