"""RSS ingestion for the feed/discovery feature.

The platform application owns the session factory and lifecycle. Call
``create_scheduler(session_factory).start()`` during app startup and stop it
on shutdown. RSS entries are persisted as FlashNews records, which lets the
timeline consume fresh items without taking ownership of the CMS Article model.
"""

from __future__ import annotations

import calendar
import logging
import re
from datetime import datetime, timezone
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, urlopen

import feedparser
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session, sessionmaker

from app.models.feed import FlashNews, RSSSource

logger = logging.getLogger(__name__)
FETCH_TIMEOUT_SECONDS = 15
DEFAULT_INTERVAL_MINUTES = 10
MAX_TITLE_LENGTH = 500
MAX_SUMMARY_LENGTH = 20_000
_AD_MARKER = re.compile(r"(?:^|[-_ ])(?:ad|ads|advert|advertisement|sponsor|promoted)(?:$|[-_ ])", re.I)


class _ReadableText(HTMLParser):
    """Extract visible text while discarding scripts, embeds, and ad blocks."""

    _DROP_TAGS = {"script", "style", "noscript", "iframe", "object", "svg", "template"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self._drop_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = {key.lower(): value or "" for key, value in attrs}
        identity = f"{attributes.get('id', '')} {attributes.get('class', '')}"
        style = attributes.get("style", "").replace(" ", "").lower()
        hidden = "hidden" in attributes or "display:none" in style or "visibility:hidden" in style
        if self._drop_depth:
            if tag in self._DROP_TAGS:
                self._drop_depth += 1
            return
        if tag in self._DROP_TAGS or _AD_MARKER.search(identity) or hidden:
            self._drop_depth = 1
            return
        if tag in {"p", "div", "li", "br", "h1", "h2", "h3", "blockquote"}:
            self.parts.append(" ")

    def handle_endtag(self, tag: str) -> None:
        if self._drop_depth:
            if tag in self._DROP_TAGS:
                self._drop_depth -= 1
            return
        if tag in {"p", "div", "li", "br", "h1", "h2", "h3", "blockquote"}:
            self.parts.append(" ")

    def handle_data(self, data: str) -> None:
        if not self._drop_depth:
            self.parts.append(data)


def clean_feed_html(value: str | None) -> str:
    """Turn an RSS HTML fragment into readable plain text without ad blocks."""
    if not value:
        return ""
    parser = _ReadableText()
    try:
        parser.feed(value)
        parser.close()
    except Exception:
        logger.debug("Could not parse an RSS HTML fragment", exc_info=True)
        return ""
    return re.sub(r"\s+", " ", " ".join(parser.parts)).strip()


def _published_at(entry: feedparser.FeedParserDict) -> datetime:
    parsed = entry.get("published_parsed") or entry.get("updated_parsed")
    if parsed:
        try:
            return datetime.fromtimestamp(calendar.timegm(parsed), tz=timezone.utc)
        except (OverflowError, OSError, TypeError, ValueError):
            logger.debug("Invalid RSS publication timestamp", exc_info=True)
    return datetime.now(timezone.utc)


def _entry_url(raw_url: str, feed_url: str) -> str | None:
    url = urljoin(feed_url, raw_url.strip())
    if urlsplit(url).scheme not in {"http", "https"}:
        return None
    return url[:2000]


def _parse_source(source: RSSSource) -> feedparser.FeedParserDict:
    request = Request(source.feed_url, headers={"User-Agent": "ByteNews RSS Aggregator/1.0"})
    with urlopen(request, timeout=FETCH_TIMEOUT_SECONDS) as response:
        return feedparser.parse(response.read())


def collect_source(db: Session, source: RSSSource) -> int:
    """Fetch and persist unique entries for one active source."""
    parsed = _parse_source(source)
    if parsed.bozo and not parsed.entries:
        logger.warning("RSS source %s returned an unreadable feed", source.id)
        return 0

    rows: list[dict[str, object]] = []
    for entry in parsed.entries:
        title = clean_feed_html(entry.get("title", ""))[:MAX_TITLE_LENGTH]
        url = _entry_url(str(entry.get("link", "")), source.feed_url)
        if not title or not url:
            continue
        content = entry.get("summary", "") or entry.get("description", "")
        summary = clean_feed_html(str(content))[:MAX_SUMMARY_LENGTH] or None
        rows.append(
            {
                "source_id": source.id,
                "title": title,
                "summary": summary,
                "source_name": source.name,
                "url": url,
                "published_at": _published_at(entry),
            }
        )

    source.last_fetched_at = datetime.now(timezone.utc)
    inserted = 0
    if rows:
        result = db.execute(
            insert(FlashNews).values(rows).on_conflict_do_nothing(index_elements=[FlashNews.url])
        )
        inserted = result.rowcount or 0
    db.commit()
    return inserted


def collect_all_sources(session_factory: sessionmaker[Session]) -> None:
    """Run one aggregation pass, isolating failures to individual sources."""
    with session_factory() as db:
        source_ids = list(db.scalars(select(RSSSource.id).where(RSSSource.is_active.is_(True))))

    for source_id in source_ids:
        with session_factory() as db:
            source = db.scalar(
                select(RSSSource).where(RSSSource.id == source_id, RSSSource.is_active.is_(True))
            )
            if source is None:
                continue
            try:
                inserted = collect_source(db, source)
                logger.info("Ingested %d new entries from RSS source %s", inserted, source.id)
            except Exception:
                db.rollback()
                logger.exception("RSS ingestion failed for source %s", source.id)


def create_scheduler(
    session_factory: sessionmaker[Session], *, interval_minutes: int = DEFAULT_INTERVAL_MINUTES
) -> BackgroundScheduler:
    """Create, but do not start, the periodic RSS scheduler."""
    if interval_minutes < 1:
        raise ValueError("interval_minutes must be at least 1")
    scheduler = BackgroundScheduler(timezone="UTC")
    scheduler.add_job(
        collect_all_sources,
        trigger="interval",
        minutes=interval_minutes,
        args=[session_factory],
        id="byte-news-rss-collection",
        next_run_time=datetime.now(timezone.utc),
        replace_existing=True,
        coalesce=True,
        max_instances=1,
    )
    return scheduler
