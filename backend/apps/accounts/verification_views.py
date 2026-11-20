from django.db.models import Q
from rest_framework import views, generics, status, permissions
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from .models import User, VerificationRequest
from .verification_serializers import (
    VerificationRequestSerializer,
    VerificationStatusResponseSerializer,
    ApproveVerificationSerializer,
    RejectVerificationSerializer,
    AdminEditVerifiedUserSerializer,
)
from .verification_services import (
    apply_for_verification,
    approve_verification_request,
    reject_verification_request,
    ConcurrencyConflictError,
)
from apps.accounts.permissions import IsModeratorOrAdmin, IsAdmin
from apps.audit.services import log_audit


class UserVerificationStatusView(views.APIView):
    """GET /me/verification returns status, latest request, rejection reason and missing fields."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        missing_fields = []
        if not user.batch:
            missing_fields.append("batch")
        if not user.registration_no:
            missing_fields.append("registration_no")

        latest_req = user.verification_requests.order_by("-submitted_at").first()
        rejection_reason = latest_req.rejection_reason if latest_req and latest_req.status == VerificationRequest.Status.REJECTED else None

        data = {
            "verification_status": user.verification_status,
            "is_verified": user.is_verified,
            "missing_required_fields": missing_fields,
            "rejection_reason": rejection_reason,
            "latest_request": VerificationRequestSerializer(latest_req).data if latest_req else None,
        }
        return Response(VerificationStatusResponseSerializer(data).data)


class UserVerificationApplyView(views.APIView):
    """POST /me/verification/apply to submit a verification application."""

    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "verification_apply"

    def post(self, request):
        ip = request.META.get("REMOTE_ADDR")
        req = apply_for_verification(user=request.user, ip=ip)
        return Response(
            {
                "detail": "ভেরিফিকেশনের আবেদন সফলভাবে জমা দেওয়া হয়েছে। মডারেটর টিম পর্যালোচনা করবে।",
                "request_id": str(req.id),
                "status": req.status,
            },
            status=status.HTTP_201_CREATED,
        )


class StaffVerificationRequestListView(generics.ListAPIView):
    """Staff list of all verification requests with filtering and search."""

    permission_classes = [IsModeratorOrAdmin]
    serializer_class = VerificationRequestSerializer

    def get_queryset(self):
        qs = VerificationRequest.objects.select_related("user", "batch", "reviewed_by").order_by("-submitted_at")

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        batch_param = self.request.query_params.get("batch")
        if batch_param:
            qs = qs.filter(Q(batch__number=batch_param) | Q(batch__id=batch_param))

        search = self.request.query_params.get("search")
        if search:
            search = search.strip()
            qs = qs.filter(
                Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(user__email__icontains=search)
                | Q(registration_no__icontains=search)
            )

        return qs


class StaffVerificationRequestDetailView(generics.RetrieveAPIView):
    """Staff detail view of a single verification request."""

    permission_classes = [IsModeratorOrAdmin]
    serializer_class = VerificationRequestSerializer
    queryset = VerificationRequest.objects.select_related("user", "batch", "reviewed_by")
    lookup_field = "pk"


class StaffVerificationApproveView(views.APIView):
    """Staff endpoint to approve verification request (with concurrency lock)."""

    permission_classes = [IsModeratorOrAdmin]

    def post(self, request, pk):
        serializer = ApproveVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reviewer_note = serializer.validated_data.get("reviewer_note", "")
        ip = request.META.get("REMOTE_ADDR")

        try:
            req = approve_verification_request(
                request_id=pk,
                reviewer=request.user,
                reviewer_note=reviewer_note,
                ip=ip,
            )
            return Response(
                {"detail": "ভেরিফিকেশন আবেদন সফলভাবে অনুমোদিত হয়েছে।", "status": req.status},
                status=status.HTTP_200_OK,
            )
        except ConcurrencyConflictError as e:
            return Response({"detail": str(e)}, status=status.HTTP_409_CONFLICT)


class StaffVerificationRejectView(views.APIView):
    """Staff endpoint to reject verification request with required reason."""

    permission_classes = [IsModeratorOrAdmin]

    def post(self, request, pk):
        serializer = RejectVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reason = serializer.validated_data["reason"]
        reviewer_note = serializer.validated_data.get("reviewer_note", "")
        ip = request.META.get("REMOTE_ADDR")

        try:
            req = reject_verification_request(
                request_id=pk,
                reviewer=request.user,
                reason=reason,
                reviewer_note=reviewer_note,
                ip=ip,
            )
            return Response(
                {"detail": "ভেরিফিকেশন আবেদন প্রত্যাখ্যাত হয়েছে।", "status": req.status},
                status=status.HTTP_200_OK,
            )
        except ConcurrencyConflictError as e:
            return Response({"detail": str(e)}, status=status.HTTP_409_CONFLICT)


class AdminVerifiedUserEditView(views.APIView):
    """Admin-only endpoint to edit a verified user's batch and registration_no."""

    permission_classes = [IsAdmin]

    def patch(self, request, user_id):
        target_user = generics.get_object_or_404(User, id=user_id)
        serializer = AdminEditVerifiedUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        batch = serializer.validated_data.get("batch")
        reg_no = serializer.validated_data.get("registration_no")

        updated_fields = []
        old_data = {"batch": target_user.batch_id, "registration_no": target_user.registration_no}

        if batch:
            target_user.batch = batch
            updated_fields.append("batch")
        if reg_no is not None:
            target_user.registration_no = reg_no.strip()
            updated_fields.append("registration_no")

        if updated_fields:
            target_user.save(update_fields=updated_fields)
            log_audit(
                actor=request.user,
                action="admin.user_verification_edit",
                target_type="User",
                target_id=str(target_user.id),
                metadata={"old": old_data, "new": {"batch": target_user.batch_id, "registration_no": target_user.registration_no}},
                ip=request.META.get("REMOTE_ADDR"),
            )

        return Response(
            {
                "detail": "ব্যবহারকারীর ভেরিফিকেশন তথ্য সফলভাবে আপডেট করা হয়েছে।",
                "batch": target_user.batch_id,
                "registration_no": target_user.registration_no,
            }
        )

    def post(self, request, user_id):
        """Admin revokes verification back to unverified."""
        target_user = generics.get_object_or_404(User, id=user_id)
        target_user.verification_status = User.VerificationStatus.UNVERIFIED
        target_user.verified_by = None
        target_user.verified_at = None
        target_user.save(update_fields=["verification_status", "verified_by", "verified_at"])

        log_audit(
            actor=request.user,
            action="admin.user_verification_revoke",
            target_type="User",
            target_id=str(target_user.id),
            metadata={"revoked_by": request.user.email},
            ip=request.META.get("REMOTE_ADDR"),
        )

        return Response({"detail": "ব্যবহারকারীর ভেরিফিকেশন স্ট্যাটাস বাতিল করে unverified করা হয়েছে।"}, status=status.HTTP_200_OK)
