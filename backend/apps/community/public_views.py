import hashlib
from django.conf import settings
from django.core.cache import cache
from django.db.models import Q
from django.http import Http404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import views, generics, status, permissions
from rest_framework.response import Response

from .models import Session, SessionSlugHistory
from .filters import SessionFilter
from .public_serializers import (
    PublicSessionListSerializer,
    PublicSessionDetailSerializer,
    SessionMetaSerializer,
    SitemapItemSerializer,
)


def _generate_etag(data_str: str) -> str:
    return f'"{hashlib.md5(data_str.encode("utf-8")).hexdigest()}"'


class PublicEndpointBaseView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if not getattr(settings, "PUBLIC_SESSIONS_ENABLED", True):
            raise Http404("Public sessions access is currently disabled.")


class PublicSessionListView(PublicEndpointBaseView, generics.ListAPIView):
    """
    Public paginated session list:
    - Excludes members-only sessions (public visibility only).
    - Excludes drafts, scheduled, archived, and deleted sessions.
    - Cached with ETag and Cache-Control headers.
    """

    serializer_class = PublicSessionListSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = SessionFilter

    def get_queryset(self):
        return (
            Session.objects.filter(
                status=Session.Status.PUBLISHED,
                is_deleted=False,
                visibility=Session.Visibility.PUBLIC,
            )
            .select_related("batch")
            .prefetch_related("tags")
            .order_by("-date", "-session_number")
        )

    def list(self, request, *args, **kwargs):
        # Cache key based on query string
        cache_key = f"public_sessions_list_{request.GET.urlencode()}"
        cached_response = cache.get(cache_key)

        if cached_response is not None:
            etag = _generate_etag(str(cached_response))
            if request.headers.get("If-None-Match") == etag:
                return Response(status=status.HTTP_304_NOT_MODIFIED)
            response = Response(cached_response)
            response["ETag"] = etag
            response["Cache-Control"] = "public, max-age=120"
            return response

        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, timeout=120)

        etag = _generate_etag(str(response.data))
        response["ETag"] = etag
        response["Cache-Control"] = "public, max-age=120"
        return response


class PublicSessionDetailView(PublicEndpointBaseView):
    """
    Public session detail:
    - If slug is in SessionSlugHistory, returns 301 permanent redirect hint to new slug.
    - Drafts, scheduled, archived, deleted return 404.
    - Members-only sessions return minimal payload to anonymous users.
    """

    def get(self, request, slug):
        # Check slug history for 301 redirect
        history = SessionSlugHistory.objects.filter(old_slug=slug).select_related("session").first()
        if history:
            return Response(
                {
                    "detail": "Slug has moved permanently.",
                    "redirect_to": history.session.slug,
                    "status_code": 301,
                },
                status=status.HTTP_301_MOVED_PERMANENTLY,
            )

        session = (
            Session.objects.filter(
                slug=slug,
                status=Session.Status.PUBLISHED,
                is_deleted=False,
            )
            .select_related("batch", "author")
            .prefetch_related("tags")
            .first()
        )

        if not session:
            return Response({"detail": "সেশনটি খুঁজে পাওয়া যায়নি।"}, status=status.HTTP_404_NOT_FOUND)

        serializer = PublicSessionDetailSerializer(session, context={"request": request})
        data = serializer.data

        etag = _generate_etag(f"{session.slug}-{session.published_at}")
        if request.headers.get("If-None-Match") == etag:
            return Response(status=status.HTTP_304_NOT_MODIFIED)

        response = Response(data)
        response["ETag"] = etag
        response["Cache-Control"] = "public, max-age=120"
        return response


class SessionMetaView(PublicEndpointBaseView):
    """Metadata endpoint for Next.js generateMetadata and JSON-LD."""

    def get(self, request, slug):
        session = (
            Session.objects.filter(
                slug=slug,
                status=Session.Status.PUBLISHED,
                is_deleted=False,
            )
            .select_related("batch", "author")
            .first()
        )

        if not session:
            return Response({"detail": "সেশনটি খুঁজে পাওয়া যায়নি।"}, status=status.HTTP_404_NOT_FOUND)

        meta_data = SessionMetaSerializer.from_session(session)
        return Response(meta_data)


class SitemapView(PublicEndpointBaseView):
    """List of all public, indexable, published session slugs for Next.js sitemap.xml."""

    def get(self, request):
        cached_sitemap = cache.get("public_sitemap")
        if cached_sitemap:
            return Response(cached_sitemap)

        qs = (
            Session.objects.filter(
                status=Session.Status.PUBLISHED,
                is_deleted=False,
                is_indexable=True,
                visibility=Session.Visibility.PUBLIC,
            )
            .order_by("-published_at")
            .only("slug", "published_at")
        )
        serializer = SitemapItemSerializer(qs, many=True)
        data = serializer.data
        cache.set("public_sitemap", data, timeout=3600)  # 1 hour
        return Response(data)


class PublicLandingView(PublicEndpointBaseView):
    """
    Public landing payload:
    - Focused announcements (max 2)
    - Active announcements (max 4)
    - Featured sessions (max 3)
    - Latest published public session
    - Upcoming scheduled sessions (title and date only, no content)
    """

    def get(self, request):
        today = timezone.localdate()
        now = timezone.now()

        # Featured sessions
        featured_sessions = (
            Session.objects.filter(
                status=Session.Status.PUBLISHED,
                is_deleted=False,
                is_featured=True,
                visibility=Session.Visibility.PUBLIC,
            )
            .select_related("batch")
            .order_by("-published_at")[:3]
        )

        # Latest published public session
        latest_session = (
            Session.objects.filter(
                status=Session.Status.PUBLISHED,
                is_deleted=False,
                visibility=Session.Visibility.PUBLIC,
            )
            .select_related("batch")
            .order_by("-published_at")
            .first()
        )

        # Upcoming scheduled sessions (title and date only, no content)
        upcoming_sessions = (
            Session.objects.filter(
                status=Session.Status.SCHEDULED,
                is_deleted=False,
                scheduled_at__gt=now,
            )
            .select_related("batch")
            .order_by("scheduled_at")[:5]
        )

        # Announcements placeholder or from Announcement model if loaded
        focused_announcements = []
        active_announcements = []
        try:
            from apps.announcements.models import Announcement
            from apps.announcements.serializers import AnnouncementPublicSerializer

            active_qs = Announcement.objects.filter(
                is_active=True,
            ).filter(
                Q(starts_at__lte=now) | Q(starts_at__isnull=True),
                Q(ends_at__gte=now) | Q(ends_at__isnull=True),
            )
            focused_announcements = AnnouncementPublicSerializer(
                active_qs.filter(is_focused=True).order_by("-priority", "-created_at")[:2], many=True
            ).data
            active_announcements = AnnouncementPublicSerializer(
                active_qs.filter(is_focused=False).order_by("-priority", "-created_at")[:4], many=True
            ).data
        except (ImportError, LookupError):
            pass

        data = {
            "focused_announcements": focused_announcements,
            "active_announcements": active_announcements,
            "featured_sessions": [
                {
                    "slug": s.slug,
                    "title": s.title,
                    "batch_number": s.batch.number,
                    "session_number": s.session_number,
                    "cover_image_url": s.cover_image_url,
                    "date": str(s.date),
                }
                for s in featured_sessions
            ],
            "latest_published_session": {
                "slug": latest_session.slug,
                "title": latest_session.title,
                "batch_number": latest_session.batch.number,
                "session_number": latest_session.session_number,
                "date": str(latest_session.date),
            }
            if latest_session
            else None,
            "upcoming_sessions": [
                {
                    "title": s.title,
                    "batch_number": s.batch.number,
                    "date": str(s.date),
                    "scheduled_at": s.scheduled_at,
                }
                for s in upcoming_sessions
            ],
        }

        return Response(data)
