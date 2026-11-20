import re
from django.conf import settings
from django.utils.html import strip_tags
from rest_framework import serializers
from .models import Session, Tag


def generate_bangla_excerpt(content: str, max_chars: int = 160) -> str:
    """
    Strips markdown and HTML, cleans whitespace, and safely truncates at
    word boundary for Bangla text.
    """
    if not content:
        return ""
    # Strip basic markdown headers, links, bold, italics
    cleaned = re.sub(r"[#*_~`\[\]\(\)>]", " ", content)
    cleaned = strip_tags(cleaned)
    cleaned = " ".join(cleaned.split())

    if len(cleaned) <= max_chars:
        return cleaned

    truncated = cleaned[:max_chars]
    # Cut at last space to avoid cutting a Bangla word in half
    last_space = truncated.rfind(" ")
    if last_space != -1 and last_space > 80:
        truncated = truncated[:last_space]
    return f"{truncated}..."


class PublicCommentSerializer(serializers.Serializer):
    """Public comment serialization - strictly exposes ONLY first name and avatar."""

    id = serializers.CharField(read_only=True)
    author_first_name = serializers.SerializerMethodField()
    author_photo_url = serializers.SerializerMethodField()
    content = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    def get_author_first_name(self, obj):
        return obj.author.first_name if obj.author and obj.author.first_name else "সদস্য"

    def get_author_photo_url(self, obj):
        return obj.author.profile_picture_url if obj.author else None


class PublicSessionListSerializer(serializers.ModelSerializer):
    """Public list serializer - only returns public published sessions."""

    batch_number = serializers.IntegerField(source="batch.number", read_only=True)
    batch_name = serializers.CharField(source="batch.name", read_only=True)
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field="name")
    like_count = serializers.IntegerField(default=0, read_only=True)
    comment_count = serializers.IntegerField(default=0, read_only=True)
    bookmark_count = serializers.IntegerField(default=0, read_only=True)
    is_liked_by_me = serializers.BooleanField(default=False, read_only=True)
    is_bookmarked_by_me = serializers.BooleanField(default=False, read_only=True)

    class Meta:
        model = Session
        fields = (
            "id",
            "slug",
            "title",
            "batch_number",
            "batch_name",
            "session_number",
            "date",
            "published_at",
            "is_featured",
            "cover_image_url",
            "tags",
            "like_count",
            "comment_count",
            "bookmark_count",
            "is_liked_by_me",
            "is_bookmarked_by_me",
        )
        read_only_fields = fields


class PublicSessionDetailSerializer(serializers.ModelSerializer):
    """
    Public detail serializer:
    - If session is 'members' visibility and user is anonymous:
      returns minimal payload (title, batch, session_number, login_required=True, no content)
    - If public (or logged in): returns full content, tags, comments.
    """

    batch_number = serializers.IntegerField(source="batch.number", read_only=True)
    batch_name = serializers.CharField(source="batch.name", read_only=True)
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field="name")
    author_name = serializers.SerializerMethodField()
    author_photo_url = serializers.URLField(source="author.profile_picture_url", read_only=True)
    like_count = serializers.IntegerField(default=0, read_only=True)
    comment_count = serializers.IntegerField(default=0, read_only=True)
    bookmark_count = serializers.IntegerField(default=0, read_only=True)
    is_liked_by_me = serializers.BooleanField(default=False, read_only=True)
    is_bookmarked_by_me = serializers.BooleanField(default=False, read_only=True)
    login_required = serializers.BooleanField(default=False, read_only=True)
    comments = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = (
            "id",
            "slug",
            "title",
            "content",
            "batch_number",
            "batch_name",
            "session_number",
            "date",
            "published_at",
            "author_name",
            "author_photo_url",
            "is_featured",
            "cover_image_url",
            "visibility",
            "login_required",
            "tags",
            "like_count",
            "comment_count",
            "bookmark_count",
            "is_liked_by_me",
            "is_bookmarked_by_me",
            "comments",
        )
        read_only_fields = fields

    def get_author_name(self, obj):
        return obj.author.first_name if obj.author else "অ্যাডমিন"

    def get_comments(self, obj):
        # Exclude hidden and soft-deleted comments
        if hasattr(obj, "comments"):
            qs = obj.comments.filter(is_deleted=False, is_hidden=False).select_related("author").order_by("created_at")
            return PublicCommentSerializer(qs, many=True).data
        return []

    def to_representation(self, instance):
        request = self.context.get("request")
        is_authenticated = request and request.user and request.user.is_authenticated

        # Rule: Members-only sessions return a minimal payload for anonymous users
        if instance.visibility == Session.Visibility.MEMBERS and not is_authenticated:
            return {
                "id": str(instance.id),
                "slug": instance.slug,
                "title": instance.title,
                "batch_number": instance.batch.number,
                "batch_name": instance.batch.name,
                "session_number": instance.session_number,
                "date": str(instance.date),
                "cover_image_url": instance.cover_image_url,
                "visibility": "members",
                "login_required": True,
            }

        return super().to_representation(instance)


class SessionMetaSerializer(serializers.Serializer):
    """Metadata payload specifically designed for Next.js generateMetadata and JSON-LD."""

    title = serializers.CharField()
    description = serializers.CharField()
    canonical_url = serializers.URLField()
    og_title = serializers.CharField()
    og_description = serializers.CharField()
    og_image_url = serializers.URLField(allow_null=True)
    og_type = serializers.CharField(default="article")
    published_at = serializers.DateTimeField()
    modified_at = serializers.DateTimeField()
    author = serializers.CharField()
    batch = serializers.CharField()
    session_number = serializers.IntegerField()
    language = serializers.CharField(default="bn")
    robots = serializers.CharField()
    json_ld = serializers.JSONField()

    @classmethod
    def from_session(cls, session: Session) -> dict:
        base_url = getattr(settings, "SITE_BASE_URL", "http://localhost:3000").rstrip("/")
        canonical_url = f"{base_url}/sessions/{session.slug}"
        title = session.seo_title or session.title
        description = session.seo_description or generate_bangla_excerpt(session.content, 160)
        og_image = session.og_image_url or session.cover_image_url
        author_name = session.author.full_name if session.author else "নিজের বলার মতো একটা গল্প"
        published_iso = session.published_at.isoformat() if session.published_at else session.date.isoformat()

        # Schema.org Article JSON-LD
        json_ld = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": description,
            "image": [og_image] if og_image else [],
            "datePublished": published_iso,
            "dateModified": session.published_at.isoformat() if session.published_at else published_iso,
            "author": {
                "@type": "Person",
                "name": author_name,
            },
            "publisher": {
                "@type": "Organization",
                "name": "নিজের বলার মতো একটা গল্প",
                "url": base_url,
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": canonical_url,
            },
            "inLanguage": "bn",
        }

        return {
            "title": title,
            "description": description,
            "canonical_url": canonical_url,
            "og_title": session.seo_title or session.title,
            "og_description": description,
            "og_image_url": og_image,
            "og_type": "article",
            "published_at": session.published_at,
            "modified_at": session.published_at,
            "author": author_name,
            "batch": f"Batch {session.batch.number}",
            "session_number": session.session_number,
            "language": "bn",
            "robots": "index, follow" if session.is_indexable else "noindex, nofollow",
            "json_ld": json_ld,
        }


class SitemapItemSerializer(serializers.ModelSerializer):
    """Sitemap item for Next.js sitemap.xml."""

    loc = serializers.SerializerMethodField()
    lastmod = serializers.DateTimeField(source="published_at")
    changefreq = serializers.CharField(default="daily")
    priority = serializers.CharField(default="0.8")

    class Meta:
        model = Session
        fields = ("loc", "lastmod", "changefreq", "priority")

    def get_loc(self, obj):
        base_url = getattr(settings, "SITE_BASE_URL", "http://localhost:3000").rstrip("/")
        return f"{base_url}/sessions/{obj.slug}"
