import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.announcements.models import Announcement
from apps.community.models import Batch, Session


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        email="admin@example.com",
        password="AdminPassword123!",
        first_name="অ্যাডমিন",
    )


@pytest.fixture
def batch(db):
    return Batch.objects.create(number=1, name="ব্যাচ ১", start_date="2024-01-01")


@pytest.mark.django_db
class TestAnnouncementsAndLimits:

    def test_focused_announcements_limit_enforced(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        url = reverse("announcement-list")

        # Create 2 focused announcements
        for i in range(1, 3):
            resp = api_client.post(
                url,
                {
                    "title": f"ফোকাসড বিজ্ঞপ্তি {i}",
                    "content": "গুরুত্বপূর্ণ আপডেট",
                    "is_focused": True,
                    "is_active": True,
                },
                format="json",
            )
            assert resp.status_code == status.HTTP_201_CREATED

        # 3rd focused announcement should fail with 400 Bad Request
        resp3 = api_client.post(
            url,
            {
                "title": "ফোকাসড বিজ্ঞপ্তি ৩",
                "content": "সীমা অতিক্রমকারী",
                "is_focused": True,
                "is_active": True,
            },
            format="json",
        )
        assert resp3.status_code == status.HTTP_400_BAD_REQUEST

    def test_active_announcements_limit_enforced(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        url = reverse("announcement-list")

        # Create 4 active announcements
        for i in range(1, 5):
            resp = api_client.post(
                url,
                {
                    "title": f"সাধারণ সক্রিয় বিজ্ঞপ্তি {i}",
                    "content": "সাধারণ তথ্য",
                    "is_focused": False,
                    "is_active": True,
                },
                format="json",
            )
            assert resp.status_code == status.HTTP_201_CREATED

        # 5th active announcement should fail with 400 Bad Request
        resp5 = api_client.post(
            url,
            {
                "title": "বিজ্ঞপ্তি ৫",
                "content": "সীমা অতিক্রম",
                "is_focused": False,
                "is_active": True,
            },
            format="json",
        )
        assert resp5.status_code == status.HTTP_400_BAD_REQUEST

    def test_announcement_reorder(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        a1 = Announcement.objects.create(title="বিজ্ঞপ্তি ১", content="c", priority=10, is_active=False)
        a2 = Announcement.objects.create(title="বিজ্ঞপ্তি ২", content="c", priority=20, is_active=False)
        a3 = Announcement.objects.create(title="বিজ্ঞপ্তি ৩", content="c", priority=30, is_active=False)

        # Reorder to [a3, a1, a2]
        url = reverse("announcement-reorder")
        resp = api_client.post(url, {"order": [str(a3.id), str(a1.id), str(a2.id)]}, format="json")
        assert resp.status_code == status.HTTP_200_OK

        a3.refresh_from_db()
        a1.refresh_from_db()
        a2.refresh_from_db()
        assert a3.priority > a1.priority > a2.priority

    def test_public_landing_payload_structure(self, api_client, batch, admin_user):
        # Create announcements
        Announcement.objects.create(
            title="টপ ফোকাসড নোটিশ", content="কন্টেন্ট", is_focused=True, is_active=True, priority=100
        )
        Announcement.objects.create(
            title="সাধারণ নোটিশ", content="কন্টেন্ট", is_focused=False, is_active=True, priority=50
        )

        # Create featured and latest session
        Session.objects.create(
            title="ফিচার্ড সেশন",
            content="কন্টেন্ট",
            batch=batch,
            session_number=1,
            status=Session.Status.PUBLISHED,
            is_featured=True,
            author=admin_user,
            published_at=timezone.now(),
        )
        Session.objects.create(
            title="আগামী সেশন",
            content="গোপন কন্টেন্ট যা ল্যান্ডিংয়ে আসবে না",
            batch=batch,
            session_number=2,
            status=Session.Status.SCHEDULED,
            author=admin_user,
            scheduled_at=timezone.now() + timezone.timedelta(days=2),
        )

        url = reverse("public-landing")
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK
        data = resp.data

        assert len(data["focused_announcements"]) == 1
        assert data["focused_announcements"][0]["title"] == "টপ ফোকাসড নোটিশ"

        assert len(data["active_announcements"]) == 1
        assert data["active_announcements"][0]["title"] == "সাধারণ নোটিশ"

        assert len(data["featured_sessions"]) == 1
        assert data["featured_sessions"][0]["title"] == "ফিচার্ড সেশন"

        assert data["latest_published_session"]["title"] == "ফিচার্ড সেশন"

        assert len(data["upcoming_sessions"]) == 1
        assert data["upcoming_sessions"][0]["title"] == "আগামী সেশন"
        # Verify content is NOT leaked for upcoming session
        assert "content" not in data["upcoming_sessions"][0]
