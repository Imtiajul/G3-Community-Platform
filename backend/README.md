# নিজের বলার মতো একটা গল্প (Community Platform Backend API)

A production-grade, headless REST API built with **Python 3.12**, **Django 5.x**, **Django REST Framework (DRF)**, and **PostgreSQL 16**. The platform is designed specifically for the batch-based learning community "নিজের বলার মতো একটা গল্প", powering a public-facing **Next.js (App Router)** frontend with SEO-optimized sessions, community verification, role-based workflows, interactions, Celery scheduling, and direct presigned S3/R2 uploads.

---

## 📑 Table of Contents
1. [Tech Stack](#-tech-stack)
2. [Modular Architecture](#-modular-architecture)
3. [Quickstart & Local Setup](#-quickstart--local-setup)
4. [Docker Deployment](#-docker-deployment)
5. [Database & Default Credentials](#-database--default-credentials)
6. [Interactive API Docs (Swagger / Redoc)](#-interactive-api-docs)
7. [Full API Reference Documentation](#-full-api-reference-documentation)
   - [1. Authentication & Accounts](#1-authentication--accounts)
   - [2. Community Verification Application Flow](#2-community-verification-application-flow)
   - [3. Public Endpoints (SEO & Next.js ISR)](#3-public-endpoints-seo--nextjs-isr)
   - [4. Community & Sessions (Staff Authoring)](#4-community--sessions-staff-authoring)
   - [5. Interactions & Private Notes](#5-interactions--private-notes)
   - [6. Announcements Engine](#6-announcements-engine)
   - [7. Notifications System](#7-notifications-system)
   - [8. Direct File Uploads (S3 / Cloudflare R2)](#8-direct-file-uploads-s3--cloudflare-r2)
   - [9. Admin Management & Platform Analytics](#9-admin-management--platform-analytics)
   - [10. Staff Moderation & Verification Review](#10-staff-moderation--verification-review)
8. [Automated Testing Suite](#-automated-testing-suite)
9. [Next.js App Router Integration Guide](#-nextjs-app-router-integration-guide)
10. [Production Deployment Checklist](#-production-deployment-checklist)

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Python 3.12+** | Core runtime |
| **Django 5.1.x & DRF 3.17.x** | Web framework and REST API engine |
| **PostgreSQL 16** | Primary relational DB with `pg_trgm` extension for Bangla search |
| **psycopg 3 (`psycopg-binary`)** | Modern PostgreSQL database adapter |
| **Celery 5.7 & Redis 8** | Background worker, scheduled task publishing, and caching |
| **SimpleJWT** | JWT authentication with token rotation and blacklist |
| **nh3** | HTML sanitizer for user & markdown session content |
| **django-storages & boto3** | S3 / Cloudflare R2 presigned direct uploads |
| **drf-spectacular** | OpenAPI 3.0 schema generation, Swagger UI & Redoc |
| **pytest & factory_boy** | Automated test suite (80 unit and integration tests) |
| **Docker & Docker Compose** | Containerized multi-service deployment |

---

## 🏛 Modular Architecture

The backend follows a **Modular, Layered Architecture** with isolated business logic:

```text
backend/
├── apps/
│   ├── accounts/          # Custom User, JWT cookie auth, verification flow, sessions
│   ├── community/         # Batches, Sessions, Tags, Public SEO & Next.js revalidation
│   ├── interactions/      # Likes, Bookmarks, Threaded Comments, Private Notes
│   ├── announcements/     # Focused banners & prioritized community notices
│   ├── notifications/     # In-app notifications & email preferences
│   ├── analytics/         # Admin metrics, engagement stats, moderation, audit views
│   ├── audit/             # Immutable audit log service and models
│   ├── uploads/           # Presigned S3/R2 direct uploads & avatar updates
│   └── core/              # Shared pagination, Bangla exceptions, management commands
├── config/
│   ├── settings/
│   │   ├── base.py        # Shared configuration
│   │   ├── local.py       # Local development (auto DB fallback)
│   │   ├── test.py        # Fast in-memory testing settings
│   │   └── production.py  # Production settings (SSL, Sentry, Strict Cookies)
│   ├── urls.py            # Root URL routing table
│   └── celery.py          # Celery configuration
├── docs/                  # API.md, NEXTJS.md, ASSUMPTIONS.md, README.md
├── tests/                 # 80 automated pytest test cases
├── Dockerfile             # Multi-stage container build
├── docker-compose.yml     # Multi-container orchestration (db, redis, web, celery)
└── manage.py              # Django management CLI
```

---

## ⚡ Quickstart & Local Setup

### 1. Clone & Enter Directory
```powershell
cd "d:\Programs\OneDrive - ewu.edu.bd\Ducument\Codings\Nijer bolar moto golpo Project\backend"
```

### 2. Activate Virtual Environment
```powershell
.venv\Scripts\Activate.ps1
```

### 3. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 4. Database Setup & Migration
The local settings dynamically detect whether PostgreSQL is running on port `5432`. If active, it connects to PostgreSQL; otherwise, it gracefully falls back to SQLite (`db.sqlite3`).

```powershell
python manage.py migrate
```

### 5. Populate Sample Community Data
```powershell
python manage.py seed_data
```
This populates:
- Batches (1, 2, 16)
- Tags (উদ্যোক্তা, নৈতিকতা, লিডারশিপ, সেলস ও মার্কেটিং, মাইন্ডসেট)
- Published, scheduled, and draft sessions with rich Bangla markdown
- Pre-configured user accounts with varied roles and verification states
- Announcements, member roster, verification requests, and interactions

### 6. Start the Server
```powershell
python manage.py runserver
```
Visit **http://127.0.0.1:8000/api/docs/** to view the interactive Swagger documentation.

---

## 🐳 Docker Deployment

To spin up the entire production-ready stack in containers (PostgreSQL 16, Redis 7, Django Gunicorn web, Celery worker, Celery beat):

```powershell
# Build and start all services in the background
docker compose up --build -d

# Check running services
docker compose ps

# View live web logs
docker compose logs -f web

# Populate demo data inside the container
docker compose exec web python manage.py seed_data
```

---

## 🔑 Database & Default Credentials

When `python manage.py seed_data` is run, the following accounts are ready for testing:

| Role | Email / Username | Password | Notes |
|---|---|---|---|
| **Admin** | `admin@nijerbolarmotogolpo.com` | `AdminSecretPass123!` | Superuser, staff, full admin permissions |
| **Moderator** | `moderator@nijerbolarmotogolpo.com` | `ModSecretPass123!` | Staff, session authoring, verification review |
| **Verified Member** | `member@nijerbolarmotogolpo.com` | `MemberPass123!` | Batch 1, verified, full interaction rights |
| **Pending Member** | `pending@nijerbolarmotogolpo.com` | `PendingPass123!` | Batch 2, verification application under review |
| **Unverified Member**| `unverified@nijerbolarmotogolpo.com` | `UnverifiedPass123!` | Email unverified, read-only access |

### Create a Custom Admin
```powershell
python manage.py create_admin --email your_email@example.com --password YourPass123!
```

---

## 📖 Interactive API Docs

Once the server is running, explore and test every endpoint interactively:
- **Swagger UI**: [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)
- **Swagger (direct)**: [http://127.0.0.1:8000/api/docs/swagger/](http://127.0.0.1:8000/api/docs/swagger/)
- **Redoc**: [http://127.0.0.1:8000/api/docs/redoc/](http://127.0.0.1:8000/api/docs/redoc/)
- **OpenAPI 3.0 Schema**: [http://127.0.0.1:8000/api/docs/schema/](http://127.0.0.1:8000/api/docs/schema/)

---

## 📡 Full API Reference Documentation

**Base API Path**: `/api/v1`  
All request bodies and responses are in `application/json` format unless stated otherwise.

---

### 1. Authentication & Accounts

#### `POST /api/v1/accounts/register/`
Create a new member account. Staff are not notified on signup; a signed email verification link is sent via Celery.
- **Access**: Public
- **Rate Limit**: 5/min
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

#### `POST /api/v1/accounts/login/`
Authenticate with email and password. Returns short-lived access JWT (30m) and refresh JWT (14d), setting an HttpOnly cookie for Next.js SSR.
- **Access**: Public
- **Rate Limit**: 5/min
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
      "id": "e93f6c8d-7871-462a-8ef1-f402f085ba4b",
      "email": "user@example.com",
      "full_name": "রাকিব হাসান",
      "role": "member",
      "verification_status": "unverified",
      "is_verified": false
    }
  }
  ```

#### `POST /api/v1/accounts/google/`
Login or register using a Google OAuth2 ID Token. Google signups automatically count as `email_verified=True`.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "id_token": "<google_oauth2_id_token>"
  }
  ```
- **Response** (`200 OK`): Access and refresh JWT tokens with user payload.

#### `POST /api/v1/accounts/token/refresh/`
Rotate and refresh access token.
- **Access**: Public
- **Request Body**: `{"refresh": "<jwt_refresh_token>"}`
- **Response** (`200 OK`): `{"access": "<new_jwt_access_token>"}`

#### `POST /api/v1/accounts/logout/`
Blacklists refresh token and clears session cookie.
- **Access**: Authenticated (`Authorization: Bearer <token>`)
- **Request Body**: `{"refresh": "<jwt_refresh_token>"}`
- **Response** (`200 OK`): `{"detail": "সফলভাবে লগআউট করা হয়েছে।"}`

#### `POST /api/v1/accounts/verification/resend/`
Resend cryptographically signed email verification link.
- **Access**: Public
- **Request Body**: `{"email": "user@example.com"}`
- **Response** (`200 OK`): Generic success message preventing user enumeration.

#### `POST /api/v1/accounts/verification/confirm/`
Confirm email address using signed token from email.
- **Access**: Public
- **Request Body**: `{"token": "<signed_token>"}`
- **Response** (`200 OK`): `{"detail": "ইমেইল সফলভাবে যাচাই করা হয়েছে।"}`

#### `POST /api/v1/accounts/password/reset/`
Request password reset link.
- **Access**: Public
- **Request Body**: `{"email": "user@example.com"}`
- **Response** (`200 OK`): Generic success response.

#### `POST /api/v1/accounts/password/reset/confirm/`
Set new password using signed token.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "token": "<signed_token>",
    "new_password": "NewSecurePassword123!"
  }
  ```
- **Response** (`200 OK`): `{"detail": "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।"}`

#### `POST /api/v1/accounts/password/change/`
Change password for authenticated user.
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "old_password": "OldPassword123!",
    "new_password": "NewPassword123!"
  }
  ```
- **Response** (`200 OK`): `{"detail": "পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে।"}`

#### `GET /api/v1/accounts/me/`
Retrieve profile of currently authenticated user.
- **Access**: Authenticated
- **Response** (`200 OK`): Returns `id`, `email`, `first_name`, `last_name`, `profile_picture_url`, `role`, `email_verified`, `verification_status`, `is_verified`, `batch`, `registration_no`, `date_joined`.

#### `PATCH /api/v1/accounts/me/`
Update profile information.
- **Access**: Authenticated
- **Rule**: `batch` and `registration_no` can **only** be modified when `verification_status` is `"unverified"` or `"rejected"`. If status is `"pending"` or `"verified"`, updates return `400 Bad Request` with a Bangla explanation.
- **Request Body**:
  ```json
  {
    "first_name": "আরিফুল",
    "last_name": "ইসলাম",
    "batch": 1,
    "registration_no": "REG-1001"
  }
  ```

#### `POST /api/v1/accounts/me/avatar/`
Update profile avatar image URL.
- **Access**: Authenticated
- **Request Body**: `{"profile_picture_url": "https://cdn.example.com/avatar.jpg"}`
- **Response** (`200 OK`): `{"detail": "প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে।", "profile_picture_url": "..."}`

#### `GET /api/v1/accounts/me/sessions/`
List active device login sessions.
- **Access**: Authenticated
- **Response** (`200 OK`): Array of `{id, user_agent, ip_address, last_active, is_current}`.

#### `DELETE /api/v1/accounts/me/sessions/{session_id}/`
Revoke a specific logged-in device session.
- **Access**: Authenticated
- **Response** (`200 OK`): `{"detail": "সেশন সফলভাবে বাতিল করা হয়েছে।"}`

---

### 2. Community Verification Application Flow

#### `GET /api/v1/accounts/me/verification/`
Check verification status, latest application, reviewer feedback, and missing profile items.
- **Access**: Authenticated
- **Response** (`200 OK`):
  ```json
  {
    "verification_status": "unverified",
    "is_verified": false,
    "declared_batch": 1,
    "declared_registration_no": "REG-1001",
    "missing_fields": [],
    "can_apply": true,
    "latest_request": null
  }
  ```

#### `POST /api/v1/accounts/me/verification/apply/`
Submit an application for community member verification.
- **Access**: Authenticated
- **Prerequisites**:
  - `email_verified == True`
  - `batch` is selected
  - `registration_no` is set and valid format
  - `verification_status` is `"unverified"` or `"rejected"`
  - No active pending application
- **Side Effects**:
  - Takes immutable snapshot of declared batch and registration number
  - Sets `verification_status = "pending"`
  - Creates in-app `verification_request` notifications for all Admins and Moderators
  - Dispatches email alerts to staff whose preferences permit it
  - Writes audit log
- **Response** (`201 Created`):
  ```json
  {
    "detail": "ভেরিফিকেশনের আবেদন সফলভাবে জমা হয়েছে। মডারেটরগণ শীঘ্রই এটি পর্যালোচনা করবেন।",
    "verification_status": "pending",
    "request_id": "uuid"
  }
  ```

---

### 3. Public Endpoints (SEO & Next.js ISR)

Optimized for high-speed CDN caching (`Cache-Control: public, max-age=60`), ETags (`304 Not Modified`), and link previews.

#### `GET /api/v1/public/landing/`
Aggregated landing page data in a single round-trip.
- **Access**: Public
- **Response** (`200 OK`):
  ```json
  {
    "announcements": {
      "focused": [...],
      "active": [...]
    },
    "featured_sessions": [...],
    "latest_session": {...},
    "upcoming_session_preview": {
      "title": "দিন ৩: কাস্টমার রিলেশনশিপ",
      "date": "2026-11-21",
      "session_number": 3,
      "batch_number": 1
    }
  }
  ```

#### `GET /api/v1/public/sessions/`
Paginated directory of published, non-deleted sessions.
- **Access**: Public
- **Query Parameters**:
  - `batch`: Filter by batch number or ID
  - `tag`: Filter by tag slug
  - `state`: Filter by computed state (`upcoming` | `completed`)
  - `search`: Substring search in title and content
  - `page`, `page_size`: Pagination parameters (default 20, max 100)
- **Response** (`200 OK`):
  ```json
  {
    "count": 25,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": "uuid",
        "slug": "1-1-k8m2px",
        "title": "দিন ১: ভালো মানুষ হওয়া কেন সবচেয়ে জরুরি?",
        "batch_number": 1,
        "session_number": 1,
        "date": "2026-11-18",
        "state": "completed",
        "excerpt": "উদ্যোক্তা হওয়ার প্রথম শর্ত ভালো মানুষ হওয়া। নিজের বলার মতো একটা গল্প ফাউন্ডেশনের মূল ভিত্তি...",
        "cover_image_url": "https://images.unsplash.com/...",
        "likes_count": 14,
        "comments_count": 8,
        "tags": [{"name": "উদ্যোক্তা", "slug": "entrepreneur", "color": "#2563eb"}]
      }
    ]
  }
  ```

#### `GET /api/v1/public/sessions/{slug}/`
Public session detail view with automatic slug history 301 redirection.
- **Access**: Public
- **Handling**:
  - **Redirect Hint**: If the slug was changed, returns `301 Moved Permanently` with `{ "redirect_to": "<new_slug>" }`.
  - **Public Sessions**: Returns full sanitized HTML (`nh3`), cover image, tags, and sanitized comment list (author names and avatars only; email is never leaked).
  - **Members-only Sessions**: Returns minimal payload `{ "slug": "...", "title": "...", "login_required": true }` preventing content scraping.

#### `GET /api/v1/public/sessions/{slug}/meta/`
SEO metadata generator for Next.js `generateMetadata()` and OpenGraph/Twitter Cards.
- **Access**: Public
- **Response** (`200 OK`):
  ```json
  {
    "title": "দিন ১: ভালো মানুষ হওয়া কেন সবচেয়ে জরুরি?",
    "description": "উদ্যোক্তা হওয়ার প্রথম শর্ত ভালো মানুষ হওয়া...",
    "og_image_url": "https://images.unsplash.com/...",
    "canonical_url": "https://nijerbolarmotogolpo.com/sessions/1-1-k8m2px",
    "schema_org": {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "দিন ১: ভালো মানুষ হওয়া কেন সবচেয়ে জরুরি?",
      "image": "https://images.unsplash.com/...",
      "datePublished": "2026-11-18T10:00:00Z"
    }
  }
  ```

#### `GET /api/v1/public/sitemap/`
Lightweight sitemap dataset for Next.js `app/sitemap.ts`.
- **Access**: Public
- **Response** (`200 OK`): Array of `{ "slug": "...", "updated_at": "...", "date": "..." }`.

---

### 4. Community & Sessions (Staff Authoring)

Only Admins and Moderators can author, edit, or publish learning sessions.

#### `GET /api/v1/community/batches/`
List all community cohorts/batches.
- **Access**: Authenticated

#### `POST /api/v1/community/batches/`
Create a new batch.
- **Access**: Staff only
- **Request Body**: `{"number": 17, "name": "ব্যাচ ১৭", "start_date": "2026-06-01"}`

#### `GET /api/v1/community/tags/`
List all session tags.
- **Access**: Authenticated

#### `POST /api/v1/community/tags/`
Create category tag.
- **Access**: Staff only
- **Request Body**: `{"name": "মোটিভেশন", "color": "#16a34a"}`

#### `GET /api/v1/community/sessions/`
List sessions for staff dashboard (includes drafts and scheduled).
- **Access**: Staff only
- **Filters**: `batch`, `status`, `tag`, `state`, `search`.

#### `POST /api/v1/community/sessions/`
Create learning session. Markdown content is automatically sanitized with `nh3`.
- **Access**: Staff only
- **Request Body**:
  ```json
  {
    "batch": 1,
    "session_number": 5,
    "title": "দিন ৫: গ্রাহক সেবা ও বিপণন",
    "content": "### গ্রাহক সন্তুষ্টিই ব্যবসার ভিত্তি\n\nবিস্তারিত কন্টেন্ট...",
    "status": "published",
    "visibility": "public",
    "date": "2026-11-20",
    "cover_image_url": "https://cdn.example.com/cover.jpg",
    "tags": ["উদ্যোক্তা", "মার্কেটিং"]
  }
  ```

#### `GET /api/v1/community/sessions/{slug}/`
Retrieve session details for editing.
- **Access**: Staff only

#### `PATCH /api/v1/community/sessions/{slug}/`
Update session details. If slug changes, previous slug is recorded in `SessionSlugHistory`.
- **Access**: Staff only

#### `DELETE /api/v1/community/sessions/{slug}/`
Soft delete session (`is_deleted=True`).
- **Access**: Staff only

#### `POST /api/v1/community/sessions/{slug}/publish/`
Immediately publish a draft or scheduled session. Triggers Next.js ISR on-demand revalidation.
- **Access**: Staff only

#### `POST /api/v1/community/sessions/{slug}/duplicate/`
Duplicate session into another batch as a draft.
- **Access**: Staff only
- **Request Body**: `{"target_batch_id": 2}`

---

### 5. Interactions & Private Notes

Interactions require authentication and verified community status (unverified members receive `403 Forbidden`).

#### `POST /api/v1/interactions/sessions/{slug}/like/`
Toggle like on a session.
- **Access**: Verified Member / Staff
- **Response** (`200 OK`): `{"liked": true, "likes_count": 15}`

#### `POST /api/v1/interactions/sessions/{slug}/bookmark/`
Toggle bookmark on a session.
- **Access**: Verified Member / Staff
- **Response** (`200 OK`): `{"bookmarked": true}`

#### `GET /api/v1/interactions/sessions/{slug}/comments/`
List comments and nested replies on a session.
- **Access**: Authenticated

#### `POST /api/v1/interactions/sessions/{slug}/comments/`
Post a comment or reply to an existing comment.
- **Access**: Verified Member / Staff
- **Request Body**:
  ```json
  {
    "content": "অসাধারণ অনুপ্রেরণাদায়ক সেশন!",
    "parent": null
  }
  ```

#### `DELETE /api/v1/interactions/comments/{id}/`
Soft delete user's own comment.
- **Access**: Comment Owner / Staff

#### `POST /api/v1/interactions/comments/{id}/report/`
Report an inappropriate comment for staff review.
- **Access**: Authenticated
- **Request Body**: `{"reason": "স্প্যাম বা আপত্তিকর ভাষা"}`
- **Response** (`201 Created`): `{"detail": "রিপোর্টটি সফলভাবে জমা হয়েছে।"}`

#### `GET /api/v1/interactions/sessions/{slug}/notes/`
Retrieve strictly private session note.
- **Access**: Authenticated (Only note owner can access)

#### `PUT /api/v1/interactions/sessions/{slug}/notes/`
Create or update private note for a specific session.
- **Access**: Authenticated
- **Request Body**: `{"content": "আমার নিজস্ব নোট: প্রতিদিন সকালে ১ ঘণ্টা পড়াশোনা করব।"}`

#### `GET /api/v1/interactions/notes/`
List all general personal notes.
- **Access**: Authenticated

#### `POST /api/v1/interactions/notes/`
Create general personal note.
- **Access**: Authenticated
- **Request Body**: `{"content": "আগামী মাসের ব্যবসায়িক পরিকল্পনা..."}`

#### `DELETE /api/v1/interactions/notes/{id}/`
Delete personal note.
- **Access**: Note Owner

#### `GET /api/v1/interactions/me/bookmarks/`
List all sessions bookmarked by the authenticated user.
- **Access**: Authenticated

#### `GET /api/v1/interactions/me/activity/`
Summary of user's personal activity feed (liked count, bookmarked count, notes count).
- **Access**: Authenticated

---

### 6. Announcements Engine

#### `GET /api/v1/announcements/`
Public list of active announcements sorted by priority.
- **Access**: Public

#### `POST /api/v1/announcements/`
Create community announcement. Enforces max 2 focused and max 4 active announcements simultaneously.
- **Access**: Staff only
- **Request Body**:
  ```json
  {
    "title": "ব্যাচ ১৬ এর ওরিয়েন্টেশন ক্লাস",
    "content": "অনলাইন লাইভ ক্লাসে অংশ নিন...",
    "link": "https://nijerbolarmotogolpo.com/live",
    "is_focused": true,
    "priority": 10,
    "starts_at": "2026-11-20T00:00:00Z",
    "ends_at": "2026-11-27T00:00:00Z"
  }
  ```

#### `PATCH /api/v1/announcements/{id}/`
Update announcement details or toggle status.
- **Access**: Staff only

#### `DELETE /api/v1/announcements/{id}/`
Delete announcement.
- **Access**: Staff only

#### `POST /api/v1/announcements/reorder/`
Bulk reorder announcement priorities.
- **Access**: Staff only
- **Request Body**:
  ```json
  {
    "orders": [
      {"id": "uuid-1", "priority": 10},
      {"id": "uuid-2", "priority": 5}
    ]
  }
  ```

---

### 7. Notifications System

#### `GET /api/v1/notifications/`
List notifications for authenticated user, including `unread_count`.
- **Access**: Authenticated

#### `POST /api/v1/notifications/{id}/read/`
Mark a single notification as read.
- **Access**: Authenticated

#### `POST /api/v1/notifications/read-all/`
Mark all notifications as read.
- **Access**: Authenticated

#### `GET /api/v1/notifications/preferences/`
Retrieve notification delivery preferences.
- **Access**: Authenticated

#### `PATCH /api/v1/notifications/preferences/`
Update delivery preferences.
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "in_app_enabled": true,
    "email_new_session": true,
    "email_verification": true,
    "email_announcement": false
  }
  ```

---

### 8. Direct File Uploads (S3 / Cloudflare R2)

Direct client-to-storage presigned upload URL generator. Avoids piping heavy binaries through the Django application server.

#### `POST /api/v1/uploads/`
Generate presigned upload URL and permanent file CDN URL.
- **Access**: Authenticated
- **Validation**:
  - Allowed types: `image/jpeg`, `image/png`, `image/webp`
  - Maximum size: 5 MB (5,242,880 bytes)
- **Request Body**:
  ```json
  {
    "filename": "cover.png",
    "content_type": "image/png",
    "file_size": 1048576
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "upload_url": "https://s3.amazonaws.com/bucket/uploads/...?signature=...",
    "file_url": "https://cdn.domain.com/uploads/user-id/hash.png",
    "key": "uploads/user-id/hash.png",
    "headers": {
      "Content-Type": "image/png"
    }
  }
  ```

---

### 9. Admin Management & Platform Analytics

Endpoints restricted to users with `role = "admin"`.

#### `GET /api/v1/admin/users/`
Search and filter community members with aggregated engagement counts.
- **Access**: Admin only
- **Filters**: `role`, `verification_status`, `email_verified`, `batch`, `is_active`, `search`.
- **Response Fields**: Includes `comments_count`, `likes_given_count`, `bookmarks_count`, `notes_count`, `posts_commented_count`.
- **Privacy Guarantee**: Note contents are never exposed; only numerical count is provided.

#### `PATCH /api/v1/admin/users/{id}/`
Update member profile, batch, registration number, or verification status. Logs audit entry.
- **Access**: Admin only

#### `DELETE /api/v1/admin/users/{id}/`
Soft delete user account (`is_active = False`). Logs audit entry.
- **Access**: Admin only

#### `POST /api/v1/admin/users/{id}/assign-moderator/`
Promote user to Moderator role (`role = "moderator"`, `is_staff = True`).
- **Access**: Admin only

#### `POST /api/v1/admin/users/{id}/revoke-moderator/`
Revoke Moderator role back to Member (`role = "member"`, `is_staff = False`).
- **Access**: Admin only

#### `POST /api/v1/admin/moderators/`
Invite or create a new moderator by email with a password-setup link.
- **Access**: Admin only
- **Request Body**: `{"email": "newmod@example.com", "first_name": "করিম"}`

#### `GET /api/v1/admin/audit-logs/`
Searchable system audit trail.
- **Access**: Admin only
- **Filters**: `actor`, `action`, `target_type`, `date_from`, `date_to`, `search`.

#### `POST /api/v1/admin/notify/`
Broadcast notification to targeted user groups.
- **Access**: Admin only
- **Request Body**:
  ```json
  {
    "recipient_type": "all",
    "target_id": "",
    "title": "গুরুত্বপূর্ণ নোটিশ",
    "message": "আজকের লাইভ সেশন রাত ৯টায় শুরু হবে।"
  }
  ```
  *(Choices for `recipient_type`: `"all"`, `"staff"`, `"batch"`, `"user"`)*

#### `GET /api/v1/admin/analytics/`
Comprehensive platform statistics with comparison deltas.
- **Access**: Admin only
- **Query Parameters**: `date_from`, `date_to`, `batch_id`.
- **Response** (`200 OK`):
  ```json
  {
    "period": {"date_from": "2026-10-21", "date_to": "2026-11-20"},
    "current_totals": {"users": 150, "sessions": 45, "likes": 320, "comments": 210, "bookmarks": 85},
    "previous_totals": {"users": 110, "sessions": 30, "likes": 190, "comments": 140, "bookmarks": 50},
    "deltas": {"users": 40, "sessions": 15, "likes": 130, "comments": 70, "bookmarks": 35},
    "users_by_status": {"verified": 120, "pending": 15, "unverified": 10, "rejected": 5},
    "sessions_by_status": {"published": 40, "scheduled": 3, "draft": 2},
    "top_sessions_by_engagement": [...],
    "batch_stats": [...]
  }
  ```

#### `GET /api/v1/admin/comments/`
Moderation list of all comments with report counts.
- **Access**: Admin only
- **Filters**: `is_hidden`, `is_deleted`, `reported`, `search`.

#### `DELETE /api/v1/admin/comments/{id}/`
Soft delete any comment across the platform. Logs audit entry.
- **Access**: Admin only

---

### 10. Staff Moderation & Verification Review

Accessible to both **Admins** and **Moderators**.

#### `GET /api/v1/accounts/staff/verification-requests/`
List pending member verification applications. Flags `roster_match: true/false` if the declared batch and registration number matches an entry in `MemberRoster`.
- **Access**: Staff only
- **Filters**: `status` (`pending`, `approved`, `rejected`), `batch`, `search`.

#### `GET /api/v1/accounts/staff/verification-requests/{id}/`
Retrieve application detail.
- **Access**: Staff only

#### `POST /api/v1/accounts/staff/verification-requests/{id}/approve/`
Approve member verification application:
- Locks user's `batch` and `registration_no`
- Sets `verification_status = "verified"`
- Marks MemberRoster entry as claimed
- Notifies user via in-app notification and email
- Concurrency Safe: Uses `select_for_update()` in an atomic transaction; returns `409 Conflict` if another moderator processed the request simultaneously.
- **Access**: Staff only
- **Request Body**: `{"reviewer_note": "তথ্য সঠিক পাওয়া গেছে।"}`

#### `POST /api/v1/accounts/staff/verification-requests/{id}/reject/`
Reject member verification application:
- Requires `rejection_reason`
- Sets `verification_status = "rejected"`
- User can edit registration info and reapply
- Notifies user with reason and profile update link
- **Access**: Staff only
- **Request Body**:
  ```json
  {
    "rejection_reason": "রেজিস্ট্রেশন নম্বরের সাথে ব্যাচের রেকর্ড মেলেনি।",
    "reviewer_note": "অভ্যন্তরীণ নোট..."
  }
  ```

#### `GET /api/v1/staff/comment-reports/`
List user-reported comments.
- **Access**: Staff only
- **Filters**: `status` (`pending`, `resolved`, `dismissed`).

#### `POST /api/v1/staff/comment-reports/{id}/resolve/`
Resolve or dismiss a reported comment.
- **Access**: Staff only
- **Request Body**:
  ```json
  {
    "status": "resolved",
    "hide_comment": true
  }
  ```

---

## 🧪 Automated Testing Suite

The project includes an automated test suite verifying business logic, concurrency handling, permissions, and security.

Run pytest:
```powershell
pytest
```

**Test Coverage Highlights (80 Passing Tests)**:
- `tests/accounts/test_auth.py`: Registration, JWT rotation, cookie auth, password reset, Google login (22 tests)
- `tests/accounts/test_verification_flow.py`: Application locking, concurrency 409 conflict, roster matching (11 tests)
- `tests/community/test_sessions.py`: Staff authoring, slug history, draft/scheduled states (11 tests)
- `tests/community/test_public_endpoints.py`: Next.js ISR, ETags, 304 handling, Schema.org Article JSON-LD (10 tests)
- `tests/community/test_scheduled_publishing.py`: Atomic Celery publishing with `skip_locked=True` (1 test)
- `tests/interactions/test_interactions.py`: Likes, bookmarks, threaded comments, private notes (9 tests)
- `tests/announcements/test_announcements.py`: Active limits, focused priority, reordering (4 tests)
- `tests/admin/test_admin_and_uploads.py`: Presigned uploads, admin analytics, moderator assignments, comment moderation (12 tests)

---

## 🌐 Next.js App Router Integration Guide

Refer to [docs/NEXTJS.md](file:///d:/Programs/OneDrive%20-%20ewu.edu.bd/Ducument/Codings/Nijer%20bolar%20moto%20golpo%20Project/backend/docs/NEXTJS.md) for full implementation details:
- **Server Components with ISR**: `revalidate = 300` on `/sessions/[slug]`
- **On-Demand Webhook Handler**: `app/api/revalidate/route.ts` validating `NEXTJS_REVALIDATE_SECRET`
- **Dynamic SEO Metadata**: Generated via `/api/v1/public/sessions/{slug}/meta/`
- **JWT Middleware**: Automatic token refresh handling via HttpOnly cookies
- **Verification Banner**: Alerts unverified members to apply for verification

---

## 🚢 Production Deployment Checklist

1. **Environment Variables**:
   - `DJANGO_SETTINGS_MODULE=config.settings.production`
   - Set strong, random strings for `SECRET_KEY`, `JWT_SIGNING_KEY`, and `NEXTJS_REVALIDATE_SECRET`
   - Set `DEBUG=False` and configure `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
2. **PostgreSQL Configuration**:
   - PostgreSQL 16 with UTF-8 encoding
   - Ensure the database user has permission to enable `CREATE EXTENSION IF NOT EXISTS pg_trgm;`
3. **Cloud Media Storage (S3 / Cloudflare R2)**:
   - Set `USE_S3=True`
   - Provide `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_STORAGE_BUCKET_NAME`, and `AWS_S3_CUSTOM_DOMAIN`
4. **Celery Daemons**:
   - Run worker: `celery -A config worker --loglevel=info`
   - Run beat scheduler: `celery -A config beat --loglevel=info`
5. **Backups & Monitoring**:
   - Configure Sentry via `SENTRY_DSN`
   - Schedule nightly database backups using `pg_dump`
