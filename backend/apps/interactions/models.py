import uuid
from django.conf import settings
from django.db import models
from django.utils import timezone
from apps.community.models import Session


class Like(models.Model):
    """User likes on a session."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="likes")
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "session")
        indexes = [
            models.Index(fields=["user", "session"], name="like_usr_sess_idx"),
            models.Index(fields=["session"], name="like_sess_idx"),
        ]

    def __str__(self):
        return f"{self.user.email} liked {self.session.slug}"


class Bookmark(models.Model):
    """User bookmarks on a session."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookmarks")
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="bookmarks")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "session")
        indexes = [
            models.Index(fields=["user", "session"], name="bm_usr_sess_idx"),
            models.Index(fields=["session"], name="bm_sess_idx"),
        ]

    def __str__(self):
        return f"{self.user.email} bookmarked {self.session.slug}"


class Comment(models.Model):
    """Post comments supporting soft delete and moderator hiding."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="authored_comments",
    )
    content = models.TextField("মন্তব্যের বিষয়বস্তু")
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    is_hidden = models.BooleanField(default=False, help_text="মডারেটর কর্তৃক লুকানো")
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="replies",
    )

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["session", "is_deleted", "is_hidden"], name="cmt_sess_active_idx"),
            models.Index(fields=["author"], name="cmt_author_idx"),
            models.Index(fields=["created_at"], name="cmt_created_idx"),
        ]

    def __str__(self):
        return f"Comment by {self.author.email} on {self.session.slug}"

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=["is_deleted", "deleted_at"])


class CommentReport(models.Model):
    """User report on a comment for moderator review."""

    class Status(models.TextChoices):
        PENDING = "pending", "অপেক্ষমাণ (Pending)"
        RESOLVED = "resolved", "সমাধানকৃত (Resolved)"
        DISMISSED = "dismissed", "বাতিলকৃত (Dismissed)"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name="reports")
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comment_reports",
    )
    reason = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="resolved_reports",
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"], name="rpt_status_idx"),
            models.Index(fields=["created_at"], name="rpt_created_idx"),
        ]

    def __str__(self):
        return f"Report on {self.comment_id} ({self.status})"


class SessionNote(models.Model):
    """Strictly private note on a specific session. Unique per user and session."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="session_notes")
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="user_notes")
    content = models.TextField("নোটের বিষয়বস্তু")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "session")
        indexes = [
            models.Index(fields=["user", "session"], name="snote_usr_sess_idx"),
        ]

    def __str__(self):
        return f"SessionNote by {self.user.email} on {self.session.slug}"


class PersonalNote(models.Model):
    """Strictly private general note not tied to a post."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="personal_notes")
    content = models.TextField("নোটের বিষয়বস্তু")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["user"], name="pnote_usr_idx"),
            models.Index(fields=["updated_at"], name="pnote_updated_idx"),
        ]

    def __str__(self):
        return f"PersonalNote by {self.user.email}"
