from django.urls import path
from . import views

urlpatterns = [
    path("", views.PresignedUploadView.as_view(), name="uploads-presigned"),
]
