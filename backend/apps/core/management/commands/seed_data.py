import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User, MemberRoster, VerificationRequest
from apps.community.models import Batch, Tag, Session, SessionTag
from apps.interactions.models import Like, Bookmark, Comment, SessionNote, PersonalNote
from apps.announcements.models import Announcement


class Command(BaseCommand):
    help = "Seeds the database with comprehensive sample data for development and demonstration."

    def handle(self, *args, **options):
        self.stdout.write("ডেটাবেজে ডেমো ডেটা যোগ করা শুরু হচ্ছে...")

        # 1. Batches
        batch1, _ = Batch.objects.get_or_create(
            number=1,
            defaults={"name": "ব্যাচ ১ - উদ্যোক্তা তৈরি ও নৈতিক শিক্ষা", "start_date": "2024-01-01"},
        )
        batch2, _ = Batch.objects.get_or_create(
            number=2,
            defaults={"name": "ব্যাচ ২ - লিডারশিপ ও ব্যবসা উন্নয়ন", "start_date": "2024-06-01"},
        )
        batch16, _ = Batch.objects.get_or_create(
            number=16,
            defaults={"name": "ব্যাচ ১৬ - বিজনেস গ্রোথ ও স্কেলিং", "start_date": "2025-01-01"},
        )
        self.stdout.write(self.style.SUCCESS("✓ ব্যাচসমূহ সফলভাবে নিশ্চিত করা হয়েছে।"))

        # 2. Tags
        tags_data = [
            ("উদ্যোক্তা", "#2563eb"),
            ("নৈতিকতা", "#16a34a"),
            ("লিডারশিপ", "#9333ea"),
            ("সেলস ও মার্কেটিং", "#ea580c"),
            ("মাইন্ডসেট", "#0891b2"),
        ]
        created_tags = {}
        for name, color in tags_data:
            tag, _ = Tag.objects.get_or_create(name=name, defaults={"color": color})
            created_tags[name] = tag
        self.stdout.write(self.style.SUCCESS("✓ ট্যাগসমূহ সফলভাবে তৈরি করা হয়েছে।"))

        # 3. Users
        # Admin
        admin, _ = User.objects.get_or_create(
            email="admin@nijerbolarmotogolpo.com",
            defaults={
                "first_name": "ইকবাল",
                "last_name": "বাহার",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "email_verified": True,
                "verification_status": User.VerificationStatus.VERIFIED,
                "batch": batch1,
                "registration_no": "ADM-001",
            },
        )
        admin.set_password("AdminSecretPass123!")
        admin.save()

        # Moderator
        moderator, _ = User.objects.get_or_create(
            email="moderator@nijerbolarmotogolpo.com",
            defaults={
                "first_name": "রাকিব",
                "last_name": "হাসান",
                "role": User.Role.MODERATOR,
                "is_staff": True,
                "email_verified": True,
                "verification_status": User.VerificationStatus.VERIFIED,
                "batch": batch1,
                "registration_no": "MOD-101",
            },
        )
        moderator.set_password("ModSecretPass123!")
        moderator.save()

        # Verified Member
        verified_member, _ = User.objects.get_or_create(
            email="member@nijerbolarmotogolpo.com",
            defaults={
                "first_name": "আরিফুল",
                "last_name": "ইসলাম",
                "role": User.Role.MEMBER,
                "email_verified": True,
                "verification_status": User.VerificationStatus.VERIFIED,
                "batch": batch1,
                "registration_no": "REG-1001",
            },
        )
        verified_member.set_password("MemberPass123!")
        verified_member.save()

        # Pending Member
        pending_member, _ = User.objects.get_or_create(
            email="pending@nijerbolarmotogolpo.com",
            defaults={
                "first_name": "তানভীর",
                "last_name": "আহমেদ",
                "role": User.Role.MEMBER,
                "email_verified": True,
                "verification_status": User.VerificationStatus.PENDING,
                "batch": batch2,
                "registration_no": "REG-2005",
            },
        )
        pending_member.set_password("PendingPass123!")
        pending_member.save()

        # Unverified Member
        unverified_member, _ = User.objects.get_or_create(
            email="unverified@nijerbolarmotogolpo.com",
            defaults={
                "first_name": "সাব্বির",
                "last_name": "রহমান",
                "role": User.Role.MEMBER,
                "email_verified": False,
                "verification_status": User.VerificationStatus.UNVERIFIED,
            },
        )
        unverified_member.set_password("UnverifiedPass123!")
        unverified_member.save()
        self.stdout.write(self.style.SUCCESS("✓ ব্যবহারকারীগণ সফলভাবে নিশ্চিত করা হয়েছে।"))

        # 4. Member Roster Entries
        MemberRoster.objects.get_or_create(
            batch=batch1,
            registration_no="REG-1001",
            defaults={"full_name": "আরিফুল ইসলাম", "is_claimed": True},
        )
        MemberRoster.objects.get_or_create(
            batch=batch2,
            registration_no="REG-2005",
            defaults={"full_name": "তানভীর আহমেদ", "is_claimed": False},
        )
        MemberRoster.objects.get_or_create(
            batch=batch16,
            registration_no="REG-16010",
            defaults={"full_name": "নাসির উদ্দিন", "is_claimed": False},
        )

        # Pending verification request for pending member
        VerificationRequest.objects.get_or_create(
            user=pending_member,
            batch=batch2,
            registration_no="REG-2005",
            defaults={"status": VerificationRequest.Status.PENDING},
        )
        self.stdout.write(self.style.SUCCESS("✓ মেম্বার রোস্টার ও ভেরিফিকেশন রিকোয়েস্ট তৈরি করা হয়েছে।"))

        # 5. Sessions
        # Session 1: Published & Featured
        sess1, _ = Session.objects.get_or_create(
            batch=batch1,
            session_number=1,
            defaults={
                "title": "দিন ১: ভালো মানুষ হওয়া কেন সবচেয়ে জরুরি?",
                "content": (
                    "### উদ্যোক্তা হওয়ার প্রথম শর্ত ভালো মানুষ হওয়া\n\n"
                    "নিজের বলার মতো একটা গল্প ফাউন্ডেশনের মূল ভিত্তি হলো সততা ও নৈতিকতা। "
                    "ব্যবসা করার আগে আপনাকে একজন ভালো মানুষ হতে হবে। কোনো অসদুপায় অবলম্বন করে সাময়িক লাভ হলেও দীর্ঘমেয়াদে টিকে থাকা যায় না।\n\n"
                    "#### ৩টি মূল শিক্ষা:\n"
                    "1. কথার দাম রাখা।\n"
                    "2. মানুষের বিশ্বাস অর্জন করা।\n"
                    "3. প্রতিদিন অন্তত একটি ভালো কাজ করা।\n\n"
                    "> \"সততাই সর্বোৎকৃষ্ট পন্থা নয়, সততাই একমাত্র পন্থা।\""
                ),
                "author": admin,
                "status": Session.Status.PUBLISHED,
                "visibility": Session.Visibility.PUBLIC,
                "is_featured": True,
                "cover_image_url": "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
                "seo_title": "ভালো মানুষ হওয়ার গুরুত্ব - সেশন ১",
                "seo_description": "উদ্যোক্তা জীবনের প্রথম সেশনে জানুন কেন সততা ও নৈতিকতা ব্যবসার মূল ভিত্তি।",
                "published_at": timezone.now() - datetime.timedelta(days=2),
                "date": (timezone.now() - datetime.timedelta(days=2)).date(),
            },
        )
        sess1.tags.add(created_tags["উদ্যোক্তা"], created_tags["নৈতিকতা"])

        # Session 2: Published
        sess2, _ = Session.objects.get_or_create(
            batch=batch1,
            session_number=2,
            defaults={
                "title": "দিন ২: আইডিয়া বড় নয়, বাস্তবায়নের সাহসই সব",
                "content": (
                    "### আইডিয়া সবার মাথায় থাকে, কাজ করে ক'জন?\n\n"
                    "প্রতিদিন হাজারো মানুষ নতুন নতুন আইডিয়া ভাবে। কিন্তু সফল হয় কেবল তারাই যারা সেই আইডিয়াকে মাঠে নামানোর সাহস দেখায়।\n\n"
                    "ছোট আকারে শুরু করুন, ভুল থেকে শিখুন এবং ধৈর্য ধরুন।"
                ),
                "author": moderator,
                "status": Session.Status.PUBLISHED,
                "visibility": Session.Visibility.PUBLIC,
                "cover_image_url": "https://images.unsplash.com/photo-1552664730-d307ca884978",
                "published_at": timezone.now() - datetime.timedelta(days=1),
                "date": (timezone.now() - datetime.timedelta(days=1)).date(),
            },
        )
        sess2.tags.add(created_tags["উদ্যোক্তা"], created_tags["মাইন্ডসেট"])

        # Session 3: Scheduled for tomorrow
        Session.objects.get_or_create(
            batch=batch1,
            session_number=3,
            defaults={
                "title": "দিন ৩: কাস্টমার রিলেশনশিপ ও যোগাযোগের দক্ষতা",
                "content": (
                    "### গ্রাহকের সন্তুষ্টিই ব্যবসার মূল চাবিকাঠি\n\n"
                    "গ্রাহকের সাথে সুন্দর ব্যবহার ও নিয়মিত যোগাযোগ আপনার পণ্য বা সেবাকে অনন্য করে তোলে।"
                ),
                "author": admin,
                "status": Session.Status.SCHEDULED,
                "scheduled_at": timezone.now() + datetime.timedelta(days=1),
                "visibility": Session.Visibility.PUBLIC,
                "date": (timezone.now() + datetime.timedelta(days=1)).date(),
            },
        )

        # Session 4: Draft
        Session.objects.get_or_create(
            batch=batch2,
            session_number=1,
            defaults={
                "title": "লিডারশিপ সেশন ১: একজন নেতা কীভাবে দল পরিচালনা করেন?",
                "content": "খসড়া বিষয়বস্তু...",
                "author": moderator,
                "status": Session.Status.DRAFT,
                "visibility": Session.Visibility.PUBLIC,
            },
        )
        self.stdout.write(self.style.SUCCESS("✓ সেশনসমূহ সফলভাবে তৈরি করা হয়েছে।"))

        # 6. Interactions (Likes, Bookmarks, Comments, Notes)
        Like.objects.get_or_create(user=verified_member, session=sess1)
        Like.objects.get_or_create(user=moderator, session=sess1)
        Bookmark.objects.get_or_create(user=verified_member, session=sess1)

        c1, _ = Comment.objects.get_or_create(
            session=sess1,
            author=verified_member,
            defaults={"content": "অসাধারণ একটি অনুপ্রেরণাদায়ক সেশন! অনেক কিছু শিখতে পারলাম।"},
        )
        Comment.objects.get_or_create(
            session=sess1,
            author=admin,
            parent=c1,
            defaults={"content": "ধন্যবাদ আরিফুল। নিয়মিত চর্চা অব্যাহত রাখুন।"},
        )

        SessionNote.objects.get_or_create(
            user=verified_member,
            session=sess1,
            defaults={"content": "আমার ব্যক্তিগত নোট: সবসময় সততা বজায় রেখে কাস্টমারের সাথে কথা বলতে হবে।"},
        )
        PersonalNote.objects.get_or_create(
            user=verified_member,
            defaults={"content": "লক্ষ্য: আগামী ৩ মাসের মধ্যে নতুন ব্যবসা শুরু করার পরিকল্পনা চূড়ান্ত করা।"},
        )
        self.stdout.write(self.style.SUCCESS("✓ ইন্টারঅ্যাকশন ও নোটস তৈরি করা হয়েছে।"))

        # 7. Announcements
        Announcement.objects.get_or_create(
            title="ব্যাচ ১৬ এর ওরিয়েন্টেশন ক্লাস আগামী শুক্রবার!",
            defaults={
                "content": "সকল নিবন্ধিত শিক্ষার্থীদের যথাসময়ে অনলাইন প্ল্যাটফর্মে যুক্ত হতে আহ্বান জানানো হচ্ছে।",
                "link": "https://nijerbolarmotogolpo.com/live",
                "is_focused": True,
                "starts_at": timezone.now() - datetime.timedelta(days=1),
                "ends_at": timezone.now() + datetime.timedelta(days=7),
                "is_active": True,
                "priority": 10,
                "created_by": admin,
            },
        )
        Announcement.objects.get_or_create(
            title="নতুন মোবাইল অ্যাপ খুব শীঘ্রই উন্মোচন করা হচ্ছে",
            defaults={
                "content": "এখন থেকে নিজের বলার মতো গল্পের সকল সেশন পড়তে পারবেন আমাদের মোবাইল অ্যাপ্লিকেশনে।",
                "is_focused": False,
                "starts_at": timezone.now() - datetime.timedelta(days=2),
                "ends_at": timezone.now() + datetime.timedelta(days=14),
                "is_active": True,
                "priority": 5,
                "created_by": moderator,
            },
        )
        self.stdout.write(self.style.SUCCESS("✓ নোটিশ ও ঘোষণা তৈরি করা হয়েছে।"))

        self.stdout.write(self.style.SUCCESS("\n🎉 সকল ডেমো ডেটা সফলভাবে ডেটাবেজে সংরক্ষিত হয়েছে!"))
        self.stdout.write("লগইন ক্রেডেনশিয়াল:")
        self.stdout.write("  - এডমিন: admin@nijerbolarmotogolpo.com / AdminSecretPass123!")
        self.stdout.write("  - মডারেটর: moderator@nijerbolarmotogolpo.com / ModSecretPass123!")
        self.stdout.write("  - ভেরিফাইড সদস্য: member@nijerbolarmotogolpo.com / MemberPass123!")
        self.stdout.write("  - অপেক্ষমাণ সদস্য: pending@nijerbolarmotogolpo.com / PendingPass123!")
