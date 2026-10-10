"""Dataset discovery, validation, grouping, and split generation."""
import hashlib
import json
from pathlib import Path
import re
from typing import Dict, List, Tuple
import numpy as np
import pandas as pd
from PIL import Image
from sklearn.model_selection import StratifiedGroupKFold

from crop_disease_ai.errors import DatasetNotFoundError, DatasetValidationError


def compute_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def validate_and_build_manifest(
    data_dir: str | Path,
    min_images_per_class: int = 20,
    min_side_px: int = 64,
    max_bytes: int = 10_485_760,
    group_regex: str = r"(_flipTB|_flipLR|_90deg|_180deg|_270deg|_newGRR|_Scaled|__\d+)",
) -> Tuple[pd.DataFrame, dict]:
    """Validates images, groups near-duplicates, and outputs manifest and data report."""
    root = Path(data_dir)
    if not root.exists():
        raise DatasetNotFoundError(f"PlantVillage directory not found at: {root}")

    class_dirs = sorted([d for d in root.iterdir() if d.is_dir() and not d.name.startswith(".")])
    if not class_dirs:
        raise DatasetValidationError(f"No class folders found in {root}")

    records = []
    class_counts: Dict[str, int] = {}
    invalid_files: List[dict] = []
    sha_map: Dict[str, str] = {}  # sha -> group_id

    for class_idx, cdir in enumerate(class_dirs):
        cname = cdir.name
        img_files = [f for f in cdir.iterdir() if f.is_file() and f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")]
        class_counts[cname] = len(img_files)

        if len(img_files) < min_images_per_class:
            logger_msg = f"Class {cname} has only {len(img_files)} images (< {min_images_per_class})"

        for fpath in img_files:
            valid = True
            reason = None
            sha = ""
            try:
                if fpath.stat().st_size > max_bytes:
                    valid = False
                    reason = "FILE_TOO_LARGE"
                elif fpath.stat().st_size == 0:
                    valid = False
                    reason = "EMPTY_FILE"
                else:
                    sha = compute_sha256(fpath)
                    with Image.open(fpath) as img:
                        img.verify()
                    with Image.open(fpath) as img:
                        w, h = img.size
                        if min(w, h) < min_side_px:
                            valid = False
                            reason = "IMAGE_TOO_SMALL"
            except Exception as e:
                valid = False
                reason = f"CORRUPT: {e}"

            if not valid:
                invalid_files.append({"path": str(fpath), "reason": reason})
                continue

            stem = fpath.stem
            base_name = re.sub(group_regex, "", stem)
            group_id = sha_map.setdefault(sha, f"{cname}_{base_name}")

            records.append({
                "path": str(fpath.resolve()),
                "class_name": cname,
                "class_index": class_idx,
                "sha256": sha,
                "group_id": group_id,
                "valid": valid,
            })

    df = pd.DataFrame(records)
    if df.empty:
        raise DatasetValidationError("No valid images found after dataset validation.")

    counts = list(class_counts.values())
    imbalance_ratio = max(counts) / max(min(counts), 1)

    report = {
        "num_classes": len(class_dirs),
        "total_valid_images": len(df),
        "total_invalid_files": len(invalid_files),
        "imbalance_ratio": round(imbalance_ratio, 2),
        "class_counts": class_counts,
        "unique_groups": int(df["group_id"].nunique()),
    }
    return df, report


def create_splits(
    manifest_df: pd.DataFrame,
    seed: int = 42,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
) -> pd.DataFrame:
    """Produces group-aware stratified splits with zero leakage."""
    df = manifest_df.copy()
    groups = df["group_id"].values
    y = df["class_index"].values
    X = np.zeros(len(df))

    # 10 folds gives 70/15/15 roughly with fold slicing (7 train, 1-2 val, 1-2 test)
    sgkf = StratifiedGroupKFold(n_splits=10, shuffle=True, random_state=seed)
    folds = list(sgkf.split(X, y, groups))

    val_fold = 0
    test_fold = 1

    df["split"] = "train"
    for train_idx, val_idx in [folds[val_fold]]:
        df.iloc[val_idx, df.columns.get_loc("split")] = "val"
    for train_idx, test_idx in [folds[test_fold]]:
        df.iloc[test_idx, df.columns.get_loc("split")] = "test"

    # Verify zero group leakage
    train_groups = set(df[df["split"] == "train"]["group_id"])
    val_groups = set(df[df["split"] == "val"]["group_id"])
    test_groups = set(df[df["split"] == "test"]["group_id"])

    assert len(train_groups.intersection(val_groups)) == 0, "Group leakage detected between train and val"
    assert len(train_groups.intersection(test_groups)) == 0, "Group leakage detected between train and test"
    assert len(val_groups.intersection(test_groups)) == 0, "Group leakage detected between val and test"

    return df
