from datetime import timedelta
from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from apps.accounts.models import User, VerificationRequest
from apps.community.models import Batch, Session
from apps.interactions.models import Like, Comment, Bookmark


def get_platform_analytics(date_from=None, date_to=None, batch_id=None) -> dict:
    """
    Computes comprehensive platform analytics:
    - Current period totals & previous period totals for deltas
    - Daily signups, likes, comments series
    - Top sessions by engagement
    - Per-batch breakdown
    - Pending verification queue count
    """
    now = timezone.now()
    if not date_to:
        date_to = now.date()
    if not date_from:
        date_from = date_to - timedelta(days=30)

    delta_days = (date_to - date_from).days
    prev_date_to = date_from - timedelta(days=1)
    prev_date_from = prev_date_to - timedelta(days=delta_days)

    # Base querysets
    user_qs = User.objects.all()
    session_qs = Session.objects.filter(is_deleted=False)
    like_qs = Like.objects.all()
    comment_qs = Comment.objects.filter(is_deleted=False)
    bookmark_qs = Bookmark.objects.all()

    if batch_id:
        user_qs = user_qs.filter(batch_id=batch_id)
        session_qs = session_qs.filter(batch_id=batch_id)
        like_qs = like_qs.filter(session__batch_id=batch_id)
        comment_qs = comment_qs.filter(session__batch_id=batch_id)
        bookmark_qs = bookmark_qs.filter(session__batch_id=batch_id)

    # Current period totals
    curr_users = user_qs.filter(date_joined__date__range=[date_from, date_to])
    curr_sessions = session_qs.filter(date__range=[date_from, date_to])
    curr_likes = like_qs.filter(created_at__date__range=[date_from, date_to])
    curr_comments = comment_qs.filter(created_at__date__range=[date_from, date_to])
    curr_bookmarks = bookmark_qs.filter(created_at__date__range=[date_from, date_to])

    # Previous period totals (for delta calculations)
    prev_users_count = user_qs.filter(date_joined__date__range=[prev_date_from, prev_date_to]).count()
    prev_sessions_count = session_qs.filter(date__range=[prev_date_from, prev_date_to]).count()
    prev_likes_count = like_qs.filter(created_at__date__range=[prev_date_from, prev_date_to]).count()
    prev_comments_count = comment_qs.filter(created_at__date__range=[prev_date_from, prev_date_to]).count()
    prev_bookmarks_count = bookmark_qs.filter(created_at__date__range=[prev_date_from, prev_date_to]).count()

    # Users by verification status
    users_by_status = {
        "verified": user_qs.filter(verification_status=User.VerificationStatus.VERIFIED).count(),
        "pending": user_qs.filter(verification_status=User.VerificationStatus.PENDING).count(),
        "unverified": user_qs.filter(verification_status=User.VerificationStatus.UNVERIFIED).count(),
        "rejected": user_qs.filter(verification_status=User.VerificationStatus.REJECTED).count(),
    }

    # Sessions by status
    sessions_by_status = {
        "published": session_qs.filter(status=Session.Status.PUBLISHED).count(),
        "scheduled": session_qs.filter(status=Session.Status.SCHEDULED).count(),
        "draft": session_qs.filter(status=Session.Status.DRAFT).count(),
        "archived": session_qs.filter(status=Session.Status.ARCHIVED).count(),
    }

    # Daily time-series for current period
    daily_signups = (
        curr_users.annotate(day=TruncDate("date_joined"))
        .values("day")
        .annotate(count=Count("id"))
        .order_by("day")
    )
    daily_likes = (
        curr_likes.annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(count=Count("id"))
        .order_by("day")
    )
    daily_comments = (
        curr_comments.annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(count=Count("id"))
        .order_by("day")
    )

    # Top sessions by engagement
    top_sessions = (
        session_qs.filter(status=Session.Status.PUBLISHED)
        .annotate(
            likes_cnt=Count("likes", distinct=True),
            comments_cnt=Count("comments", filter=Q(comments__is_deleted=False), distinct=True),
            bookmarks_cnt=Count("bookmarks", distinct=True),
        )
        .annotate(
            total_engagement=Count("likes", distinct=True)
            + Count("comments", filter=Q(comments__is_deleted=False), distinct=True)
            + Count("bookmarks", distinct=True)
        )
        .order_by("-total_engagement")[:5]
    )

    top_sessions_data = [
        {
            "slug": s.slug,
            "title": s.title,
            "batch_number": s.batch.number,
            "likes_count": s.likes_cnt,
            "comments_count": s.comments_cnt,
            "bookmarks_count": s.bookmarks_cnt,
            "total_engagement": s.total_engagement,
        }
        for s in top_sessions
    ]

    # Per-batch statistics
    batches = Batch.objects.filter(is_active=True).order_by("number")
    batch_stats = []
    for b in batches:
        batch_stats.append(
            {
                "batch_id": b.id,
                "batch_number": b.number,
                "batch_name": b.name,
                "verified_members_count": b.users.filter(
                    verification_status=User.VerificationStatus.VERIFIED
                ).count(),
                "published_sessions_count": b.sessions.filter(
                    status=Session.Status.PUBLISHED, is_deleted=False
                ).count(),
            }
        )

    pending_verifications_count = VerificationRequest.objects.filter(
        status=VerificationRequest.Status.PENDING
    ).count()

    return {
        "period": {
            "date_from": str(date_from),
            "date_to": str(date_to),
            "prev_date_from": str(prev_date_from),
            "prev_date_to": str(prev_date_to),
        },
        "current_totals": {
            "users": curr_users.count(),
            "sessions": curr_sessions.count(),
            "likes": curr_likes.count(),
            "comments": curr_comments.count(),
            "bookmarks": curr_bookmarks.count(),
        },
        "previous_totals": {
            "users": prev_users_count,
            "sessions": prev_sessions_count,
            "likes": prev_likes_count,
            "comments": prev_comments_count,
            "bookmarks": prev_bookmarks_count,
        },
        "deltas": {
            "users": curr_users.count() - prev_users_count,
            "sessions": curr_sessions.count() - prev_sessions_count,
            "likes": curr_likes.count() - prev_likes_count,
            "comments": curr_comments.count() - prev_comments_count,
            "bookmarks": curr_bookmarks.count() - prev_bookmarks_count,
        },
        "users_by_status": users_by_status,
        "sessions_by_status": sessions_by_status,
        "daily_series": {
            "signups": {str(item["day"]): item["count"] for item in daily_signups if item["day"]},
            "likes": {str(item["day"]): item["count"] for item in daily_likes if item["day"]},
            "comments": {str(item["day"]): item["count"] for item in daily_comments if item["day"]},
        },
        "top_sessions_by_engagement": top_sessions_data,
        "batch_stats": batch_stats,
        "pending_verifications_count": pending_verifications_count,
    }
