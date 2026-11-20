import pytest
from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User, UserSession
from apps.accounts.services import generate_email_verification_token, generate_password_reset_token
from apps.community.models import Batch


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def test_batch(db):
    return Batch.objects.create(
        number=1,
        name="ব্যাচ ১ - উদ্যোক্তা যাত্রা",
        start_date="2024-01-01",
    )


@pytest.fixture
def member_user(db, test_batch):
    return User.objects.create_user(
        email="member@example.com",
        password="ValidPassword123!",
        first_name="রহিম",
        last_name="আহমেদ",
        batch=test_batch,
        registration_no="REG-001",
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        email="admin@example.com",
        password="AdminPassword123!",
        first_name="অ্যাডমিন",
        last_name="ইউজার",
    )


@pytest.mark.django_db
class TestAuthenticationFlows:

    def test_user_registration_success(self, api_client):
        url = reverse("account-register")
        data = {
            "email": "newuser@example.com",
            "password": "SecurePassword123!",
            "first_name": "করিম",
            "last_name": "উদ্দিন",
            "terms_accepted": True,
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        user = User.objects.get(email="newuser@example.com")
        assert user.email_verified is False
        assert user.verification_status == User.VerificationStatus.UNVERIFIED
        assert user.is_verified is False
        assert user.terms_accepted_at is not None

    def test_user_registration_duplicate_email(self, api_client, member_user):
        url = reverse("account-register")
        data = {
            "email": member_user.email,
            "password": "Password123!",
            "terms_accepted": True,
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_user_registration_terms_not_accepted(self, api_client):
        url = reverse("account-register")
        data = {
            "email": "noterms@example.com",
            "password": "Password123!",
            "terms_accepted": False,
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_verify_email_confirm(self, api_client, member_user):
        assert member_user.email_verified is False
        token = generate_email_verification_token(member_user)

        url = reverse("account-verification-confirm")
        response = api_client.post(url, {"token": token}, format="json")
        assert response.status_code == status.HTTP_200_OK

        member_user.refresh_from_db()
        assert member_user.email_verified is True

    def test_verify_email_invalid_token(self, api_client):
        url = reverse("account-verification-confirm")
        response = api_client.post(url, {"token": "invalid:token"}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_resend_email_verification_non_revealing(self, api_client, member_user):
        url = reverse("account-verification-resend")
        # For existing user
        resp1 = api_client.post(url, {"email": member_user.email}, format="json")
        assert resp1.status_code == status.HTTP_200_OK

        # For non-existing user
        resp2 = api_client.post(url, {"email": "doesnotexist@example.com"}, format="json")
        assert resp2.status_code == status.HTTP_200_OK
        assert resp1.data["detail"] == resp2.data["detail"]

    def test_login_success_and_jwt_tokens(self, api_client, member_user):
        url = reverse("account-login")
        data = {"email": member_user.email, "password": "ValidPassword123!"}
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data
        assert response.data["user"]["email"] == member_user.email

    def test_login_invalid_password(self, api_client, member_user):
        url = reverse("account-login")
        data = {"email": member_user.email, "password": "WrongPassword123!"}
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_token_refresh_and_rotation(self, api_client, member_user):
        login_url = reverse("account-login")
        login_resp = api_client.post(login_url, {"email": member_user.email, "password": "ValidPassword123!"})
        refresh_token = login_resp.data["refresh"]

        refresh_url = reverse("account-token-refresh")
        refresh_resp = api_client.post(refresh_url, {"refresh": refresh_token}, format="json")
        assert refresh_resp.status_code == status.HTTP_200_OK
        assert "access" in refresh_resp.data
        new_refresh = refresh_resp.data["refresh"]
        assert new_refresh != refresh_token

        # Using old refresh token must fail because it was blacklisted
        failed_resp = api_client.post(refresh_url, {"refresh": refresh_token}, format="json")
        assert failed_resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout_blacklists_refresh_token(self, api_client, member_user):
        login_url = reverse("account-login")
        login_resp = api_client.post(login_url, {"email": member_user.email, "password": "ValidPassword123!"})
        access_token = login_resp.data["access"]
        refresh_token = login_resp.data["refresh"]

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        logout_url = reverse("account-logout")
        logout_resp = api_client.post(logout_url, {"refresh": refresh_token}, format="json")
        assert logout_resp.status_code == status.HTTP_200_OK

        # Trying to use blacklisted refresh token
        refresh_url = reverse("account-token-refresh")
        refresh_resp = api_client.post(refresh_url, {"refresh": refresh_token}, format="json")
        assert refresh_resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_password_reset_flow(self, api_client, member_user):
        reset_req_url = reverse("account-password-reset")
        req_resp = api_client.post(reset_req_url, {"email": member_user.email}, format="json")
        assert req_resp.status_code == status.HTTP_200_OK

        token = generate_password_reset_token(member_user)
        reset_confirm_url = reverse("account-password-reset-confirm")
        confirm_resp = api_client.post(
            reset_confirm_url,
            {"token": token, "new_password": "BrandNewPassword999!"},
            format="json",
        )
        assert confirm_resp.status_code == status.HTTP_200_OK

        # Can log in with new password
        login_url = reverse("account-login")
        login_resp = api_client.post(
            login_url,
            {"email": member_user.email, "password": "BrandNewPassword999!"},
            format="json",
        )
        assert login_resp.status_code == status.HTTP_200_OK

    def test_change_password_authenticated(self, api_client, member_user):
        api_client.force_authenticate(user=member_user)
        url = reverse("account-password-change")
        data = {
            "old_password": "ValidPassword123!",
            "new_password": "UpdatedPassword456!",
        }
        resp = api_client.post(url, data, format="json")
        assert resp.status_code == status.HTTP_200_OK

        member_user.refresh_from_db()
        assert member_user.check_password("UpdatedPassword456!")

    @patch("apps.accounts.services.requests.get")
    def test_google_login_mocked(self, mock_get, api_client):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "email": "googleuser@example.com",
            "email_verified": "true",
            "sub": "google-sub-12345",
            "name": "গুগল ইউজার",
            "given_name": "গুগল",
            "family_name": "ইউজার",
            "picture": "https://example.com/avatar.jpg",
        }

        url = reverse("account-google-login")
        resp = api_client.post(url, {"id_token": "valid-mock-token"}, format="json")
        assert resp.status_code == status.HTTP_200_OK
        assert "access" in resp.data

        user = User.objects.get(email="googleuser@example.com")
        assert user.google_id == "google-sub-12345"
        assert user.email_verified is True
        assert user.auth_provider == User.AuthProvider.GOOGLE

    @patch("apps.accounts.services.requests.get")
    def test_google_login_links_existing_user(self, mock_get, api_client, member_user):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "email": member_user.email,
            "email_verified": True,
            "sub": "google-linked-id-999",
            "picture": "https://example.com/photo.jpg",
        }

        url = reverse("account-google-login")
        resp = api_client.post(url, {"id_token": "valid-token"}, format="json")
        assert resp.status_code == status.HTTP_200_OK

        member_user.refresh_from_db()
        assert member_user.google_id == "google-linked-id-999"
        assert member_user.email_verified is True


@pytest.mark.django_db
class TestProfileAndVerificationRules:

    def test_profile_read(self, api_client, member_user):
        api_client.force_authenticate(user=member_user)
        url = reverse("account-me")
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["email"] == member_user.email
        assert resp.data["registration_no"] == "REG-001"

    def test_profile_update_allowed_when_unverified(self, api_client, member_user, test_batch):
        api_client.force_authenticate(user=member_user)
        url = reverse("account-me")
        data = {
            "first_name": "হাসান",
            "registration_no": "REG-002",
        }
        resp = api_client.patch(url, data, format="json")
        assert resp.status_code == status.HTTP_200_OK
        member_user.refresh_from_db()
        assert member_user.first_name == "হাসান"
        assert member_user.registration_no == "REG-002"

    def test_profile_update_blocked_when_pending_or_verified(self, api_client, member_user):
        member_user.verification_status = User.VerificationStatus.PENDING
        member_user.save()

        api_client.force_authenticate(user=member_user)
        url = reverse("account-me")
        # Editing first_name is fine
        resp = api_client.patch(url, {"first_name": "হাসান"}, format="json")
        assert resp.status_code == status.HTTP_200_OK

        # Editing batch or registration_no while pending is blocked
        resp_blocked = api_client.patch(url, {"registration_no": "REG-NEW"}, format="json")
        assert resp_blocked.status_code == status.HTTP_400_BAD_REQUEST

    def test_registration_no_regex_validation(self, api_client, member_user):
        api_client.force_authenticate(user=member_user)
        url = reverse("account-me")
        # registration_no with invalid special characters
        resp = api_client.patch(url, {"registration_no": "INVALID@@@$$$###"}, format="json")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_registration_no_uniqueness_per_batch(self, api_client, member_user, test_batch):
        # Create another verified user in the same batch
        User.objects.create_user(
            email="other@example.com",
            password="Password123!",
            batch=test_batch,
            registration_no="REG-TAKEN",
            verification_status=User.VerificationStatus.VERIFIED,
        )

        api_client.force_authenticate(user=member_user)
        url = reverse("account-me")
        # Trying to take the same registration number in test_batch
        resp = api_client.patch(url, {"registration_no": "REG-TAKEN"}, format="json")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestModeratorAndSessions:

    def test_admin_create_moderator_success(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        url = reverse("admin-create-moderator")
        data = {
            "email": "newmod@example.com",
            "first_name": "সুমন",
            "last_name": "মডারেটর",
        }
        resp = api_client.post(url, data, format="json")
        assert resp.status_code == status.HTTP_201_CREATED

        mod = User.objects.get(email="newmod@example.com")
        assert mod.role == User.Role.MODERATOR
        assert mod.is_staff is True
        assert mod.has_usable_password() is False

    def test_regular_member_cannot_create_moderator(self, api_client, member_user):
        api_client.force_authenticate(user=member_user)
        url = reverse("admin-create-moderator")
        resp = api_client.post(url, {"email": "mod@example.com"}, format="json")
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_user_session_listing_and_revocation(self, api_client, member_user):
        session = UserSession.objects.create(
            user=member_user,
            ip_address="192.168.1.1",
            user_agent="Mozilla/5.0",
        )
        api_client.force_authenticate(user=member_user)
        list_url = reverse("account-me-sessions")
        resp = api_client.get(list_url)
        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.data) == 1

        revoke_url = reverse("account-me-sessions-revoke", kwargs={"session_id": session.id})
        revoke_resp = api_client.delete(revoke_url)
        assert revoke_resp.status_code == status.HTTP_200_OK

        session.refresh_from_db()
        assert session.revoked is True
