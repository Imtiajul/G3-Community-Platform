import random
import string
import uuid
import nh3
from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Batch(models.Model):
    """Batch organizing community sessions and member cohorts."""

    number = models.PositiveIntegerField(unique=True, help_text="ব্যাচ নম্বর (যেমন: ১, ২, ১৬)")
    name = models.CharField(max_length=200, help_text="ব্যাচের শিরোনাম বা নাম")
    start_date = models.DateField(help_text="ব্যাচ শুরুর তারিখ")
    end_date = models.DateField(null=True, blank=True, help_text="ব্যাচ সমাপ্তির তারিখ")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["number"]
        indexes = [
            models.Index(fields=["number"], name="batch_num_idx"),
            models.Index(fields=["is_active"], name="batch_active_idx"),
        ]

    def __str__(self):
        return f"Batch {self.number}: {self.name}"

    def get_next_session_number(self) -> int:
        """Returns the next available session number in this batch."""
        last_session = (
            self.sessions.filter(is_deleted=False).order_by("-session_number").first()
        )
        return (last_session.session_number + 1) if last_session else 1


class Tag(models.Model):
    """Category tags for sessions (e.g. upcoming, completed, featured)."""

    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True)
    color = models.CharField(max_length=20, default="#0d6efd", help_text="HEX color code e.g. #ff5733")

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
            if not self.slug:
                self.slug = f"tag-{random.randint(1000, 9999)}"
        super().save(*args, **kwargs)


class Session(models.Model):
    """Individual daily learning post published by staff for a batch."""

    class Status(models.TextChoices):
        DRAFT = "draft", "খসড়া (Draft)"
        SCHEDULED = "scheduled", "নির্ধারিত (Scheduled)"
        PUBLISHED = "published", "প্রকাশিত (Published)"
        ARCHIVED = "archived", "আর্কাইভ (Archived)"

    class Visibility(models.TextChoices):
        PUBLIC = "public", "সবার জন্য উন্মুক্ত (Public)"
        MEMBERS = "members", "শুধুমাত্র সদস্যদের জন্য (Members Only)"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField("সেশনের শিরোনাম", max_length=300)
    content = models.TextField("সেশনের মূল বিষয়বস্তু", help_text="Markdown format, HTML is sanitized")
    batch = models.ForeignKey(Batch, on_delete=models.PROTECT, related_name="sessions")
    session_number = models.PositiveIntegerField("সেশন নম্বর")
    date = models.DateField("সেশনের তারিখ", default=timezone.localdate)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="authored_sessions",
    )
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    is_featured = models.BooleanField(default=False)
    cover_image_url = models.URLField(max_length=500, null=True, blank=True)
    visibility = models.CharField(max_length=20, choices=Visibility.choices, default=Visibility.PUBLIC)
    is_indexable = models.BooleanField(default=True)
    seo_title = models.CharField(max_length=255, null=True, blank=True)
    seo_description = models.CharField(max_length=500, null=True, blank=True)
    og_image_url = models.URLField(max_length=500, null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    tags = models.ManyToManyField(Tag, through="SessionTag", related_name="sessions", blank=True)

    class Meta:
        ordering = ["-date", "-session_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["batch", "session_number"],
                condition=models.Q(is_deleted=False),
                name="unique_active_batch_session_number",
            ),
        ]
        indexes = [
            models.Index(fields=["batch"], name="session_batch_idx"),
            models.Index(fields=["date"], name="session_date_idx"),
            models.Index(fields=["status"], name="session_status_idx"),
            models.Index(fields=["published_at"], name="session_pub_idx"),
            models.Index(fields=["session_number"], name="session_num_idx"),
            models.Index(fields=["is_deleted"], name="session_del_idx"),
            models.Index(fields=["is_featured"], name="session_feat_idx"),
        ]

    def __str__(self):
        return f"[{self.batch.number}-{self.session_number}] {self.title}"

    @property
    def state(self) -> str:
        """
        Computed state:
        - 'upcoming': if published and date > today (or scheduled).
        - 'completed': if published and date <= today.
        """
        today = timezone.localdate()
        if self.status == self.Status.PUBLISHED:
            return "upcoming" if self.date > today else "completed"
        if self.status == self.Status.SCHEDULED:
            return "upcoming"
        return "completed" if self.date <= today else "upcoming"

    def clean(self):
        super().clean()
        if self.content:
            # Sanitize HTML tags with nh3
            self.content = nh3.clean(self.content)

    def save(self, *args, **kwargs):
        self.clean()
        if not self.slug:
            rand = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))
            batch_num = self.batch.number if self.batch_id else 0
            self.slug = f"{batch_num}-{self.session_number}-{rand}"
        super().save(*args, **kwargs)

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=["is_deleted", "deleted_at"])


class SessionTag(models.Model):
    """Through table associating Session with Tag."""

    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="session_tags")
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name="tag_sessions")

    class Meta:
        unique_together = ("session", "tag")
        indexes = [
            models.Index(fields=["session", "tag"], name="sess_tag_pair_idx"),
        ]

    def __str__(self):
        return f"{self.session.slug} <-> {self.tag.name}"


class SessionAttachment(models.Model):
    """File attachment belonging to a session."""

    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="attachments")
    file_url = models.URLField(max_length=500)
    type = models.CharField(max_length=50, help_text="MIME type or category e.g. pdf, image")
    caption = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"Attachment ({self.type}) for {self.session.slug}"


class SessionSlugHistory(models.Model):
    """Maintains old slug redirects to guarantee slug stability."""

    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="slug_history")
    old_slug = models.SlugField(max_length=255, db_index=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-changed_at"]

    def __str__(self):
        return f"{self.old_slug} -> {self.session.slug}"
