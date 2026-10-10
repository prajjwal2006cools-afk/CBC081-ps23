"""Model export and verification per Section 10.3."""
import json
from pathlib import Path
from typing import List
import numpy as np
import tensorflow as tf
from crop_disease_ai.labels import save_class_names


def export_and_verify(
    model: tf.keras.Model,
    class_names: List[str],
    output_dir: str | Path,
    model_name: str = "crop_disease_model.keras",
) -> Path:
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)

    # 1. Save class_names.json
    save_class_names(class_names, out / "class_names.json")

    # 2. Save Keras model
    model_path = out / model_name
    model.save(str(model_path))

    # 3. Export verification (§10.3)
    reloaded = tf.keras.models.load_model(str(model_path), compile=False)
    dummy_input = np.ones((1, 224, 224, 3), dtype="float32") * 128.0

    orig_out = model(dummy_input, training=False).numpy()
    reload_out = reloaded(dummy_input, training=False).numpy()

    assert reload_out.shape == (1, len(class_names)), f"Expected shape (1, {len(class_names)}), got {reload_out.shape}"
    assert np.all(np.isfinite(reload_out)), "Reloaded output has non-finite values"
    assert abs(np.sum(reload_out) - 1.0) < 1e-3, f"Output sum {np.sum(reload_out)} not within 1e-3 of 1.0"
    assert np.allclose(orig_out, reload_out, atol=1e-5), "Reloaded output doesn't match original model output"

    return model_path
