# ByteNews

ByteNews is a Ukrainian technology news and engineering analysis platform for
developers, DevOps engineers and IT professionals.

## Stack

- **Frontend:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4
- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.x, Alembic
- **Database:** PostgreSQL 16

## Local development

Start PostgreSQL and the API as described in [backend/README.md](backend/README.md).
Then start the frontend:

```powershell
Copy-Item frontend/.env.local.example frontend/.env.local
Set-Location frontend
npm ci
npm run dev
```

The app runs at `http://localhost:3000`; the API runs at
`http://localhost:8000`. Frontend requests use `NEXT_PUBLIC_API_BASE_URL`.

## Main route composition

The home route composes the shared Header, auth modal, feed, profile view and
Footer. Header search and category controls share state with the feed, while
the profile view remains reachable through the auth context.

Database tables for identity, CMS, discovery and community are defined from
one SQLAlchemy metadata registry. Apply schema changes with Alembic from the
`backend` directory; the initial revision is `0001_initial`.
