from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Announcement
from .serializers import (
    AnnouncementSerializer,
    AnnouncementReorderSerializer,
)
from apps.accounts.permissions import IsModeratorOrAdmin
from apps.audit.services import log_audit


class AnnouncementViewSet(viewsets.ModelViewSet):
    """Staff CRUD for announcements with priority reordering."""

    queryset = Announcement.objects.select_related("created_by").order_by("-priority", "-created_at")
    serializer_class = AnnouncementSerializer
    permission_classes = [IsModeratorOrAdmin]

    def perform_create(self, serializer):
        announcement = serializer.save(created_by=self.request.user)
        log_audit(
            actor=self.request.user,
            action="announcement.create",
            target_type="Announcement",
            target_id=str(announcement.id),
            metadata={"title": announcement.title},
            ip=self.request.META.get("REMOTE_ADDR"),
        )

    def perform_update(self, serializer):
        announcement = serializer.save()
        log_audit(
            actor=self.request.user,
            action="announcement.update",
            target_type="Announcement",
            target_id=str(announcement.id),
            metadata={"title": announcement.title},
            ip=self.request.META.get("REMOTE_ADDR"),
        )

    def perform_destroy(self, instance):
        log_audit(
            actor=self.request.user,
            action="announcement.delete",
            target_type="Announcement",
            target_id=str(instance.id),
            metadata={"title": instance.title},
            ip=self.request.META.get("REMOTE_ADDR"),
        )
        instance.delete()

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        now = timezone.now()
        active_qs = Announcement.objects.filter(is_active=True).filter(
            Q(starts_at__lte=now) | Q(starts_at__isnull=True),
            Q(ends_at__gte=now) | Q(ends_at__isnull=True),
        )
        active_count = active_qs.count()
        focused_count = active_qs.filter(is_focused=True).count()

        if isinstance(response.data, dict) and "results" in response.data:
            response.data["active_count"] = active_count
            response.data["focused_count"] = focused_count
        return response

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        """Accepts an ordered list of announcement IDs and updates priorities descending."""
        serializer = AnnouncementReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order_ids = serializer.validated_data["order"]

        with transaction.atomic():
            priority = len(order_ids) * 10
            for aid in order_ids:
                Announcement.objects.filter(id=aid).update(priority=priority)
                priority -= 10

        log_audit(
            actor=request.user,
            action="announcement.reorder",
            target_type="Announcement",
            target_id="bulk",
            metadata={"order": [str(x) for x in order_ids]},
            ip=request.META.get("REMOTE_ADDR"),
        )
        return Response({"detail": "বিজ্ঞপ্তির অগ্রাধিকার ক্রম সফলভাবে সংরক্ষিত হয়েছে।"}, status=status.HTTP_200_OK)
