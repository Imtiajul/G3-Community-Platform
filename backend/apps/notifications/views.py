from django.utils import timezone
from rest_framework import views, generics, status, permissions
from rest_framework.response import Response

from .models import Notification, NotificationPreference
from .serializers import NotificationSerializer, NotificationPreferenceSerializer


class NotificationListView(generics.ListAPIView):
    """List notifications for current user with unread_count."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return Notification.objects.none()
        return Notification.objects.filter(recipient=self.request.user).order_by("-created_at")

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        unread_count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        if isinstance(response.data, dict) and "results" in response.data:
            response.data["unread_count"] = unread_count
        return response


class NotificationMarkReadView(views.APIView):
    """Mark a specific notification as read."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notif = generics.get_object_or_404(Notification, pk=pk, recipient=request.user)
        notif.mark_read()
        return Response({"detail": "নোটিফিকেশনটি পঠিত হিসেবে চিহ্নিত করা হয়েছে।", "is_read": True})


class NotificationMarkAllReadView(views.APIView):
    """Mark all unread notifications as read for current user."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        updated = Notification.objects.filter(recipient=request.user, is_read=False).update(
            is_read=True, read_at=timezone.now()
        )
        return Response({"detail": f"{updated} টি নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে।", "updated_count": updated})


class NotificationPreferenceView(views.APIView):
    """View and update current user's notification preferences."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pref, _ = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = NotificationPreferenceSerializer(pref)
        return Response(serializer.data)

    def patch(self, request):
        pref, _ = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = NotificationPreferenceSerializer(pref, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
