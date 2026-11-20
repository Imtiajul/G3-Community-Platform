from rest_framework import views, status, permissions
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from .serializers import UploadPresignRequestSerializer, AvatarUpdateSerializer
from .services import generate_presigned_upload
from apps.audit.services import log_audit


class PresignedUploadView(views.APIView):
    """
    POST /api/v1/uploads/
    Generates a presigned direct upload URL and the permanent file URL.
    Restricted to JPEG, PNG, WEBP, max 5 MB, throttled per user.
    """

    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [UserRateThrottle]

    def post(self, request):
        serializer = UploadPresignRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = generate_presigned_upload(
            user=request.user,
            filename=serializer.validated_data["filename"],
            content_type=serializer.validated_data["content_type"],
            file_size=serializer.validated_data["file_size"],
        )

        if request.user.role in (request.user.Role.ADMIN, request.user.Role.MODERATOR):
            log_audit(
                actor=request.user,
                action="staff.upload_requested",
                target_type="Upload",
                target_id=data["key"],
                metadata={"filename": serializer.validated_data["filename"]},
                ip=request.META.get("REMOTE_ADDR"),
            )

        return Response(data, status=status.HTTP_200_OK)


class AvatarUpdateView(views.APIView):
    """
    POST /api/v1/accounts/me/avatar/
    Sets authenticated user's profile picture URL.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AvatarUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.profile_picture_url = serializer.validated_data["profile_picture_url"]
        user.save(update_fields=["profile_picture_url"])

        return Response(
            {
                "detail": "প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে।",
                "profile_picture_url": user.profile_picture_url,
            },
            status=status.HTTP_200_OK,
        )
