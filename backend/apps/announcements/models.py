import uuid
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from django.utils import timezone


class Announcement(models.Model):
    """Community announcements with focus priority and active window limits."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField("বিজ্ঞপ্তির শিরোনাম", max_length=200)
    content = models.TextField("বিজ্ঞপ্তির মূল বিষয়বস্তু")
    link = models.URLField("সম্পর্কিত লিংক", null=True, blank=True, max_length=500)
    image_url = models.URLField("বিজ্ঞপ্তির ছবি", null=True, blank=True, max_length=500)
    is_focused = models.BooleanField(
        "বিশেষ দৃষ্টি আকর্ষণ (Focused)",
        default=False,
        help_text="সর্বোচ্চ ২টি ফোকাসড বিজ্ঞপ্তি একযোগে সক্রিয় থাকতে পারবে।",
    )
    is_active = models.BooleanField("সক্রিয়", default=True)
    priority = models.IntegerField("অগ্রাধিকার ক্রম", default=0, help_text="উচ্চতর সংখ্যা প্রথমে প্রদর্শিত হবে")
    starts_at = models.DateTimeField("শুরুর সময়", null=True, blank=True)
    ends_at = models.DateTimeField("শেষের সময়", null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_announcements",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-priority", "-created_at"]
        indexes = [
            models.Index(fields=["is_active", "is_focused"], name="ann_active_focus_idx"),
            models.Index(fields=["priority"], name="ann_priority_idx"),
        ]

    def __str__(self):
        focus = " [Focused]" if self.is_focused else ""
        return f"{self.title}{focus} (Priority: {self.priority})"

    def clean(self):
        super().clean()
        now = timezone.now()

        # Date window check
        is_in_window = True
        if self.starts_at and self.starts_at > now:
            is_in_window = False
        if self.ends_at and self.ends_at < now:
            is_in_window = False

        if self.is_active and is_in_window:
            # Active query excluding self
            active_qs = Announcement.objects.filter(is_active=True).filter(
                Q(starts_at__lte=now) | Q(starts_at__isnull=True),
                Q(ends_at__gte=now) | Q(ends_at__isnull=True),
            )
            if self.pk:
                active_qs = active_qs.exclude(pk=self.pk)

            # Limit: at most 4 active announcements within date windows
            if active_qs.count() >= 4:
                raise ValidationError("একই সময়ে সর্বোচ্চ ৪টি সাধারণ বিজ্ঞপ্তি সক্রিয় রাখা সম্ভব।")

            # Limit: at most 2 focused announcements within date windows
            if self.is_focused and active_qs.filter(is_focused=True).count() >= 2:
                raise ValidationError("একই সময়ে সর্বোচ্চ ২টি ফোকাসড বিজ্ঞপ্তি সক্রিয় রাখা সম্ভব।")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
