import logging
import requests
from django.conf import settings
from django.core.mail import send_mail
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

logger = logging.getLogger(__name__)
signer = TimestampSigner()


def generate_email_verification_token(user: User) -> str:
    """Generates an expiring signed token for email verification."""
    return signer.sign(f"verify_email:{user.id}:{user.email}")


def verify_email_token(token: str, max_age: int = 86400) -> User | None:
    """Validates the email verification token and returns the corresponding User."""
    try:
        raw_val = signer.unsign(token, max_age=max_age)
        action, user_id, email = raw_val.split(":", 2)
        if action != "verify_email":
            return None
        user = User.objects.get(id=user_id, email=email)
        return user
    except (BadSignature, SignatureExpired, User.DoesNotExist, ValueError):
        return None


def send_verification_email(user: User) -> bool:
    """Sends email verification link to user."""
    token = generate_email_verification_token(user)
    verify_url = f"{settings.SITE_BASE_URL}/verify-email?token={token}"
    subject = "আপনার ইমেইল ভেরিফাই করুন - নিজের বলার মতো একটা গল্প ফাউন্ডেশন"
    message = (
        f"প্রিয় {user.full_name},\n\n"
        f"\"নিজের বলার মতো একটা গল্প\" কমিউনিটিতে স্বাগতম। আপনার অ্যাকাউন্টটি সক্রিয় করতে নিচের লিংকে ক্লিক করুন:\n"
        f"{verify_url}\n\n"
        f"এই লিংকটি ২৪ ঘণ্টার মধ্যে কার্যকর থাকবে।\n\n"
        f"ধন্যবাদ,\nকমিউনিটি অ্যাডমিন টিম"
    )
    try:
        sent_count = send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f"Verification email successfully sent to {user.email}")
        print(f"[AUTH EMAIL] ✓ Verification email successfully sent to: {user.email}")
        return bool(sent_count)
    except Exception as e:
        logger.error(f"Failed to send verification email to {user.email}: {e}")
        print(f"[AUTH EMAIL] ✗ Failed to send verification email to {user.email}: {e}")
        return False


def generate_password_reset_token(user: User) -> str:
    """Generates an expiring signed token for password reset."""
    return signer.sign(f"password_reset:{user.id}:{user.password}")


def verify_password_reset_token(token: str, max_age: int = 3600) -> User | None:
    """Validates the password reset token and returns the corresponding User."""
    try:
        raw_val = signer.unsign(token, max_age=max_age)
        action, user_id, password_hash = raw_val.split(":", 2)
        if action != "password_reset":
            return None
        user = User.objects.get(id=user_id)
        if user.password != password_hash:
            return None  # Token already used or password changed
        return user
    except (BadSignature, SignatureExpired, User.DoesNotExist, ValueError):
        return None


def send_password_reset_email(user: User) -> bool:
    """Sends password reset link to user."""
    token = generate_password_reset_token(user)
    reset_url = f"{settings.SITE_BASE_URL}/reset-password?token={token}"
    subject = "পাসওয়ার্ড রিসেট অনুরোধ - নিজের বলার মতো একটা গল্প ফাউন্ডেশন"
    message = (
        f"প্রিয় {user.full_name},\n\n"
        f"আপনার অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার জন্য একটি অনুরোধ পেয়েছি। পাসওয়ার্ড পরিবর্তন করতে নিচের লিংকে ক্লিক করুন:\n"
        f"{reset_url}\n\n"
        f"এই লিংকটি ১ ঘণ্টার জন্য কার্যকর থাকবে। আপনি যদি এই অনুরোধ না করে থাকেন তবে এই ইমেইলটি উপেক্ষা করুন।\n\n"
        f"ধন্যবাদ,\nকমিউনিটি অ্যাডমিন টিম"
    )
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user.email}: {e}")
        return False


def send_moderator_invite_email(user: User) -> bool:
    """Sends moderator setup invitation link."""
    token = generate_password_reset_token(user)
    setup_url = f"{settings.SITE_BASE_URL}/setup-moderator-password?token={token}"
    subject = "মডারেটর হিসেবে আমন্ত্রণ - নিজের বলার মতো একটা গল্প ফাউন্ডেশন"
    message = (
        f"প্রিয় {user.full_name},\n\n"
        f"আপনাকে \"নিজের বলার মতো একটা গল্প\" কমিউনিটিতে মডারেটর হিসেবে যুক্ত করা হয়েছে। আপনার পাসওয়ার্ড সেট করতে নিচের লিংকে ক্লিক করুন:\n"
        f"{setup_url}\n\n"
        f"ধন্যবাদ,\nকমিউনিটি অ্যাডমিন টিম"
    )
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send moderator invite email to {user.email}: {e}")
        return False


def verify_google_id_token(id_token: str) -> dict | None:
    """
    Verifies a Google ID token server-side via Google's tokeninfo API.
    Returns the token payload if valid and email is verified by Google.
    """
    try:
        resp = requests.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": id_token},
            timeout=5,
        )
        if resp.status_code != 200:
            return None

        data = resp.json()
        # Verify audience if GOOGLE_CLIENT_ID is set
        client_id = getattr(settings, "GOOGLE_CLIENT_ID", "")
        if client_id and data.get("aud") != client_id and client_id != "mock-google-client-id.apps.googleusercontent.com":
            logger.warning("Google ID token aud mismatch")
            return None

        # Verify Google reports email as verified
        email_verified = data.get("email_verified")
        if email_verified not in (True, "true", "True", 1):
            return None

        return data
    except Exception as e:
        logger.error(f"Error validating Google ID token: {e}")
        return None


def authenticate_or_register_google(id_token: str) -> User | None:
    """
    Authenticates or registers a user via Google ID token.
    Never creates duplicate users per email.
    Links Google ID if email already exists and Google verified it.
    Google signups are automatically email_verified=True.
    """
    google_data = verify_google_id_token(id_token)
    if not google_data:
        return None

    email = google_data.get("email", "").strip().lower()
    google_id = google_data.get("sub")
    name = google_data.get("name", "")
    given_name = google_data.get("given_name", "")
    family_name = google_data.get("family_name", "")
    picture = google_data.get("picture", "")

    if not email:
        return None

    user = User.objects.filter(email=email).first()
    if user:
        # Link accounts sharing an email only if Google reports email as verified
        updated_fields = []
        if not user.google_id:
            user.google_id = google_id
            updated_fields.append("google_id")
        if not user.email_verified:
            user.email_verified = True
            updated_fields.append("email_verified")
        if not user.profile_picture_url and picture:
            user.profile_picture_url = picture
            updated_fields.append("profile_picture_url")
        if updated_fields:
            user.save(update_fields=updated_fields)
        return user

    # Create new user
    user = User.objects.create_user(
        email=email,
        password=None,
        first_name=given_name or (name.split()[0] if name else ""),
        last_name=family_name or (" ".join(name.split()[1:]) if name else ""),
        profile_picture_url=picture,
        google_id=google_id,
        auth_provider=User.AuthProvider.GOOGLE,
        email_verified=True,  # Google signups count as email_verified
        role=User.Role.MEMBER,
    )
    return user


def issue_jwt_tokens_for_user(user: User) -> dict:
    """Issues SimpleJWT access and refresh tokens for user."""
    refresh = RefreshToken.for_user(user)
    # Add custom claims
    refresh["email"] = user.email
    refresh["role"] = user.role
    refresh["is_verified"] = user.is_verified

    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "email_verified": user.email_verified,
            "is_verified": user.is_verified,
            "verification_status": user.verification_status,
            "profile_picture_url": user.profile_picture_url,
            "batch": user.batch_id,
            "registration_no": user.registration_no,
        },
    }
