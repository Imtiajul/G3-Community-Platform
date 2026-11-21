import os
from datetime import timedelta
from pathlib import Path
import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env()
# Read .env if it exists
env_file = BASE_DIR / ".env"
if env_file.exists():
    environ.Env.read_env(str(env_file))

SECRET_KEY = env("SECRET_KEY", default="django-insecure-community-platform-secret-key-1234567890")
DEBUG = env.bool("DEBUG", default=False)
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1", "[::1]"])

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.postgres",
    # Third party apps
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
    # Local apps
    "apps.core",
    "apps.accounts",
    "apps.community",
    "apps.interactions",
    "apps.announcements",
    "apps.notifications",
    "apps.analytics",
    "apps.audit",
    "apps.uploads",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "apps.accounts.middleware.UserSessionMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# Database
DATABASES = {
    "default": env.db("DATABASE_URL", default="sqlite:///" + str(BASE_DIR / "db.sqlite3"))
}

# Custom User Model
AUTH_USER_MODEL = "accounts.User"

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = env("LANGUAGE_CODE", default="bn")
TIME_ZONE = env("TIME_ZONE", default="Asia/Dhaka")
USE_I18N = True
USE_TZ = True

LOCALE_PATHS = [
    BASE_DIR / "locale",
]

# Static & Media files
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS
CORS_ALLOW_ALL_ORIGINS = env.bool("CORS_ALLOW_ALL_ORIGINS", default=False)
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=["http://localhost:3000", "http://127.0.0.1:3000"],
)
CORS_ALLOW_CREDENTIALS = True

# Django REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "apps.accounts.authentication.JWTCookieAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_PAGINATION_CLASS": "apps.core.pagination.StandardResultsSetPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
        "rest_framework.filters.SearchFilter",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "apps.core.exceptions.custom_exception_handler",
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/min",
        "user": "120/min",
        "login": "10/min",
        "register": "10/min",
        "password_reset": "5/hour",
        "resend_verification": "5/hour",
        "verification_apply": "10/hour",
    },
}

# Simple JWT
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(env("JWT_ACCESS_TOKEN_LIFETIME_MINUTES", default=30))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(env("JWT_REFRESH_TOKEN_LIFETIME_DAYS", default=14))),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# drf-spectacular
SPECTACULAR_SETTINGS = {
    "TITLE": "নিজের বলার মতো একটা গল্প API",
    "DESCRIPTION": "Headless Backend API for role-based community platform",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
    "REDOC_DIST": "https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js",
    "SWAGGER_UI_DIST": "https://cdn.jsdelivr.net/npm/swagger-ui-dist@latest",
}

# Redis & Caching
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": env("REDIS_URL", default="redis://127.0.0.1:6379/1"),
    }
}

# Celery
CELERY_BROKER_URL = env("CELERY_BROKER_URL", default="redis://127.0.0.1:6379/0")
CELERY_RESULT_BACKEND = env("CELERY_RESULT_BACKEND", default="redis://127.0.0.1:6379/0")
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_BEAT_SCHEDULE = {
    "publish_scheduled_sessions_every_minute": {
        "task": "apps.community.tasks.publish_scheduled_sessions",
        "schedule": 60.0,
    },
}

# Email
EMAIL_BACKEND = env("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = env("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="নিজের বলার মতো একটা গল্প <no-reply@community.org>")

# Google OAuth2
GOOGLE_CLIENT_ID = env("GOOGLE_CLIENT_ID", default="")

# Verification and Interaction Business Rules
REQUIRE_VERIFIED_TO_INTERACT = env.bool("REQUIRE_VERIFIED_TO_INTERACT", default=True)
EMAIL_VERIFICATION_REQUIRED_TO_INTERACT = env.bool("EMAIL_VERIFICATION_REQUIRED_TO_INTERACT", default=True)
REGISTRATION_NO_REGEX = env("REGISTRATION_NO_REGEX", default=r"^[A-Za-z0-9_\-\.\/]{1,50}$")

# Public sessions kill switch & Next.js ISR
PUBLIC_SESSIONS_ENABLED = env.bool("PUBLIC_SESSIONS_ENABLED", default=True)
SITE_BASE_URL = env("SITE_BASE_URL", default="http://localhost:3000")
NEXTJS_REVALIDATE_URL = env("NEXTJS_REVALIDATE_URL", default="")
NEXTJS_REVALIDATE_SECRET = env("NEXTJS_REVALIDATE_SECRET", default="")

# Cookie settings for Next.js
JWT_COOKIE_SECURE = env.bool("JWT_COOKIE_SECURE", default=False)
JWT_COOKIE_SAMESITE = env("JWT_COOKIE_SAMESITE", default="Lax")
JWT_REFRESH_COOKIE_NAME = "refresh_token"

# AWS S3 / Cloudflare R2 Uploads
AWS_ACCESS_KEY_ID = env("AWS_ACCESS_KEY_ID", default="")
AWS_SECRET_ACCESS_KEY = env("AWS_SECRET_ACCESS_KEY", default="")
AWS_STORAGE_BUCKET_NAME = env("AWS_STORAGE_BUCKET_NAME", default="")
AWS_S3_ENDPOINT_URL = env("AWS_S3_ENDPOINT_URL", default="")
AWS_S3_CUSTOM_DOMAIN = env("AWS_S3_CUSTOM_DOMAIN", default="")

# Sentry
SENTRY_DSN = env("SENTRY_DSN", default="")
if SENTRY_DSN:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.django import DjangoIntegration
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            integrations=[DjangoIntegration()],
            traces_sample_rate=0.2,
            send_default_pii=False,
        )
    except ImportError:
        # sentry_sdk not installed; skip Sentry integration
        pass
