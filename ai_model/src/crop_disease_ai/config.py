"""Configuration management for crop_disease_ai."""
import copy
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, Optional
import yaml


@dataclass
class DataConfig:
    plantvillage_dir: str = "data/plantvillage"
    plantdoc_dir: Optional[str] = "data/plantdoc"
    plantdoc_class_map: Optional[str] = "data/plantdoc/plantdoc_class_map.json"
    min_images_per_class: int = 20
    min_side_px: int = 64
    max_image_bytes: int = 10485760
    max_pixels: int = 50000000
    split: Dict[str, float] = field(default_factory=lambda: {"train": 0.70, "val": 0.15, "test": 0.15})
    output_dir: str = "artifacts"
    group_regex: str = r"(_flipTB|_flipLR|_90deg|_180deg|_270deg|_newGRR|_Scaled|__\d+)"
    near_duplicate_hash: bool = False


@dataclass
class ImageConfig:
    size: int = 224
    resize_mode: str = "squash"


@dataclass
class ModelConfig:
    dropout: float = 0.2
    imagenet_weights_path: Optional[str] = None


@dataclass
class TrainingConfig:
    batch_size: int = 32
    epochs_head: int = 5
    epochs_finetune: int = 5
    learning_rate_head: float = 0.001
    learning_rate_finetune: float = 0.00001
    fine_tune_layers: int = 30
    use_class_weights: bool = False
    early_stopping_patience: int = 3
    deterministic: bool = False
    max_train_samples: Optional[int] = None
    mixed_precision: bool = False


@dataclass
class InferenceConfig:
    confidence_threshold: float = 0.70
    min_margin: float = 0.10
    top_k: int = 3
    threshold_calibrated: bool = False


@dataclass
class AppConfig:
    seed: int = 42
    data: DataConfig = field(default_factory=DataConfig)
    image: ImageConfig = field(default_factory=ImageConfig)
    model: ModelConfig = field(default_factory=ModelConfig)
    training: TrainingConfig = field(default_factory=TrainingConfig)
    inference: InferenceConfig = field(default_factory=InferenceConfig)


def load_config(path: str | Path, overrides: Optional[Dict[str, Any]] = None) -> AppConfig:
    path = Path(path)
    raw = {}
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            raw = yaml.safe_load(f) or {}

    cfg = AppConfig(
        seed=raw.get("seed", 42),
        data=DataConfig(**raw.get("data", {})),
        image=ImageConfig(**raw.get("image", {})),
        model=ModelConfig(**raw.get("model", {})),
        training=TrainingConfig(**raw.get("training", {})),
        inference=InferenceConfig(**raw.get("inference", {})),
    )

    if overrides:
        for k, v in overrides.items():
            parts = k.split(".")
            target = cfg
            for part in parts[:-1]:
                target = getattr(target, part)
            setattr(target, parts[-1], v)

    return cfg
