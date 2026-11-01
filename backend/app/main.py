from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.session import SessionLocal, engine, get_db
from app.feed.aggregator import create_scheduler
from app.feed.router import create_feed_router
from app.feed.seeds import seed_feed_catalog
from app.auth.router import router as auth_router
from app.models import Article, User


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    with SessionLocal() as session:
        seed_feed_catalog(session)

    scheduler = create_scheduler(SessionLocal, interval_minutes=settings.rss_interval_minutes)
    scheduler.start()
    app.state.rss_scheduler = scheduler
    try:
        yield
    finally:
        scheduler.shutdown(wait=False)
        await engine.dispose()


app = FastAPI(title="ByteNews API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(create_feed_router(get_db=get_db, article_model=Article, user_model=User))
app.include_router(auth_router)


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}
