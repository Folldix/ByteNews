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
    """Insert the catalog and reconcile configured RSS feeds by URL or name."""
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
        existing = db.scalar(select(RSSSource).where(RSSSource.feed_url == feed_url))
        if existing is None:
            # Keep a source's row and related FlashNews when its configured URL
            # changes; otherwise a stale, failing URL would remain active.
            existing = db.scalar(
                select(RSSSource)
                .where(RSSSource.name == name)
                .order_by(RSSSource.created_at, RSSSource.id)
                .limit(1)
            )
        if existing is not None:
            existing.name = name
            existing.feed_url = feed_url
            existing.category_id = category_id
            existing.is_active = True
        else:
            db.execute(
                insert(RSSSource)
                .values(name=name, feed_url=feed_url, category_id=category_id)
                .on_conflict_do_update(
                    index_elements=[RSSSource.feed_url],
                    set_={"name": name, "category_id": category_id, "is_active": True},
                )
            )
    db.commit()
