from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"personal-notes", views.PersonalNoteViewSet, basename="personal-note")

urlpatterns = [
    # Session likes & bookmarks
    path("sessions/<slug:slug>/like/", views.SessionLikeView.as_view(), name="session-like"),
    path("sessions/<slug:slug>/bookmark/", views.SessionBookmarkView.as_view(), name="session-bookmark"),
    # Session comments
    path("sessions/<slug:slug>/comments/", views.SessionCommentListCreateView.as_view(), name="session-comments"),
    path("comments/<uuid:pk>/", views.CommentDetailView.as_view(), name="comment-detail"),
    path("comments/<uuid:pk>/report/", views.CommentReportView.as_view(), name="comment-report"),
    # Session notes
    path("sessions/<slug:slug>/note/", views.SessionNoteView.as_view(), name="session-note"),
    # Dashboard /me endpoints
    path("me/bookmarks/", views.UserBookmarksListView.as_view(), name="me-bookmarks"),
    path("me/notes/", views.UserNotesListView.as_view(), name="me-notes"),
    path("me/activity/", views.UserDashboardActivityView.as_view(), name="me-activity"),
    # Router
    path("", include(router.urls)),
]
