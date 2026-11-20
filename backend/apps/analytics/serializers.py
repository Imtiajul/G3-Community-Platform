from rest_framework import serializers
from apps.accounts.models import User
from apps.audit.models import AuditLog
from apps.interactions.models import Comment, CommentReport


class AdminUserListSerializer(serializers.ModelSerializer):
    """Admin view of users with engagement counts (notes counts only, never content!)."""

    full_name = serializers.CharField(read_only=True)
    batch_number = serializers.IntegerField(source="batch.number", read_only=True)
    batch_name = serializers.CharField(source="batch.name", read_only=True)
    comments_count = serializers.IntegerField(default=0, read_only=True)
    likes_given_count = serializers.IntegerField(default=0, read_only=True)
    bookmarks_count = serializers.IntegerField(default=0, read_only=True)
    notes_count = serializers.IntegerField(default=0, read_only=True)
    posts_commented_count = serializers.IntegerField(default=0, read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "verification_status",
            "email_verified",
            "batch",
            "batch_number",
            "batch_name",
            "registration_no",
            "is_active",
            "date_joined",
            "last_active_at",
            "comments_count",
            "likes_given_count",
            "bookmarks_count",
            "notes_count",
            "posts_commented_count",
        )
        read_only_fields = fields


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "first_name",
            "last_name",
            "role",
            "is_active",
            "batch",
            "registration_no",
            "email_verified",
            "verification_status",
        )


class AuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source="actor.email", read_only=True)

    class Meta:
        model = AuditLog
        fields = ("id", "actor_email", "action", "target_type", "target_id", "metadata", "ip", "created_at")
        read_only_fields = fields


class AdminBroadcastSerializer(serializers.Serializer):
    recipient_type = serializers.ChoiceField(choices=["all", "staff", "batch", "user"])
    target_id = serializers.CharField(required=False, allow_blank=True, default="")
    title = serializers.CharField(max_length=200)
    message = serializers.CharField()


class StaffCommentReportListSerializer(serializers.ModelSerializer):
    comment_content = serializers.CharField(source="comment.content", read_only=True)
    reporter_email = serializers.EmailField(source="reporter.email", read_only=True)
    session_title = serializers.CharField(source="comment.session.title", read_only=True)
    session_slug = serializers.CharField(source="comment.session.slug", read_only=True)

    class Meta:
        model = CommentReport
        fields = (
            "id",
            "comment",
            "comment_content",
            "session_title",
            "session_slug",
            "reporter_email",
            "reason",
            "status",
            "created_at",
        )
        read_only_fields = fields


class ResolveCommentReportSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["resolved", "dismissed"])
    hide_comment = serializers.BooleanField(default=False)


class AdminCommentSerializer(serializers.ModelSerializer):
    author_email = serializers.EmailField(source="author.email", read_only=True)
    author_name = serializers.CharField(source="author.full_name", read_only=True)
    session_title = serializers.CharField(source="session.title", read_only=True)
    session_slug = serializers.CharField(source="session.slug", read_only=True)
    reports_count = serializers.IntegerField(default=0, read_only=True)

    class Meta:
        model = Comment
        fields = (
            "id",
            "session",
            "session_title",
            "session_slug",
            "author",
            "author_email",
            "author_name",
            "content",
            "is_hidden",
            "is_deleted",
            "reports_count",
            "created_at",
            "edited_at",
        )
        read_only_fields = ("id", "session", "author", "created_at", "edited_at")


class AdminCommentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ("is_hidden",)

