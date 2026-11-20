import logging
from django.utils import timezone
from .models import AuditLog

logger = logging.getLogger(__name__)


def log_audit(
    actor=None,
    action: str = "",
    target_type: str = "",
    target_id: str = "",
    metadata: dict | None = None,
    ip: str | None = None,
) -> AuditLog:
    """Creates an audit log entry for administrative or security-sensitive actions."""
    try:
        return AuditLog.objects.create(
            actor=actor if (actor and getattr(actor, "is_authenticated", False)) else None,
            action=action,
            target_type=target_type,
            target_id=str(target_id),
            metadata=metadata or {},
            ip=ip,
            created_at=timezone.now(),
        )
    except Exception as e:
        logger.error(f"Failed to write audit log: {e}")
        return None
