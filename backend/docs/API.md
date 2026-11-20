# API Reference Documentation

**Base URL**: `/api/v1`  
**OpenAPI Swagger UI**: `/api/docs/` or `/api/docs/swagger/`  
**OpenAPI Raw Schema**: `/api/docs/schema/`  
**Redoc**: `/api/docs/redoc/`

---

## Table of Contents
1. [Authentication & Accounts](#1-authentication--accounts)
2. [Community & Sessions (Protected Staff Endpoints)](#2-community--sessions-protected-staff-endpoints)
3. [Public Endpoints (Anonymous / SEO)](#3-public-endpoints-anonymous--seo)
4. [Interactions & Personal Notes](#4-interactions--personal-notes)
5. [Announcements](#5-announcements)
6. [Notifications](#6-notifications)
7. [Direct Uploads](#7-direct-uploads)
8. [Admin Management & Analytics](#8-admin-management--analytics)
9. [Staff Moderation & Verification](#9-staff-moderation--verification)

---

## 1. Authentication & Accounts

### `POST /api/v1/accounts/register/`
Create a new member account with email and password.
- **Throttle**: 5/min
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "first_name": "রাকিব",
    "last_name": "হাসান",
    "terms_accepted": true
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "detail": "নিবন্ধন সফল হয়েছে। আপনার ইমেইল যাচাইয়ের জন্য একটি লিংক পাঠানো হয়েছে।"
  }
  ```

### `POST /api/v1/accounts/login/`
Login with email and password. Returns JWT tokens and sets HttpOnly refresh cookie.
- **Throttle**: 5/min
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "access": "<jwt_access_token>",
    "refresh": "<jwt_refresh_token>",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "রাকিব হাসান",
      "role": "member",
      "verification_status": "unverified",
      "is_verified": false
    }
  }
  ```

### `POST /api/v1/accounts/google/`
Login or sign up with Google ID Token. Email is automatically marked verified.
- **Request Body**:
  ```json
  {
    "id_token": "<google_oauth2_id_token>"
  }
  ```

### `POST /api/v1/accounts/token/refresh/`
Rotate and refresh access token.
- **Request Body**:
  ```json
  {
    "refresh": "<jwt_refresh_token>"
  }
  ```

### `POST /api/v1/accounts/logout/`
Blacklists refresh token and clears auth cookie.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "refresh": "<jwt_refresh_token>"
  }
  ```

### `POST /api/v1/accounts/verification/resend/`
Resend email verification link. Expiring cryptographically signed token sent via email.
- **Request Body**: `{"email": "user@example.com"}`

### `POST /api/v1/accounts/verification/confirm/`
Confirm email verification link.
- **Request Body**: `{"token": "<signed_token>"}`

### `POST /api/v1/accounts/password/reset/`
Initiates password reset. Always returns 200 generic message.
- **Request Body**: `{"email": "user@example.com"}`

### `POST /api/v1/accounts/password/reset/confirm/`
Confirms password reset with signed token.
- **Request Body**: `{"token": "<signed_token>", "new_password": "NewSecurePassword123!"}`

### `POST /api/v1/accounts/password/change/`
Change password for authenticated user.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{"old_password": "OldPass123!", "new_password": "NewPass123!"}`

### `GET /api/v1/accounts/me/`
Returns current user profile, batch, verification status, and profile completion info.

### `PATCH /api/v1/accounts/me/`
Update profile details. `batch` and `registration_no` are editable **only** when `verification_status` is `"unverified"` or `"rejected"`. Once `"pending"` or `"verified"`, attempts to edit them return `400 Bad Request` with a Bangla explanation.

### `POST /api/v1/accounts/me/avatar/`
Update profile picture URL.
- **Request Body**: `{"profile_picture_url": "https://cdn.example.com/avatar.jpg"}`

### `GET /api/v1/accounts/me/verification/`
Returns community verification status, latest application details, rejection reason (if rejected), and list of missing profile requirements.

### `POST /api/v1/accounts/me/verification/apply/`
Submits application for community verification.
- **Prerequisites**:
  - `email_verified == True`
  - `batch` is set
  - `registration_no` is set and valid format
  - `verification_status` in (`"unverified"`, `"rejected"`)
  - No active pending verification request
- **Side effects**:
  - Sets `verification_status = "pending"`
  - Takes immutable snapshot of declared batch and registration number
  - Dispatches `verification_request` notifications to all admins and moderators
  - Writes audit log

### `GET /api/v1/accounts/me/sessions/`
List active logged-in device sessions.

### `DELETE /api/v1/accounts/me/sessions/{session_id}/`
Revoke a specific device session.

---

## 2. Community & Sessions (Protected Staff Endpoints)

Only Admins and Moderators can create, publish, edit, or delete batch learning sessions.

### `GET /api/v1/community/batches/`
List active batches.

### `GET /api/v1/community/tags/`
List available category tags.

### `GET /api/v1/community/sessions/`
List all sessions (including drafts and scheduled) with staff filters:
- Query parameters: `batch`, `status`, `tag`, `state` (`upcoming` / `completed`), `search`.

### `POST /api/v1/community/sessions/`
Create a new learning session. Markdown HTML is sanitized with `nh3`.
- **Request Body**:
  ```json
  {
    "batch": 1,
    "session_number": 5,
    "title": "দিন ৫: গ্রাহক সেবা ও বিপণন",
    "content": "### সেশনের বিস্তারিত বিষয়বস্তু...",
    "status": "published",
    "visibility": "public",
    "cover_image_url": "https://cdn.example.com/cover.jpg",
    "tags": ["উদ্যোক্তা", "মার্কেটিং"]
  }
  ```

### `GET /api/v1/community/sessions/{slug}/`
Retrieve session detail for staff editor.

### `PATCH /api/v1/community/sessions/{slug}/`
Update session. If slug changes, previous slug is archived in `SessionSlugHistory`.

### `DELETE /api/v1/community/sessions/{slug}/`
Soft deletes session (`is_deleted=True`).

### `POST /api/v1/community/sessions/{slug}/publish/`
Immediately publishes a draft or scheduled session. Triggers Next.js ISR revalidation.

### `POST /api/v1/community/sessions/{slug}/duplicate/`
Duplicates an existing session into a new draft in the specified batch.

---

## 3. Public Endpoints (Anonymous / SEO)

Optimized for high-speed Next.js ISR server-side rendering, CDN caching (ETag, Cache-Control: max-age=60), and link previews.

### `GET /api/v1/public/landing/`
Returns landing page data in a single round-trip:
- Active focused announcement banner
- Featured sessions
- Latest published session
- Next upcoming session preview (no content leaked)

### `GET /api/v1/public/sessions/`
Paginated list of published, non-deleted sessions.
- Query parameters: `batch`, `tag`, `state` (`upcoming` / `completed`), `search`.
- Includes: `slug`, `title`, `batch_number`, `session_number`, `date`, `state`, `cover_image_url`, `excerpt` (Bangla 160-char word-boundary excerpt), `likes_count`, `comments_count`.

### `GET /api/v1/public/sessions/{slug}/`
Public session detail:
- Handles `301 Moved Permanently` hint if slug was renamed.
- Public sessions: Full sanitized content, cover image, public tags, sanitized comments (author names and avatars only).
- Members-only sessions: Returns minimal `{ "slug": "...", "title": "...", "login_required": true }` without leaking private content to crawlers.

### `GET /api/v1/public/sessions/{slug}/meta/`
SEO metadata generator for Next.js `generateMetadata()`:
- `title`, `description` (clean 160-character excerpt), `og_image_url`, `canonical_url`
- Pre-built Schema.org `Article` JSON-LD object ready for script tag injection.

### `GET /api/v1/public/sitemap/`
Returns all published session slugs, dates, and update times for Next.js `sitemap.xml`.

---

## 4. Interactions & Personal Notes

Interactions require authentication and community verification (staff can always interact).

### `POST /api/v1/interactions/sessions/{slug}/like/`
Toggle like on a session. Returns `{"liked": true/false, "likes_count": int}`.

### `POST /api/v1/interactions/sessions/{slug}/bookmark/`
Toggle bookmark on a session. Returns `{"bookmarked": true/false}`.

### `GET /api/v1/interactions/sessions/{slug}/comments/`
List comments and nested replies on a session.

### `POST /api/v1/interactions/sessions/{slug}/comments/`
Post a comment or reply (`parent` id optional). Content is sanitized with `nh3`.

### `DELETE /api/v1/interactions/comments/{id}/`
Soft delete user's own comment.

### `POST /api/v1/interactions/comments/{id}/report/`
Report inappropriate comment for staff review.
- **Request Body**: `{"reason": "স্প্যাম বা বিজ্ঞাপন"}`

### `GET /api/v1/interactions/sessions/{slug}/notes/`
### `PUT /api/v1/interactions/sessions/{slug}/notes/`
Strictly private, encrypted-at-rest session note unique to the authenticated user.

### `GET /api/v1/interactions/notes/`
### `POST /api/v1/interactions/notes/`
### `DELETE /api/v1/interactions/notes/{id}/`
General personal notes not tied to any post. Strictly private.

### `GET /api/v1/interactions/me/bookmarks/`
List all sessions bookmarked by the user.

### `GET /api/v1/interactions/me/activity/`
User's personal activity feed (liked sessions, commented sessions, notes count).

---

## 5. Announcements

### `GET /api/v1/announcements/`
Public list of active announcements sorted by priority.

### `POST /api/v1/announcements/` (Staff only)
Create announcement. Enforces max 2 focused and max 4 active announcements simultaneously.

### `PATCH /api/v1/announcements/{id}/` (Staff only)
Update announcement details or toggle active/focused.

### `POST /api/v1/announcements/reorder/` (Staff only)
Reorder priorities in bulk.

---

## 6. Notifications

### `GET /api/v1/notifications/`
List in-app notifications with `unread_count`.

### `POST /api/v1/notifications/{id}/read/`
Mark a single notification as read.

### `POST /api/v1/notifications/read-all/`
Mark all notifications as read.

### `GET /api/v1/notifications/preferences/`
### `PATCH /api/v1/notifications/preferences/`
Manage email and in-app notification preferences (`email_new_session`, `email_verification`, `email_announcement`, `in_app_enabled`).

---

## 7. Direct Uploads

### `POST /api/v1/uploads/`
Generate a presigned S3 / Cloudflare R2 direct upload URL.
- **Validation**:
  - Allowed types: `image/jpeg`, `image/png`, `image/webp`
  - Max size: 5 MB (5,242,880 bytes)
- **Request Body**:
  ```json
  {
    "filename": "banner.png",
    "content_type": "image/png",
    "file_size": 1048576
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "upload_url": "https://s3.amazonaws.com/bucket/...",
    "file_url": "https://cdn.domain.com/uploads/<uuid>/hash.png",
    "key": "uploads/<uuid>/hash.png",
    "headers": {
      "Content-Type": "image/png"
    }
  }
  ```

---

## 8. Admin Management & Analytics

### `GET /api/v1/admin/users/`
Search and filter users with aggregated engagement counts (`comments_count`, `likes_given_count`, `bookmarks_count`, `notes_count`, `posts_commented_count`).
- **Privacy**: Exposes counts only; never reveals private note contents.

### `PATCH /api/v1/admin/users/{id}/`
Update user role, batch, registration number, or verification status. Logs audit entry.

### `DELETE /api/v1/admin/users/{id}/`
Soft delete user (`is_active = False`). Logs audit entry.

### `POST /api/v1/admin/users/{id}/assign-moderator/`
Promote user to Moderator role (`role = "moderator"`, `is_staff = True`).

### `POST /api/v1/admin/users/{id}/revoke-moderator/`
Revoke Moderator role back to Member (`role = "member"`, `is_staff = False`).

### `GET /api/v1/admin/audit-logs/`
Paginated audit logs with search, actor, action, and date-range filtering.

### `POST /api/v1/admin/notify/`
Broadcast notification to target group:
- `recipient_type`: `"all"` | `"staff"` | `"batch"` | `"user"`
- `target_id`: batch ID or user UUID (if batch/user)
- `title`, `message`

### `GET /api/v1/admin/analytics/`
Comprehensive platform statistics:
- Current totals & previous period totals with deltas (users, sessions, likes, comments, bookmarks)
- Verification queue counts
- Sessions breakdown by status
- Daily signups, likes, comments time series
- Top sessions by total engagement
- Per-batch breakdown of verified members and published sessions

### `GET /api/v1/admin/comments/`
Moderation list of all comments with report counts and hidden filter.

### `DELETE /api/v1/admin/comments/{id}/`
Soft delete any inappropriate comment.

---

## 9. Staff Moderation & Verification

Staff (Admins and Moderators) endpoints for community operations.

### `GET /api/v1/accounts/staff/verification-requests/`
List pending member verification applications. Flags `roster_match: true/false` if MemberRoster table has a matching batch + registration number.

### `POST /api/v1/accounts/staff/verification-requests/{id}/approve/`
Approve member verification application:
- Locks user's `batch` and `registration_no`
- Sets `verification_status = "verified"`
- Marks MemberRoster entry as claimed
- Notifies user via in-app notification and email
- Concurrency control: protected with `select_for_update()`; returns `409 Conflict` if already processed.

### `POST /api/v1/accounts/staff/verification-requests/{id}/reject/`
Reject member verification application:
- Requires `rejection_reason`
- Sets `verification_status = "rejected"`
- Allows user to correct registration info and reapply
- Notifies user with reason and profile update link

### `GET /api/v1/staff/comment-reports/`
List user-reported comments (`pending`, `resolved`, `dismissed`).

### `POST /api/v1/staff/comment-reports/{id}/resolve/`
Resolve or dismiss a report. Optionally hides the flagged comment (`hide_comment: true`).
