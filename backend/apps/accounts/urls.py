from django.urls import path
from . import views, verification_views
from apps.uploads import views as avatar_views

urlpatterns = [
    # Authentication
    path("register/", views.RegisterView.as_view(), name="account-register"),
    path("login/", views.LoginView.as_view(), name="account-login"),
    path("google/", views.GoogleLoginView.as_view(), name="account-google-login"),
    path("logout/", views.LogoutView.as_view(), name="account-logout"),
    path("token/refresh/", views.TokenRefreshView.as_view(), name="account-token-refresh"),
    # Email verification
    path("verification/resend/", views.ResendEmailVerificationView.as_view(), name="account-verification-resend"),
    path("verification/confirm/", views.VerifyEmailConfirmView.as_view(), name="account-verification-confirm"),
    # Password management
    path("password/reset/", views.PasswordResetRequestView.as_view(), name="account-password-reset"),
    path("password/reset/confirm/", views.PasswordResetConfirmView.as_view(), name="account-password-reset-confirm"),
    path("password/change/", views.ChangePasswordView.as_view(), name="account-password-change"),
    # Profile & Sessions
    path("me/", views.MeProfileView.as_view(), name="account-me"),
    path("me/avatar/", avatar_views.AvatarUpdateView.as_view(), name="account-me-avatar"),
    path("me/verification/", verification_views.UserVerificationStatusView.as_view(), name="me-verification-status"),
    path("me/verification/apply/", verification_views.UserVerificationApplyView.as_view(), name="me-verification-apply"),
    path("me/sessions/", views.UserSessionListView.as_view(), name="account-me-sessions"),
    path("me/sessions/<uuid:session_id>/", views.UserSessionRevokeView.as_view(), name="account-me-sessions-revoke"),
    # Staff verification review
    path("staff/verification-requests/", verification_views.StaffVerificationRequestListView.as_view(), name="staff-verification-list"),
    path("staff/verification-requests/<uuid:pk>/", verification_views.StaffVerificationRequestDetailView.as_view(), name="staff-verification-detail"),
    path("staff/verification-requests/<uuid:pk>/approve/", verification_views.StaffVerificationApproveView.as_view(), name="staff-verification-approve"),
    path("staff/verification-requests/<uuid:pk>/reject/", verification_views.StaffVerificationRejectView.as_view(), name="staff-verification-reject"),
    # Admin verification management
    path("admin/users/<uuid:user_id>/verification/", verification_views.AdminVerifiedUserEditView.as_view(), name="admin-user-verification-edit"),
]
