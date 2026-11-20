from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import views, viewsets, status, permissions, generics
from rest_framework.response import Response

from .models import Like, Bookmark, Comment, CommentReport, SessionNote, PersonalNote
from .serializers import (
    CommentSerializer,
    CommentCreateSerializer,
    CommentReportSerializer,
    SessionNoteSerializer,
    PersonalNoteSerializer,
    ActivitySummarySerializer,
)
from apps.community.models import Session
from apps.community.revalidation import invalidate_session_cache
from apps.accounts.permissions import IsVerifiedMemberOrReadOnly, IsOwnerOrReadOnly


class SessionLikeView(views.APIView):
    """POST to like a session; DELETE to unlike."""

    permission_classes = [permissions.IsAuthenticated, IsVerifiedMemberOrReadOnly]

    def post(self, request, slug):
        session = get_object_or_404(Session, slug=slug, is_deleted=False)
        like, created = Like.objects.get_or_create(user=request.user, session=session)
        invalidate_session_cache(session.slug)
        total_likes = Like.objects.filter(session=session).count()
        return Response(
            {"detail": "লাইক করা হয়েছে।", "liked": True, "total_likes": total_likes},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def delete(self, request, slug):
        session = get_object_or_404(Session, slug=slug, is_deleted=False)
        Like.objects.filter(user=request.user, session=session).delete()
        invalidate_session_cache(session.slug)
        total_likes = Like.objects.filter(session=session).count()
        return Response(
            {"detail": "লাইক বাতিল করা হয়েছে।", "liked": False, "total_likes": total_likes},
            status=status.HTTP_200_OK,
        )


class SessionBookmarkView(views.APIView):
    """POST to bookmark a session; DELETE to remove bookmark."""

    permission_classes = [permissions.IsAuthenticated, IsVerifiedMemberOrReadOnly]

    def post(self, request, slug):
        session = get_object_or_404(Session, slug=slug, is_deleted=False)
        bm, created = Bookmark.objects.get_or_create(user=request.user, session=session)
        total_bookmarks = Bookmark.objects.filter(session=session).count()
        return Response(
            {"detail": "বুকমার্ক করা হয়েছে।", "bookmarked": True, "total_bookmarks": total_bookmarks},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def delete(self, request, slug):
        session = get_object_or_404(Session, slug=slug, is_deleted=False)
        Bookmark.objects.filter(user=request.user, session=session).delete()
        total_bookmarks = Bookmark.objects.filter(session=session).count()
        return Response(
            {"detail": "বুকমার্ক সরানো হয়েছে।", "bookmarked": False, "total_bookmarks": total_bookmarks},
            status=status.HTTP_200_OK,
        )


class SessionCommentListCreateView(views.APIView):
    """List comments or create a new comment on a session."""

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsVerifiedMemberOrReadOnly()]
        return [permissions.IsAuthenticated()]

    def get(self, request, slug):
        session = get_object_or_404(Session, slug=slug, is_deleted=False)
        comments = (
            Comment.objects.filter(session=session, is_deleted=False, is_hidden=False)
            .select_related("author")
            .order_by("created_at")
        )
        serializer = CommentSerializer(comments, many=True, context={"request": request})
        return Response(serializer.data)

    def post(self, request, slug):
        session = get_object_or_404(Session, slug=slug, is_deleted=False)
        serializer = CommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        parent = serializer.validated_data.get("parent")
        if parent and parent.session_id != session.id:
            return Response(
                {"detail": "রিপ্লাই মন্তব্য অবশ্যই একই সেশনের হতে হবে।"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        comment = Comment.objects.create(
            session=session,
            author=request.user,
            content=serializer.validated_data["content"],
            parent=parent,
        )
        invalidate_session_cache(session.slug)
        return Response(
            CommentSerializer(comment, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class CommentDetailView(views.APIView):
    """Update or soft delete an individual comment."""

    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk, is_deleted=False)
        if comment.author != request.user:
            return Response({"detail": "আপনি শুধুমাত্র নিজের মন্তব্য সম্পাদনা করতে পারবেন।"}, status=status.HTTP_403_FORBIDDEN)

        content = request.data.get("content", "").strip()
        if not content:
            return Response({"detail": "মন্তব্যের বিষয়বস্তু খালি রাখা যাবে না।"}, status=status.HTTP_400_BAD_REQUEST)

        comment.content = content
        comment.edited_at = timezone.now()
        comment.save(update_fields=["content", "edited_at"])
        invalidate_session_cache(comment.session.slug)
        return Response(CommentSerializer(comment, context={"request": request}).data)

    def delete(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk, is_deleted=False)
        is_staff = request.user.role in (request.user.Role.ADMIN, request.user.Role.MODERATOR)
        if comment.author != request.user and not is_staff:
            return Response({"detail": "মন্তব্য মুছে ফেলার অনুমতি নেই।"}, status=status.HTTP_403_FORBIDDEN)

        comment.soft_delete()
        invalidate_session_cache(comment.session.slug)
        return Response({"detail": "মন্তব্যটি মুছে ফেলা হয়েছে।"}, status=status.HTTP_200_OK)


class CommentReportView(views.APIView):
    """Report an inappropriate comment for staff review."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk, is_deleted=False)
        reason = request.data.get("reason", "").strip()
        if not reason:
            return Response({"detail": "রিপোর্টের কারণ উল্লেখ করা আবশ্যক।"}, status=status.HTTP_400_BAD_REQUEST)

        report = CommentReport.objects.create(
            comment=comment,
            reporter=request.user,
            reason=reason,
        )
        return Response(
            {"detail": "মন্তব্যটি সফলভাবে রিপোর্ট করা হয়েছে। মডারেটর টিম পর্যালোচনা করবে।", "id": str(report.id)},
            status=status.HTTP_201_CREATED,
        )


class SessionNoteView(views.APIView):
    """Private note on a session (GET, PUT, DELETE)."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, slug):
        session = get_object_or_404(Session, slug=slug, is_deleted=False)
        note = SessionNote.objects.filter(user=request.user, session=session).first()
        if not note:
            return Response({"content": "", "exists": False}, status=status.HTTP_200_OK)
        return Response(SessionNoteSerializer(note).data)

    def put(self, request, slug):
        session = get_object_or_404(Session, slug=slug, is_deleted=False)
        content = request.data.get("content", "").strip()
        if not content:
            return Response({"detail": "নোট খালি রাখা যাবে না।"}, status=status.HTTP_400_BAD_REQUEST)

        note, created = SessionNote.objects.update_or_create(
            user=request.user,
            session=session,
            defaults={"content": content},
        )
        return Response(
            SessionNoteSerializer(note).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def delete(self, request, slug):
        session = get_object_or_404(Session, slug=slug, is_deleted=False)
        SessionNote.objects.filter(user=request.user, session=session).delete()
        return Response({"detail": "নোটটি মুছে ফেলা হয়েছে।"}, status=status.HTTP_200_OK)


class PersonalNoteViewSet(viewsets.ModelViewSet):
    """CRUD for private personal notes not tied to a post."""

    serializer_class = PersonalNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PersonalNote.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserDashboardActivityView(views.APIView):
    """Returns user engagement counts and activity metrics."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        likes_count = Like.objects.filter(user=user).count()
        bookmarks_count = Bookmark.objects.filter(user=user).count()
        comments_count = Comment.objects.filter(author=user, is_deleted=False).count()
        session_notes_count = SessionNote.objects.filter(user=user).count()
        personal_notes_count = PersonalNote.objects.filter(user=user).count()
        sessions_commented = (
            Comment.objects.filter(author=user, is_deleted=False).values("session_id").distinct().count()
        )

        data = {
            "likes_count": likes_count,
            "bookmarks_count": bookmarks_count,
            "comments_count": comments_count,
            "notes_count": session_notes_count + personal_notes_count,
            "sessions_commented_count": sessions_commented,
        }
        return Response(ActivitySummarySerializer(data).data)


class UserBookmarksListView(generics.ListAPIView):
    """List all sessions bookmarked by current user."""

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        from apps.community.serializers import SessionListSerializer
        return SessionListSerializer

    def get_queryset(self):
        return (
            Session.objects.filter(
                bookmarks__user=self.request.user,
                status=Session.Status.PUBLISHED,
                is_deleted=False,
            )
            .select_related("batch")
            .prefetch_related("tags")
            .order_by("-bookmarks__created_at")
        )


class UserNotesListView(views.APIView):
    """List all session notes and personal notes for current user."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        session_notes = SessionNote.objects.filter(user=request.user).select_related("session")
        personal_notes = PersonalNote.objects.filter(user=request.user)

        return Response(
            {
                "session_notes": SessionNoteSerializer(session_notes, many=True).data,
                "personal_notes": PersonalNoteSerializer(personal_notes, many=True).data,
            }
        )
