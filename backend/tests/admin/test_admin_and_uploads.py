import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.audit.models import AuditLog
from apps.community.models import Batch, Session
from apps.interactions.models import Comment, CommentReport, SessionNote, PersonalNote, Like, Bookmark
from apps.notifications.models import Notification


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
def moderator_user(db, batch):
    return User.objects.create_user(
        email="moderator@example.com",
        password="ModPassword123!",
        role=User.Role.MODERATOR,
        first_name="মডারেটর",
        is_staff=True,
        batch=batch,
        email_verified=True,
    )


@pytest.fixture
def member_user(db, batch):
    return User.objects.create_user(
        email="member@example.com",
        password="MemberPassword123!",
        role=User.Role.MEMBER,
        first_name="সদস্য",
        batch=batch,
        email_verified=True,
        verification_status=User.VerificationStatus.VERIFIED,
        registration_no="REG-1001",
    )


@pytest.fixture
def session_item(db, batch, admin_user):
    return Session.objects.create(
        batch=batch,
        session_number=1,
        title="প্রথম সেশন",
        content="সেশনের বিস্তারিত কন্টেন্ট।",
        author=admin_user,
        status=Session.Status.PUBLISHED,
        visibility=Session.Visibility.PUBLIC,
    )


@pytest.mark.django_db
class TestUploadsAndAvatar:
    def test_presigned_upload_valid(self, api_client, member_user):
        api_client.force_authenticate(user=member_user)
        url = reverse("uploads-presigned")
        payload = {
            "filename": "my_avatar.png",
            "content_type": "image/png",
            "file_size": 1024 * 500,  # 500 KB
        }
        response = api_client.post(url, payload, format="json")
        assert response.status_code == status.HTTP_200_OK
        data = response.data
        assert "upload_url" in data
        assert "file_url" in data
        assert "key" in data

    def test_presigned_upload_invalid_type_or_too_large(self, api_client, member_user):
        api_client.force_authenticate(user=member_user)
        url = reverse("uploads-presigned")

        # Invalid mime type
        res_bad_type = api_client.post(
            url,
            {"filename": "document.pdf", "content_type": "application/pdf", "file_size": 1024},
            format="json",
        )
        assert res_bad_type.status_code == status.HTTP_400_BAD_REQUEST

        # File too large (> 5 MB)
        res_too_large = api_client.post(
            url,
            {"filename": "huge.jpg", "content_type": "image/jpeg", "file_size": 6 * 1024 * 1024},
            format="json",
        )
        assert res_too_large.status_code == status.HTTP_400_BAD_REQUEST

    def test_update_avatar(self, api_client, member_user):
        api_client.force_authenticate(user=member_user)
        url = reverse("account-me-avatar")
        avatar_url = "https://cdn.example.com/media/avatars/user123.jpg"

        response = api_client.post(url, {"profile_picture_url": avatar_url}, format="json")
        assert response.status_code == status.HTTP_200_OK

        member_user.refresh_from_db()
        assert member_user.profile_picture_url == avatar_url


@pytest.mark.django_db
class TestAdminUserManagement:
    def test_admin_user_list_permissions(self, api_client, member_user, moderator_user, admin_user):
        url = reverse("admin-user-list")

        # Anonymous -> 401
        res_anon = api_client.get(url)
        assert res_anon.status_code == status.HTTP_401_UNAUTHORIZED

        # Member -> 403
        api_client.force_authenticate(user=member_user)
        res_mem = api_client.get(url)
        assert res_mem.status_code == status.HTTP_403_FORBIDDEN

        # Moderator -> 403 (Admin only)
        api_client.force_authenticate(user=moderator_user)
        res_mod = api_client.get(url)
        assert res_mod.status_code == status.HTTP_403_FORBIDDEN

        # Admin -> 200
        api_client.force_authenticate(user=admin_user)
        res_adm = api_client.get(url)
        assert res_adm.status_code == status.HTTP_200_OK
        assert len(res_adm.data["results"]) >= 3

    def test_admin_user_list_with_annotations(
        self, api_client, admin_user, member_user, session_item
    ):
        # Add engagement for member_user
        Like.objects.create(user=member_user, session=session_item)
        Bookmark.objects.create(user=member_user, session=session_item)
        Comment.objects.create(author=member_user, session=session_item, content="দারুণ!")
        SessionNote.objects.create(user=member_user, session=session_item, content="নোট ১")
        PersonalNote.objects.create(user=member_user, content="নোট ২")

        api_client.force_authenticate(user=admin_user)
        url = reverse("admin-user-list") + f"?search={member_user.email}"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        results = response.data["results"]
        assert len(results) == 1
        item = results[0]
        assert item["email"] == member_user.email
        assert item["likes_given_count"] == 1
        assert item["bookmarks_count"] == 1
        assert item["comments_count"] == 1
        assert item["posts_commented_count"] == 1
        assert item["notes_count"] == 2

    def test_admin_user_update_and_deactivate(self, api_client, admin_user, member_user):
        api_client.force_authenticate(user=admin_user)
        detail_url = reverse("admin-user-detail", kwargs={"pk": member_user.id})

        # Update
        patch_res = api_client.patch(detail_url, {"registration_no": "UPDATED-999"}, format="json")
        assert patch_res.status_code == status.HTTP_200_OK
        member_user.refresh_from_db()
        assert member_user.registration_no == "UPDATED-999"

        # Soft delete
        del_res = api_client.delete(detail_url)
        assert del_res.status_code == status.HTTP_200_OK
        member_user.refresh_from_db()
        assert member_user.is_active is False

    def test_assign_and_revoke_moderator(self, api_client, admin_user, member_user):
        api_client.force_authenticate(user=admin_user)

        assign_url = reverse("admin-user-assign-moderator", kwargs={"pk": member_user.id})
        res_assign = api_client.post(assign_url)
        assert res_assign.status_code == status.HTTP_200_OK

        member_user.refresh_from_db()
        assert member_user.role == User.Role.MODERATOR
        assert member_user.is_staff is True

        revoke_url = reverse("admin-user-revoke-moderator", kwargs={"pk": member_user.id})
        res_revoke = api_client.post(revoke_url)
        assert res_revoke.status_code == status.HTTP_200_OK

        member_user.refresh_from_db()
        assert member_user.role == User.Role.MEMBER
        assert member_user.is_staff is False


@pytest.mark.django_db
class TestAdminAuditBroadcastAndAnalytics:
    def test_audit_logs_list(self, api_client, admin_user, member_user):
        api_client.force_authenticate(user=admin_user)
        # Trigger an action that writes audit log
        assign_url = reverse("admin-user-assign-moderator", kwargs={"pk": member_user.id})
        api_client.post(assign_url)

        audit_url = reverse("admin-audit-log-list")
        res = api_client.get(audit_url)
        assert res.status_code == status.HTTP_200_OK
        assert len(res.data["results"]) >= 1

    def test_broadcast_notifications(self, api_client, admin_user, member_user):
        api_client.force_authenticate(user=admin_user)
        url = reverse("admin-notify-broadcast")
        payload = {
            "recipient_type": "all",
            "title": "গুরুত্বপূর্ণ ঘোষণা",
            "message": "আজকের সেশনটি সবাইকে দেখার অনুরোধ করা হচ্ছে।",
        }
        res = api_client.post(url, payload, format="json")
        assert res.status_code == status.HTTP_200_OK
        assert res.data["sent_count"] >= 2
        assert Notification.objects.filter(recipient=member_user).exists()

    def test_platform_analytics(self, api_client, admin_user, session_item, member_user):
        api_client.force_authenticate(user=admin_user)
        url = reverse("admin-platform-analytics")
        res = api_client.get(url)
        assert res.status_code == status.HTTP_200_OK
        data = res.data

        assert "period" in data
        assert "current_totals" in data
        assert "previous_totals" in data
        assert "deltas" in data
        assert "users_by_status" in data
        assert "sessions_by_status" in data
        assert "batch_stats" in data
        assert "pending_verifications_count" in data


@pytest.mark.django_db
class TestCommentModerationAndReports:
    def test_staff_comment_report_and_resolution(
        self, api_client, moderator_user, member_user, session_item
    ):
        comment = Comment.objects.create(
            author=member_user,
            session=session_item,
            content="আপত্তিকর বিষয়বস্তু",
        )
        report = CommentReport.objects.create(
            comment=comment,
            reporter=member_user,
            reason="স্প্যাম বা আপত্তিকর ভাষা",
        )

        api_client.force_authenticate(user=moderator_user)
        list_url = reverse("staff-comment-reports")
        res_list = api_client.get(list_url)
        assert res_list.status_code == status.HTTP_200_OK
        assert len(res_list.data["results"]) >= 1

        resolve_url = reverse("staff-comment-report-resolve", kwargs={"pk": report.id})
        resolve_res = api_client.post(
            resolve_url,
            {"status": "resolved", "hide_comment": True},
            format="json",
        )
        assert resolve_res.status_code == status.HTTP_200_OK

        report.refresh_from_db()
        comment.refresh_from_db()
        assert report.status == CommentReport.Status.RESOLVED
        assert report.resolved_by == moderator_user
        assert comment.is_hidden is True

    def test_admin_comment_soft_delete(self, api_client, admin_user, member_user, session_item):
        comment = Comment.objects.create(
            author=member_user,
            session=session_item,
            content="মুছে ফেলার জন্য মন্তব্য",
        )
        api_client.force_authenticate(user=admin_user)
        detail_url = reverse("admin-comment-detail", kwargs={"pk": comment.id})

        res_del = api_client.delete(detail_url)
        assert res_del.status_code == status.HTTP_200_OK

        comment.refresh_from_db()
        assert comment.is_deleted is True
