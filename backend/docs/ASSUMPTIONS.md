# Project Assumptions & Architectural Decisions

## 1. Computed Session State
- A session's computed `state` field is exposed as:
  - `"upcoming"`: when `status == "published"` and `date > timezone.localdate()` (or scheduled for the future).
  - `"completed"`: when `status == "published"` and `date <= timezone.localdate()`.
  - For drafts/scheduled/archived accessed by staff, the state reflects the date relative to today.

## 2. Authentication & Verification
- **Email Normalization**: Emails are stripped of whitespace and converted to lowercase upon creation and authentication.
- **Verification Status**:
  - `verification_status` has 4 states: `"unverified"` (default), `"pending"`, `"verified"`, `"rejected"`.
  - `is_verified` is a derived property returning `verification_status == "verified"`.
  - Staff are **not** notified on signup; notification is dispatched only when the user explicitly applies via `POST /api/v1/accounts/me/verification/apply/`.
- **Google Authentication**:
  - Validates the Google ID token server-side via Google's tokeninfo API.
  - Accounts with the same verified email are automatically linked.
  - Automatically marks `email_verified=True` for Google-authenticated users.
- **Password Reset & Email Verification**:
  - Token-based via cryptographically signed tokens (`django.core.signing.TimestampSigner`).
  - Endpoints always respond with a generic success message to prevent user enumeration attacks.
- **JWT Cookies**:
  - Supports both `Authorization: Bearer <token>` header and optional HttpOnly, Secure, SameSite refresh cookies for Next.js Route Handlers and Server Components.

## 3. Registration Number Uniqueness & Formatting
- Format is checked using the configurable `REGISTRATION_NO_REGEX` environment setting.
- Default regex: `^[A-Za-z0-9_\-\.\/]{1,50}$`.
- Enforces uniqueness per `batch` strictly among users whose status is `"pending"` or `"verified"`.

## 4. Public vs Members-only Content
- Public endpoints (`/api/v1/public/sessions/`) return only non-deleted, published sessions.
- In `GET /api/v1/public/sessions/{slug}/`:
  - Public sessions return full content, tags, author public display info, comment list (names and avatars only).
  - Members-only sessions return `{slug, title, batch, session_number, login_required: true}` without leaking post content, author details, or comments.

## 5. Slugs & SEO
- Slugs are generated once using `batch_number-session_number-<short_random_id>` (e.g. `12-05-k8m2px`) to ensure URL-safe, clean URLs for Bangla content.
- If a session's slug is ever edited, the previous slug is archived in `SessionSlugHistory` to allow 301 permanent redirects.
- Meta endpoint `/api/v1/public/sessions/{slug}/meta/` generates a 160-character Bangla-safe plain-text excerpt stripped of Markdown, together with a valid Schema.org `Article` JSON-LD payload.

## 6. Celery Publishing & Revalidation
- Celery Beat executes `publish_scheduled_sessions` every minute.
- Uses `select_for_update(skip_locked=True)` in an atomic transaction to prevent duplicate publishing across multiple worker processes.
- Dispatches Next.js ISR on-demand revalidation webhooks with `NEXTJS_REVALIDATE_SECRET` for the published session, session list, and sitemap.

## 7. Testing Environment
- Uses SQLite with custom sqlite functions/regex for fast pytest execution locally and in CI.
- Docker and production utilize PostgreSQL 16 with the `pg_trgm` extension for high-performance Bangla fuzzy/trigram search.

## 8. Presigned Uploads
- Direct client-to-storage uploads (S3 or Cloudflare R2) avoid file streaming through Django server processes.
- Enforces strict content-type validation (`image/jpeg`, `image/png`, `image/webp`) and a 5 MB maximum file size limit.
- Presigned endpoints return a permanent public CDN URL and headers. Avatar endpoints save only the URL string.

## 9. Staff Verification Review & Race Conditions
- Two staff members acting simultaneously on the same pending application are handled using database row-level locking (`select_for_update`) in an atomic transaction.
- The second reviewer receives `409 Conflict` with a clear message indicating the request was already reviewed.
- Admin can update or revoke verification at any time, with all actions captured in the immutable audit log table.

## 10. Admin Analytics & Privacy Guarantee
- Platform analytics calculates current vs previous period totals and provides exact deltas (users, sessions, likes, comments, bookmarks).
- Admin user listings expose aggregated counts (`comments_count`, `likes_given_count`, `bookmarks_count`, `notes_count`, `posts_commented_count`).
- **Privacy Guarantee**: Note contents (`SessionNote` and `PersonalNote`) are strictly private to the individual user and are never exposed to admins or staff in analytics or API responses.

