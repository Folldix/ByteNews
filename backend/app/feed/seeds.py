"""Initial catalog values used by the category bar and topic discovery."""

from sqlalchemy import select
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
    """Insert the initial feed categories and topic tags without overwriting edits."""
    category_slugs = set(db.scalars(select(Category.slug)))
    tag_slugs = set(db.scalars(select(Tag.slug)))
    changed = False
    for name, slug in DEFAULT_CATEGORIES:
        if slug not in category_slugs:
            db.add(Category(name=name, slug=slug))
            changed = True
    for name, slug in DEFAULT_TAGS:
        if slug not in tag_slugs:
            db.add(Tag(name=name, slug=slug))
            changed = True
    if changed:
        db.commit()
