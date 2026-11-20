import datetime
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, views, status, permissions
from rest_framework.response import Response

from apps.accounts.models import User
from apps.accounts.permissions import IsAdmin, IsModeratorOrAdmin
from apps.audit.models import AuditLog
from apps.audit.services import log_audit
from apps.core.pagination import StandardResultsSetPagination
from apps.interactions.models import Comment, CommentReport
from apps.notifications.models import Notification
from apps.notifications.services import create_and_send_notification

from .serializers import (
    AdminUserListSerializer,
    AdminUserUpdateSerializer,
    AuditLogSerializer,
    AdminBroadcastSerializer,
    StaffCommentReportListSerializer,
    ResolveCommentReportSerializer,
    AdminCommentSerializer,
    AdminCommentUpdateSerializer,
)
from .services import get_platform_analytics


class AdminUserListView(generics.ListAPIView):
    """
    GET /api/v1/admin/users/
    List users with search, filtering, and aggregated engagement statistics.
    Admin only.
    """

    permission_classes = [IsAdmin]
    serializer_class = AdminUserListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = (
            User.objects.select_related("batch")
            .annotate(
                comments_count=Count(
                    "authored_comments",
                    filter=Q(authored_comments__is_deleted=False),
                    distinct=True,
                ),
                likes_given_count=Count("likes", distinct=True),
                bookmarks_count=Count("bookmarks", distinct=True),
                notes_count=(
                    Count("session_notes", distinct=True)
                    + Count("personal_notes", distinct=True)
                ),
                posts_commented_count=Count(
                    "authored_comments__session",
                    filter=Q(authored_comments__is_deleted=False),
                    distinct=True,
                ),
            )
            .order_by("-date_joined")
        )

        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)

        v_status = self.request.query_params.get("verification_status")
        if v_status:
            qs = qs.filter(verification_status=v_status)

        email_verified = self.request.query_params.get("email_verified")
        if email_verified is not None:
            if email_verified.lower() in ("true", "1"):
                qs = qs.filter(email_verified=True)
            elif email_verified.lower() in ("false", "0"):
                qs = qs.filter(email_verified=False)

        batch = self.request.query_params.get("batch")
        if batch:
            qs = qs.filter(batch_id=batch)

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            if is_active.lower() in ("true", "1"):
                qs = qs.filter(is_active=True)
            elif is_active.lower() in ("false", "0"):
                qs = qs.filter(is_active=False)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
                | Q(registration_no__icontains=search)
            )

        return qs


class AdminUserDetailView(views.APIView):
    """
    GET /api/v1/admin/users/{id}/
    PATCH /api/v1/admin/users/{id}/
    DELETE /api/v1/admin/users/{id}/ (soft delete)
    Admin only.
    """

    permission_classes = [IsAdmin]

    def get_object(self, pk):
        return get_object_or_404(
            User.objects.annotate(
                comments_count=Count(
                    "authored_comments",
                    filter=Q(authored_comments__is_deleted=False),
                    distinct=True,
                ),
                likes_given_count=Count("likes", distinct=True),
                bookmarks_count=Count("bookmarks", distinct=True),
                notes_count=(
                    Count("session_notes", distinct=True)
                    + Count("personal_notes", distinct=True)
                ),
                posts_commented_count=Count(
                    "authored_comments__session",
                    filter=Q(authored_comments__is_deleted=False),
                    distinct=True,
                ),
            ),
            pk=pk,
        )

    def get(self, request, pk):
        user = self.get_object(pk)
        serializer = AdminUserListSerializer(user)
        return Response(serializer.data)

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = AdminUserUpdateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        log_audit(
            actor=request.user,
            action="admin.user_updated",
            target_type="User",
            target_id=str(user.id),
            metadata={"changed_fields": list(request.data.keys())},
            ip=request.META.get("REMOTE_ADDR"),
        )
        return Response(serializer.data)

    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.is_active = False
        user.save(update_fields=["is_active"])

        log_audit(
            actor=request.user,
            action="admin.user_deactivated",
            target_type="User",
            target_id=str(user.id),
            metadata={"email": user.email},
            ip=request.META.get("REMOTE_ADDR"),
        )
        return Response(
            {"detail": "ইউজার অ্যাকাউন্ট সফলভাবে নিষ্ক্রিয় করা হয়েছে।"},
            status=status.HTTP_200_OK,
        )


class AdminAssignModeratorView(views.APIView):
    """
    POST /api/v1/admin/users/{id}/assign-moderator/
    Promotes user to moderator role. Admin only.
    """

    permission_classes = [IsAdmin]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.role = User.Role.MODERATOR
        user.is_staff = True
        user.save(update_fields=["role", "is_staff"])

        log_audit(
            actor=request.user,
            action="admin.moderator_assigned",
            target_type="User",
            target_id=str(user.id),
            metadata={"email": user.email},
            ip=request.META.get("REMOTE_ADDR"),
        )
        return Response(
            {"detail": f"{user.email} কে মডারেটর পদে নিযুক্ত করা হয়েছে।"},
            status=status.HTTP_200_OK,
        )


class AdminRevokeModeratorView(views.APIView):
    """
    POST /api/v1/admin/users/{id}/revoke-moderator/
    Revokes moderator role back to member. Admin only.
    """

    permission_classes = [IsAdmin]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.role = User.Role.MEMBER
        user.is_staff = False
        user.save(update_fields=["role", "is_staff"])

        log_audit(
            actor=request.user,
            action="admin.moderator_revoked",
            target_type="User",
            target_id=str(user.id),
            metadata={"email": user.email},
            ip=request.META.get("REMOTE_ADDR"),
        )
        return Response(
            {"detail": f"{user.email} এর মডারেটর পদ প্রত্যাহার করা হয়েছে।"},
            status=status.HTTP_200_OK,
        )


class AdminAuditLogListView(generics.ListAPIView):
    """
    GET /api/v1/admin/audit-logs/
    List system audit logs. Admin only.
    """

    permission_classes = [IsAdmin]
    serializer_class = AuditLogSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = AuditLog.objects.select_related("actor").order_by("-created_at")

        actor_email = self.request.query_params.get("actor")
        if actor_email:
            qs = qs.filter(actor__email__icontains=actor_email)

        action = self.request.query_params.get("action")
        if action:
            qs = qs.filter(action=action)

        target_type = self.request.query_params.get("target_type")
        if target_type:
            qs = qs.filter(target_type=target_type)

        date_from = self.request.query_params.get("date_from")
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)

        date_to = self.request.query_params.get("date_to")
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(action__icontains=search)
                | Q(target_type__icontains=search)
                | Q(target_id__icontains=search)
            )

        return qs


class AdminBroadcastView(views.APIView):
    """
    POST /api/v1/admin/notify/
    Send in-app and email notification to targeted user groups. Admin only.
    """

    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = AdminBroadcastSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        recipient_type = serializer.validated_data["recipient_type"]
        target_id = serializer.validated_data.get("target_id", "")
        title = serializer.validated_data["title"]
        message = serializer.validated_data["message"]

        recipients = User.objects.filter(is_active=True)
        if recipient_type == "staff":
            recipients = recipients.filter(role__in=[User.Role.ADMIN, User.Role.MODERATOR])
        elif recipient_type == "batch":
            recipients = recipients.filter(batch_id=target_id)
        elif recipient_type == "user":
            recipients = recipients.filter(id=target_id)

        count = 0
        for user in recipients:
            create_and_send_notification(
                recipient=user,
                notif_type=Notification.Type.ADMIN_MESSAGE,
                title=title,
                message=message,
            )
            count += 1

        log_audit(
            actor=request.user,
            action="admin.broadcast_sent",
            target_type="Notification",
            target_id=recipient_type,
            metadata={"title": title, "recipients_count": count},
            ip=request.META.get("REMOTE_ADDR"),
        )

        return Response(
            {"detail": f"{count} জন ব্যবহারকারীকে সফলভাবে বিজ্ঞপ্তি পাঠানো হয়েছে।", "sent_count": count},
            status=status.HTTP_200_OK,
        )


class AdminAnalyticsView(views.APIView):
    """
    GET /api/v1/admin/analytics/
    Aggregated platform analytics with deltas, series, top sessions and batch stats.
    Admin only.
    """

    permission_classes = [IsAdmin]

    def get(self, request):
        date_from_str = request.query_params.get("date_from")
        date_to_str = request.query_params.get("date_to")
        batch_id = request.query_params.get("batch_id")

        date_from = None
        date_to = None

        if date_from_str:
            try:
                date_from = datetime.date.fromisoformat(date_from_str)
            except ValueError:
                pass

        if date_to_str:
            try:
                date_to = datetime.date.fromisoformat(date_to_str)
            except ValueError:
                pass

        data = get_platform_analytics(date_from=date_from, date_to=date_to, batch_id=batch_id)
        return Response(data, status=status.HTTP_200_OK)


class AdminCommentListView(generics.ListAPIView):
    """
    GET /api/v1/admin/comments/
    List comments for admin moderation with report counts. Admin only.
    """

    permission_classes = [IsAdmin]
    serializer_class = AdminCommentSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = (
            Comment.objects.select_related("author", "session")
            .annotate(reports_count=Count("reports", distinct=True))
            .order_by("-created_at")
        )

        is_hidden = self.request.query_params.get("is_hidden")
        if is_hidden is not None:
            if is_hidden.lower() in ("true", "1"):
                qs = qs.filter(is_hidden=True)
            elif is_hidden.lower() in ("false", "0"):
                qs = qs.filter(is_hidden=False)

        is_deleted = self.request.query_params.get("is_deleted")
        if is_deleted is not None:
            if is_deleted.lower() in ("true", "1"):
                qs = qs.filter(is_deleted=True)
            elif is_deleted.lower() in ("false", "0"):
                qs = qs.filter(is_deleted=False)

        reported_only = self.request.query_params.get("reported")
        if reported_only and reported_only.lower() in ("true", "1"):
            qs = qs.filter(reports_count__gt=0)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(content__icontains=search)

        return qs


class AdminCommentDetailView(views.APIView):
    """
    PATCH /api/v1/admin/comments/{id}/
    DELETE /api/v1/admin/comments/{id}/
    Admin only.
    """

    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)
        serializer = AdminCommentUpdateSerializer(comment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        log_audit(
            actor=request.user,
            action="admin.comment_moderated",
            target_type="Comment",
            target_id=str(comment.id),
            metadata={"is_hidden": comment.is_hidden},
            ip=request.META.get("REMOTE_ADDR"),
        )
        return Response(serializer.data)

    def delete(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)
        comment.soft_delete()

        log_audit(
            actor=request.user,
            action="admin.comment_deleted",
            target_type="Comment",
            target_id=str(comment.id),
            metadata={"author": comment.author.email},
            ip=request.META.get("REMOTE_ADDR"),
        )
        return Response(
            {"detail": "মন্তব্য সফলভাবে মুছে ফেলা হয়েছে।"},
            status=status.HTTP_200_OK,
        )


class StaffCommentReportListView(generics.ListAPIView):
    """
    GET /api/v1/staff/comment-reports/
    List reported comments. Staff (moderators and admins).
    """

    permission_classes = [IsModeratorOrAdmin]
    serializer_class = StaffCommentReportListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = CommentReport.objects.select_related("comment", "comment__session", "reporter").order_by("-created_at")

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        return qs


class StaffCommentReportResolveView(views.APIView):
    """
    POST /api/v1/staff/comment-reports/{id}/resolve/
    Resolves or dismisses a reported comment. Optionally hides the comment.
    Staff only.
    """

    permission_classes = [IsModeratorOrAdmin]

    def post(self, request, pk):
        report = get_object_or_404(CommentReport, pk=pk)
        serializer = ResolveCommentReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data["status"]
        hide_comment = serializer.validated_data.get("hide_comment", False)

        report.status = new_status
        report.resolved_by = request.user
        report.resolved_at = timezone.now()
        report.save(update_fields=["status", "resolved_by", "resolved_at"])

        if hide_comment and not report.comment.is_hidden:
            report.comment.is_hidden = True
            report.comment.save(update_fields=["is_hidden"])

        log_audit(
            actor=request.user,
            action="staff.comment_report_resolved",
            target_type="CommentReport",
            target_id=str(report.id),
            metadata={"status": new_status, "comment_hidden": hide_comment},
            ip=request.META.get("REMOTE_ADDR"),
        )

        return Response(
            {"detail": "রিপোর্টটি সফলভাবে সমাধান করা হয়েছে।", "status": new_status},
            status=status.HTTP_200_OK,
        )
