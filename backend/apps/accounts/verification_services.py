from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from .models import User, VerificationRequest, MemberRoster
from apps.audit.services import log_audit
from apps.notifications.services import create_and_send_notification, notify_all_staff
from apps.notifications.models import Notification


class ConcurrencyConflictError(Exception):
    """Raised when staff attempts to review an already-reviewed verification request."""
    pass


def apply_for_verification(user: User, ip: str | None = None) -> VerificationRequest:
    """Submits a verification request for an unverified/rejected user."""
    if not user.email_verified:
        raise ValidationError({"detail": "ইমেইল ভেরিফাই করা ছাড়া ভেরিফিকেশনের জন্য আবেদন করা যাবে না।"})

    if not user.batch or not user.registration_no:
        missing = []
        if not user.batch:
            missing.append("ব্যাচ")
        if not user.registration_no:
            missing.append("রেজিস্ট্রেশন নম্বর")
        raise ValidationError(
            {"detail": f"ভেরিফিকেশন আবেদনের পূর্বে প্রোফাইলে {', '.join(missing)} যুক্ত করা আবশ্যক।"}
        )

    if user.verification_status not in (
        User.VerificationStatus.UNVERIFIED,
        User.VerificationStatus.REJECTED,
    ):
        raise ValidationError(
            {"detail": "আপনার ভেরিফিকেশন আবেদন ইতোমধ্যে প্রক্রিয়াধীন বা সম্পন্ন রয়েছে।"}
        )

    with transaction.atomic():
        # Double check no pending request exists
        if VerificationRequest.objects.filter(user=user, status=VerificationRequest.Status.PENDING).exists():
            raise ValidationError({"detail": "আপনার একটি আবেদন ইতোমধ্যে প্রক্রিয়াধীন রয়েছে।"})

        req = VerificationRequest.objects.create(
            user=user,
            batch=user.batch,
            registration_no=user.registration_no,
            status=VerificationRequest.Status.PENDING,
            submitted_at=timezone.now(),
        )

        user.verification_status = User.VerificationStatus.PENDING
        user.save(update_fields=["verification_status"])

        # Write audit log
        log_audit(
            actor=user,
            action="verification.apply",
            target_type="VerificationRequest",
            target_id=str(req.id),
            metadata={"batch": req.batch.number, "registration_no": req.registration_no},
            ip=ip,
        )

        # Notify all admins and moderators
        notify_all_staff(
            notif_type=Notification.Type.VERIFICATION_REQUEST,
            title="নতুন ভেরিফিকেশন আবেদন",
            message=f"{user.full_name} ({user.email}) ব্যাচ {req.batch.number}-এর জন্য ভেরিফিকেশন আবেদন করেছেন।",
            url=f"/staff/verification-requests/{req.id}",
        )

        return req


def approve_verification_request(
    request_id,
    reviewer: User,
    reviewer_note: str = "",
    ip: str | None = None,
) -> VerificationRequest:
    """Staff approves verification request with select_for_update concurrency lock."""
    with transaction.atomic():
        try:
            req = VerificationRequest.objects.select_for_update().get(id=request_id)
        except VerificationRequest.DoesNotExist:
            raise ValidationError({"detail": "আবেদনটি পাওয়া যায়নি।"})

        if req.status != VerificationRequest.Status.PENDING:
            raise ConcurrencyConflictError("এই আবেদনটি ইতোমধ্যে অন্য স্টাফ সদস্য দ্বারা পর্যালোচনা করা হয়েছে।")

        now = timezone.now()
        req.status = VerificationRequest.Status.APPROVED
        req.reviewed_by = reviewer
        req.reviewed_at = now
        req.reviewer_note = reviewer_note
        req.save(update_fields=["status", "reviewed_by", "reviewed_at", "reviewer_note"])

        # Update user status to verified
        user = req.user
        user.verification_status = User.VerificationStatus.VERIFIED
        user.verified_by = reviewer
        user.verified_at = now
        # Lock batch and registration_no to the approved snapshot
        user.batch = req.batch
        user.registration_no = req.registration_no
        user.save(update_fields=["verification_status", "verified_by", "verified_at", "batch", "registration_no"])

        # Mark roster entry as claimed if found
        MemberRoster.objects.filter(
            batch=req.batch,
            registration_no=req.registration_no,
        ).update(is_claimed=True)

        # Audit log
        log_audit(
            actor=reviewer,
            action="verification.approve",
            target_type="VerificationRequest",
            target_id=str(req.id),
            metadata={"user_id": str(user.id), "reviewer_note": reviewer_note},
            ip=ip,
        )

        # Notify user
        create_and_send_notification(
            recipient=user,
            notif_type=Notification.Type.VERIFICATION_APPROVED,
            title="ভেরিফিকেশন অনুমোদিত হয়েছে",
            message="অভিনন্দন! আপনার ভেরিফিকেশন আবেদনটি অনুমোদিত হয়েছে। এখন থেকে আপনি কমিউনিটির সকল সেশনে অংশগ্রহণ করতে পারবেন।",
            url="/me",
            send_email=True,
        )

        # Mark staff notifications for this user as read
        Notification.objects.filter(
            type=Notification.Type.VERIFICATION_REQUEST,
            message__contains=user.email,
        ).update(is_read=True, read_at=now)

        return req


def reject_verification_request(
    request_id,
    reviewer: User,
    reason: str,
    reviewer_note: str = "",
    ip: str | None = None,
) -> VerificationRequest:
    """Staff rejects verification request with required reason."""
    if not reason or not reason.strip():
        raise ValidationError({"reason": "প্রত্যাখ্যানের সুনির্দিষ্ট কারণ উল্লেখ করা আবশ্যক।"})

    with transaction.atomic():
        try:
            req = VerificationRequest.objects.select_for_update().get(id=request_id)
        except VerificationRequest.DoesNotExist:
            raise ValidationError({"detail": "আবেদনটি পাওয়া যায়নি।"})

        if req.status != VerificationRequest.Status.PENDING:
            raise ConcurrencyConflictError("এই আবেদনটি ইতোমধ্যে অন্য স্টাফ সদস্য দ্বারা পর্যালোচনা করা হয়েছে।")

        now = timezone.now()
        req.status = VerificationRequest.Status.REJECTED
        req.reviewed_by = reviewer
        req.reviewed_at = now
        req.rejection_reason = reason.strip()
        req.reviewer_note = reviewer_note
        req.save(update_fields=["status", "reviewed_by", "reviewed_at", "rejection_reason", "reviewer_note"])

        # Update user status to rejected so they can edit details and reapply
        user = req.user
        user.verification_status = User.VerificationStatus.REJECTED
        user.save(update_fields=["verification_status"])

        # Audit log
        log_audit(
            actor=reviewer,
            action="verification.reject",
            target_type="VerificationRequest",
            target_id=str(req.id),
            metadata={"user_id": str(user.id), "reason": reason.strip()},
            ip=ip,
        )

        # Notify user with reason
        create_and_send_notification(
            recipient=user,
            notif_type=Notification.Type.VERIFICATION_REJECTED,
            title="ভেরিফিকেশন আবেদন প্রত্যাখ্যাত হয়েছে",
            message=f"আপনার আবেদনটি প্রত্যাখ্যাত হয়েছে। কারণ: {reason.strip()}। অনুগ্রহ করে প্রোফাইল তথ্য সংশোধন করে পুনরায় আবেদন করুন।",
            url="/me",
            send_email=True,
        )

        return req
