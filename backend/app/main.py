from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import settings
from app.db.session import SessionLocal, engine, get_db
from app.feed.aggregator import create_scheduler
from app.feed.router import create_feed_router
from app.feed.seeds import seed_feed_catalog
from app.auth.router import router as auth_router
from app.community.router import router as community_router
from app.cms.media import router as media_router
from app.cms.router import router as cms_router
from app.models import Article, User


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    Path(settings.media_storage_path).expanduser().resolve().mkdir(parents=True, exist_ok=True)
    with SessionLocal() as session:
        seed_feed_catalog(session, settings.rss_sources)

    scheduler = create_scheduler(SessionLocal, interval_minutes=settings.rss_interval_minutes)
    scheduler.start()
    app.state.rss_scheduler = scheduler
    try:
        yield
    finally:
        scheduler.shutdown(wait=False)
        await engine.dispose()


app = FastAPI(title="ByteNews API", version="1.0.0", lifespan=lifespan)
app.mount(
    "/uploads",
    StaticFiles(directory=str(Path(settings.media_storage_path).expanduser().resolve()), check_dir=False),
    name="uploaded-media",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    # Local Next.js can be opened via localhost or a loopback IP and may
    # move to another port when the default dev port is occupied.
    allow_origin_regex=r"https?://(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
app.include_router(create_feed_router(get_db=get_db, article_model=Article, user_model=User))
app.include_router(auth_router)
app.include_router(cms_router)
app.include_router(media_router)
app.include_router(community_router)


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}
