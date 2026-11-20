import logging
from celery import shared_task
from django.db import transaction
from django.utils import timezone
from .models import Session
from .revalidation import invalidate_session_cache, trigger_nextjs_revalidation
from apps.accounts.models import User
from apps.audit.services import log_audit
from apps.notifications.models import Notification
from apps.notifications.services import create_and_send_notification

logger = logging.getLogger(__name__)


@shared_task(name="apps.community.tasks.publish_scheduled_sessions")
def publish_scheduled_sessions() -> int:
    """
    Periodic task executed every minute by Celery Beat.
    Publishes all sessions where status is 'scheduled' and scheduled_at <= now.
    Uses select_for_update(skip_locked=True) in an atomic transaction
    to prevent double publishing across distributed worker instances.
    """
    now = timezone.now()
    published_count = 0

    with transaction.atomic():
        due_sessions = (
            Session.objects.select_for_update(skip_locked=True)
            .filter(
                status=Session.Status.SCHEDULED,
                scheduled_at__lte=now,
                is_deleted=False,
            )
            .select_related("batch", "author")
        )

        for session in due_sessions:
            session.status = Session.Status.PUBLISHED
            session.published_at = now
            session.save(update_fields=["status", "published_at"])
            published_count += 1

            # 1. Invalidate caches
            invalidate_session_cache(session.slug)

            # 2. Trigger Next.js ISR on-demand revalidation
            paths = [f"/sessions/{session.slug}", "/sessions", "/sitemap.xml"]
            trigger_nextjs_revalidation(paths)

            # 3. Write Audit Log
            log_audit(
                actor=session.author,
                action="session.publish_scheduled",
                target_type="Session",
                target_id=str(session.id),
                metadata={"slug": session.slug, "batch": session.batch.number, "session_number": session.session_number},
            )

            # 4. Dispatch new_session notification to verified members in this batch
            verified_members = User.objects.filter(
                batch=session.batch,
                verification_status=User.VerificationStatus.VERIFIED,
                is_active=True,
            )

            for member in verified_members:
                create_and_send_notification(
                    recipient=member,
                    notif_type=Notification.Type.NEW_SESSION,
                    title=f"নতুন সেশন প্রকাশিত: {session.title}",
                    message=f"ব্যাচ {session.batch.number}-এর সেশন নম্বর {session.session_number} প্রকাশিত হয়েছে। এখনই পড়ুন!",
                    session=session,
                    url=f"/sessions/{session.slug}",
                    send_email=True,
                )

    logger.info(f"Published {published_count} scheduled session(s) at {now}.")
    return published_count
