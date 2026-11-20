from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"batches", views.BatchViewSet, basename="batch")
router.register(r"tags", views.TagViewSet, basename="tag")
router.register(r"sessions", views.SessionViewSet, basename="session")

urlpatterns = [
    path("", include(router.urls)),
]
