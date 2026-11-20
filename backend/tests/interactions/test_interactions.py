import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.community.models import Batch, Session
from apps.interactions.models import Like, Bookmark, Comment, CommentReport, SessionNote, PersonalNote


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
def verified_member(db, batch):
    return User.objects.create_user(
        email="verified@example.com",
        password="Password123!",
        role=User.Role.MEMBER,
        first_name="ভেরিফাইড",
        batch=batch,
        email_verified=True,
        verification_status=User.VerificationStatus.VERIFIED,
    )


@pytest.fixture
def unverified_member(db, batch):
    return User.objects.create_user(
        email="unverified@example.com",
        password="Password123!",
        role=User.Role.MEMBER,
        first_name="অযাচাইকৃত",
        batch=batch,
        email_verified=True,
        verification_status=User.VerificationStatus.UNVERIFIED,
    )


@pytest.fixture
def session_obj(db, batch, admin_user):
    return Session.objects.create(
        title="ইন্টারেকশন টেস্ট সেশন",
        content="সেশনের মূল বিষয়বস্তু",
        batch=batch,
        session_number=1,
        date=timezone.localdate(),
        status=Session.Status.PUBLISHED,
        published_at=timezone.now(),
        author=admin_user,
    )


@pytest.mark.django_db
class TestInteractionsPermissions:

    def test_anonymous_interaction_returns_401(self, api_client, session_obj):
        like_url = reverse("session-like", kwargs={"slug": session_obj.slug})
        assert api_client.post(like_url).status_code == status.HTTP_401_UNAUTHORIZED

        bm_url = reverse("session-bookmark", kwargs={"slug": session_obj.slug})
        assert api_client.post(bm_url).status_code == status.HTTP_401_UNAUTHORIZED

        cmt_url = reverse("session-comments", kwargs={"slug": session_obj.slug})
        assert api_client.post(cmt_url, {"content": "x"}).status_code == status.HTTP_401_UNAUTHORIZED

    def test_unverified_member_blocked_when_require_verified(self, api_client, unverified_member, session_obj):
        api_client.force_authenticate(user=unverified_member)

        like_url = reverse("session-like", kwargs={"slug": session_obj.slug})
        resp = api_client.post(like_url)
        assert resp.status_code == status.HTTP_403_FORBIDDEN
        assert "কমিউনিটি ভেরিফিকেশন ছাড়া" in resp.data["detail"]

        cmt_url = reverse("session-comments", kwargs={"slug": session_obj.slug})
        resp_cmt = api_client.post(cmt_url, {"content": "টেস্ট মন্তব্য"})
        assert resp_cmt.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestLikesAndBookmarks:

    def test_verified_member_like_toggle(self, api_client, verified_member, session_obj):
        api_client.force_authenticate(user=verified_member)
        url = reverse("session-like", kwargs={"slug": session_obj.slug})

        # Like
        resp = api_client.post(url)
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data["liked"] is True
        assert resp.data["total_likes"] == 1
        assert Like.objects.filter(user=verified_member, session=session_obj).exists()

        # Idempotent like returns 200 OK
        resp_again = api_client.post(url)
        assert resp_again.status_code == status.HTTP_200_OK

        # Unlike
        del_resp = api_client.delete(url)
        assert del_resp.status_code == status.HTTP_200_OK
        assert del_resp.data["liked"] is False
        assert del_resp.data["total_likes"] == 0
        assert not Like.objects.filter(user=verified_member, session=session_obj).exists()

    def test_bookmark_and_dashboard_list(self, api_client, verified_member, session_obj):
        api_client.force_authenticate(user=verified_member)
        url = reverse("session-bookmark", kwargs={"slug": session_obj.slug})

        # Bookmark session
        resp = api_client.post(url)
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data["bookmarked"] is True

        # Check me/bookmarks/
        bm_list_url = reverse("me-bookmarks")
        list_resp = api_client.get(bm_list_url)
        assert list_resp.status_code == status.HTTP_200_OK
        assert len(list_resp.data["results"]) == 1
        assert list_resp.data["results"][0]["slug"] == session_obj.slug

        # Remove bookmark
        del_resp = api_client.delete(url)
        assert del_resp.status_code == status.HTTP_200_OK
        assert del_resp.data["bookmarked"] is False


@pytest.mark.django_db
class TestCommentsAndModeration:

    def test_comment_create_and_soft_delete(self, api_client, verified_member, session_obj):
        api_client.force_authenticate(user=verified_member)
        url = reverse("session-comments", kwargs={"slug": session_obj.slug})

        # Create comment
        resp = api_client.post(url, {"content": "অসাধারণ একটি শিক্ষণীয় সেশন!"}, format="json")
        assert resp.status_code == status.HTTP_201_CREATED
        comment_id = resp.data["id"]

        comment = Comment.objects.get(id=comment_id)
        assert comment.content == "অসাধারণ একটি শিক্ষণীয় সেশন!"
        assert comment.author == verified_member

        # Edit comment
        detail_url = reverse("comment-detail", kwargs={"pk": comment_id})
        patch_resp = api_client.patch(detail_url, {"content": "সম্পাদিত মন্তব্য"}, format="json")
        assert patch_resp.status_code == status.HTTP_200_OK
        comment.refresh_from_db()
        assert comment.content == "সম্পাদিত মন্তব্য"
        assert comment.edited_at is not None

        # Soft delete comment
        del_resp = api_client.delete(detail_url)
        assert del_resp.status_code == status.HTTP_200_OK
        comment.refresh_from_db()
        assert comment.is_deleted is True
        assert comment.deleted_at is not None

    def test_comment_report(self, api_client, verified_member, session_obj, admin_user):
        comment = Comment.objects.create(session=session_obj, author=admin_user, content="মূল মন্তব্য")

        api_client.force_authenticate(user=verified_member)
        url = reverse("comment-report", kwargs={"pk": comment.id})
        resp = api_client.post(url, {"reason": "স্প্যাম বা অবাঞ্ছিত বিষয়বস্তু"}, format="json")
        assert resp.status_code == status.HTTP_201_CREATED

        report = CommentReport.objects.get(id=resp.data["id"])
        assert report.reporter == verified_member
        assert report.status == CommentReport.Status.PENDING


@pytest.mark.django_db
class TestNotesAndActivityDashboard:

    def test_private_session_note(self, api_client, verified_member, session_obj):
        api_client.force_authenticate(user=verified_member)
        url = reverse("session-note", kwargs={"slug": session_obj.slug})

        # Initial get (no note yet)
        get_empty = api_client.get(url)
        assert get_empty.status_code == status.HTTP_200_OK
        assert get_empty.data["exists"] is False

        # Upsert note
        put_resp = api_client.put(url, {"content": "আমার ব্যক্তিগত গুরুত্বপূর্ণ নোট"}, format="json")
        assert put_resp.status_code == status.HTTP_201_CREATED
        assert put_resp.data["content"] == "আমার ব্যক্তিগত গুরুত্বপূর্ণ নোট"

        # Read back note
        get_resp = api_client.get(url)
        assert get_resp.status_code == status.HTTP_200_OK
        assert get_resp.data["content"] == "আমার ব্যক্তিগত গুরুত্বপূর্ণ নোট"

        # Delete note
        del_resp = api_client.delete(url)
        assert del_resp.status_code == status.HTTP_200_OK

    def test_personal_notes_crud(self, api_client, verified_member):
        api_client.force_authenticate(user=verified_member)
        url = reverse("personal-note-list")

        # Create
        post_resp = api_client.post(url, {"content": "আমার লক্ষ্য ও পরিকল্পনা"}, format="json")
        assert post_resp.status_code == status.HTTP_201_CREATED
        note_id = post_resp.data["id"]

        # List
        list_resp = api_client.get(url)
        assert list_resp.status_code == status.HTTP_200_OK
        assert len(list_resp.data["results"]) == 1

        # Delete
        detail_url = reverse("personal-note-detail", kwargs={"pk": note_id})
        del_resp = api_client.delete(detail_url)
        assert del_resp.status_code == status.HTTP_204_NO_CONTENT

    def test_user_activity_dashboard(self, api_client, verified_member, session_obj):
        # Create 1 like, 1 bookmark, 1 comment, 1 personal note
        Like.objects.create(user=verified_member, session=session_obj)
        Bookmark.objects.create(user=verified_member, session=session_obj)
        Comment.objects.create(author=verified_member, session=session_obj, content="মন্তব্য")
        PersonalNote.objects.create(user=verified_member, content="নোট")

        api_client.force_authenticate(user=verified_member)
        url = reverse("me-activity")
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["likes_count"] == 1
        assert resp.data["bookmarks_count"] == 1
        assert resp.data["comments_count"] == 1
        assert resp.data["notes_count"] == 1
        assert resp.data["sessions_commented_count"] == 1
