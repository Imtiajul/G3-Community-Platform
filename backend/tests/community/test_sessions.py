import pytest
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.community.models import Batch, Tag, Session, SessionTag, SessionAttachment


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def batch(db):
    return Batch.objects.create(
        number=1,
        name="ব্যাচ ১ - ডিজিটাল উদ্যোক্তা",
        start_date="2024-01-01",
    )


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
        email="mod@example.com",
        password="ModPassword123!",
        role=User.Role.MODERATOR,
        is_staff=True,
        first_name="মডারেটর",
    )


@pytest.fixture
def member_user(db, batch):
    return User.objects.create_user(
        email="member@example.com",
        password="MemberPassword123!",
        role=User.Role.MEMBER,
        first_name="সদস্য",
        batch=batch,
        verification_status=User.VerificationStatus.VERIFIED,
    )


@pytest.fixture
def published_session(db, batch, admin_user):
    return Session.objects.create(
        title="প্রথম দিনের সেশন - নিজের বলার মতো একটা গল্প",
        content="## শুভ সকাল\nআজকের সেশনে সবাইকে স্বাগতম।",
        batch=batch,
        session_number=1,
        date=timezone.localdate(),
        status=Session.Status.PUBLISHED,
        published_at=timezone.now(),
        author=admin_user,
    )


@pytest.mark.django_db
class TestSessionPermissionsAndCRUD:

    def test_staff_can_create_session(self, api_client, moderator_user, batch):
        api_client.force_authenticate(user=moderator_user)
        url = reverse("session-list")
        data = {
            "title": "দ্বিতীয় সেশন - উদ্যোক্তা হওয়ার মূলমন্ত্র",
            "content": "**ধৈর্য ও সততা** সাফল্যের চাবিকাঠি। <script>alert('xss')</script>",
            "batch": batch.id,
            "session_number": 2,
            "date": str(timezone.localdate()),
            "status": "published",
        }
        resp = api_client.post(url, data, format="json")
        assert resp.status_code == status.HTTP_201_CREATED

        session = Session.objects.get(id=resp.data["id"])
        assert session.session_number == 2
        assert session.slug.startswith("1-2-")
        # Verify HTML script tag was sanitized
        assert "<script>" not in session.content

    def test_member_cannot_create_session(self, api_client, member_user, batch):
        api_client.force_authenticate(user=member_user)
        url = reverse("session-list")
        data = {
            "title": "অবৈধ সেশন",
            "content": "টেস্ট",
            "batch": batch.id,
            "session_number": 99,
        }
        resp = api_client.post(url, data, format="json")
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_member_sees_only_published_sessions(self, api_client, member_user, batch, admin_user):
        # Create a published session, a draft session, and a scheduled session
        s_pub = Session.objects.create(
            title="প্রকাশিত সেশন",
            content="কন্টেন্ট",
            batch=batch,
            session_number=1,
            status=Session.Status.PUBLISHED,
            author=admin_user,
        )
        s_draft = Session.objects.create(
            title="খসড়া সেশন",
            content="কন্টেন্ট",
            batch=batch,
            session_number=2,
            status=Session.Status.DRAFT,
            author=admin_user,
        )

        api_client.force_authenticate(user=member_user)
        url = reverse("session-list")
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK

        slugs = [item["slug"] for item in resp.data["results"]]
        assert s_pub.slug in slugs
        assert s_draft.slug not in slugs

        # Staff can see drafts
        api_client.force_authenticate(user=admin_user)
        staff_resp = api_client.get(url, {"status": "draft"})
        assert staff_resp.status_code == status.HTTP_200_OK
        staff_slugs = [item["slug"] for item in staff_resp.data["results"]]
        assert s_draft.slug in staff_slugs

    def test_session_soft_delete(self, api_client, admin_user, published_session):
        api_client.force_authenticate(user=admin_user)
        url = reverse("session-detail", kwargs={"slug": published_session.slug})
        resp = api_client.delete(url)
        assert resp.status_code == status.HTTP_204_NO_CONTENT

        published_session.refresh_from_db()
        assert published_session.is_deleted is True
        assert published_session.deleted_at is not None

        # Session should no longer be returned
        get_resp = api_client.get(url)
        assert get_resp.status_code == status.HTTP_404_NOT_FOUND

    def test_unique_constraint_on_batch_and_session_number(self, batch, admin_user):
        Session.objects.create(
            title="সেশন ১",
            content="কন্টেন্ট",
            batch=batch,
            session_number=1,
            author=admin_user,
        )
        # Creating another active session with same batch & session_number raises IntegrityError
        with pytest.raises(Exception):
            Session.objects.create(
                title="সেশন ১ ডুপ্লিকেট",
                content="কন্টেন্ট",
                batch=batch,
                session_number=1,
                author=admin_user,
            )


@pytest.mark.django_db
class TestSessionActionsAndNavigation:

    def test_session_today_endpoint(self, api_client, member_user, batch, admin_user):
        today = timezone.localdate()
        s_today = Session.objects.create(
            title="আজকের সেশন",
            content="কন্টেন্ট",
            batch=batch,
            session_number=10,
            date=today,
            status=Session.Status.PUBLISHED,
            author=admin_user,
        )
        s_past = Session.objects.create(
            title="গতকালের সেশন",
            content="কন্টেন্ট",
            batch=batch,
            session_number=9,
            date=today - timedelta(days=1),
            status=Session.Status.PUBLISHED,
            author=admin_user,
        )

        api_client.force_authenticate(user=member_user)
        url = reverse("session-today")
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK
        returned_slugs = [s["slug"] for s in resp.data]
        assert s_today.slug in returned_slugs
        assert s_past.slug not in returned_slugs

    def test_session_duplicate_action(self, api_client, admin_user, published_session):
        api_client.force_authenticate(user=admin_user)
        url = reverse("session-duplicate", kwargs={"slug": published_session.slug})
        resp = api_client.post(url)
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data["session_number"] == 2
        assert resp.data["status"] == "draft"
        assert "(অনুলিপি)" in resp.data["title"]

    def test_next_session_number_endpoint(self, api_client, member_user, batch, published_session):
        api_client.force_authenticate(user=member_user)
        url = reverse("batch-next-session-number", kwargs={"pk": batch.id})
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["next_session_number"] == 2

    def test_staff_preview_endpoint(self, api_client, admin_user, member_user, batch):
        draft_session = Session.objects.create(
            title="খসড়া প্রিভিউ",
            content="খসড়া কন্টেন্ট",
            batch=batch,
            session_number=5,
            status=Session.Status.DRAFT,
            author=admin_user,
        )
        # Member cannot preview draft
        api_client.force_authenticate(user=member_user)
        preview_url = reverse("session-preview", kwargs={"slug": draft_session.slug})
        assert api_client.get(preview_url).status_code == status.HTTP_403_FORBIDDEN

        # Staff can preview with noindex header
        api_client.force_authenticate(user=admin_user)
        resp = api_client.get(preview_url)
        assert resp.status_code == status.HTTP_200_OK
        assert "noindex" in resp.headers["X-Robots-Tag"]

    def test_prev_and_next_session_navigation(self, api_client, member_user, batch, admin_user):
        s1 = Session.objects.create(
            title="সেশন ১", content="c", batch=batch, session_number=1, status=Session.Status.PUBLISHED, author=admin_user
        )
        s2 = Session.objects.create(
            title="সেশন ২", content="c", batch=batch, session_number=2, status=Session.Status.PUBLISHED, author=admin_user
        )
        s3 = Session.objects.create(
            title="সেশন ৩", content="c", batch=batch, session_number=3, status=Session.Status.PUBLISHED, author=admin_user
        )

        api_client.force_authenticate(user=member_user)
        url = reverse("session-detail", kwargs={"slug": s2.slug})
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["prev_session"]["slug"] == s1.slug
        assert resp.data["next_session"]["slug"] == s3.slug

    def test_bangla_utf8_search_filter(self, api_client, member_user, batch, admin_user):
        Session.objects.create(
            title="উদ্যোক্তা হওয়ার প্রথম ধাপ",
            content="কন্টেন্ট",
            batch=batch,
            session_number=1,
            status=Session.Status.PUBLISHED,
            author=admin_user,
        )
        Session.objects.create(
            title="মার্কেটিং ও সেলস কৌশল",
            content="কন্টেন্ট",
            batch=batch,
            session_number=2,
            status=Session.Status.PUBLISHED,
            author=admin_user,
        )

        api_client.force_authenticate(user=member_user)
        url = reverse("session-list")
        resp = api_client.get(url, {"search": "উদ্যোক্তা"})
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] == 1
        assert "উদ্যোক্তা" in resp.data["results"][0]["title"]
