from django.apps import apps
from django.db.models import Count, Q, Exists, OuterRef, Value, BooleanField
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response

from .models import Batch, Tag, Session
from .serializers import (
    BatchSerializer,
    TagSerializer,
    SessionListSerializer,
    SessionDetailSerializer,
    SessionCreateUpdateSerializer,
)
from .filters import SessionFilter
from .services import duplicate_session, publish_session
from apps.accounts.permissions import IsModeratorOrAdmin, IsAdmin


class BatchViewSet(viewsets.ModelViewSet):
    """CRUD for Batches. Staff can write; authenticated members can read."""

    queryset = Batch.objects.all().order_by("number")
    serializer_class = BatchSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve", "next_session_number"]:
            return [permissions.IsAuthenticated()]
        return [IsModeratorOrAdmin()]

    @action(detail=True, methods=["get"], url_path="next-session-number")
    def next_session_number(self, request, pk=None):
        batch = self.get_object()
        return Response({"next_session_number": batch.get_next_session_number()})


class TagViewSet(viewsets.ModelViewSet):
    """CRUD for Tags. Staff can write; authenticated members can read."""

    queryset = Tag.objects.all().order_by("name")
    serializer_class = TagSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [IsModeratorOrAdmin()]


class SessionViewSet(viewsets.ModelViewSet):
    """
    Main sessions endpoint for members and staff:
    - Staff see all statuses (draft, scheduled, published, archived).
    - Regular members see only published, non-deleted sessions.
    - Soft delete supported.
    """

    lookup_field = "slug"
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = SessionFilter
    ordering_fields = [
        "date",
        "session_number",
        "published_at",
        "like_count",
        "comment_count",
        "bookmark_count",
    ]
    ordering = ["-date", "-session_number"]

    def get_permissions(self):
        if self.action in ["list", "retrieve", "today"]:
            return [permissions.IsAuthenticated()]
        if self.action == "preview":
            return [IsModeratorOrAdmin()]
        return [IsModeratorOrAdmin()]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return SessionCreateUpdateSerializer
        if self.action in ["retrieve", "preview"]:
            return SessionDetailSerializer
        return SessionListSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Session.objects.filter(is_deleted=False).select_related("batch", "author").prefetch_related("tags")

        # Staff can see all statuses; members see only published
        is_staff = user.is_authenticated and user.role in (user.Role.ADMIN, user.Role.MODERATOR)
        if not is_staff:
            qs = qs.filter(status=Session.Status.PUBLISHED)
        else:
            status_param = self.request.query_params.get("status")
            if status_param:
                qs = qs.filter(status=status_param)

        # Annotate counts if interactions models exist
        try:
            Like = apps.get_model("interactions", "Like")
            Comment = apps.get_model("interactions", "Comment")
            Bookmark = apps.get_model("interactions", "Bookmark")

            qs = qs.annotate(
                like_count=Count("likes", distinct=True),
                comment_count=Count("comments", filter=Q(comments__is_deleted=False, comments__is_hidden=False), distinct=True),
                bookmark_count=Count("bookmarks", distinct=True),
            )

            if user.is_authenticated:
                qs = qs.annotate(
                    is_liked_by_me=Exists(Like.objects.filter(session=OuterRef("pk"), user=user)),
                    is_bookmarked_by_me=Exists(Bookmark.objects.filter(session=OuterRef("pk"), user=user)),
                )
            else:
                qs = qs.annotate(
                    is_liked_by_me=Value(False, output_field=BooleanField()),
                    is_bookmarked_by_me=Value(False, output_field=BooleanField()),
                )
        except LookupError:
            # Interactions models not loaded yet
            pass

        return qs

    def perform_destroy(self, instance):
        # Soft delete
        instance.soft_delete()

    @action(detail=False, methods=["get"])
    def today(self, request):
        """Published sessions for timezone.localdate(), ordered by batch then session_number."""
        today = timezone.localdate()
        qs = self.get_queryset().filter(status=Session.Status.PUBLISHED, date=today).order_by("batch__number", "session_number")
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def duplicate(self, request, slug=None):
        """Staff action: duplicates session as a new draft in the batch."""
        session = self.get_object()
        new_session = duplicate_session(session, author=request.user)
        serializer = SessionDetailSerializer(new_session, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def publish(self, request, slug=None):
        """Staff action: publish a draft or scheduled session immediately."""
        session = self.get_object()
        publish_session(session)
        serializer = SessionDetailSerializer(session, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def preview(self, request, slug=None):
        """Staff preview endpoint for drafts & scheduled sessions (not cached, noindex)."""
        session = self.get_object()
        serializer = self.get_serializer(session)
        response = Response(serializer.data)
        response["X-Robots-Tag"] = "noindex, nofollow"
        response["Cache-Control"] = "no-store, no-cache, must-revalidate"
        return response
