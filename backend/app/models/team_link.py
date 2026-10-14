"""Team workspace shared link database model."""
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.extensions import db
from app.models.types import FK_TYPE, PK_TYPE


class TeamLink(db.Model):
    """Shared link entity within a team workspace."""

    __tablename__ = "team_links"

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    team_id: Mapped[int] = mapped_column(
        FK_TYPE, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[int | None] = mapped_column(
        FK_TYPE, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )
    added_by: Mapped[int] = mapped_column(
        FK_TYPE, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    click_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    team = relationship("Team", back_populates="links")
    creator = relationship("User", foreign_keys=[added_by])
    category = relationship("Category", foreign_keys=[category_id])

    def to_dict(self) -> dict:
        """Serialize team link to dictionary."""
        return {
            "id": self.id,
            "team_id": self.team_id,
            "category_id": self.category_id,
            "added_by": self.added_by,
            "added_by_name": self.creator.full_name if self.creator else "Team Member",
            "category_name": self.category.name if self.category else None,
            "title": self.title,
            "url": self.url,
            "click_count": self.click_count,
            "is_deleted": self.is_deleted,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
