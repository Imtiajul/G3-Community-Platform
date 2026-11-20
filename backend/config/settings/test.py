from .base import *

DEBUG = False

# SQLite in-memory database for testing
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Remove postgres app in sqlite tests to prevent postgres-only check errors
if "django.contrib.postgres" in INSTALLED_APPS:
    INSTALLED_APPS = [app for app in INSTALLED_APPS if app != "django.contrib.postgres"]

# Fast password hashing for tests
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# In-memory cache for tests
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "test-cache",
    }
}

# In-memory email backend
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# Celery run eagerly in tests
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Disable throttling during tests
REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"] = []
