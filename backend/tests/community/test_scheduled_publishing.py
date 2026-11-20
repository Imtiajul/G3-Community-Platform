import pytest
from unittest.mock import patch
from datetime import timedelta
from django.utils import timezone
from apps.accounts.models import User
from apps.community.models import Batch, Session
from apps.community.tasks import publish_scheduled_sessions
from apps.notifications.models import Notification
from apps.audit.models import AuditLog


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
        email="verified_member@example.com",
        password="Password123!",
        role=User.Role.MEMBER,
        first_name="ভেরিফাইড সদস্য",
        batch=batch,
        verification_status=User.VerificationStatus.VERIFIED,
    )


@pytest.fixture
def unverified_member(db, batch):
    return User.objects.create_user(
        email="unverified_member@example.com",
        password="Password123!",
        role=User.Role.MEMBER,
        first_name="অযাচাইকৃত সদস্য",
        batch=batch,
        verification_status=User.VerificationStatus.UNVERIFIED,
    )


@pytest.mark.django_db
class TestScheduledPublishingTask:

    @patch("apps.community.revalidation.requests.post")
    def test_publish_scheduled_sessions_success(
        self, mock_post, batch, admin_user, verified_member, unverified_member
    ):
        mock_post.return_value.status_code = 200
        now = timezone.now()

        # Session due for publishing (5 minutes in past)
        due_session = Session.objects.create(
            title="সিডিউলড সেশন যা প্রকাশিত হবে",
            content="কন্টেন্ট",
            batch=batch,
            session_number=1,
            status=Session.Status.SCHEDULED,
            scheduled_at=now - timedelta(minutes=5),
            author=admin_user,
        )

        # Session scheduled for future (1 hour in future)
        future_session = Session.objects.create(
            title="ভবিষ্যত সেশন",
            content="কন্টেন্ট",
            batch=batch,
            session_number=2,
            status=Session.Status.SCHEDULED,
            scheduled_at=now + timedelta(hours=1),
            author=admin_user,
        )

        # Run scheduled task
        count = publish_scheduled_sessions()
        assert count == 1

        # Check due session was published
        due_session.refresh_from_db()
        assert due_session.status == Session.Status.PUBLISHED
        assert due_session.published_at is not None

        # Check future session remains scheduled
        future_session.refresh_from_db()
        assert future_session.status == Session.Status.SCHEDULED
        assert future_session.published_at is None

        # Check audit log
        audit = AuditLog.objects.filter(
            action="session.publish_scheduled", target_id=str(due_session.id)
        ).first()
        assert audit is not None

        # Check notifications: verified member receives notification, unverified does NOT
        verified_notif = Notification.objects.filter(
            recipient=verified_member, type=Notification.Type.NEW_SESSION
        ).first()
        assert verified_notif is not None
        assert due_session.title in verified_notif.title

        unverified_notif = Notification.objects.filter(
            recipient=unverified_member, type=Notification.Type.NEW_SESSION
        ).first()
        assert unverified_notif is None

        # Revalidation webhook called
        mock_post.assert_called()

        # Running task again does NOT double publish
        count2 = publish_scheduled_sessions()
        assert count2 == 0
