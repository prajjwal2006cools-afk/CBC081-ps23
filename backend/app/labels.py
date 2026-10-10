"""Turns a PlantVillage class name like 'Tomato___Late_blight' into readable parts."""
import re


def _clean(text: str) -> str:
    text = text.replace("_", " ")
    return re.sub(r"\s+", " ", text).strip(" ,")


def parse_label(label: str) -> dict:
    label = str(label)
    if "___" in label:
        crop_raw, disease_raw = label.split("___", 1)
    else:
        crop_raw, disease_raw = "", label

    crop = _clean(crop_raw) or "Unknown"
    disease = _clean(disease_raw) or "Unknown"
    lowered = label.lower()

    return {
        "crop": crop,
        "disease": disease,
        "is_healthy": disease.lower() == "healthy" or lowered.endswith("healthy"),
        "is_background": "background" in lowered,
    }
