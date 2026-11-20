import pytest
from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User, VerificationRequest, MemberRoster
from apps.community.models import Batch
from apps.notifications.models import Notification, NotificationPreference
from apps.audit.models import AuditLog


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def batch(db):
    return Batch.objects.create(number=1, name="ব্যাচ ১", start_date="2024-01-01")


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        email="admin@example.com",
        password="AdminPassword123!",
        first_name="অ্যাডমিন",
    )


@pytest.fixture
def moderator_user(db):
    return User.objects.create_user(
        email="moderator@example.com",
        password="ModPassword123!",
        role=User.Role.MODERATOR,
        is_staff=True,
        email_verified=True,
        verification_status=User.VerificationStatus.VERIFIED,
    )


@pytest.fixture
def applicant_user(db, batch):
    return User.objects.create_user(
        email="applicant@example.com",
        password="ValidPassword123!",
        first_name="আবেদনকারী",
        batch=batch,
        registration_no="REG-777",
        email_verified=True,
        verification_status=User.VerificationStatus.UNVERIFIED,
    )


@pytest.mark.django_db
class TestVerificationApplicationFlow:

    def test_apply_blocked_without_batch_or_registration_no(self, api_client, db):
        user = User.objects.create_user(
            email="nobatch@example.com",
            password="Password123!",
            email_verified=True,
        )
        api_client.force_authenticate(user=user)
        url = reverse("me-verification-apply")
        resp = api_client.post(url)
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert "ব্যাচ" in resp.data["detail"]

    def test_apply_blocked_without_verified_email(self, api_client, applicant_user):
        applicant_user.email_verified = False
        applicant_user.save()

        api_client.force_authenticate(user=applicant_user)
        url = reverse("me-verification-apply")
        resp = api_client.post(url)
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert "ইমেইল ভেরিফাই করা ছাড়া" in resp.data["detail"]

    def test_apply_success_notifies_staff_and_creates_audit(
        self, api_client, applicant_user, admin_user, moderator_user
    ):
        api_client.force_authenticate(user=applicant_user)
        url = reverse("me-verification-apply")
        resp = api_client.post(url)
        assert resp.status_code == status.HTTP_201_CREATED

        applicant_user.refresh_from_db()
        assert applicant_user.verification_status == User.VerificationStatus.PENDING

        # Verify request snapshot created
        vreq = VerificationRequest.objects.get(user=applicant_user)
        assert vreq.status == VerificationRequest.Status.PENDING
        assert vreq.batch == applicant_user.batch
        assert vreq.registration_no == "REG-777"

        # Verify audit log entry
        audit = AuditLog.objects.filter(action="verification.apply", target_id=str(vreq.id)).first()
        assert audit is not None
        assert audit.actor == applicant_user

        # Verify staff notifications created
        staff_notifs = Notification.objects.filter(type=Notification.Type.VERIFICATION_REQUEST)
        recipients = [n.recipient for n in staff_notifs]
        assert admin_user in recipients
        assert moderator_user in recipients

    def test_duplicate_pending_request_blocked(self, api_client, applicant_user, admin_user):
        api_client.force_authenticate(user=applicant_user)
        url = reverse("me-verification-apply")
        # First application
        api_client.post(url)
        # Second application must be blocked
        resp2 = api_client.post(url)
        assert resp2.status_code == status.HTTP_400_BAD_REQUEST

    def test_fields_locked_while_pending_and_verified(self, api_client, applicant_user, batch):
        api_client.force_authenticate(user=applicant_user)
        # Apply first
        api_client.post(reverse("me-verification-apply"))

        # While pending, editing registration_no or batch is blocked
        patch_resp = api_client.patch(reverse("account-me"), {"registration_no": "NEW-REG"})
        assert patch_resp.status_code == status.HTTP_400_BAD_REQUEST

        # Approve user
        applicant_user.verification_status = User.VerificationStatus.VERIFIED
        applicant_user.save()

        # While verified, editing registration_no or batch is also blocked
        patch_resp2 = api_client.patch(reverse("account-me"), {"registration_no": "NEW-REG"})
        assert patch_resp2.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestStaffVerificationActions:

    def test_staff_approve_flow(self, api_client, applicant_user, moderator_user, batch):
        api_client.force_authenticate(user=applicant_user)
        api_client.post(reverse("me-verification-apply"))
        vreq = VerificationRequest.objects.get(user=applicant_user)

        # Moderator approves
        api_client.force_authenticate(user=moderator_user)
        approve_url = reverse("staff-verification-approve", kwargs={"pk": vreq.id})
        resp = api_client.post(approve_url, {"reviewer_note": "সবকিছু যাচাই করে সঠিক পাওয়া গেছে।"})
        assert resp.status_code == status.HTTP_200_OK

        vreq.refresh_from_db()
        assert vreq.status == VerificationRequest.Status.APPROVED
        assert vreq.reviewed_by == moderator_user

        applicant_user.refresh_from_db()
        assert applicant_user.verification_status == User.VerificationStatus.VERIFIED
        assert applicant_user.is_verified is True
        assert applicant_user.verified_by == moderator_user

        # User receives verification_approved notification
        user_notif = Notification.objects.filter(
            recipient=applicant_user, type=Notification.Type.VERIFICATION_APPROVED
        ).first()
        assert user_notif is not None

    def test_staff_reject_flow_and_reapply(self, api_client, applicant_user, moderator_user):
        api_client.force_authenticate(user=applicant_user)
        api_client.post(reverse("me-verification-apply"))
        vreq = VerificationRequest.objects.get(user=applicant_user)

        # Moderator rejects with reason
        api_client.force_authenticate(user=moderator_user)
        reject_url = reverse("staff-verification-reject", kwargs={"pk": vreq.id})
        resp = api_client.post(reject_url, {"reason": "রেজিস্ট্রেশন নম্বর রোস্টারের সাথে মেলেনি।"})
        assert resp.status_code == status.HTTP_200_OK

        applicant_user.refresh_from_db()
        assert applicant_user.verification_status == User.VerificationStatus.REJECTED
        assert applicant_user.is_verified is False

        # User can now edit details in profile and reapply
        api_client.force_authenticate(user=applicant_user)
        api_client.patch(reverse("account-me"), {"registration_no": "CORRECTED-888"})
        applicant_user.refresh_from_db()
        assert applicant_user.registration_no == "CORRECTED-888"

        # Reapply succeeds
        reapply_resp = api_client.post(reverse("me-verification-apply"))
        assert reapply_resp.status_code == status.HTTP_201_CREATED
        applicant_user.refresh_from_db()
        assert applicant_user.verification_status == User.VerificationStatus.PENDING

    def test_concurrent_review_returns_409(self, api_client, applicant_user, moderator_user, admin_user):
        api_client.force_authenticate(user=applicant_user)
        api_client.post(reverse("me-verification-apply"))
        vreq = VerificationRequest.objects.get(user=applicant_user)

        # First staff approves
        api_client.force_authenticate(user=moderator_user)
        api_client.post(reverse("staff-verification-approve", kwargs={"pk": vreq.id}))

        # Second staff attempts to reject -> 409 Conflict
        api_client.force_authenticate(user=admin_user)
        resp_conflict = api_client.post(
            reverse("staff-verification-reject", kwargs={"pk": vreq.id}),
            {"reason": "দেরিতে পরীক্ষা করা হয়েছে"},
        )
        assert resp_conflict.status_code == status.HTTP_409_CONFLICT


@pytest.mark.django_db
class TestAdminVerificationOverridesAndNotifications:

    def test_admin_can_edit_verified_user_and_revoke(self, api_client, applicant_user, admin_user, batch):
        applicant_user.verification_status = User.VerificationStatus.VERIFIED
        applicant_user.save()

        api_client.force_authenticate(user=admin_user)
        url = reverse("admin-user-verification-edit", kwargs={"user_id": applicant_user.id})

        # Edit registration_no
        patch_resp = api_client.patch(url, {"registration_no": "ADMIN-OVERRIDE"})
        assert patch_resp.status_code == status.HTTP_200_OK
        applicant_user.refresh_from_db()
        assert applicant_user.registration_no == "ADMIN-OVERRIDE"

        # Revoke verification
        revoke_resp = api_client.post(url)
        assert revoke_resp.status_code == status.HTTP_200_OK
        applicant_user.refresh_from_db()
        assert applicant_user.verification_status == User.VerificationStatus.UNVERIFIED
        assert applicant_user.is_verified is False

    def test_notifications_list_and_mark_read(self, api_client, applicant_user):
        Notification.objects.create(
            recipient=applicant_user,
            type=Notification.Type.ADMIN_MESSAGE,
            title="স্বাগতম বার্তা",
            message="আমাদের কমিউনিটিতে স্বাগতম।",
        )
        Notification.objects.create(
            recipient=applicant_user,
            type=Notification.Type.ANNOUNCEMENT,
            title="নতুন নোটিশ",
            message="আগামীকাল ক্লাস বন্ধ থাকবে।",
        )

        api_client.force_authenticate(user=applicant_user)
        list_url = reverse("notification-list")
        resp = api_client.get(list_url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["unread_count"] == 2

        # Mark all as read
        read_all_url = reverse("notification-mark-all-read")
        read_all_resp = api_client.post(read_all_url)
        assert read_all_resp.status_code == status.HTTP_200_OK

        resp2 = api_client.get(list_url)
        assert resp2.data["unread_count"] == 0

    def test_notification_preferences_get_and_patch(self, api_client, applicant_user):
        api_client.force_authenticate(user=applicant_user)
        pref_url = reverse("notification-preferences")

        get_resp = api_client.get(pref_url)
        assert get_resp.status_code == status.HTTP_200_OK
        assert get_resp.data["email_new_session"] is True

        patch_resp = api_client.patch(pref_url, {"email_new_session": False})
        assert patch_resp.status_code == status.HTTP_200_OK
        assert patch_resp.data["email_new_session"] is False
