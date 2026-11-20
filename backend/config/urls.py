from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from apps.accounts.views import AdminModeratorCreateView
from apps.analytics.views import StaffCommentReportListView, StaffCommentReportResolveView

urlpatterns = [
    path("admin/", admin.site.urls),
    # OpenAPI Schema & Docs
    path("api/docs/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/docs/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs-root"),
    # API v1 Endpoints
    path("api/v1/accounts/", include("apps.accounts.urls")),
    path("api/v1/community/", include("apps.community.urls")),
    path("api/v1/interactions/", include("apps.interactions.urls")),
    path("api/v1/announcements/", include("apps.announcements.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
    path("api/v1/public/", include("apps.community.public_urls")),
    path("api/v1/uploads/", include("apps.uploads.urls")),
    path("api/v1/admin/moderators/", AdminModeratorCreateView.as_view(), name="admin-create-moderator"),
    path("api/v1/admin/", include("apps.analytics.urls")),
    # Staff comment reports
    path("api/v1/staff/comment-reports/", StaffCommentReportListView.as_view(), name="staff-comment-reports"),
    path("api/v1/staff/comment-reports/<uuid:pk>/resolve/", StaffCommentReportResolveView.as_view(), name="staff-comment-report-resolve"),
]
