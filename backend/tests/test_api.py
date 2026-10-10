"""Tests the real web endpoints. Needs fastapi + httpx."""
import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.config import settings
from app.main import app


def png_bytes():
    buf = io.BytesIO()
    Image.new("RGB", (300, 300), (30, 140, 40)).save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture()
def client(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "")  # never call real Gemini
    monkeypatch.setattr(settings, "allow_mock", True)
    with TestClient(app) as c:  # "with" runs the startup code
        yield c


def test_health(client):
    body = client.get("/api/health").json()
    assert body["status"] == "ok"
    assert "ai_model_loaded" in body and "gemini_configured" in body


def test_analyze_ok(client):
    r = client.post("/api/analyze", files={"image": ("leaf.png", png_bytes(), "image/png")})
    if r.status_code == 503:
        assert r.json()["error"]["code"] == "MODEL_NOT_LOADED"
        return
    assert r.status_code == 200
    body = r.json()
    for key in (
        "success",
        "mock_mode",
        "top_prediction",
        "predictions",
        "confidence_level",
        "guidance",
        "warnings",
        "disclaimer",
    ):
        assert key in body


def test_not_an_image(client):
    r = client.post("/api/analyze", files={"image": ("x.png", b"hello", "image/png")})
    assert r.status_code == 400
    assert r.json() == {
        "success": False,
        "error": {
            "code": "INVALID_IMAGE",
            "message": "This file could not be read as an image. Please upload a JPG, PNG, or WebP photo.",
        },
    }


def test_missing_field(client):
    r = client.post("/api/analyze")
    assert r.status_code == 400
    assert r.json()["error"]["code"] == "INVALID_REQUEST"


def test_unknown_route_uses_same_error_shape(client):
    r = client.get("/api/nope")
    assert r.status_code == 404
    assert r.json()["success"] is False


def test_cors_header_for_allowed_origin(client):
    origin = settings.cors_origins[0]
    r = client.get("/api/health", headers={"Origin": origin})
    assert r.headers.get("access-control-allow-origin") in (origin, "*")
