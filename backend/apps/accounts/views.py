from django.conf import settings
from django.utils import timezone
from rest_framework import status, views, viewsets, mixins, permissions
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User, UserSession
from .permissions import IsAdmin
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    GoogleAuthSerializer,
    EmailVerificationRequestSerializer,
    VerifyEmailConfirmSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ChangePasswordSerializer,
    UserSessionSerializer,
    ModeratorInviteSerializer,
)
from .services import (
    send_verification_email,
    verify_email_token,
    send_password_reset_email,
    verify_password_reset_token,
    send_moderator_invite_email,
    authenticate_or_register_google,
    issue_jwt_tokens_for_user,
)


def _set_jwt_cookies(response: Response, tokens: dict):
    """Optionally sets refresh token cookie for Next.js."""
    cookie_secure = getattr(settings, "JWT_COOKIE_SECURE", False)
    cookie_samesite = getattr(settings, "JWT_COOKIE_SAMESITE", "Lax")
    cookie_name = getattr(settings, "JWT_REFRESH_COOKIE_NAME", "refresh_token")
    refresh_lifetime = settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]

    response.set_cookie(
        key=cookie_name,
        value=tokens["refresh"],
        max_age=int(refresh_lifetime.total_seconds()),
        httponly=True,
        secure=cookie_secure,
        samesite=cookie_samesite,
        path="/",
    )


class RegisterView(views.APIView):
    """User registration via email and password."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Send email verification
        email_sent = send_verification_email(user)

        return Response(
            {
                "detail": "নিবন্ধন সফল হয়েছে। আপনার ইমেইল ইনবক্স চেক করে অ্যাকাউন্ট ভেরিফাই করুন।",
                "email": user.email,
                "email_sent": email_sent,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(views.APIView):
    """Standard JWT login endpoint."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        tokens = issue_jwt_tokens_for_user(user)
        response = Response(tokens, status=status.HTTP_200_OK)
        _set_jwt_cookies(response, tokens)
        return response


class GoogleLoginView(views.APIView):
    """Sign up or sign in using a Google ID token verified server-side."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        id_token = serializer.validated_data["id_token"]

        user = authenticate_or_register_google(id_token)
        if not user:
            return Response(
                {"detail": "গুগল আইডি টোকেনটি সঠিক নয় বা ইমেইল ভেরিফাইড পাওয়া যায়নি।"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.is_active:
            return Response(
                {"detail": "আপনার অ্যাকাউন্ট নিষ্ক্রিয় রয়েছে।"},
                status=status.HTTP_403_FORBIDDEN,
            )

        tokens = issue_jwt_tokens_for_user(user)
        response = Response(tokens, status=status.HTTP_200_OK)
        _set_jwt_cookies(response, tokens)
        return response


class LogoutView(views.APIView):
    """Blacklists the refresh token and clears cookies."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh") or request.COOKIES.get(
            getattr(settings, "JWT_REFRESH_COOKIE_NAME", "refresh_token")
        )

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass

        response = Response({"detail": "সফলভাবে লগআউট করা হয়েছে।"}, status=status.HTTP_200_OK)
        cookie_name = getattr(settings, "JWT_REFRESH_COOKIE_NAME", "refresh_token")
        response.delete_cookie(cookie_name, path="/")
        return response


class TokenRefreshView(views.APIView):
    """Refreshes access token with rotation and blacklist."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_str = request.data.get("refresh") or request.COOKIES.get(
            getattr(settings, "JWT_REFRESH_COOKIE_NAME", "refresh_token")
        )

        if not refresh_str:
            return Response(
                {"detail": "রিফ্রেশ টোকেন প্রদান করা আবশ্যক।"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            old_refresh = RefreshToken(refresh_str)
            user_id = old_refresh.get("user_id")
            user = User.objects.filter(id=user_id, is_active=True).first()
            if not user:
                return Response({"detail": "ব্যবহারকারী পাওয়া যায়নি বা নিষ্ক্রিয়।"}, status=status.HTTP_401_UNAUTHORIZED)

            # Rotate tokens
            new_tokens = issue_jwt_tokens_for_user(user)
            # Blacklist old token
            old_refresh.blacklist()

            response = Response(new_tokens, status=status.HTTP_200_OK)
            _set_jwt_cookies(response, new_tokens)
            return response
        except TokenError as e:
            return Response({"detail": "রিফ্রেশ টোকেনটি অবৈধ বা মেয়াদোত্তীর্ণ।"}, status=status.HTTP_401_UNAUTHORIZED)


class ResendEmailVerificationView(views.APIView):
    """Resend email verification link without revealing user existence."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "resend_verification"

    def post(self, request):
        serializer = EmailVerificationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()

        user = User.objects.filter(email=email).first()
        if user and not user.email_verified:
            send_verification_email(user)

        # Generic response to prevent enumeration
        return Response(
            {"detail": "যদি এই ইমেইলটি নিবন্ধিত থাকে, তবে যাচাইকরণ লিংক পাঠানো হয়েছে।"},
            status=status.HTTP_200_OK,
        )


class VerifyEmailConfirmView(views.APIView):
    """Confirm email verification from link token."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyEmailConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]

        user = verify_email_token(token)
        if not user:
            return Response(
                {"detail": "ভেরিফিকেশন লিংকটি অবৈধ বা মেয়াদোত্তীর্ণ।"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.email_verified:
            user.email_verified = True
            user.save(update_fields=["email_verified"])

        return Response(
            {"detail": "আপনার ইমেইল সফলভাবে যাচাই হয়েছে। আপনি এখন লগইন করতে পারেন।"},
            status=status.HTTP_200_OK,
        )


class PasswordResetRequestView(views.APIView):
    """Request password reset link without revealing user existence."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()

        user = User.objects.filter(email=email).first()
        if user and user.is_active:
            send_password_reset_email(user)

        return Response(
            {"detail": "যদি এই ইমেইলটি নিবন্ধিত থাকে, তবে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।"},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(views.APIView):
    """Confirm password reset with signed token."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        user = verify_password_reset_token(token)
        if not user:
            return Response(
                {"detail": "পাসওয়ার্ড রিসেট লিংকটি অবৈধ বা মেয়াদোত্তীর্ণ।"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        # Also mark email verified if user resets password via email link
        user.email_verified = True
        user.save(update_fields=["password", "email_verified"])

        return Response(
            {"detail": "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।"},
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(views.APIView):
    """Change password or set password for Google-only users."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        new_password = serializer.validated_data["new_password"]

        user = request.user
        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response(
            {"detail": "আপনার পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে।"},
            status=status.HTTP_200_OK,
        )


class MeProfileView(views.APIView):
    """View and update authenticated user profile."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserSessionListView(views.APIView):
    """List active sessions for current user."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sessions = UserSession.objects.filter(user=request.user, revoked=False)
        serializer = UserSessionSerializer(sessions, many=True)
        return Response(serializer.data)


class UserSessionRevokeView(views.APIView):
    """Revoke a specific session."""

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, session_id):
        session = UserSession.objects.filter(id=session_id, user=request.user).first()
        if not session:
            return Response({"detail": "সেশন পাওয়া যায়নি।"}, status=status.HTTP_404_NOT_FOUND)

        session.revoked = True
        session.save(update_fields=["revoked"])
        return Response({"detail": "সেশন বাতিল করা হয়েছে।"}, status=status.HTTP_200_OK)


class AdminModeratorCreateView(views.APIView):
    """Admin endpoint to create or invite a moderator with password-setup link."""

    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = ModeratorInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        first_name = serializer.validated_data.get("first_name", "")
        last_name = serializer.validated_data.get("last_name", "")

        user = User.objects.create_user(
            email=email,
            password=None,  # Unusable until setup link used
            first_name=first_name,
            last_name=last_name,
            role=User.Role.MODERATOR,
            email_verified=True,
            is_staff=True,
            verification_status=User.VerificationStatus.VERIFIED,
        )

        send_moderator_invite_email(user)

        return Response(
            {
                "detail": f"মডারেটর অ্যাকাউন্ট তৈরি হয়েছে এবং {user.email} ঠিকানায় আমন্ত্রণ লিংক পাঠানো হয়েছে।",
                "id": str(user.id),
                "email": user.email,
                "role": user.role,
            },
            status=status.HTTP_201_CREATED,
        )
