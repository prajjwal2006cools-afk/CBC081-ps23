"""The main workflow: image -> model -> Gemini explanation -> one clean result."""
from PIL import Image
from app.config import settings
from app.errors import AppError
from app.gemini_service import get_guidance
from app.labels import parse_label
from app.model_service import model_service

DISCLAIMER = (
    "This is an AI-generated suggestion, not a confirmed diagnosis. "
    "Please confirm with a local agricultural expert before using any chemical or treatment."
)


def confidence_level(confidence: float) -> str:
    if confidence >= settings.high_confidence:
        return "high"
    if confidence >= settings.medium_confidence:
        return "medium"
    return "low"


def _enrich(prediction: dict) -> dict:
    parts = parse_label(prediction["label"])
    return {
        "label": prediction["label"],
        "crop": parts["crop"],
        "disease": parts["disease"],
        "is_healthy": parts["is_healthy"],
        "is_background": parts["is_background"],
        "confidence": round(float(prediction["confidence"]), 4),
    }


def run_analysis(image: Image.Image) -> dict:
    warnings = []
    mock_mode = False

    if model_service.is_loaded:
        raw_predictions = model_service.predict(image)
    elif settings.allow_mock:
        raw_predictions = model_service.mock_predict()
        mock_mode = True
        warnings.append("DEMO MODE: the real AI model is not loaded, so these results are simulated.")
    else:
        raise AppError("MODEL_NOT_LOADED", "The disease model is not available.", 503)

    predictions = [_enrich(p) for p in raw_predictions]
    top = predictions[0]

    if top["is_background"]:
        raise AppError(
            "NO_LEAF_DETECTED",
            "No plant leaf was found in this photo. Please take a close, clear photo of a leaf.",
            422,
        )

    level = confidence_level(top["confidence"])
    if level == "low":
        warnings.append("The app is not sure about this result. Try a clearer, closer photo with good lighting.")

    guidance = get_guidance(top["crop"], top["disease"], top["is_healthy"], level)

    return {
        "success": True,
        "mock_mode": mock_mode,
        "top_prediction": top,
        "predictions": predictions,
        "confidence_level": level,
        "guidance": guidance,
        "warnings": warnings,
        "disclaimer": DISCLAIMER,
    }
