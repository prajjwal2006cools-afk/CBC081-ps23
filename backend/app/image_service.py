"""Checks the uploaded file and turns it into a clean RGB image."""
import io
from PIL import Image, ImageOps
from app.config import settings
from app.errors import AppError

ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}
MIN_SIDE_PIXELS = 64

# Protects the server from "decompression bomb" images (tiny file, gigantic picture)
Image.MAX_IMAGE_PIXELS = 50_000_000


def load_image(data: bytes) -> Image.Image:
    if not data:
        raise AppError("EMPTY_FILE", "The file is empty. Please choose a photo.", 400)

    if len(data) > settings.max_upload_bytes:
        raise AppError(
            "FILE_TOO_LARGE",
            f"The photo is larger than {settings.max_upload_mb} MB. Please upload a smaller photo.",
            413,
        )

    try:
        img = Image.open(io.BytesIO(data))
        image_format = img.format
        img.load()  # really reads the pixels, so broken files fail here
    except Exception:
        raise AppError(
            "INVALID_IMAGE",
            "This file could not be read as an image. Please upload a JPG, PNG, or WebP photo.",
            400,
        )

    if image_format not in ALLOWED_FORMATS:
        raise AppError(
            "UNSUPPORTED_FORMAT",
            "This image type is not supported. Please upload a JPG, PNG, or WEBP photo.",
            415,
        )

    img = ImageOps.exif_transpose(img)  # fixes sideways phone photos
    if min(img.size) < MIN_SIDE_PIXELS:
        raise AppError(
            "IMAGE_TOO_SMALL",
            "The photo is too small to analyze. Please upload a clearer, larger photo.",
            400,
        )

    return img.convert("RGB")
