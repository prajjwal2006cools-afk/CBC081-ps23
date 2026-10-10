"""Loads the Keras model from the AI teammate and makes predictions with it."""
import json
import logging
import threading
from pathlib import Path
from typing import List, Optional
import numpy as np
from PIL import Image
from app.config import settings
from app.errors import AppError

logger = logging.getLogger("backend.model")


# ---------- small pure helper functions (easy to test, no TensorFlow needed) ----------
def read_class_names(path: Path) -> List[str]:
    """class_names.json can be a list ["A","B"] or a dict {"0":"A","1":"B"} or object with 'class_names' key."""
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if isinstance(data, dict):
        if "class_names" in data and isinstance(data["class_names"], list):
            data = data["class_names"]
        else:
            data = [name for _, name in sorted(data.items(), key=lambda item: int(item[0]) if item[0].isdigit() else item[0])]
    if not isinstance(data, list) or not data or not all(isinstance(x, str) for x in data):
        raise ValueError("class_names.json must be a non-empty list of class-names")
    return data


def preprocess(image: Image.Image, size, pixel_scale: float) -> np.ndarray:
    """size is (width, height). Returns an array shaped (1, height, width, 3)."""
    img = image.convert("RGB").resize(size, Image.BILINEAR)
    arr = np.asarray(img, dtype="float32")
    if pixel_scale and pixel_scale != 1:
        arr = arr / float(pixel_scale)
    return np.expand_dims(arr, axis=0)


def to_probabilities(raw) -> np.ndarray:
    """If the model gave raw scores (logits), turn them into probabilities."""
    p = np.asarray(raw, dtype="float64").reshape(-1)
    if p.min() < 0 or p.max() > 1 or abs(p.sum() - 1.0) > 0.01:
        e = np.exp(p - p.max())
        p = e / e.sum()
    return p


def top_k(probs: np.ndarray, class_names: List[str], k: int) -> List[dict]:
    order = np.argsort(probs)[::-1][:k]
    return [{"label": class_names[int(i)], "confidence": float(probs[int(i)])} for i in order]


# ---------- the service ----------
class ModelService:
    def __init__(self):
        self.model = None
        self.class_names: List[str] = []
        self.input_size = (settings.default_image_size, settings.default_image_size)
        self.load_error: Optional[str] = None
        self._lock = threading.Lock()

    @property
    def is_loaded(self) -> bool:
        return self.model is not None

    def _find_model_file(self) -> Optional[Path]:
        if settings.model_path.exists():
            return settings.model_path
        if settings.model_path_is_explicit:
            return None  # the team set an exact path, so do not guess
        for pattern in ("*.keras", "*.h5"):
            found = sorted(settings.model_dir.glob(pattern))
            if found:
                return found[0]
        return None

    def load(self) -> None:
        """Called once when the server starts. Never crashes the server."""
        self.model = None
        self.load_error = None
        try:
            model_file = self._find_model_file()
            if model_file is None:
                raise FileNotFoundError(
                    f"No model file found. Put a .keras or .h5 file in {settings.model_dir}"
                )
            if not settings.class_names_path.exists():
                raise FileNotFoundError(f"class_names.json not found at {settings.class_names_path}")

            class_names = read_class_names(settings.class_names_path)

            import tensorflow as tf  # imported here so the server can start even without TF

            model = tf.keras.models.load_model(str(model_file), compile=False)

            output_shape = model.output_shape
            if isinstance(output_shape, list):
                output_shape = output_shape[0]
            if output_shape[-1] != len(class_names):
                raise ValueError(
                    f"Model has {output_shape[-1]} outputs but class_names.json has "
                    f"{len(class_names)} names. They must match."
                )

            input_shape = model.input_shape
            if isinstance(input_shape, list):
                input_shape = input_shape[0]
            if len(input_shape) == 4 and input_shape[1] and input_shape[2]:
                self.input_size = (int(input_shape[2]), int(input_shape[1]))

            # Warm-up: the first prediction is slow, so do it now
            warm = np.zeros((1, self.input_size[1], self.input_size[0], 3), dtype="float32")
            model.predict(warm, verbose=0)

            self.class_names = class_names
            self.model = model
            logger.info(
                "Model loaded: %s | input size %s | %d classes",
                model_file.name,
                self.input_size,
                len(class_names),
            )
        except Exception as exc:  # noqa: BLE001 - catch everything cleanly
            self.model = None
            self.load_error = f"{type(exc).__name__}: {exc}"
            logger.error("Model NOT loaded: %s", self.load_error)

    def predict(self, image: Image.Image) -> List[dict]:
        if not self.is_loaded:
            raise AppError("MODEL_NOT_LOADED", "The disease model is not available.", 503)
        arr = preprocess(image, self.input_size, settings.pixel_scale)
        with self._lock:  # one prediction at a time keeps Keras safe
            raw = self.model.predict(arr, verbose=0)[0]
        return top_k(to_probabilities(raw), self.class_names, settings.top_k)

    @staticmethod
    def mock_predict() -> List[dict]:
        """FAKE results so the frontend can be built before the real model exists."""
        return [
            {"label": "Tomato___Late_blight", "confidence": 0.87},
            {"label": "Tomato___Early_blight", "confidence": 0.08},
            {"label": "Tomato___healthy", "confidence": 0.03},
        ]


model_service = ModelService()
