import logging
import requests
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


def invalidate_session_cache(slug: str | None = None):
    """Invalidates public session list and specific session detail cache."""
    cache.delete("public_sessions_list")
    cache.delete("public_sitemap")
    cache.delete("public_landing")
    if slug:
        cache.delete(f"public_session_detail_{slug}")


def trigger_nextjs_revalidation(paths: list[str]) -> bool:
    """
    Triggers Next.js on-demand ISR revalidation webhook.
    Sends POST request with paths and shared secret.
    """
    revalidate_url = getattr(settings, "NEXTJS_REVALIDATE_URL", "")
    revalidate_secret = getattr(settings, "NEXTJS_REVALIDATE_SECRET", "")

    if not revalidate_url or not revalidate_secret:
        return False

    payload = {
        "secret": revalidate_secret,
        "paths": paths,
    }

    try:
        resp = requests.post(revalidate_url, json=payload, timeout=5)
        if resp.status_code == 200:
            logger.info(f"Successfully revalidated Next.js paths: {paths}")
            return True
        logger.warning(f"Next.js revalidation returned status {resp.status_code}: {resp.text}")
        return False
    except Exception as e:
        logger.error(f"Error calling Next.js revalidation webhook: {e}")
        return False
