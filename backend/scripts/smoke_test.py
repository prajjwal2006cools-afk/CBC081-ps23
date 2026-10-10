"""Integration-day check. Run it while the server is running:

python scripts/smoke_test.py http://localhost:8000 path/to/leaf.jpg

It checks the health endpoint and one real analysis, and prints PASS or FAIL for each.
"""
import sys
from pathlib import Path
import httpx

REQUIRED_KEYS = [
    "success",
    "mock_mode",
    "top_prediction",
    "predictions",
    "confidence_level",
    "guidance",
    "warnings",
    "disclaimer",
]
GUIDANCE_KEYS = ["summary", "visible_symptoms", "safe_next_steps", "when_to_seek_expert"]


def check(ok: bool, text: str) -> bool:
    print(("PASS " if ok else "FAIL ") + text)
    return ok


def main() -> int:
    if len(sys.argv) < 3:
        print("Usage: python scripts/smoke_test.py <backend-url> <image-path>")
        return 2

    base, image_path = sys.argv[1].rstrip("/"), sys.argv[2]
    all_ok = True

    try:
        health = httpx.get(f"{base}/api/health", timeout=20).json()
    except Exception as exc:
        print(f"FAIL Cannot reach {base}: {exc}")
        return 1

    all_ok &= check(health.get("status") == "ok", "Server is up (/api/health)")
    ai_loaded = health.get("ai_model_loaded") is True
    all_ok &= check(
        ai_loaded,
        f"AI model loaded {('(error: ' + str(health.get('ai_model_error')) + ')') if not ai_loaded else ''}",
    )
    gemini_conf = health.get("gemini_configured") is True
    # If gemini is not configured, inform user that fallback guidance will be used
    if gemini_conf:
        all_ok &= check(True, "Gemini key is configured")
    else:
        print("NOTE Gemini key is not configured (safe fallback guidance active)")

    with open(image_path, "rb") as f:
        resp = httpx.post(
            f"{base}/api/analyze",
            files={"image": (Path(image_path).name, f, "image/jpeg")},
        )

    all_ok &= check(resp.status_code == 200, f"/api/analyze returned HTTP {resp.status_code}")
    body = resp.json()

    if resp.status_code == 200:
        all_ok &= check(all(k in body for k in REQUIRED_KEYS), "Response has every required key")
        all_ok &= check(
            all(k in body.get("guidance", {}) for k in GUIDANCE_KEYS),
            "Guidance has every required key",
        )
        all_ok &= check(body.get("mock_mode") is False, "Results are REAL (not mock)")
        source = body.get("guidance", {}).get("source")
        all_ok &= check(source in ("gemini", "fallback"), f"Explanation came from {source}")

        top = body.get("top_prediction", {})
        print(f"\nTop result: {top.get('crop')} / {top.get('disease')} (confidence: {top.get('confidence')})")
    else:
        print(body)

    print("\nALL CHECKS PASSED" if all_ok else "\nSOME CHECKS FAILED - read the lines above")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
