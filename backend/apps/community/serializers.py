from django.utils.text import slugify
from rest_framework import serializers
from .models import Batch, Tag, Session, SessionTag, SessionAttachment


class BatchSerializer(serializers.ModelSerializer):
    """Batch serializer with optional next session number."""

    next_session_number = serializers.SerializerMethodField()

    class Meta:
        model = Batch
        fields = ("id", "number", "name", "start_date", "end_date", "is_active", "next_session_number")
        read_only_fields = ("id", "next_session_number")

    def get_next_session_number(self, obj) -> int:
        return obj.get_next_session_number()


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name", "slug", "color")
        read_only_fields = ("id", "slug")

    def create(self, validated_data):
        name = validated_data["name"]
        if not validated_data.get("slug"):
            validated_data["slug"] = slugify(name) or f"tag-{Tag.objects.count() + 1}"
        return super().create(validated_data)


class SessionAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionAttachment
        fields = ("id", "file_url", "type", "caption")
        read_only_fields = ("id",)


class SessionTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name", "slug", "color")


class SessionListSerializer(serializers.ModelSerializer):
    """Member & staff list serializer with engagement counts, state and latest comment."""

    batch_number = serializers.IntegerField(source="batch.number", read_only=True)
    batch_name = serializers.CharField(source="batch.name", read_only=True)
    state = serializers.CharField(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    like_count = serializers.IntegerField(default=0, read_only=True)
    comment_count = serializers.IntegerField(default=0, read_only=True)
    bookmark_count = serializers.IntegerField(default=0, read_only=True)
    is_liked_by_me = serializers.BooleanField(default=False, read_only=True)
    is_bookmarked_by_me = serializers.BooleanField(default=False, read_only=True)
    latest_comment = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = (
            "id",
            "slug",
            "title",
            "batch",
            "batch_number",
            "batch_name",
            "session_number",
            "date",
            "status",
            "published_at",
            "scheduled_at",
            "is_featured",
            "cover_image_url",
            "visibility",
            "state",
            "tags",
            "like_count",
            "comment_count",
            "bookmark_count",
            "is_liked_by_me",
            "is_bookmarked_by_me",
            "latest_comment",
        )
        read_only_fields = fields

    def get_latest_comment(self, obj):
        # Retrieved via prefetch or related comment
        comment = getattr(obj, "prefetched_latest_comment", None)
        if comment is None and hasattr(obj, "comments"):
            comment = obj.comments.filter(is_deleted=False, is_hidden=False).order_by("-created_at").first()

        if not comment:
            return None

        content = comment.content or ""
        plain_excerpt = content.replace("\n", " ").strip()[:140]
        return {
            "author_first_name": comment.author.first_name if comment.author else "বেনামী",
            "excerpt": plain_excerpt,
            "created_at": comment.created_at,
        }


class SessionDetailSerializer(SessionListSerializer):
    """Detailed post serializer including full content, navigation links and author details."""

    author_name = serializers.CharField(source="author.full_name", read_only=True)
    author_photo_url = serializers.URLField(source="author.profile_picture_url", read_only=True)
    attachments = SessionAttachmentSerializer(many=True, read_only=True)
    prev_session = serializers.SerializerMethodField()
    next_session = serializers.SerializerMethodField()

    class Meta(SessionListSerializer.Meta):
        fields = SessionListSerializer.Meta.fields + (
            "content",
            "author_name",
            "author_photo_url",
            "seo_title",
            "seo_description",
            "og_image_url",
            "attachments",
            "prev_session",
            "next_session",
        )

    def get_prev_session(self, obj):
        prev = (
            Session.objects.filter(
                batch_id=obj.batch_id,
                session_number__lt=obj.session_number,
                status=Session.Status.PUBLISHED,
                is_deleted=False,
            )
            .order_by("-session_number")
            .only("slug", "title", "session_number")
            .first()
        )
        if not prev:
            return None
        return {
            "slug": prev.slug,
            "title": prev.title,
            "session_number": prev.session_number,
        }

    def get_next_session(self, obj):
        nxt = (
            Session.objects.filter(
                batch_id=obj.batch_id,
                session_number__gt=obj.session_number,
                status=Session.Status.PUBLISHED,
                is_deleted=False,
            )
            .order_by("session_number")
            .only("slug", "title", "session_number")
            .first()
        )
        if not nxt:
            return None
        return {
            "slug": nxt.slug,
            "title": nxt.title,
            "session_number": nxt.session_number,
        }


class SessionCreateUpdateSerializer(serializers.ModelSerializer):
    """Staff serializer for creating and updating sessions."""

    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, required=False
    )

    class Meta:
        model = Session
        fields = (
            "id",
            "slug",
            "title",
            "content",
            "batch",
            "session_number",
            "date",
            "status",
            "scheduled_at",
            "published_at",
            "is_featured",
            "cover_image_url",
            "visibility",
            "is_indexable",
            "seo_title",
            "seo_description",
            "og_image_url",
            "tag_ids",
        )
        read_only_fields = ("id", "slug", "published_at")

    def validate(self, attrs):
        status_val = attrs.get("status", getattr(self.instance, "status", None))
        scheduled_at = attrs.get("scheduled_at", getattr(self.instance, "scheduled_at", None))

        if status_val == Session.Status.SCHEDULED and not scheduled_at:
            raise serializers.ValidationError({"scheduled_at": "নির্ধারিত (Scheduled) সেশনের জন্য scheduled_at তারিখ প্রদান আবশ্যক।"})

        return attrs

    def create(self, validated_data):
        tag_ids = validated_data.pop("tag_ids", [])
        author = self.context["request"].user
        session = Session.objects.create(author=author, **validated_data)
        if tag_ids:
            SessionTag.objects.bulk_create(
                [SessionTag(session=session, tag=tag) for tag in tag_ids]
            )
        return session

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop("tag_ids", None)
        session = super().update(instance, validated_data)
        if tag_ids is not None:
            instance.session_tags.all().delete()
            SessionTag.objects.bulk_create(
                [SessionTag(session=instance, tag=tag) for tag in tag_ids]
            )
        return session
