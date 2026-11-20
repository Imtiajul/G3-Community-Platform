# নিজের বলার মতো একটা গল্প (Community Platform Backend API)

A production-grade, headless backend REST API built with **Django 5.x**, **Django REST Framework**, and **PostgreSQL 16**, specifically engineered for the "নিজের বলার মতো একটা গল্প" batch-based learning community. It powers a modern **Next.js (App Router)** frontend with public SEO-optimized session rendering, role-based content authoring, community verification, interactions, notifications, and scheduled publishing via Celery.

---

## 🚀 Key Highlights & Architectural Features

- **Role-Based Access Control**:
  - **Admin**: Full platform management, moderator assignment, broadcast notifications, audit logs, and analytics.
  - **Moderator**: Session creation/editing, verification review, comment moderation.
  - **Member**: Reading published sessions, liking, commenting, bookmarking, and private note-taking.
- **Two-Phase Community Verification**:
  - Staff are **never spammed** at signup.
  - Users verify email, fill profile (`batch` + `registration_no`), and explicitly apply via `POST /api/v1/accounts/me/verification/apply/`.
  - Immutable batch and registration snapshot taken upon submission.
  - All admins and moderators receive in-app and email notifications.
  - High-concurrency review mechanism with row-level database locking (`select_for_update`) returning `409 Conflict` on race conditions.
  - Optional `MemberRoster` matching imported via CSV.
- **Bangla-First Content & Publishing**:
  - Rich Bangla text support (UTF-8, `pg_trgm` GIN trigram indexes for high-speed fuzzy search).
  - Markdown content safely sanitized via `nh3`.
  - Human-friendly URL slugs (`{batch}-{session_number}-{random}`) with automated `SessionSlugHistory` for permanent 301 redirects.
- **Public SEO & Next.js ISR Integration**:
  - `/api/v1/public/sessions/` endpoints protected with short-TTL cache headers, ETags, and 304 Not Modified handling.
  - Dynamic SEO metadata endpoint generating Schema.org `Article` JSON-LD and clean 160-character Bangla excerpts.
  - On-demand ISR revalidation webhooks dispatched automatically to Next.js on publish, edit, or scheduled Celery release.
- **Privacy & Security**:
  - User notes (`SessionNote` and `PersonalNote`) are strictly private; admin analytics expose counts only, never content.
  - Authentication via SimpleJWT with token rotation, blacklisting, and HttpOnly cookie support.
  - Rate limiting (throttling) on login, registration, verification application, and presigned uploads.
- **Automated Scheduling**:
  - Celery Beat executes every minute to publish scheduled posts atomically using `select_for_update(skip_locked=True)`.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Python 3.12** | Core language runtime |
| **Django 5.x & DRF** | Web framework and REST API engine |
| **PostgreSQL 16** | Relational DB with `pg_trgm` extension |
| **Celery & Redis** | Asynchronous task queue, scheduled publishing, emails |
| **SimpleJWT** | JWT authentication with token rotation & blacklist |
| **nh3** | Blazing-fast HTML sanitizer |
| **django-storages & boto3** | S3 / Cloudflare R2 direct presigned uploads |
| **drf-spectacular** | OpenAPI 3.0 schema generation & Swagger/Redoc UI |
| **pytest & factory_boy** | Automated testing suite (80 passing tests) |
| **Docker & Docker Compose** | Containerized development and deployment |

---

## 📁 Repository Structure

```text
├── apps/
│   ├── accounts/          # Custom User, JWT cookie auth, verification application flow
│   ├── community/         # Batches, Sessions, Tags, Public SEO & Revalidation
│   ├── interactions/      # Likes, Bookmarks, Comments, Reports, Private Notes
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
│   ├── urls.py            # Root URL configuration
│   ├── celery.py          # Celery app definition
│   └── wsgi.py / asgi.py  # Application entry points
├── docs/                  # API, Next.js, and architectural documentation
├── tests/                 # Comprehensive pytest test suite (80 tests)
├── Dockerfile             # Multi-stage production container
├── docker-compose.yml     # Local orchestration (db, redis, web, celery)
└── manage.py              # Django management script
```

---

## ⚡ Quickstart (Local Development)

### 1. Prerequisites
- Python 3.12+ (or [uv](https://github.com/astral-sh/uv))
- PostgreSQL 16 & Redis (optional locally; backend includes automatic SQLite/LocMemCache fallback)

### 2. Setup Virtual Environment & Install Dependencies
```bash
# Clone the repository
git clone <repository_url>
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Run Migrations & Seed Demo Data
```bash
python manage.py migrate
python manage.py seed_data
```

This populates the database with:
- Batches (1, 2, 16)
- Tags (উদ্যোক্তা, নৈতিকতা, লিডারশিপ, সেলস ও মার্কেটিং, মাইন্ডসেট)
- Published, scheduled, and draft sessions with rich Bangla content
- Announcements, member roster, verification requests, and interactions
- Ready-to-use accounts:
  - **Admin**: `admin@nijerbolarmotogolpo.com` / `AdminSecretPass123!`
  - **Moderator**: `moderator@nijerbolarmotogolpo.com` / `ModSecretPass123!`
  - **Verified Member**: `member@nijerbolarmotogolpo.com` / `MemberPass123!`
  - **Pending Member**: `pending@nijerbolarmotogolpo.com` / `PendingPass123!`

### 5. Start Development Servers
```bash
# Terminal 1: Django API server
python manage.py runserver

# Terminal 2: Celery Worker
celery -A config worker -l info

# Terminal 3: Celery Beat (Scheduler)
celery -A config beat -l info
```

Visit the interactive API documentation at:
- **Swagger UI**: http://localhost:8000/api/docs/
- **Redoc**: http://localhost:8000/api/docs/redoc/
- **Django Admin**: http://localhost:8000/admin/

---

## 🐳 Running with Docker Compose

To start all services (PostgreSQL 16 with healthcheck, Redis, Web API, Celery Worker, Celery Beat) in isolated containers:

```bash
docker compose up --build -d
```

Check logs:
```bash
docker compose logs -f web celery_worker
```

Run migrations and seed data in the container:
```bash
docker compose exec web python manage.py migrate
docker compose exec web python manage.py seed_data
```

---

## 🧪 Testing

The test suite covers authentication, verification state transitions, concurrency race conditions, public SEO endpoints, interactions, announcements, presigned uploads, and admin moderation.

Run pytest:
```bash
pytest
```
*Expected: 80 passed in ~10 seconds.*

---

## 🌐 Next.js Frontend Integration

Refer to the complete Next.js App Router integration guide in [NEXTJS.md](file:///d:/Programs/OneDrive%20-%20ewu.edu.bd/Ducument/Codings/Nijer%20bolar%20moto%20golpo%20Project/backend/docs/NEXTJS.md).

It covers:
- Server Components with ISR (`revalidate = 300`)
- On-demand webhook revalidation (`/api/revalidate`)
- Dynamic SEO generation with Schema.org `Article` JSON-LD
- HttpOnly JWT cookie rotation middleware
- Handling public vs members-only preview states
- Verification status warning banners

---

## 🚢 Production Deployment Checklist

1. **Environment Variables**:
   - Set `DJANGO_SETTINGS_MODULE=config.settings.production`
   - Set strong, random values for `SECRET_KEY`, `JWT_SIGNING_KEY`, and `NEXTJS_REVALIDATE_SECRET`
   - Set `DEBUG=False` and configure `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
2. **Database**:
   - PostgreSQL 16 with UTF-8 encoding
   - Ensure the user has permission to install the `pg_trgm` extension
3. **Static & Media Storage**:
   - Set `USE_S3=True`, configure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_STORAGE_BUCKET_NAME`, and `AWS_S3_CUSTOM_DOMAIN`
4. **Process Manager**:
   - Run `gunicorn config.wsgi:application --workers 4 --bind 0.0.0.0:8000` behind Nginx
   - Run `celery -A config worker -l info` and `celery -A config beat -l info` under systemd or Supervisor
5. **Monitoring & Backups**:
   - Configure Sentry via `SENTRY_DSN`
   - Schedule nightly `pg_dump` backups for disaster recovery
