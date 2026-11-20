import pytest
from unittest.mock import patch
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.community.models import Batch, Session, SessionSlugHistory
from apps.community.revalidation import trigger_nextjs_revalidation, invalidate_session_cache


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
def member_user(db, batch):
    return User.objects.create_user(
        email="member@example.com",
        password="MemberPassword123!",
        role=User.Role.MEMBER,
        batch=batch,
        verification_status=User.VerificationStatus.VERIFIED,
    )


@pytest.fixture
def public_session(db, batch, admin_user):
    return Session.objects.create(
        title="সবার জন্য উন্মুক্ত সেশন",
        content="## উদ্যোক্তা যাত্রা\nসততা ও নিষ্ঠার সাথে কাজ করলে সাফল্য আসবেই। এই সেশনটি সবার জন্য।",
        batch=batch,
        session_number=1,
        date=timezone.localdate(),
        status=Session.Status.PUBLISHED,
        published_at=timezone.now(),
        author=admin_user,
        visibility=Session.Visibility.PUBLIC,
        is_indexable=True,
    )


@pytest.fixture
def members_only_session(db, batch, admin_user):
    return Session.objects.create(
        title="শুধুমাত্র সদস্যদের জন্য বিশেষ সেশন",
        content="গোপন ব্যবসায়িক কৌশল যা কেবল ব্যাচ সদস্যদের দৃশ্যমান।",
        batch=batch,
        session_number=2,
        date=timezone.localdate(),
        status=Session.Status.PUBLISHED,
        published_at=timezone.now(),
        author=admin_user,
        visibility=Session.Visibility.MEMBERS,
        is_indexable=False,
    )


@pytest.mark.django_db
class TestPublicEndpoints:

    def test_public_sessions_list_only_published_public(
        self, api_client, public_session, members_only_session, batch, admin_user
    ):
        # Create draft and scheduled sessions
        Session.objects.create(
            title="খসড়া", content="x", batch=batch, session_number=3, status=Session.Status.DRAFT, author=admin_user
        )
        Session.objects.create(
            title="শিডিউলড", content="x", batch=batch, session_number=4, status=Session.Status.SCHEDULED, author=admin_user
        )

        url = reverse("public-session-list")
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK
        assert "Cache-Control" in resp.headers
        assert "ETag" in resp.headers

        slugs = [item["slug"] for item in resp.data["results"]]
        assert public_session.slug in slugs
        assert members_only_session.slug not in slugs

    def test_public_session_detail_anonymous(self, api_client, public_session):
        url = reverse("public-session-detail", kwargs={"slug": public_session.slug})
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["title"] == public_session.title
        assert "উদ্যোক্তা যাত্রা" in resp.data["content"]
        assert resp.data["login_required"] is False

    def test_public_session_detail_draft_returns_404(self, api_client, batch, admin_user):
        draft = Session.objects.create(
            title="খসড়া সেশন", content="x", batch=batch, session_number=5, status=Session.Status.DRAFT, author=admin_user
        )
        url = reverse("public-session-detail", kwargs={"slug": draft.slug})
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_404_NOT_FOUND

    def test_members_only_session_minimal_payload(self, api_client, members_only_session, member_user):
        url = reverse("public-session-detail", kwargs={"slug": members_only_session.slug})

        # Anonymous request returns minimal payload
        anon_resp = api_client.get(url)
        assert anon_resp.status_code == status.HTTP_200_OK
        assert anon_resp.data["login_required"] is True
        assert "content" not in anon_resp.data
        assert anon_resp.data["title"] == members_only_session.title

        # Authenticated member request returns full content
        api_client.force_authenticate(user=member_user)
        auth_resp = api_client.get(url)
        assert auth_resp.status_code == status.HTTP_200_OK
        assert "content" in auth_resp.data
        assert "গোপন ব্যবসায়িক কৌশল" in auth_resp.data["content"]

    def test_slug_redirect_hint(self, api_client, public_session):
        old_slug = "1-1-old-slug-12345"
        SessionSlugHistory.objects.create(session=public_session, old_slug=old_slug)

        url = reverse("public-session-detail", kwargs={"slug": old_slug})
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_301_MOVED_PERMANENTLY
        assert resp.data["redirect_to"] == public_session.slug

    def test_meta_endpoint_for_nextjs(self, api_client, public_session):
        url = reverse("public-session-meta", kwargs={"slug": public_session.slug})
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK
        data = resp.data

        assert data["title"] == public_session.title
        assert data["canonical_url"].endswith(f"/sessions/{public_session.slug}")
        assert data["language"] == "bn"
        assert data["robots"] == "index, follow"
        assert data["json_ld"]["@type"] == "Article"
        assert data["json_ld"]["headline"] == public_session.title

    def test_sitemap_endpoint(self, api_client, public_session, members_only_session):
        url = reverse("public-sitemap")
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK

        locs = [item["loc"] for item in resp.data]
        assert any(public_session.slug in loc for loc in locs)
        # Members only or non-indexable excluded from sitemap
        assert not any(members_only_session.slug in loc for loc in locs)

    def test_etag_if_none_match_returns_304(self, api_client, public_session):
        url = reverse("public-session-detail", kwargs={"slug": public_session.slug})
        resp = api_client.get(url)
        etag = resp.headers["ETag"]

        cached_resp = api_client.get(url, HTTP_IF_NONE_MATCH=etag)
        assert cached_resp.status_code == status.HTTP_304_NOT_MODIFIED

    def test_public_sessions_kill_switch(self, api_client, public_session, settings):
        settings.PUBLIC_SESSIONS_ENABLED = False
        url = reverse("public-session-list")
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_404_NOT_FOUND

    @patch("apps.community.revalidation.requests.post")
    def test_nextjs_revalidation_webhook(self, mock_post, settings):
        settings.NEXTJS_REVALIDATE_URL = "https://frontend.com/api/revalidate"
        settings.NEXTJS_REVALIDATE_SECRET = "secret-key-123"

        mock_post.return_value.status_code = 200
        success = trigger_nextjs_revalidation(["/sessions/test-slug", "/sitemap.xml"])
        assert success is True
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert kwargs["json"]["secret"] == "secret-key-123"
        assert kwargs["json"]["paths"] == ["/sessions/test-slug", "/sitemap.xml"]
