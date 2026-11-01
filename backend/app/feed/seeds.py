"""Initial catalog values used by the category bar and topic discovery."""

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.models.feed import Category, RSSSource, Tag

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


def seed_feed_catalog(
    db: Session, rss_sources: list[dict[str, str]] | None = None
) -> None:
    """Insert the catalog and configured RSS feeds; safe across API workers."""
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
    for source in rss_sources or []:
        name = source.get("name", "").strip()
        feed_url = source.get("feed_url", "").strip()
        category_slug = source.get("category_slug", "").strip()
        if not name or not feed_url or not category_slug:
            raise ValueError("Each RSS source requires name, feed_url, and category_slug")
        category_id = db.scalar(select(Category.id).where(Category.slug == category_slug))
        if category_id is None:
            raise ValueError(f"RSS source category does not exist: {category_slug}")
        db.execute(
            insert(RSSSource)
            .values(name=name, feed_url=feed_url, category_id=category_id)
            .on_conflict_do_update(
                index_elements=[RSSSource.feed_url],
                set_={"name": name, "category_id": category_id},
            )
        )
    db.commit()
