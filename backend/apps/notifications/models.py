import uuid
from django.conf import settings
from django.db import models
from django.utils import timezone


class Notification(models.Model):
    """User notifications with read status and event references."""

    class Type(models.TextChoices):
        VERIFICATION_REQUEST = "verification_request", "যাচাইয়ের আবেদন (Verification Request)"
        VERIFICATION_APPROVED = "verification_approved", "আবেদন অনুমোদিত (Verification Approved)"
        VERIFICATION_REJECTED = "verification_rejected", "আবেদন প্রত্যাখ্যাত (Verification Rejected)"
        NEW_SESSION = "new_session", "নতুন সেশন (New Session)"
        ANNOUNCEMENT = "announcement", "বিজ্ঞপ্তি (Announcement)"
        ADMIN_MESSAGE = "admin_message", "অ্যাডমিন বার্তা (Admin Message)"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    type = models.CharField(max_length=40, choices=Type.choices)
    title = models.CharField(max_length=255)
    message = models.TextField()
    session = models.ForeignKey(
        "community.Session",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="notifications",
    )
    url = models.CharField(max_length=500, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient", "is_read"], name="notif_user_read_idx"),
            models.Index(fields=["created_at"], name="notif_created_idx"),
        ]

    def __str__(self):
        status = "Read" if self.is_read else "Unread"
        return f"{self.recipient.email} - {self.title} ({status})"

    def mark_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=["is_read", "read_at"])


class NotificationPreference(models.Model):
    """User preferences controlling email and in-app notifications."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notification_preferences",
    )
    email_new_session = models.BooleanField(default=True)
    email_announcement = models.BooleanField(default=True)
    email_verification = models.BooleanField(default=True)
    in_app_enabled = models.BooleanField(default=True)

    def __str__(self):
        return f"Preferences for {self.user.email}"
