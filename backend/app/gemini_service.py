"""Asks Gemini to explain the result in simple words. If Gemini fails, we use safe fallback text."""
import json
import logging
from typing import List, Optional
from app.config import settings

logger = logging.getLogger("backend.gemini")

SYSTEM_INSTRUCTION = """You are a careful crop-health assistant that helps farmers.
Rules:
- The disease name comes from an image classifier and is only POSSIBLE, never confirmed.
- Use very simple English that a farmer can understand. Short sentences.
- Do NOT give pesticide, fungicide, or chemical names, doses, or mixing ratios.
- Suggest only low-risk first steps (isolate or remove badly affected leaves, avoid wetting leaves, improve airflow).
- Always advise confirming with a local agricultural extension officer or plant clinic.
Reply with ONLY valid JSON in exactly this shape:
{
  "summary": "1-2 simple sentences",
  "visible_symptoms": ["3 to 5 short typical visible signs of this problem"],
  "safe_next_steps": ["3 to 5 short safe actions"],
  "when_to_seek_expert": "1 short sentence"
}
If the plant is reported healthy, use an empty list for visible_symptoms and give general care tips in safe_next_steps.
"""

CHAT_SYSTEM_INSTRUCTION = """You are a friendly, helpful agricultural assistant helping a farmer.
Rules:
- You help with plant care, cultural management, organic practices, sanitation, and watering advice.
- Do NOT provide dangerous chemical formulations, unverified poison recipes, or toxic mixing ratios.
- Recommend consulting local agricultural extension services or agronomists for chemical diagnosis and prescriptions.
- Keep explanations simple, practical, and empathetic.
"""

_client = None


def _clean_name(text: str) -> str:
    return "".join(ch for ch in str(text) if ch.isprintable())[:100]


def build_prompt(crop: str, disease: str, is_healthy: bool, confidence_level: str) -> str:
    status = "reported HEALTHY" if is_healthy else f"possibly affected by: {_clean_name(disease)}"
    return (
        f"Crop: {_clean_name(crop)}\n"
        f"Classifier result: {status}\n"
        f"Classifier confidence: {confidence_level}\n"
        "Write the guidance for the farmer now."
    )


def parse_guidance(text: str) -> dict:
    """Turns Gemini's text into a clean dictionary. Raises ValueError if it is invalid."""
    if not text:
        raise ValueError("empty reply")
    text = text.strip()
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("no JSON found")
    data = json.loads(text[start : end + 1])

    def as_list(value):
        if not isinstance(value, list):
            return []
        return [str(item).strip() for item in value if str(item).strip()][:6]

    summary = str(data.get("summary", "")).strip()
    steps = as_list(data.get("safe_next_steps"))
    if not summary or not steps:
        raise ValueError("missing summary or safe_next_steps")

    return {
        "summary": summary,
        "visible_symptoms": as_list(data.get("visible_symptoms")),
        "safe_next_steps": steps,
        "when_to_seek_expert": str(data.get("when_to_seek_expert", "")).strip()
        or "If the problem spreads or you are unsure, ask a local agricultural extension officer.",
    }


def fallback_guidance(crop: str, disease: str, is_healthy: bool, reason: str) -> dict:
    """Safe, general text. Used when Gemini is off, slow, or returns an error."""
    if is_healthy:
        data = {
            "summary": f"The {crop} plant looks healthy in this photo.",
            "visible_symptoms": [],
            "safe_next_steps": [
                "Keep watering steady and avoid wetting the leaves.",
                "Check the plant every few days for new spots or color changes.",
                "Keep the area clean and remove fallen leaves.",
            ],
            "when_to_seek_expert": "If you notice spots, curling, or wilting, take a sample to your local extension office.",
        }
    else:
        data = {
            "summary": (
                f"The photo may show signs of {disease} on {crop}. "
                "This is a possible result, not a confirmed one."
            ),
            "visible_symptoms": [
                "General warning signs to look for (not specific to one disease):",
                "Spots, patches, or unusual color on the leaves",
                "Leaves that curl, wilt, or turn yellow",
                "Problems that spread to more leaves over a few days",
            ],
            "safe_next_steps": [
                "Keep this plant away from healthy plants if possible.",
                "Remove badly affected leaves and dispose of them away from the crop.",
                "Avoid wetting the leaves and improve airflow around the plant.",
                "Take a clear daylight photo again tomorrow to see if symptoms spread.",
            ],
            "when_to_seek_expert": "Please confirm with a local agricultural extension officer before taking major control actions.",
        }
    data["source"] = "fallback"
    data["fallback_reason"] = reason
    return data


def _get_client():
    global _client
    if _client is None:
        from google import genai
        from google.genai import types

        _client = genai.Client(
            api_key=settings.gemini_api_key,
            http_options=types.HttpOptions(timeout=int(settings.gemini_timeout_seconds * 1000)),
        )
    return _client


def _call_gemini(prompt: str) -> Optional[str]:
    from google.genai import types

    response = _get_client().models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            temperature=0.3,
            response_mime_type="application/json",
        ),
    )
    return response.text


def get_guidance(crop: str, disease: str, is_healthy: bool, confidence_level: str) -> dict:
    """Always returns a usable dictionary. Never raises."""
    if not settings.gemini_api_key:
        return fallback_guidance(crop, disease, is_healthy, "GEMINI_API_KEY is not set")
    try:
        text = _call_gemini(build_prompt(crop, disease, is_healthy, confidence_level))
        data = parse_guidance(text)
        data["source"] = "gemini"
        data["fallback_reason"] = None
        return data
    except Exception as exc:  # noqa: BLE001 - any failure falls back safely
        logger.warning("Gemini failed, using fallback: %s: %s", type(exc).__name__, exc)
        return fallback_guidance(crop, disease, is_healthy, f"{type(exc).__name__}: {exc}")


def chat_followup(message: str, context: Optional[dict] = None, history: Optional[List[dict]] = None) -> str:
    """Provides follow-up answers to farmer questions."""
    if not settings.gemini_api_key:
        # Farmer-friendly fallback answers
        return (
            "For plant safety and best results, please avoid over-watering the foliage, isolate affected plants, "
            "and consult your local agricultural extension officer for specific localized recommendations."
        )
    try:
        from google.genai import types

        context_str = ""
        if context:
            c = context.get("crop", "plant")
            d = context.get("disease", "condition")
            context_str = f"Context: The user previously analyzed a {c} with suspected {d}.\n"

        prompt = f"{context_str}Farmer asks: {message}\nProvide a clear, farmer-friendly response."

        response = _get_client().models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=CHAT_SYSTEM_INSTRUCTION,
                temperature=0.4,
            ),
        )
        return response.text.strip()
    except Exception as exc:
        logger.warning("Gemini chat failed: %s", exc)
        return (
            "I am currently having trouble connecting to the live advisory assistant. "
            "Please check with a local agronomist or extension agent for direct advice."
        )
