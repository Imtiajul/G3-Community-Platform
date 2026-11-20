import logging
from django.conf import settings
from django.core.mail import send_mail
from .models import Notification, NotificationPreference
from apps.accounts.models import User

logger = logging.getLogger(__name__)


def create_and_send_notification(
    recipient: User,
    notif_type: str,
    title: str,
    message: str,
    session=None,
    url: str | None = None,
    send_email: bool = True,
) -> Notification:
    """Creates an in-app Notification and optionally dispatches email based on user preferences."""
    pref, _ = NotificationPreference.objects.get_or_create(user=recipient)

    notification = None
    if pref.in_app_enabled:
        notification = Notification.objects.create(
            recipient=recipient,
            type=notif_type,
            title=title,
            message=message,
            session=session,
            url=url,
        )

    # Check email preferences
    should_email = False
    if send_email:
        if notif_type in (
            Notification.Type.VERIFICATION_REQUEST,
            Notification.Type.VERIFICATION_APPROVED,
            Notification.Type.VERIFICATION_REJECTED,
        ):
            should_email = pref.email_verification
        elif notif_type == Notification.Type.NEW_SESSION:
            should_email = pref.email_new_session
        elif notif_type == Notification.Type.ANNOUNCEMENT:
            should_email = pref.email_announcement
        elif notif_type == Notification.Type.ADMIN_MESSAGE:
            should_email = True

    if should_email:
        try:
            send_mail(
                subject=f"[{settings.SPECTACULAR_SETTINGS.get('TITLE', 'কমিউনিটি')}] {title}",
                message=f"প্রিয় {recipient.full_name},\n\n{message}\n\nধন্যবাদ,\nকমিউনিটি টিম",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient.email],
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"Failed to dispatch notification email to {recipient.email}: {e}")

    return notification


def notify_all_staff(notif_type: str, title: str, message: str, url: str | None = None) -> int:
    """Dispatches a notification to all active admins and moderators."""
    staff_users = User.objects.filter(
        role__in=[User.Role.ADMIN, User.Role.MODERATOR],
        is_active=True,
    )
    count = 0
    for staff in staff_users:
        create_and_send_notification(
            recipient=staff,
            notif_type=notif_type,
            title=title,
            message=message,
            url=url,
            send_email=True,
        )
        count += 1
    return count
