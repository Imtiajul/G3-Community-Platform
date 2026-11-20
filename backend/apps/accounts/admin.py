from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserSession


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "email",
        "first_name",
        "last_name",
        "role",
        "verification_status",
        "email_verified",
        "batch",
        "registration_no",
        "is_active",
        "date_joined",
    )
    list_filter = ("role", "verification_status", "email_verified", "is_active", "batch")
    search_fields = ("email", "first_name", "last_name", "registration_no")
    ordering = ("-date_joined",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "ব্যক্তিগত তথ্য",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "profile_picture_url",
                    "auth_provider",
                    "google_id",
                )
            },
        ),
        (
            "কমিউনিটি তথ্য",
            {
                "fields": (
                    "role",
                    "batch",
                    "registration_no",
                    "verification_status",
                    "verified_by",
                    "verified_at",
                    "terms_accepted_at",
                )
            },
        ),
        (
            "অনুমতি ও সক্রিয়তা",
            {
                "fields": (
                    "is_active",
                    "email_verified",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("গুরুত্বপূর্ণ তারিখসমূহ", {"fields": ("date_joined", "last_active_at")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2", "role"),
            },
        ),
    )


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ("user", "ip_address", "last_active", "revoked", "created_at")
    list_filter = ("revoked",)
    search_fields = ("user__email", "ip_address")
