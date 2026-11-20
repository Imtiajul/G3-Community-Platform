from rest_framework import serializers


class UploadPresignRequestSerializer(serializers.Serializer):
    filename = serializers.CharField(max_length=255)
    content_type = serializers.CharField(max_length=100)
    file_size = serializers.IntegerField(min_value=1)


class AvatarUpdateSerializer(serializers.Serializer):
    profile_picture_url = serializers.URLField(max_length=500)
