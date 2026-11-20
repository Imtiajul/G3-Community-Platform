import mimetypes
import os
import uuid
import boto3
from botocore.config import Config
from django.conf import settings
from rest_framework.exceptions import ValidationError

ALLOWED_MIME_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def generate_presigned_upload(
    user,
    filename: str,
    content_type: str,
    file_size: int,
) -> dict:
    """
    Validates file MIME type and file size, generates a unique storage key,
    and returns a presigned PUT URL and the final publicly-accessible file URL.
    """
    if content_type not in ALLOWED_MIME_TYPES:
        raise ValidationError(
            {"content_type": "শুধুমাত্র JPEG, PNG এবং WEBP ফরম্যাটের ছবি আপলোড করা যাবে।"}
        )

    if file_size > MAX_FILE_SIZE_BYTES:
        raise ValidationError(
            {"file_size": "ফাইলের আকার সর্বোচ্চ ৫ মেগাবাইট (5 MB) হতে পারবে।"}
        )

    ext = ALLOWED_MIME_TYPES[content_type]
    file_id = uuid.uuid4().hex
    user_prefix = str(user.id) if user and getattr(user, "id", None) else "guest"
    key = f"uploads/{user_prefix}/{file_id}{ext}"

    bucket_name = getattr(settings, "AWS_STORAGE_BUCKET_NAME", "community-media")
    endpoint_url = getattr(settings, "AWS_S3_ENDPOINT_URL", "")
    custom_domain = getattr(settings, "AWS_S3_CUSTOM_DOMAIN", "")
    access_key = getattr(settings, "AWS_ACCESS_KEY_ID", "")
    secret_key = getattr(settings, "AWS_SECRET_ACCESS_KEY", "")

    # Construct final public file URL
    if custom_domain:
        file_url = f"https://{custom_domain}/{key}"
    elif endpoint_url:
        file_url = f"{endpoint_url.rstrip('/')}/{bucket_name}/{key}"
    else:
        site_base = getattr(settings, "SITE_BASE_URL", "http://localhost:3000").rstrip("/")
        file_url = f"{site_base}/media/{key}"

    # Generate presigned URL via boto3 if credentials exist
    if access_key and secret_key and bucket_name:
        try:
            s3_client = boto3.client(
                "s3",
                endpoint_url=endpoint_url or None,
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
                config=Config(signature_version="s3v4"),
            )
            presigned_url = s3_client.generate_presigned_url(
                ClientMethod="put_object",
                Params={
                    "Bucket": bucket_name,
                    "Key": key,
                    "ContentType": content_type,
                },
                ExpiresIn=300,  # 5 minutes
            )
            return {
                "upload_url": presigned_url,
                "file_url": file_url,
                "key": key,
                "headers": {"Content-Type": content_type},
            }
        except Exception:
            pass

    # Fallback / mock presigned URL for local test environment
    mock_upload_url = f"https://s3.amazonaws.com/{bucket_name}/{key}?mock_presigned=true"
    return {
        "upload_url": mock_upload_url,
        "file_url": file_url,
        "key": key,
        "headers": {"Content-Type": content_type},
    }
