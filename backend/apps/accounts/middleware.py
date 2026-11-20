from django.utils import timezone
from .models import User, UserSession


class UserSessionMiddleware:
    """Updates user last_active_at and records UserSession activity."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            now = timezone.now()
            # Update user last_active_at
            User.objects.filter(id=user.id).update(last_active_at=now)

            # Record or update user session
            ip = self.get_client_ip(request)
            user_agent = request.META.get("HTTP_USER_AGENT", "")[:500]

            # If user has an active session from this IP & User-Agent, update last_active
            existing_session = UserSession.objects.filter(
                user=user,
                ip_address=ip,
                user_agent=user_agent,
                revoked=False,
            ).first()

            if existing_session:
                UserSession.objects.filter(id=existing_session.id).update(last_active=now)
            else:
                UserSession.objects.create(
                    user=user,
                    ip_address=ip,
                    user_agent=user_agent,
                    last_active=now,
                )

        return response

    @staticmethod
    def get_client_ip(request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0].strip()
        else:
            ip = request.META.get("REMOTE_ADDR")
        return ip
