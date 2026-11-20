import re
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers
from .models import User, UserSession
from apps.community.models import Batch


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile representation and editing."""

    batch_name = serializers.CharField(source="batch.name", read_only=True)
    full_name = serializers.CharField(read_only=True)
    is_verified = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "profile_picture_url",
            "auth_provider",
            "role",
            "email_verified",
            "batch",
            "batch_name",
            "registration_no",
            "verification_status",
            "is_verified",
            "terms_accepted_at",
            "date_joined",
            "last_active_at",
        )
        read_only_fields = (
            "id",
            "email",
            "auth_provider",
            "role",
            "email_verified",
            "verification_status",
            "is_verified",
            "terms_accepted_at",
            "date_joined",
            "last_active_at",
        )

    def validate(self, attrs):
        user = self.instance
        if user is None:
            return attrs

        has_batch_update = "batch" in attrs
        has_reg_update = "registration_no" in attrs

        # Rule: PATCH /me accepts batch and registration_no only when status is "unverified" or "rejected".
        # While "pending" or "verified" they are read-only (400 with a clear Bangla message).
        if has_batch_update or has_reg_update:
            if user.verification_status in (
                User.VerificationStatus.PENDING,
                User.VerificationStatus.VERIFIED,
            ):
                raise serializers.ValidationError(
                    "আপনার প্রোফাইল বর্তমানে প্রক্রিয়াধীন বা যাচাইকৃত অবস্থায় রয়েছে। ব্যাচ এবং রেজিস্ট্রেশন নম্বর পরিবর্তন করা সম্ভব নয়।"
                )

        target_batch = attrs.get("batch", user.batch)
        target_reg = attrs.get("registration_no", user.registration_no)

        if target_reg is not None:
            target_reg = target_reg.strip()
            attrs["registration_no"] = target_reg
            if target_reg != "":
                regex = getattr(settings, "REGISTRATION_NO_REGEX", r"^[A-Za-z0-9_\-\.\/]{1,50}$")
                if not re.fullmatch(regex, target_reg):
                    raise serializers.ValidationError(
                        {"registration_no": "রেজিস্ট্রেশন নম্বরের ফরম্যাট সঠিক নয়।"}
                    )

                # Enforce uniqueness per batch among pending and verified users
                if target_batch:
                    conflict = User.objects.filter(
                        batch=target_batch,
                        registration_no=target_reg,
                        verification_status__in=[
                            User.VerificationStatus.PENDING,
                            User.VerificationStatus.VERIFIED,
                        ],
                    ).exclude(pk=user.pk)
                    if conflict.exists():
                        raise serializers.ValidationError(
                            {"registration_no": "এই রেজিস্ট্রেশন নম্বরটি উক্ত ব্যাচে ইতোমধ্যে নিবন্ধিত বা অপেক্ষমাণ রয়েছে।"}
                        )

        return attrs


class RegisterSerializer(serializers.Serializer):
    """User registration serializer."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    terms_accepted = serializers.BooleanField(required=True)

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে।")
        return email

    def validate_terms_accepted(self, value):
        if not value:
            raise serializers.ValidationError("কমিউনিটির নীতিমালা ও শর্তাবলী গ্রহণ করা আবশ্যক।")
        return value

    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]
        first_name = validated_data.get("first_name", "")
        last_name = validated_data.get("last_name", "")

        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            auth_provider=User.AuthProvider.EMAIL,
            email_verified=False,
            role=User.Role.MEMBER,
            terms_accepted_at=timezone.now(),
        )
        return user


class LoginSerializer(serializers.Serializer):
    """User authentication serializer."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email", "").strip().lower()
        password = attrs.get("password")

        user = authenticate(username=email, password=password)
        if not user:
            # Check if user exists with unusable password (Google only)
            existing = User.objects.filter(email=email).first()
            if existing and not existing.has_usable_password():
                raise serializers.ValidationError(
                    "এই অ্যাকাউন্টটি গুগল দিয়ে খোলা হয়েছিল। অনুগ্রহ করে গুগল দিয়ে লগইন করুন অথবা পাসওয়ার্ড সেট করুন।"
                )
            raise serializers.ValidationError("ইমেইল বা পাসওয়ার্ড সঠিক নয়।")

        if not user.is_active:
            raise serializers.ValidationError("আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।")

        attrs["user"] = user
        return attrs


class GoogleAuthSerializer(serializers.Serializer):
    """Google ID token login / signup serializer."""

    id_token = serializers.CharField(required=True)


class EmailVerificationRequestSerializer(serializers.Serializer):
    """Request a new email verification link."""

    email = serializers.EmailField()


class VerifyEmailConfirmSerializer(serializers.Serializer):
    """Confirm email using signed token."""

    token = serializers.CharField()


class PasswordResetRequestSerializer(serializers.Serializer):
    """Request a password reset email."""

    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Confirm password reset using token and set new password."""

    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])


class ChangePasswordSerializer(serializers.Serializer):
    """Change current password or set a password for Google-only users."""

    old_password = serializers.CharField(required=False, allow_blank=True)
    new_password = serializers.CharField(validators=[validate_password])

    def validate(self, attrs):
        user = self.context["request"].user
        old_password = attrs.get("old_password")

        # If user has usable password, old_password is required
        if user.has_usable_password():
            if not old_password:
                raise serializers.ValidationError({"old_password": "বর্তমান পাসওয়ার্ড প্রদান আবশ্যক।"})
            if not user.check_password(old_password):
                raise serializers.ValidationError({"old_password": "বর্তমান পাসওয়ার্ডটি সঠিক নয়।"})

        return attrs


class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = ("id", "user_agent", "ip_address", "last_active", "revoked", "created_at")
        read_only_fields = fields


class ModeratorInviteSerializer(serializers.Serializer):
    """Admin invite for a moderator account."""

    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150, required=False, default="")
    last_name = serializers.CharField(max_length=150, required=False, default="")

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("এই ইমেইল দিয়ে ইতোমধ্যে ব্যবহারকারী রয়েছে।")
        return email
