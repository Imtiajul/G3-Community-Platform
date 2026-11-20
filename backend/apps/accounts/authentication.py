from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings


class JWTCookieAuthentication(JWTAuthentication):
    """
    Extends simplejwt authentication to support reading access token from
    authorization header as well as from cookies (for Next.js App Router).
    """

    def authenticate(self, request):
        header = self.get_header(request)
        if header is not None:
            raw_token = self.get_raw_token(header)
            if raw_token is not None:
                validated_token = self.get_validated_token(raw_token)
                return self.get_user(validated_token), validated_token

        # Check cookie if header is not present
        cookie_name = getattr(settings, "JWT_ACCESS_COOKIE_NAME", "access_token")
        raw_token = request.COOKIES.get(cookie_name)
        if raw_token:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token

        return None


try:
    from drf_spectacular.extensions import OpenApiAuthenticationExtension

    class JWTCookieAuthenticationScheme(OpenApiAuthenticationExtension):
        target_class = "apps.accounts.authentication.JWTCookieAuthentication"
        name = "jwtCookieAuth"

        def get_security_definition(self, auto_schema):
            return {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "JWT Bearer token in 'Authorization: Bearer <token>' header or HttpOnly cookie",
            }
except ImportError:
    pass

