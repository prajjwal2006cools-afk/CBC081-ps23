"""Data preprocessing and augmentation pipeline."""
import io
from pathlib import Path
from typing import Union
import numpy as np
from PIL import Image, ImageOps
import tensorflow as tf
from crop_disease_ai.errors import ImageTooLargeError, InvalidImageError, UnsupportedInputError

ImageSource = Union[bytes, str, Path, Image.Image, np.ndarray]


def load_rgb_array(
    source: ImageSource,
    max_bytes: int = 10_485_760,
    max_pixels: int = 50_000_000,
    min_side_px: int = 64,
) -> np.ndarray:
    """Decodes image into uint8 numpy array of shape (H, W, 3)."""
    Image.MAX_IMAGE_PIXELS = max_pixels

    if isinstance(source, np.ndarray):
        if source.ndim != 3 or source.shape[2] != 3:
            raise UnsupportedInputError(f"Expected shape (H, W, 3), got {source.shape}")
        if source.dtype != np.uint8:
            if np.issubdtype(source.dtype, np.floating) and source.max() <= 255.0 and source.min() >= 0.0:
                return np.clip(source, 0, 255).astype(np.uint8)
            raise UnsupportedInputError(f"Unsupported numpy dtype: {source.dtype}")
        if min(source.shape[0], source.shape[1]) < min_side_px:
            raise InvalidImageError(f"Image side too small: {source.shape[:2]}")
        return source

    if isinstance(source, (str, Path)):
        p = Path(source)
        if not p.exists():
            raise InvalidImageError(f"File not found: {source}")
        source = p.read_bytes()

    if isinstance(source, bytes):
        if len(source) == 0:
            raise InvalidImageError("Zero-byte image payload")
        if len(source) > max_bytes:
            raise ImageTooLargeError(f"Image exceeds maximum size of {max_bytes} bytes")
        try:
            img = Image.open(io.BytesIO(source))
            img.load()
        except Exception as exc:
            raise InvalidImageError(f"Cannot decode image: {exc}") from exc
    elif isinstance(source, Image.Image):
        img = source
    else:
        raise UnsupportedInputError(f"Unsupported source type: {type(source)}")

    try:
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass

    if img.mode != "RGB":
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            canvas = Image.new("RGB", img.size, (255, 255, 255))
            canvas.paste(img, mask=img.convert("RGBA").split()[-1])
            img = canvas
        else:
            img = img.convert("RGB")

    w, h = img.size
    if min(w, h) < min_side_px:
        raise InvalidImageError(f"Image dimensions ({w}x{h}) smaller than min {min_side_px}px")

    arr = np.asarray(img, dtype=np.uint8)
    if np.var(arr) < 1e-3:
        raise InvalidImageError("Image is completely blank / zero-variance")

    return arr


def resize_to_model_input(
    array: np.ndarray,
    size: int = 224,
    mode: str = "squash",
) -> tf.Tensor:
    """Resizes decoded uint8 array into float32 (0-255) tensor of shape (size, size, 3)."""
    tensor = tf.convert_to_tensor(array, dtype=tf.float32)
    if mode == "center_crop":
        h, w = array.shape[0], array.shape[1]
        crop_size = min(h, w)
        tensor = tf.image.resize_with_crop_or_pad(tensor, crop_size, crop_size)
    resized = tf.image.resize(tensor, (size, size), method="bilinear", antialias=True)
    return resized


def get_augmentation_layer():
    """Builds augmentation pipeline for training only."""
    return tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal_and_vertical"),
        tf.keras.layers.RandomRotation(0.05),
        tf.keras.layers.RandomZoom(0.10),
        tf.keras.layers.RandomBrightness(0.15),
        tf.keras.layers.RandomContrast(0.15),
    ], name="data_augmentation")
