from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.conf import settings


class IsAdmin(BasePermission):
    """Allows access only to users with role=admin."""

    message = "শুধুমাত্র অ্যাডমিনদের জন্য এই সুবিধা প্রযোজ্য।"

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == user.Role.ADMIN)


class IsModeratorOrAdmin(BasePermission):
    """Allows access to moderators and admins."""

    message = "শুধুমাত্র মডারেটর এবং অ্যাডমিনদের জন্য এই সুবিধা প্রযোজ্য।"

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and user.role in (user.Role.ADMIN, user.Role.MODERATOR)
        )


class IsOwnerOrReadOnly(BasePermission):
    """Object-level permission allowing only the owner to edit or delete."""

    message = "আপনি শুধুমাত্র আপনার নিজস্ব তথ্য পরিবর্তন করতে পারবেন।"

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        owner = getattr(obj, "user", None) or getattr(obj, "author", None)
        return bool(owner and owner == request.user)


class IsVerifiedMemberOrReadOnly(BasePermission):
    """
    Enforces that unverified users can only read content.
    Interaction (write) requires:
      1. Authentication
      2. Verified email (if EMAIL_VERIFICATION_REQUIRED_TO_INTERACT is True)
      3. Community verification (if REQUIRE_VERIFIED_TO_INTERACT is True)
    Staff (moderator/admin) can always interact.
    """

    message = "এই সুবিধাটি ব্যবহারের জন্য আপনার অ্যাকাউন্টটি ভেরিফাইড হতে হবে।"

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        user = request.user
        if not (user and user.is_authenticated):
            return False

        # Staff can always interact
        if user.role in (user.Role.ADMIN, user.Role.MODERATOR):
            return True

        if getattr(settings, "EMAIL_VERIFICATION_REQUIRED_TO_INTERACT", True):
            if not user.email_verified:
                self.message = "ইমেইল ভেরিফিকেশন ছাড়া মন্তব্য বা লাইক করা যাবে না।"
                return False

        if getattr(settings, "REQUIRE_VERIFIED_TO_INTERACT", True):
            if not user.is_verified:
                self.message = "কমিউনিটি ভেরিফিকেশন ছাড়া মন্তব্য, লাইক বা বুকমার্ক করা যাবে না।"
                return False

        return True
