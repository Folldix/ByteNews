"""Add reporter topic preferences to the user profile."""

from alembic import op

revision = "0002_reporter_topics"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE users ADD COLUMN reporter_topics JSONB NOT NULL DEFAULT '[]'::jsonb")


def downgrade() -> None:
    op.execute("ALTER TABLE users DROP COLUMN reporter_topics")
