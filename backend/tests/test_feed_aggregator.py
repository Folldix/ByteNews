from __future__ import annotations

import io
import os
import time
from collections.abc import Iterator

import feedparser
import pytest
from sqlalchemy import create_engine, func, select
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session, sessionmaker

from app.db.base import Base
from app.feed import aggregator
from app.feed.aggregator import (
    _entry_url,
    _published_at,
    clean_feed_html,
    collect_all_sources,
    create_scheduler,
)
from app.feed.seeds import seed_feed_catalog
from app.models import Category  # noqa: F401  (registers all models on Base)
from app.models.feed import FlashNews, RSSSource

FEED_URL = "https://news.example.test/feed.xml"
RSS_PAYLOAD = b"""<?xml version="1.0"?>
<rss version="2.0"><channel><title>Example</title>
  <item>
    <title>First &amp; <b>bold</b> story</title>
    <link>/posts/1</link>
    <description><![CDATA[<p>Useful text</p><div class="ad-banner">Buy now</div><script>x()</script>]]></description>
    <pubDate>Mon, 02 Nov 2026 10:00:00 GMT</pubDate>
  </item>
  <item><title>Unsafe link</title><link>javascript:alert(1)</link></item>
  <item><title></title><link>https://news.example.test/empty-title</link></item>
</channel></rss>"""


# ---------- pure helpers ----------


def test_clean_feed_html_drops_ads_scripts_and_hidden_blocks() -> None:
    html = (
        "<p>Hello <b>world</b></p>"
        '<div id="sponsor-box"><p>nested <span>ad</span></p></div>'
        '<span style="display: none">secret</span>'
        "<script>alert(1)</script><br/>Done"
    )
    assert clean_feed_html(html) == "Hello world Done"
    assert clean_feed_html(None) == ""
    assert clean_feed_html("") == ""
    # Malformed / unbalanced markup must not raise.
    assert clean_feed_html("<div><p>open <b>tags") == "open tags"


def test_entry_url_only_allows_http_schemes() -> None:
    assert _entry_url("/a", FEED_URL) == "https://news.example.test/a"
    assert _entry_url("javascript:alert(1)", FEED_URL) is None
    assert _entry_url("file:///etc/passwd", FEED_URL) is None
    assert len(_entry_url("/" + "x" * 3000, FEED_URL) or "") == 2000


def test_published_at_falls_back_to_now_for_missing_or_invalid_dates() -> None:
    parsed = time.strptime("2026-11-02 10:00:00", "%Y-%m-%d %H:%M:%S")
    assert _published_at(feedparser.FeedParserDict(published_parsed=parsed)).year == 2026
    assert _published_at(feedparser.FeedParserDict()).tzinfo is not None
    assert _published_at(feedparser.FeedParserDict(updated_parsed=("bad",))).tzinfo is not None


def test_create_scheduler_validates_interval() -> None:
    with pytest.raises(ValueError):
        create_scheduler(sessionmaker(), interval_minutes=0)
    scheduler = create_scheduler(sessionmaker(), interval_minutes=5)
    assert scheduler.get_job("byte-news-rss-collection") is not None


# ---------- database-backed ingestion ----------


@pytest.fixture
def sync_sessions() -> Iterator[sessionmaker[Session]]:
    test_url = os.getenv("TEST_DATABASE_URL")
    if not test_url:
        pytest.skip("Set TEST_DATABASE_URL to a disposable PostgreSQL database")
    url = make_url(test_url)
    if not url.database or not url.database.endswith("_test"):
        pytest.fail("TEST_DATABASE_URL database name must end in _test")
    engine = create_engine(test_url.replace("+asyncpg", "+psycopg", 1))
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    try:
        yield sessionmaker(bind=engine, expire_on_commit=False)
    finally:
        Base.metadata.drop_all(engine)
        engine.dispose()


class _FakeResponse(io.BytesIO):
    def __enter__(self) -> _FakeResponse:
        return self

    def __exit__(self, *args: object) -> None:
        self.close()


def test_seed_catalog_validates_and_reconciles_sources(sync_sessions: sessionmaker[Session]) -> None:
    with sync_sessions() as db:
        seed_feed_catalog(db, [{"name": "Example", "feed_url": FEED_URL, "category_slug": "ai"}])
        # Second run with a changed URL updates the existing source instead of duplicating it.
        seed_feed_catalog(
            db, [{"name": "Example", "feed_url": FEED_URL + "?v=2", "category_slug": "development"}]
        )
        sources = db.scalars(select(RSSSource)).all()
        assert len(sources) == 1 and sources[0].feed_url.endswith("?v=2")
        assert db.scalar(select(func.count()).select_from(Category)) == 6

        with pytest.raises(ValueError):
            seed_feed_catalog(db, [{"name": "", "feed_url": FEED_URL, "category_slug": "ai"}])
        db.rollback()
        with pytest.raises(ValueError):
            seed_feed_catalog(db, [{"name": "X", "feed_url": FEED_URL, "category_slug": "missing"}])


def test_collect_all_sources_ingests_once_and_isolates_failures(
    sync_sessions: sessionmaker[Session], monkeypatch: pytest.MonkeyPatch
) -> None:
    broken_url = "https://broken.example.test/rss"
    with sync_sessions() as db:
        seed_feed_catalog(
            db,
            [
                {"name": "Example", "feed_url": FEED_URL, "category_slug": "ai"},
                {"name": "Broken", "feed_url": broken_url, "category_slug": "ai"},
            ],
        )

    def fake_urlopen(request: object, timeout: int) -> _FakeResponse:
        if request.full_url == broken_url:  # type: ignore[attr-defined]
            raise OSError("connection refused")
        return _FakeResponse(RSS_PAYLOAD)

    monkeypatch.setattr(aggregator, "urlopen", fake_urlopen)

    collect_all_sources(sync_sessions)
    collect_all_sources(sync_sessions)  # second pass must not duplicate entries

    with sync_sessions() as db:
        news = db.scalars(select(FlashNews)).all()
        assert len(news) == 1  # unsafe link and empty title are skipped
        assert news[0].title == "First & bold story"
        assert news[0].summary == "Useful text"
        assert news[0].url == "https://news.example.test/posts/1"
        example = db.scalar(select(RSSSource).where(RSSSource.feed_url == FEED_URL))
        broken = db.scalar(select(RSSSource).where(RSSSource.feed_url == broken_url))
        assert example.last_fetched_at is not None
        assert broken.last_fetched_at is None


def test_oversized_and_unreadable_feeds_are_rejected(
    sync_sessions: sessionmaker[Session], monkeypatch: pytest.MonkeyPatch
) -> None:
    with sync_sessions() as db:
        seed_feed_catalog(db, [{"name": "Example", "feed_url": FEED_URL, "category_slug": "ai"}])
        source = db.scalar(select(RSSSource))

        monkeypatch.setattr(aggregator, "MAX_FEED_BYTES", 10)
        monkeypatch.setattr(aggregator, "urlopen", lambda *a, **k: _FakeResponse(RSS_PAYLOAD))
        with pytest.raises(ValueError):
            aggregator.collect_source(db, source)

        source.feed_url = "file:///etc/passwd"
        with pytest.raises(ValueError, match="scheme"):
            aggregator.collect_source(db, source)
        source.feed_url = FEED_URL

        monkeypatch.setattr(aggregator, "MAX_FEED_BYTES", 10 * 1024 * 1024)
        monkeypatch.setattr(aggregator, "urlopen", lambda *a, **k: _FakeResponse(b"<<not xml"))
        assert aggregator.collect_source(db, source) == 0
