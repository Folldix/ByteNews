# Feed feature integration

This module owns categories, tags and RSS/timeline ingestion, the public feed
routes, and RSS scheduling. The repository currently has no shared database
module, `Article`/`User` model, FastAPI app, or Alembic history; those belong to
the other student workstreams and are intentionally not duplicated here.

When the shared modules are available:

1. Ensure the shared declarative `Base` is importable as `app.db.base.Base` and
   that `Article` maps to `articles` with the fields referenced in
   `router.py` (`id`, `title`, `slug`, `lead`, `category_id`, `author_id`,
   `is_hero`, `read_time_min`, `views_count`, `likes_count`, `published_at`).
2. Add an Alembic revision after the `articles` table exists. Create
   `categories`, `tags`, `article_tags`, `rss_sources`, and `flash_news`, then
   add the Article category foreign key if it is not part of the CMS revision.
3. After applying migrations, run `seed_feed_catalog(db)` once to add the
   initial six categories and example discovery tags. The helper does not
   overwrite existing catalog edits.
4. Register the feed routes from the platform app:

   ```python
   app.include_router(
       create_feed_router(
           get_db=get_db,
           article_model=Article,
           user_model=User,
       )
   )
   ```

5. Start and stop the RSS scheduler with the FastAPI app lifecycle, using the
   shared session factory:

   ```python
   scheduler = create_scheduler(SessionLocal)
   scheduler.start()
   # During shutdown: scheduler.shutdown(wait=False)
   ```

RSS entries are stored as `FlashNews` so they appear in the operational
timeline without creating or modifying CMS-owned Article records. The public
feed and regular article catalog contain published CMS articles.
