from django.urls import path
from . import views

urlpatterns = [
    path("", views.NotificationListView.as_view(), name="notification-list"),
    path("<uuid:pk>/read/", views.NotificationMarkReadView.as_view(), name="notification-mark-read"),
    path("read-all/", views.NotificationMarkAllReadView.as_view(), name="notification-mark-all-read"),
    path("me/preferences/", views.NotificationPreferenceView.as_view(), name="notification-preferences"),
]
