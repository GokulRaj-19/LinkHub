"""Personal link vault database model."""
from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.extensions import db
from app.models.types import FK_TYPE, PK_TYPE


class SavedLink(db.Model):
    """Personal vault saved bookmark entity."""

    __tablename__ = "saved_links"
    __table_args__ = (
        UniqueConstraint("user_id", "url", name="uq_saved_links_user_url"),
        Index("ix_saved_links_user_pinned_starred", "user_id", "is_pinned", "is_starred"),
    )

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        FK_TYPE,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category_id: Mapped[int | None] = mapped_column(
        FK_TYPE,
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    note: Mapped[str | None] = mapped_column(Text, default="", nullable=True)
    tag: Mapped[str | None] = mapped_column(String(100), default="", nullable=True)
    is_starred: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    pinned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    source_link_id: Mapped[int | None] = mapped_column(
        FK_TYPE,
        ForeignKey("team_links.id", ondelete="SET NULL"),
        nullable=True,
    )
    click_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="saved_links")
    category = relationship("Category", back_populates="saved_links")

    def to_dict(self) -> dict:
        """Serialize saved link to JSON-safe dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "category_id": self.category_id,
            "title": self.title,
            "url": self.url,
            "note": self.note or "",
            "tag": self.tag or "",
            "is_starred": self.is_starred,
            "is_pinned": self.is_pinned,
            "pinned_at": self.pinned_at.isoformat() if self.pinned_at else None,
            "source_link_id": self.source_link_id,
            "click_count": self.click_count,
            "is_deleted": self.is_deleted,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
