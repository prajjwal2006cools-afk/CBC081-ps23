"""Inference pipeline and CropDiseasePredictor class per specification Section 14.3."""
import json
import logging
from pathlib import Path
import threading
from typing import Any, List, Optional, Union
import numpy as np
from PIL import Image
import tensorflow as tf

from crop_disease_ai.errors import (
    ClassMappingError,
    InferenceError,
    ModelLoadError,
    ModelNotFoundError,
)
from crop_disease_ai.labels import load_class_names, parse_label
from crop_disease_ai.preprocessing import load_rgb_array, resize_to_model_input

logger = logging.getLogger("crop_disease_ai.inference")

ImageInput = Union[bytes, str, Path, Image.Image, np.ndarray]


class CropDiseasePredictor:
    def __init__(
        self,
        model: tf.keras.Model,
        class_names: List[str],
        config: Optional[dict] = None,
        model_filename: str = "crop_disease_model.keras",
    ):
        self._model = model
        self._class_names = class_names
        self._config = config or {}
        self._model_filename = model_filename
        self._lock = threading.Lock()

        inf_cfg = self._config.get("inference", {})
        self.default_confidence_threshold = float(inf_cfg.get("confidence_threshold", 0.70))
        self.default_min_margin = float(inf_cfg.get("min_margin", 0.10))
        self.default_top_k = int(inf_cfg.get("top_k", 3))
        self.threshold_calibrated = bool(inf_cfg.get("threshold_calibrated", False))
        self.image_size = int(self._config.get("image", {}).get("size", 224))
        self.resize_mode = self._config.get("image", {}).get("resize_mode", "squash")

    @property
    def class_names(self) -> List[str]:
        return list(self._class_names)

    @property
    def is_ready(self) -> bool:
        return self._model is not None and len(self._class_names) > 0

    @classmethod
    def load(
        cls,
        model_path: str | Path | None = None,
        class_names_path: str | Path | None = None,
        config_path: str | Path | None = None,
    ) -> "CropDiseasePredictor":
        """Loads and validates model + mapping. Raises ModelNotFoundError, ModelLoadError, ClassMappingError."""
        # Find model path
        root = Path(__file__).resolve().parent.parent.parent
        if model_path is None:
            # Check default locations
            candidates = [
                root / "artifacts" / "crop_disease_model.keras",
                root.parent / "backend" / "model" / "plant_disease_model.keras",
                root / "data" / "crop_disease_model.keras",
            ]
            for c in candidates:
                if c.exists():
                    model_path = c
                    break

        if model_path is None or not Path(model_path).exists():
            raise ModelNotFoundError(f"Model file not found at {model_path}")

        # Find class names path
        if class_names_path is None:
            candidates = [
                Path(model_path).parent / "class_names.json",
                root / "artifacts" / "class_names.json",
                root.parent / "backend" / "model" / "class_names.json",
            ]
            for c in candidates:
                if c.exists():
                    class_names_path = c
                    break

        if class_names_path is None or not Path(class_names_path).exists():
            raise ClassMappingError(f"class_names.json not found at {class_names_path}")

        # Load class names
        class_names = load_class_names(class_names_path)

        # Load model
        try:
            model = tf.keras.models.load_model(str(model_path), compile=False)
        except Exception as exc:
            raise ModelLoadError(f"Failed to load model from {model_path}: {exc}") from exc

        # Validate outputs match class count
        output_units = model.output_shape[-1]
        if output_units != len(class_names):
            raise ClassMappingError(
                f"Model output units ({output_units}) != number of classes ({len(class_names)})"
            )

        # Config
        cfg = {}
        if config_path and Path(config_path).exists():
            try:
                import yaml

                with open(config_path, "r", encoding="utf-8") as f:
                    cfg = yaml.safe_load(f) or {}
            except Exception:
                pass

        return cls(
            model=model,
            class_names=class_names,
            config=cfg,
            model_filename=Path(model_path).name,
        )

    def predict(
        self,
        image: ImageInput,
        top_k: int | None = None,
        confidence_threshold: float | None = None,
    ) -> dict[str, Any]:
        """Runs prediction per Section 11 & Section 14.4 specification."""
        k = top_k or self.default_top_k
        thresh = confidence_threshold or self.default_confidence_threshold
        margin_req = self.default_min_margin

        # Step 1: Decode
        arr = load_rgb_array(image)

        # Step 2: Resize
        resized = resize_to_model_input(arr, size=self.image_size, mode=self.resize_mode)

        # Step 3: Inference
        batch = tf.expand_dims(resized, axis=0)
        with self._lock:
            try:
                raw_out = self._model(batch, training=False).numpy()[0]
            except Exception as exc:
                raise InferenceError(f"Inference execution failed: {exc}") from exc

        # Step 4: Validate output
        if not np.all(np.isfinite(raw_out)) or len(raw_out) != len(self._class_names):
            raise InferenceError("Invalid or non-finite output from model")

        # Softmax normalize if needed
        probs = raw_out.astype(np.float64)
        if probs.min() < 0 or probs.max() > 1 or abs(probs.sum() - 1.0) > 0.01:
            e = np.exp(probs - probs.max())
            probs = e / e.sum()

        # Step 5: Compute top-k with deterministic tie-breaking
        sorted_indices = np.argsort(-probs, kind="stable")
        top_indices = sorted_indices[:k]

        top_k_list = []
        for idx in top_indices:
            cname = self._class_names[idx]
            info = parse_label(cname)
            top_k_list.append({
                "class_index": int(idx),
                "class_name": cname,
                "crop": info["crop"],
                "condition": info["disease"],
                "probability": round(float(probs[idx]), 4),
            })

        top1_idx = int(sorted_indices[0])
        top1_prob = float(probs[top1_idx])
        top2_prob = float(probs[sorted_indices[1]]) if len(sorted_indices) > 1 else 0.0
        margin = top1_prob - top2_prob

        # Step 6: Confidence decision rule (Section 12.1)
        is_confident = (top1_prob >= thresh) and (margin >= margin_req)

        top_info = parse_label(self._class_names[top1_idx])
        status = "confident" if is_confident else "uncertain"

        if is_confident:
            message = (
                "Model score exceeds the confidence threshold. "
                "This is an automated estimate, not a confirmed diagnosis. "
                "Confirm with an agronomist or extension officer."
            )
            return {
                "status": status,
                "predicted_class_index": top1_idx,
                "predicted_class": self._class_names[top1_idx],
                "crop": top_info["crop"],
                "condition": top_info["disease"],
                "is_healthy": top_info["is_healthy"],
                "display_label": top_info["display_label"],
                "confidence": round(top1_prob, 4),
                "confidence_threshold": thresh,
                "min_margin": margin_req,
                "threshold_calibrated": self.threshold_calibrated,
                "top_k": top_k_list,
                "message": message,
                "warnings": [],
                "model": {
                    "file": self._model_filename,
                    "num_classes": len(self._class_names),
                    "version": "1.0.0",
                },
            }
        else:
            message = (
                "The model cannot reliably classify this image. "
                "Please retake the photo with clear lighting, good focus on a single leaf, and a plain background."
            )
            return {
                "status": status,
                "predicted_class_index": None,
                "predicted_class": None,
                "crop": None,
                "condition": None,
                "is_healthy": None,
                "display_label": None,
                "confidence": round(top1_prob, 4),
                "confidence_threshold": thresh,
                "min_margin": margin_req,
                "threshold_calibrated": self.threshold_calibrated,
                "top_k": top_k_list,
                "message": message,
                "warnings": ["Low confidence or small margin between candidates."],
                "model": {
                    "file": self._model_filename,
                    "num_classes": len(self._class_names),
                    "version": "1.0.0",
                },
            }


_singleton_lock = threading.Lock()
_singleton_predictor: Optional[CropDiseasePredictor] = None


def get_predictor() -> CropDiseasePredictor:
    """Process-wide lazily created singleton; thread-safe initialisation."""
    global _singleton_predictor
    with _singleton_lock:
        if _singleton_predictor is None:
            _singleton_predictor = CropDiseasePredictor.load()
        return _singleton_predictor
