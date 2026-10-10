"""All settings live here. Values come from environment variables or the .env file."""
import os
from pathlib import Path
from dotenv import load_dotenv

# BASE_DIR is the backend/ folder. Using it means the server works
# no matter which folder you start it from.
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def _get_bool(name: str, default: bool) -> bool:
    return os.getenv(name, str(default)).strip().lower() in ("1", "true", "yes")


def _get_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, default))
    except ValueError:
        return float(default)


def _get_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except ValueError:
        return int(default)


def _get_list(name: str, default: str):
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


def _get_path(name: str, default: str) -> Path:
    val = os.getenv(name, default)
    path = Path(val)
    return path if path.is_absolute() else BASE_DIR / path


class Settings:
    def __init__(self):
        # --- AI model (from the AI teammate) ---
        self.model_dir = BASE_DIR / "model"
        self.model_path = _get_path("MODEL_PATH", "model/plant_disease_model.keras")
        self.model_path_is_explicit = "MODEL_PATH" in os.environ
        self.class_names_path = _get_path("CLASS_NAMES_PATH", "model/class_names.json")
        self.default_image_size = _get_int("DEFAULT_IMAGE_SIZE", 224)
        # 255 means "divide pixels by 255". Use 1 if the model already rescales inside itself
        self.pixel_scale = _get_float("PIXEL_SCALE", 1.0)
        self.top_k = _get_int("TOP_K", 3)
        self.allow_mock = _get_bool("ALLOW_MOCK", True)

        # --- Gemini ---
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
        self.gemini_timeout_seconds = _get_float("GEMINI_TIMEOUT_SECONDS", 15)

        # --- Web server ---
        self.cors_origins = _get_list(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
        )
        self.max_upload_mb = _get_int("MAX_UPLOAD_MB", 5)

        # --- Confidence levels ---
        self.high_confidence = 0.80
        self.medium_confidence = 0.50

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024


settings = Settings()
