from django.urls import path
from . import public_views

urlpatterns = [
    path("sessions/", public_views.PublicSessionListView.as_view(), name="public-session-list"),
    path("sessions/<slug:slug>/", public_views.PublicSessionDetailView.as_view(), name="public-session-detail"),
    path("sessions/<slug:slug>/meta/", public_views.SessionMetaView.as_view(), name="public-session-meta"),
    path("sitemap/", public_views.SitemapView.as_view(), name="public-sitemap"),
    path("landing/", public_views.PublicLandingView.as_view(), name="public-landing"),
]
