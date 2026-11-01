# ByteNews API and database

Backend stack: Python 3.12, FastAPI, SQLAlchemy 2.x, Alembic and PostgreSQL 16.
All project entities share `app.db.base.Base`; Alembic revisions create the
core, CMS, feed, community and identity schema together.

## Local setup

From the repository root:

```powershell
docker compose up -d db
Copy-Item .env.example backend/.env
Set-Location backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

The API is available at `http://localhost:8000`; the health check is
`/health`. Feed routes are under `/api/v1`. The app seeds the six project
categories and example tags after the database has been migrated, then starts
the RSS scheduler in FastAPI's lifespan and stops it at shutdown. RSS feeds are
configured through `RSS_SOURCES` as a JSON array of `{name, feed_url,
category_slug}` objects. For example:

```dotenv
RSS_SOURCES=[{"name":"Example Tech","feed_url":"https://example.com/feed.xml","category_slug":"development"}]
```

Sources are inserted idempotently at startup; remove or deactivate source rows
in the database to stop polling a feed.

## Shared schema

- **Identity:** `users`, `refresh_tokens`
- **CMS:** `articles`, `article_blocks`
- **Feed/discovery:** `categories`, `tags`, `article_tags`, `rss_sources`,
  `flash_news`
- **Community/reader:** `comments`, `bookmarks`, `polls`, `poll_options`,
  `poll_votes`, `reactions`

UUID primary keys, foreign keys, uniqueness, cascade rules, counter checks,
reaction/role/block enums, poll-vote uniqueness and an indexed PostgreSQL
full-text search vector live in the schema. Refresh token rows keep only a
hash and rotation family metadata; token values must never be persisted.

Authentication uses bcrypt password hashes and signed access/refresh JWTs.
Set a unique `JWT_SECRET_KEY` before deployment. Refresh tokens are stored as
hashes and rotated; reusing a revoked token revokes its token family.

Identity routes are `POST /api/v1/auth/register`, `POST /api/v1/auth/login`,
`POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `GET
/api/v1/users/me`, `GET /api/v1/users/{handle}`, and `PATCH
/api/v1/users/upgrade-role`. Use `get_current_user` and `require_roles(...)`
from `app.auth.dependencies` to protect future private routes.

## CMS and media

Reporter and administrator accounts can create articles with
`POST /api/v1/articles`, list their own drafts and publications with
`GET /api/v1/articles/mine`, edit an article with `GET
/api/v1/articles/{id}/edit` and `PUT /api/v1/articles/{id}`, and delete their
own articles with `DELETE /api/v1/articles/{id}`. Administrators can manage
articles from any author. The API validates each block payload by its block
type, replaces block order in one transaction, and creates or reuses topic
tags. New articles are drafts by default; a publication timestamp is set when
an article is published and cleared if it returns to draft.

`POST /api/v1/media/upload` accepts JPEG, PNG, GIF, and WebP files from
reporters and administrators. Both the declared MIME type and file signature
are checked. `MEDIA_MAX_BYTES` sets the upload limit (8 MiB by default), and
`MEDIA_STORAGE_PATH` sets the local storage directory (defaults to `uploads`
relative to the backend working directory). The API serves saved files from
`/uploads/` and returns an absolute URL. Set `MEDIA_PUBLIC_BASE_URL` when the
API is exposed through a proxy or CDN. Persist this directory on a mounted
volume in container deployments.

Reader/community routes include article detail, nested comments, reaction
state/update, active poll/vote, and authenticated bookmark list/add/remove.

Run future schema changes as new Alembic revisions. Do not edit the initial
revision after it has been applied to a shared database.
