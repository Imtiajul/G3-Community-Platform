from rest_framework import serializers
from .models import User, VerificationRequest, MemberRoster
from apps.community.models import Batch


class UserVerificationSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "full_name")


class VerificationRequestSerializer(serializers.ModelSerializer):
    user = UserVerificationSummarySerializer(read_only=True)
    batch_number = serializers.IntegerField(source="batch.number", read_only=True)
    batch_name = serializers.CharField(source="batch.name", read_only=True)
    reviewed_by_email = serializers.EmailField(source="reviewed_by.email", read_only=True)
    roster_match = serializers.SerializerMethodField()

    class Meta:
        model = VerificationRequest
        fields = (
            "id",
            "user",
            "batch",
            "batch_number",
            "batch_name",
            "registration_no",
            "status",
            "submitted_at",
            "reviewed_by_email",
            "reviewed_at",
            "rejection_reason",
            "reviewer_note",
            "roster_match",
        )
        read_only_fields = fields

    def get_roster_match(self, obj) -> bool:
        return MemberRoster.objects.filter(
            batch=obj.batch,
            registration_no=obj.registration_no,
        ).exists()


class VerificationStatusResponseSerializer(serializers.Serializer):
    verification_status = serializers.CharField()
    is_verified = serializers.BooleanField()
    missing_required_fields = serializers.ListField(child=serializers.CharField())
    rejection_reason = serializers.CharField(allow_null=True)
    latest_request = VerificationRequestSerializer(allow_null=True)


class ApproveVerificationSerializer(serializers.Serializer):
    reviewer_note = serializers.CharField(required=False, allow_blank=True, default="")


class RejectVerificationSerializer(serializers.Serializer):
    reason = serializers.CharField(required=True)
    reviewer_note = serializers.CharField(required=False, allow_blank=True, default="")


class AdminEditVerifiedUserSerializer(serializers.Serializer):
    batch = serializers.PrimaryKeyRelatedField(queryset=Batch.objects.all(), required=False)
    registration_no = serializers.CharField(max_length=50, required=False)
