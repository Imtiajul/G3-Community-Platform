from django.core.management.base import BaseCommand
from apps.accounts.models import User


class Command(BaseCommand):
    help = "Creates or updates an admin superuser non-interactively or with flags."

    def add_arguments(self, parser):
        parser.add_argument("--email", type=str, default="admin@nijerbolarmotogolpo.com", help="Admin email address")
        parser.add_argument("--password", type=str, default="AdminSecretPass123!", help="Admin password")
        parser.add_argument("--first-name", type=str, default="এডমিন", help="Admin first name")
        parser.add_argument("--last-name", type=str, default="ব্যবহারকারী", help="Admin last name")

    def handle(self, *args, **options):
        email = options["email"].strip().lower()
        password = options["password"]
        first_name = options["first_name"]
        last_name = options["last_name"]

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": first_name,
                "last_name": last_name,
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "email_verified": True,
                "verification_status": User.VerificationStatus.VERIFIED,
            },
        )

        user.set_password(password)
        user.role = User.Role.ADMIN
        user.is_staff = True
        user.is_superuser = True
        user.email_verified = True
        user.verification_status = User.VerificationStatus.VERIFIED
        user.first_name = first_name
        user.last_name = last_name
        user.save()

        action = "সফলভাবে তৈরি করা হয়েছে" if created else "সফলভাবে আপডেট করা হয়েছে"
        self.stdout.write(
            self.style.SUCCESS(
                f"এডমিন ইউজার [{email}] {action}। পাসওয়ার্ড: {password}"
            )
        )
