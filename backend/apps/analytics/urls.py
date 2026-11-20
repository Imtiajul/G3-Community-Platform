from django.urls import path
from . import views

urlpatterns = [
    # Admin User Management
    path("users/", views.AdminUserListView.as_view(), name="admin-user-list"),
    path("users/<uuid:pk>/", views.AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("users/<uuid:pk>/assign-moderator/", views.AdminAssignModeratorView.as_view(), name="admin-user-assign-moderator"),
    path("users/<uuid:pk>/revoke-moderator/", views.AdminRevokeModeratorView.as_view(), name="admin-user-revoke-moderator"),
    # Admin Audit Logs
    path("audit-logs/", views.AdminAuditLogListView.as_view(), name="admin-audit-log-list"),
    # Admin Broadcast Notification
    path("notify/", views.AdminBroadcastView.as_view(), name="admin-notify-broadcast"),
    # Platform Analytics
    path("analytics/", views.AdminAnalyticsView.as_view(), name="admin-platform-analytics"),
    # Admin Comment Moderation
    path("comments/", views.AdminCommentListView.as_view(), name="admin-comment-list"),
    path("comments/<uuid:pk>/", views.AdminCommentDetailView.as_view(), name="admin-comment-detail"),
]
