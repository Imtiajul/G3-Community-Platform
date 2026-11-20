from django.conf import settings
from django.db import models
from django.utils import timezone


class AuditLog(models.Model):
    """System-wide audit trail for compliance, moderation, and administrative events."""

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=100, db_index=True)
    target_type = models.CharField(max_length=50, db_index=True)
    target_id = models.CharField(max_length=100, db_index=True)
    metadata = models.JSONField(default=dict, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["actor", "action"], name="audit_actor_action_idx"),
            models.Index(fields=["target_type", "target_id"], name="audit_target_idx"),
        ]

    def __str__(self):
        actor_email = self.actor.email if self.actor else "System"
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M')}] {actor_email} -> {self.action} on {self.target_type}:{self.target_id}"
