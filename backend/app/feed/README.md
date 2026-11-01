# Feed feature

The feature shares the project's SQLAlchemy `Base` and the common `Article`,
`User`, `Category`, `Tag`, and `FlashNews` models. `app.main` registers its
catalog, PostgreSQL FTS, flash-news and public-feed routes and owns the RSS
scheduler lifecycle. The single Alembic schema includes the feed tables and
their foreign keys alongside identity, CMS and community tables.

The RSS scheduler runs on FastAPI startup and stores normalized, deduplicated
feed entries as `FlashNews` for the operational timeline. Authored CMS articles
remain in `articles`; the public feed returns published article records.
