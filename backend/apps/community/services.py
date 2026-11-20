import logging
from django.db import transaction
from django.utils import timezone
from .models import Session, SessionTag, SessionAttachment

logger = logging.getLogger(__name__)


def duplicate_session(session: Session, author) -> Session:
    """
    Duplicates an existing session as a new DRAFT copy with the next available
    session_number in the same batch.
    """
    with transaction.atomic():
        next_number = session.batch.get_next_session_number()
        new_session = Session.objects.create(
            title=f"{session.title} (অনুলিপি)",
            content=session.content,
            batch=session.batch,
            session_number=next_number,
            date=timezone.localdate(),
            status=Session.Status.DRAFT,
            author=author,
            is_featured=False,
            cover_image_url=session.cover_image_url,
            visibility=session.visibility,
            is_indexable=session.is_indexable,
            seo_title=session.seo_title,
            seo_description=session.seo_description,
            og_image_url=session.og_image_url,
        )

        # Copy tags
        tags = session.tags.all()
        if tags.exists():
            SessionTag.objects.bulk_create(
                [SessionTag(session=new_session, tag=tag) for tag in tags]
            )

        # Copy attachments
        attachments = session.attachments.all()
        if attachments.exists():
            SessionAttachment.objects.bulk_create(
                [
                    SessionAttachment(
                        session=new_session,
                        file_url=att.file_url,
                        type=att.type,
                        caption=att.caption,
                    )
                    for att in attachments
                ]
            )

        return new_session


def publish_session(session: Session) -> Session:
    """Sets session status to PUBLISHED and sets published_at timestamp."""
    session.status = Session.Status.PUBLISHED
    session.published_at = timezone.now()
    session.save(update_fields=["status", "published_at"])
    return session
