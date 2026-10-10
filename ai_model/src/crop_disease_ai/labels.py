"""Class labels mapping and parsing utilities."""
import datetime
import json
from pathlib import Path
import re
from typing import Dict, List, Optional
from crop_disease_ai.errors import ClassMappingError


def parse_label(label: str) -> dict:
    """Parses a PlantVillage label into readable crop and condition."""
    label = str(label)
    if "___" in label:
        crop_raw, disease_raw = label.split("___", 1)
    else:
        crop_raw, disease_raw = "", label

    crop = re.sub(r"\s+", " ", crop_raw.replace("_", " ")).strip(" ,") or "Unknown"
    disease = re.sub(r"\s+", " ", disease_raw.replace("_", " ")).strip(" ,") or "Unknown"
    lowered = disease.lower()

    return {
        "crop": crop,
        "disease": disease,
        "is_healthy": lowered == "healthy" or lowered.endswith("healthy"),
        "display_label": f"{crop} — {disease}",
    }


def save_class_names(class_names: List[str], path: str | Path, input_size=(224, 224)) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    sorted_names = sorted(class_names)
    data = {
        "schema_version": 1,
        "num_classes": len(sorted_names),
        "input_size": list(input_size),
        "class_names": sorted_names,
        "index_to_class": {str(i): name for i, name in enumerate(sorted_names)},
        "created_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "dataset": "PlantVillage",
        "source": "sorted class folder names",
    }
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def load_class_names(path: str | Path) -> List[str]:
    path = Path(path)
    if not path.exists():
        raise ClassMappingError(f"Class names file not found: {path}")
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            if "class_names" in data and isinstance(data["class_names"], list):
                return data["class_names"]
            return [name for _, name in sorted(data.items(), key=lambda x: int(x[0]) if x[0].isdigit() else x[0])]
        raise ValueError("Invalid format")
    except Exception as exc:
        raise ClassMappingError(f"Failed to load class mapping: {exc}") from exc
