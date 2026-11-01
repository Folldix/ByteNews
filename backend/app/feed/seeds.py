"""Initial catalog values used by the category bar and topic discovery."""

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.models.feed import Category, Tag

DEFAULT_CATEGORIES = (
    ("Штучний Інтелект", "ai"),
    ("Розробка", "development"),
    ("Кібербезпека", "cybersecurity"),
    ("GameDev & 3D", "gamedev-3d"),
    ("Залізо & Чіпи", "hardware-chips"),
    ("Стартапи & Ринок", "startups-market"),
)

DEFAULT_TAGS = (
    ("Claude", "claude"),
    ("React", "react"),
    ("TypeScript", "typescript"),
    ("Linux", "linux"),
    ("ZeroDay", "zeroday"),
    ("OpenAI", "openai"),
    ("Rust", "rust"),
    ("GPU", "gpu"),
)


def seed_feed_catalog(db: Session) -> None:
    """Insert the initial catalog once; safe if API workers start together."""
    db.execute(
        insert(Category)
        .values([{"name": name, "slug": slug} for name, slug in DEFAULT_CATEGORIES])
        .on_conflict_do_nothing()
    )
    db.execute(
        insert(Tag)
        .values([{"name": name, "slug": slug} for name, slug in DEFAULT_TAGS])
        .on_conflict_do_nothing()
    )
    db.commit()
