from .base import *

DEBUG = True

# Fallback to local SQLite if PostgreSQL is not running
import socket

def is_port_open(host, port):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.3)
        res = sock.connect_ex((host, int(port)))
        sock.close()
        return res == 0
    except Exception:
        return False

db_host = env("POSTGRES_HOST", default="localhost")
db_port = env.int("POSTGRES_PORT", default=5432)
if not is_port_open(db_host, db_port) and not is_port_open("127.0.0.1", 5432):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
    if "django.contrib.postgres" in INSTALLED_APPS:
        INSTALLED_APPS = [app for app in INSTALLED_APPS if app != "django.contrib.postgres"]

# Fallback to local memory cache if Redis is not running locally
if not is_port_open("127.0.0.1", 6379):
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "unique-community-cache",
        }
    }

