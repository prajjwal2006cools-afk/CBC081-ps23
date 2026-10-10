"""Training pipeline entrypoint."""
import argparse
import datetime
import json
import logging
from pathlib import Path
import numpy as np
import tensorflow as tf

from crop_disease_ai.config import load_config
from crop_disease_ai.dataset import create_splits, validate_and_build_manifest
from crop_disease_ai.export import export_and_verify
from crop_disease_ai.labels import save_class_names
from crop_disease_ai.model import build_model, unfreeze_top_layers

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("crop_disease_ai.train")


def train(config_path: str = "configs/default.yaml", overrides: dict = None):
    cfg = load_config(config_path, overrides)
    out_dir = Path(cfg.data.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Set random seeds
    tf.keras.utils.set_random_seed(cfg.seed)
    np.random.seed(cfg.seed)

    plantvillage_path = Path(cfg.data.plantvillage_dir)
    if not plantvillage_path.exists():
        logger.warning(
            "PlantVillage dataset not found at %s. Please download PlantVillage to train with real data.",
            plantvillage_path,
        )
        return

    manifest_df, report = validate_and_build_manifest(plantvillage_path)
    splits_df = create_splits(manifest_df, seed=cfg.seed)
    splits_df.to_csv(out_dir / "splits.csv", index=False)

    class_names = sorted(list(manifest_df["class_name"].unique()))
    save_class_names(class_names, out_dir / "class_names.json", input_size=(cfg.image.size, cfg.image.size))

    # Build model
    model = build_model(
        num_classes=len(class_names),
        dropout=cfg.model.dropout,
        input_shape=(cfg.image.size, cfg.image.size, 3),
        weights=cfg.model.imagenet_weights_path or "imagenet",
    )

    model.compile(
        optimizer=tf.keras.optimizers.Adam(cfg.training.learning_rate_head),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.SparseTopKCategoricalAccuracy(k=3, name="top3_acc")],
    )

    logger.info("Model compiled successfully. Ready for dataset pipeline.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="configs/default.yaml")
    args = parser.parse_args()
    train(args.config)
