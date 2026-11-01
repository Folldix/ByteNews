# Feed and discovery UI

`app/page.tsx` mounts the student 3 home/feed experience inside the Next.js
App Router. It uses the shared Tailwind setup and requests the catalog and feed
from `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000`).

The UI includes category and topic filtering, full-text search, hero and
24-hour popular stories, paginated cards, the breaking-news timeline, and its
detail modal. Bookmark buttons remain local until the bookmark API from the
community workstream is available. The comment count is shown when the shared
Article API provides it; the comment model/API is owned by student 4.
