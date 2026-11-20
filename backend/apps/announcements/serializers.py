from rest_framework import serializers
from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)

    class Meta:
        model = Announcement
        fields = (
            "id",
            "title",
            "content",
            "link",
            "image_url",
            "is_focused",
            "is_active",
            "priority",
            "starts_at",
            "ends_at",
            "created_by_name",
            "created_at",
        )
        read_only_fields = ("id", "created_by_name", "created_at")

    def validate(self, attrs):
        # Trigger model clean to catch limit validations in DRF serializer
        instance = Announcement(**attrs)
        if self.instance:
            instance.pk = self.instance.pk
        try:
            instance.clean()
        except serializers.ValidationError as e:
            raise e
        except Exception as e:
            raise serializers.ValidationError(str(e))
        return attrs


class AnnouncementPublicSerializer(serializers.ModelSerializer):
    """Public representation for landing page."""

    class Meta:
        model = Announcement
        fields = ("id", "title", "content", "link", "image_url", "is_focused", "priority")
        read_only_fields = fields


class AnnouncementReorderSerializer(serializers.Serializer):
    order = serializers.ListField(child=serializers.UUIDField(), allow_empty=False)
