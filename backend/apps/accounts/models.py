import uuid
import re
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from django.conf import settings
from django.core.exceptions import ValidationError


class UserManager(BaseUserManager):
    def normalize_email(self, email):
        if not email:
            return ""
        return email.strip().lower()

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("ইমেইল অ্যাড্রেস প্রদান করা আবশ্যক।")
        email = self.normalize_email(email)
        extra_fields.setdefault("role", User.Role.MEMBER)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("verification_status", User.VerificationStatus.UNVERIFIED)

        role = extra_fields.get("role")
        if role in (User.Role.ADMIN, User.Role.MODERATOR):
            extra_fields.setdefault("is_staff", True)

        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", User.Role.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("email_verified", True)
        extra_fields.setdefault("verification_status", User.VerificationStatus.VERIFIED)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model with email as unique identifier."""

    class Role(models.TextChoices):
        ADMIN = "admin", "অ্যাডমিন (Admin)"
        MODERATOR = "moderator", "মডারেটর (Moderator)"
        MEMBER = "member", "সদস্য (Member)"

    class AuthProvider(models.TextChoices):
        EMAIL = "email", "ইমেইল ও পাসওয়ার্ড"
        GOOGLE = "google", "গুগল (Google)"

    class VerificationStatus(models.TextChoices):
        UNVERIFIED = "unverified", "যাচাইবিহীন (Unverified)"
        PENDING = "pending", "অপেক্ষমাণ (Pending)"
        VERIFIED = "verified", "যাচাইকৃত (Verified)"
        REJECTED = "rejected", "প্রত্যাখ্যাত (Rejected)"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField("ইমেইল অ্যাড্রেস", unique=True, db_index=True)
    first_name = models.CharField("নামের প্রথম অংশ", max_length=150, blank=True)
    last_name = models.CharField("নামের শেষ অংশ", max_length=150, blank=True)
    profile_picture_url = models.URLField("প্রোফাইল ছবি", blank=True, null=True, max_length=500)
    google_id = models.CharField("গুগল আইডি", max_length=255, blank=True, null=True, unique=True)
    auth_provider = models.CharField(
        "অথেন্টিকেশন মাধ্যম",
        max_length=20,
        choices=AuthProvider.choices,
        default=AuthProvider.EMAIL,
    )
    role = models.CharField("ব্যবহারকারীর ভূমিকা", max_length=20, choices=Role.choices, default=Role.MEMBER)
    email_verified = models.BooleanField("ইমেইল যাচাই হয়েছে কি না", default=False)
    batch = models.ForeignKey(
        "community.Batch",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
        help_text="ব্যবহারকারীর নিজস্ব ব্যাচ",
    )
    registration_no = models.CharField("রেজিস্ট্রেশন নম্বর", max_length=50, null=True, blank=True)
    verification_status = models.CharField(
        "কমিউনিটি ভেরিফিকেশন স্ট্যাটাস",
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.UNVERIFIED,
    )
    verified_by = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="verified_members",
        verbose_name="যাচাইকারী স্টাফ",
    )
    verified_at = models.DateTimeField("যাচাইয়ের সময়", null=True, blank=True)
    terms_accepted_at = models.DateTimeField("শর্তাবলী গ্রহণের সময়", null=True, blank=True)

    is_active = models.BooleanField("সক্রিয়", default=True)
    is_staff = models.BooleanField("স্টাফ স্ট্যাটাস", default=False)
    date_joined = models.DateTimeField("যোগদানের সময়", default=timezone.now)
    last_active_at = models.DateTimeField("সর্বশেষ সক্রিয়", null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "ব্যবহারকারী"
        verbose_name_plural = "ব্যবহারকারীগণ"
        ordering = ["-date_joined"]
        indexes = [
            models.Index(fields=["email"], name="user_email_idx"),
            models.Index(fields=["role"], name="user_role_idx"),
            models.Index(fields=["verification_status"], name="user_verif_status_idx"),
            models.Index(fields=["batch"], name="user_batch_idx"),
            models.Index(fields=["registration_no"], name="user_reg_no_idx"),
        ]

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    @property
    def is_verified(self) -> bool:
        """Derived property indicating whether community verification is approved."""
        return self.verification_status == self.VerificationStatus.VERIFIED

    @property
    def full_name(self) -> str:
        name = f"{self.first_name} {self.last_name}".strip()
        return name if name else self.email.split("@")[0]

    def clean(self):
        super().clean()
        if self.email:
            self.email = self.email.strip().lower()
        if self.registration_no:
            self.registration_no = self.registration_no.strip()
            regex_str = getattr(settings, "REGISTRATION_NO_REGEX", r"^[A-Za-z0-9_\-\.\/]{1,50}$")
            if not re.fullmatch(regex_str, self.registration_no):
                raise ValidationError({"registration_no": "রেজিস্ট্রেশন নম্বরের ফরম্যাট সঠিক নয়।"})

            # Enforce uniqueness per batch among pending & verified members
            if self.batch_id and self.verification_status in (
                self.VerificationStatus.PENDING,
                self.VerificationStatus.VERIFIED,
            ):
                conflict = User.objects.filter(
                    batch_id=self.batch_id,
                    registration_no=self.registration_no,
                    verification_status__in=[
                        self.VerificationStatus.PENDING,
                        self.VerificationStatus.VERIFIED,
                    ],
                ).exclude(pk=self.pk)
                if conflict.exists():
                    raise ValidationError(
                        {"registration_no": "এই রেজিস্ট্রেশন নম্বরটি এই ব্যাচে ইতোমধ্যে ব্যবহৃত হয়েছে।"}
                    )

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.strip().lower()
        if self.registration_no:
            self.registration_no = self.registration_no.strip()
        if self.role in (self.Role.ADMIN, self.Role.MODERATOR):
            self.is_staff = True
        self.clean()
        super().save(*args, **kwargs)


class UserSession(models.Model):
    """Tracks active user sessions with IP and User-Agent."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions")
    session_key = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    user_agent = models.TextField(blank=True, default="")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    last_active = models.DateTimeField(default=timezone.now)
    revoked = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-last_active"]
        indexes = [
            models.Index(fields=["user", "revoked"], name="usersess_user_revoked_idx"),
            models.Index(fields=["last_active"], name="usersess_last_active_idx"),
        ]

    def __str__(self):
        status = "Revoked" if self.revoked else "Active"
        return f"{self.user.email} - {self.ip_address} ({status})"


class VerificationRequest(models.Model):
    """Community verification application submitted by a user."""

    class Status(models.TextChoices):
        PENDING = "pending", "অপেক্ষমাণ (Pending)"
        APPROVED = "approved", "অনুমোদিত (Approved)"
        REJECTED = "rejected", "প্রত্যাখ্যাত (Rejected)"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="verification_requests")
    batch = models.ForeignKey("community.Batch", on_delete=models.PROTECT, related_name="verification_requests")
    registration_no = models.CharField("রেজিস্ট্রেশন নম্বর (স্ন্যাপশট)", max_length=50, db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    submitted_at = models.DateTimeField(default=timezone.now)
    reviewed_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reviewed_verifications",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField("প্রত্যাখ্যানের কারণ", null=True, blank=True)
    reviewer_note = models.TextField("পর্যালোচকের অভ্যন্তরীণ মন্তব্য", null=True, blank=True)

    class Meta:
        ordering = ["-submitted_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=models.Q(status="pending"),
                name="unique_pending_verification_request",
            ),
        ]
        indexes = [
            models.Index(fields=["status"], name="vreq_status_idx"),
            models.Index(fields=["submitted_at"], name="vreq_submitted_idx"),
        ]

    def __str__(self):
        return f"VerificationRequest by {self.user.email} ({self.status})"


class MemberRoster(models.Model):
    """Official batch member roster for auto-matching registration credentials."""

    batch = models.ForeignKey("community.Batch", on_delete=models.PROTECT, related_name="roster_members")
    registration_no = models.CharField(max_length=50, db_index=True)
    full_name = models.CharField(max_length=200)
    is_claimed = models.BooleanField(default=False)

    class Meta:
        unique_together = ("batch", "registration_no")
        ordering = ["batch__number", "registration_no"]

    def __str__(self):
        claimed = "Claimed" if self.is_claimed else "Available"
        return f"{self.batch.name} - {self.registration_no} ({self.full_name}) [{claimed}]"

