"""Create the unified ByteNews PostgreSQL schema.

Revision ID: 0001_initial
Revises:
Create Date: 2026-11-01
"""

from alembic import op

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def _execute_statements(sql: str) -> None:
    for statement in sql.split(";"):
        if statement.strip():
            op.execute(statement)


def upgrade() -> None:
    _execute_statements(
        """
        CREATE TABLE users (
            id UUID NOT NULL,
            email VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(150) NOT NULL,
            handle VARCHAR(80) NOT NULL,
            role VARCHAR(20) DEFAULT 'reader' NOT NULL,
            role_title VARCHAR(150),
            bio TEXT,
            avatar_url VARCHAR(2048),
            location VARCHAR(150),
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            CONSTRAINT pk_users PRIMARY KEY (id),
            CONSTRAINT uq_users_email UNIQUE (email),
            CONSTRAINT uq_users_handle UNIQUE (handle),
            CONSTRAINT ck_users_user_role CHECK (role IN ('guest', 'reader', 'reporter', 'admin'))
        );

        CREATE TABLE categories (
            id UUID NOT NULL,
            name VARCHAR(100) NOT NULL,
            slug VARCHAR(100) NOT NULL,
            CONSTRAINT pk_categories PRIMARY KEY (id),
            CONSTRAINT uq_categories_name UNIQUE (name),
            CONSTRAINT uq_categories_slug UNIQUE (slug)
        );

        CREATE TABLE tags (
            id UUID NOT NULL,
            name VARCHAR(100) NOT NULL,
            slug VARCHAR(100) NOT NULL,
            CONSTRAINT pk_tags PRIMARY KEY (id),
            CONSTRAINT uq_tags_name UNIQUE (name),
            CONSTRAINT uq_tags_slug UNIQUE (slug)
        );

        CREATE TABLE rss_sources (
            id UUID NOT NULL,
            name VARCHAR(150) NOT NULL,
            feed_url VARCHAR(500) NOT NULL,
            category_id UUID NOT NULL,
            is_active BOOLEAN DEFAULT true NOT NULL,
            last_fetched_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            CONSTRAINT pk_rss_sources PRIMARY KEY (id),
            CONSTRAINT uq_rss_sources_feed_url UNIQUE (feed_url),
            CONSTRAINT fk_rss_sources_category_id_categories
                FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
        );

        CREATE TABLE articles (
            id UUID NOT NULL,
            title VARCHAR(500) NOT NULL,
            slug VARCHAR(550) NOT NULL,
            lead TEXT,
            cover_image_url VARCHAR(2048),
            cover_caption VARCHAR(500),
            is_hero BOOLEAN DEFAULT false NOT NULL,
            is_photo_reportage BOOLEAN DEFAULT false NOT NULL,
            status VARCHAR(20) DEFAULT 'draft' NOT NULL,
            category_id UUID NOT NULL,
            author_id UUID NOT NULL,
            read_time_min INTEGER DEFAULT 1 NOT NULL,
            views_count INTEGER DEFAULT 0 NOT NULL,
            likes_count INTEGER DEFAULT 0 NOT NULL,
            published_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            search_vector TSVECTOR GENERATED ALWAYS AS (
                setweight(to_tsvector('simple'::regconfig, coalesce(title, '')), 'A') ||
                setweight(to_tsvector('simple'::regconfig, coalesce(lead, '')), 'B')
            ) STORED NOT NULL,
            CONSTRAINT pk_articles PRIMARY KEY (id),
            CONSTRAINT uq_articles_slug UNIQUE (slug),
            CONSTRAINT ck_articles_article_status CHECK (status IN ('draft', 'published')),
            CONSTRAINT ck_articles_positive_read_time CHECK (read_time_min > 0),
            CONSTRAINT ck_articles_nonnegative_views CHECK (views_count >= 0),
            CONSTRAINT ck_articles_nonnegative_likes CHECK (likes_count >= 0),
            CONSTRAINT ck_articles_status_publication_time CHECK (
                (status = 'draft' AND published_at IS NULL) OR
                (status = 'published' AND published_at IS NOT NULL)
            ),
            CONSTRAINT fk_articles_category_id_categories
                FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
            CONSTRAINT fk_articles_author_id_users
                FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE RESTRICT
        );

        CREATE TABLE article_blocks (
            id UUID NOT NULL,
            article_id UUID NOT NULL,
            block_type VARCHAR(20) NOT NULL,
            order_index INTEGER NOT NULL,
            content_payload JSONB NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            CONSTRAINT pk_article_blocks PRIMARY KEY (id),
            CONSTRAINT ck_article_blocks_article_block_type
                CHECK (block_type IN ('text', 'heading', 'image', 'quote', 'code', 'callout')),
            CONSTRAINT ck_article_blocks_nonnegative_order_index CHECK (order_index >= 0),
            CONSTRAINT fk_article_blocks_article_id_articles
                FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE
        );

        CREATE TABLE article_tags (
            article_id UUID NOT NULL,
            tag_id UUID NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            CONSTRAINT pk_article_tags PRIMARY KEY (article_id, tag_id),
            CONSTRAINT fk_article_tags_article_id_articles
                FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE,
            CONSTRAINT fk_article_tags_tag_id_tags
                FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
        );

        CREATE TABLE flash_news (
            id UUID NOT NULL,
            source_id UUID,
            title VARCHAR(500) NOT NULL,
            summary TEXT,
            source_name VARCHAR(150) NOT NULL,
            url VARCHAR(2000) NOT NULL,
            published_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            CONSTRAINT pk_flash_news PRIMARY KEY (id),
            CONSTRAINT uq_flash_news_url UNIQUE (url),
            CONSTRAINT fk_flash_news_source_id_rss_sources
                FOREIGN KEY (source_id) REFERENCES rss_sources (id) ON DELETE SET NULL
        );

        CREATE TABLE refresh_tokens (
            id UUID NOT NULL,
            user_id UUID NOT NULL,
            token_hash VARCHAR(255) NOT NULL,
            family_id UUID NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            revoked_at TIMESTAMPTZ,
            replaced_by_id UUID,
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            CONSTRAINT pk_refresh_tokens PRIMARY KEY (id),
            CONSTRAINT uq_refresh_tokens_token_hash UNIQUE (token_hash),
            CONSTRAINT fk_refresh_tokens_user_id_users
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            CONSTRAINT fk_refresh_tokens_replaced_by_id_refresh_tokens
                FOREIGN KEY (replaced_by_id) REFERENCES refresh_tokens (id) ON DELETE SET NULL
        );

        CREATE TABLE comments (
            id UUID NOT NULL,
            article_id UUID NOT NULL,
            author_id UUID NOT NULL,
            parent_id UUID,
            text TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            CONSTRAINT pk_comments PRIMARY KEY (id),
            CONSTRAINT ck_comments_nonempty_comment CHECK (length(trim(text)) > 0),
            CONSTRAINT fk_comments_article_id_articles
                FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE,
            CONSTRAINT fk_comments_author_id_users
                FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE RESTRICT,
            CONSTRAINT fk_comments_parent_id_comments
                FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE
        );

        CREATE TABLE bookmarks (
            user_id UUID NOT NULL,
            article_id UUID NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            CONSTRAINT pk_bookmarks PRIMARY KEY (user_id, article_id),
            CONSTRAINT fk_bookmarks_user_id_users
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            CONSTRAINT fk_bookmarks_article_id_articles
                FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE
        );

        CREATE TABLE polls (
            id UUID NOT NULL,
            question VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT false NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            closes_at TIMESTAMPTZ,
            CONSTRAINT pk_polls PRIMARY KEY (id)
        );

        CREATE TABLE poll_options (
            id UUID NOT NULL,
            poll_id UUID NOT NULL,
            option_text VARCHAR(150) NOT NULL,
            votes_count INTEGER DEFAULT 0 NOT NULL,
            CONSTRAINT pk_poll_options PRIMARY KEY (id),
            CONSTRAINT uq_poll_options_id_poll UNIQUE (id, poll_id),
            CONSTRAINT ck_poll_options_nonnegative_votes CHECK (votes_count >= 0),
            CONSTRAINT fk_poll_options_poll_id_polls
                FOREIGN KEY (poll_id) REFERENCES polls (id) ON DELETE CASCADE
        );

        CREATE TABLE poll_votes (
            id UUID NOT NULL,
            poll_id UUID NOT NULL,
            option_id UUID NOT NULL,
            user_id UUID NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            CONSTRAINT pk_poll_votes PRIMARY KEY (id),
            CONSTRAINT uq_poll_votes_poll_user UNIQUE (poll_id, user_id),
            CONSTRAINT fk_poll_votes_poll_id_polls
                FOREIGN KEY (poll_id) REFERENCES polls (id) ON DELETE CASCADE,
            CONSTRAINT fk_poll_votes_option_poll
                FOREIGN KEY (option_id, poll_id) REFERENCES poll_options (id, poll_id) ON DELETE CASCADE,
            CONSTRAINT fk_poll_votes_user_id_users
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );

        CREATE TABLE reactions (
            id UUID NOT NULL,
            article_id UUID NOT NULL,
            user_id UUID NOT NULL,
            kind VARCHAR(20) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            CONSTRAINT pk_reactions PRIMARY KEY (id),
            CONSTRAINT uq_reactions_article_user UNIQUE (article_id, user_id),
            CONSTRAINT ck_reactions_reaction_kind
                CHECK (kind IN ('useful', 'fire', 'insight', 'controversial')),
            CONSTRAINT fk_reactions_article_id_articles
                FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE,
            CONSTRAINT fk_reactions_user_id_users
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
        """
    )

    _execute_statements(
        """
        CREATE INDEX ix_rss_sources_category_id ON rss_sources (category_id);
        CREATE INDEX ix_articles_status ON articles (status);
        CREATE INDEX ix_articles_author_id ON articles (author_id);
        CREATE INDEX ix_articles_published_at ON articles (published_at);
        CREATE INDEX ix_articles_category_published ON articles (category_id, published_at);
        CREATE INDEX ix_articles_search_vector ON articles USING GIN (search_vector);
        CREATE UNIQUE INDEX uq_article_blocks_article_order ON article_blocks (article_id, order_index);
        CREATE INDEX ix_article_tags_tag_article ON article_tags (tag_id, article_id);
        CREATE INDEX ix_flash_news_source_id ON flash_news (source_id);
        CREATE INDEX ix_flash_news_published_at ON flash_news (published_at);
        CREATE INDEX ix_refresh_tokens_user_id ON refresh_tokens (user_id);
        CREATE INDEX ix_refresh_tokens_family_id ON refresh_tokens (family_id);
        CREATE INDEX ix_refresh_tokens_expires_at ON refresh_tokens (expires_at);
        CREATE INDEX ix_comments_article_created ON comments (article_id, created_at);
        CREATE INDEX ix_comments_author_id ON comments (author_id);
        CREATE INDEX ix_comments_parent_id ON comments (parent_id);
        CREATE INDEX ix_bookmarks_created_at ON bookmarks (created_at);
        CREATE INDEX ix_polls_active_created ON polls (is_active, created_at);
        CREATE UNIQUE INDEX uq_polls_single_active ON polls (is_active) WHERE is_active;
        CREATE INDEX ix_poll_options_poll_id ON poll_options (poll_id);
        CREATE INDEX ix_reactions_article_kind ON reactions (article_id, kind);
        """
    )


def downgrade() -> None:
    _execute_statements(
        """
        DROP TABLE reactions;
        DROP TABLE poll_votes;
        DROP TABLE poll_options;
        DROP TABLE polls;
        DROP TABLE bookmarks;
        DROP TABLE comments;
        DROP TABLE refresh_tokens;
        DROP TABLE flash_news;
        DROP TABLE article_tags;
        DROP TABLE article_blocks;
        DROP TABLE articles;
        DROP TABLE rss_sources;
        DROP TABLE tags;
        DROP TABLE categories;
        DROP TABLE users;
        """
    )
