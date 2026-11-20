from rest_framework import serializers
from .models import Like, Bookmark, Comment, CommentReport, SessionNote, PersonalNote


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.full_name", read_only=True)
    author_photo_url = serializers.URLField(source="author.profile_picture_url", read_only=True)
    is_my_comment = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = (
            "id",
            "author_name",
            "author_photo_url",
            "content",
            "created_at",
            "edited_at",
            "is_hidden",
            "parent",
            "is_my_comment",
        )
        read_only_fields = ("id", "author_name", "author_photo_url", "created_at", "edited_at", "is_hidden", "is_my_comment")

    def get_is_my_comment(self, obj):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            return obj.author_id == request.user.id
        return False


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ("content", "parent")

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("মন্তব্যের বিষয়বস্তু খালি রাখা যাবে না।")
        return value.strip()


class CommentReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentReport
        fields = ("id", "comment", "reason", "status", "created_at")
        read_only_fields = ("id", "status", "created_at")


class SessionNoteSerializer(serializers.ModelSerializer):
    session_slug = serializers.CharField(source="session.slug", read_only=True)
    session_title = serializers.CharField(source="session.title", read_only=True)
    session_number = serializers.IntegerField(source="session.session_number", read_only=True)

    class Meta:
        model = SessionNote
        fields = ("id", "session_slug", "session_title", "session_number", "content", "created_at", "updated_at")
        read_only_fields = ("id", "session_slug", "session_title", "session_number", "created_at", "updated_at")


class PersonalNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalNote
        fields = ("id", "content", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("নোটের বিষয়বস্তু খালি রাখা যাবে না।")
        return value.strip()


class ActivitySummarySerializer(serializers.Serializer):
    likes_count = serializers.IntegerField()
    bookmarks_count = serializers.IntegerField()
    comments_count = serializers.IntegerField()
    notes_count = serializers.IntegerField()
    sessions_commented_count = serializers.IntegerField()
