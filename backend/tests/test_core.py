"""Tests that need NO internet, NO API key, and NO TensorFlow."""
import io
import json
import numpy as np
import pytest
from PIL import Image

from app import analysis, gemini_service, model_service as ms
from app.config import settings
from app.errors import AppError
from app.image_service import load_image
from app.labels import parse_label


def image_bytes(size=(300, 300), mode="RGB", fmt="PNG"):
    img = Image.new(mode, size, (30, 140, 40) if mode == "RGB" else (30, 140, 40, 255))
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()


@pytest.fixture(autouse=True)
def no_gemini_and_clean_model(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "")  # never call the real Gemini API
    monkeypatch.setattr(settings, "allow_mock", True)
    monkeypatch.setattr(ms.model_service, "model", None)


# ---------- labels ----------
def test_parse_label_disease():
    p = parse_label("Tomato___Late_blight")
    assert p["crop"] == "Tomato" and p["disease"] == "Late blight"
    assert not p["is_healthy"]


def test_parse_label_special_names():
    assert parse_label("Corn_(maize)___Common_rust_")["disease"] == "Common rust"
    assert parse_label("Pepper,_bell___healthy")["crop"] == "Pepper, bell"
    assert parse_label("Pepper,_bell___healthy")["is_healthy"]


def test_parse_label_background():
    assert parse_label("Background_without_leaves")["is_background"]


# ---------- image checks ----------
def test_valid_image_is_rgb():
    assert load_image(image_bytes()).mode == "RGB"


def test_png_with_transparency_ok():
    assert load_image(image_bytes(mode="RGBA")).mode == "RGB"


@pytest.mark.parametrize(
    "data,code",
    [
        (b"", "EMPTY_FILE"),
        (b"just some text", "INVALID_IMAGE"),
        (image_bytes(size=(20, 20)), "IMAGE_TOO_SMALL"),
    ],
)
def test_bad_images_rejected(data, code):
    with pytest.raises(AppError) as err:
        load_image(data)
    assert err.value.code == code


def test_too_large_rejected(monkeypatch):
    monkeypatch.setattr(settings, "max_upload_mb", 0)
    with pytest.raises(AppError) as err:
        load_image(image_bytes())
    assert err.value.code == "FILE_TOO_LARGE" and err.value.status_code == 413


def test_unsupported_format_rejected():
    with pytest.raises(AppError) as err:
        load_image(image_bytes(fmt="BMP"))
    assert err.value.code == "UNSUPPORTED_FORMAT"


# ---------- model helpers ----------
def test_preprocess_shape_and_scale():
    arr = ms.preprocess(Image.new("RGB", (500, 300), (255, 255, 255)), (224, 224), 255)
    assert arr.shape == (1, 224, 224, 3)
    assert arr.max() == pytest.approx(1.0)


def test_preprocess_non_square_size():
    arr = ms.preprocess(Image.new("RGB", (500, 300)), (128, 64), 1)  # width 128, height 64
    assert arr.shape == (1, 64, 128, 3)


def test_logits_become_probabilities():
    p = ms.to_probabilities([2.0, 1.0, -1.0])
    assert p.sum() == pytest.approx(1.0)


def test_probabilities_left_alone():
    p = ms.to_probabilities([0.7, 0.2, 0.1])
    assert list(p) == pytest.approx([0.7, 0.2, 0.1])


def test_read_class_names_list_and_dict(tmp_path):
    f1 = tmp_path / "a.json"
    f1.write_text(json.dumps(["A", "B"]))
    f2 = tmp_path / "b.json"
    f2.write_text(json.dumps({"1": "B", "0": "A"}))
    assert ms.read_class_names(f1) == ["A", "B"]
    assert ms.read_class_names(f2) == ["A", "B"]


def test_read_class_names_bad_file(tmp_path):
    f = tmp_path / "c.json"
    f.write_text(json.dumps({"oops": 1}))
    with pytest.raises(Exception):
        ms.read_class_names(f)


class FakeModel:
    """Pretends to be a Keras model with 3 classes."""

    def predict(self, arr, verbose=0):
        assert arr.shape == (1, 224, 224, 3)
        return np.array([[0.1, 0.7, 0.2]])


def test_real_model_path_with_fake_model(monkeypatch):
    svc = ms.model_service
    monkeypatch.setattr(svc, "model", FakeModel())
    monkeypatch.setattr(svc, "class_names", ["Tomato___healthy", "Tomato___Early_blight", "Tomato___Late_blight"])
    monkeypatch.setattr(svc, "input_size", (224, 224))
    result = analysis.run_analysis(Image.new("RGB", (300, 300)))
    assert result["mock_mode"] is False
    assert result["top_prediction"]["disease"] == "Early blight"
    assert result["confidence_level"] == "medium"
    assert len(result["predictions"]) == 3


def test_background_class_gives_friendly_error(monkeypatch):
    class BgModel:
        def predict(self, arr, verbose=0):
            return np.array([[0.95, 0.05]])

    svc = ms.model_service
    monkeypatch.setattr(svc, "model", BgModel())
    monkeypatch.setattr(svc, "class_names", ["Background_without_leaves", "Tomato___Late_blight"])
    monkeypatch.setattr(svc, "input_size", (224, 224))
    with pytest.raises(AppError) as err:
        analysis.run_analysis(Image.new("RGB", (300, 300)))
    assert err.value.code == "NO_LEAF_DETECTED"


# ---------- full workflow ----------
def test_mock_mode_workflow_shape():
    result = analysis.run_analysis(Image.new("RGB", (300, 300)))
    assert result["success"] is True and result["mock_mode"] is True
    assert any("DEMO MODE" in w for w in result["warnings"])
    assert result["guidance"]["source"] == "fallback"
    for key in ("summary", "visible_symptoms", "safe_next_steps", "when_to_seek_expert"):
        assert key in result["guidance"]
    assert result["disclaimer"]


def test_mock_mode_off_gives_503(monkeypatch):
    monkeypatch.setattr(settings, "allow_mock", False)
    with pytest.raises(AppError) as err:
        analysis.run_analysis(Image.new("RGB", (300, 300)))
    assert err.value.code == "MODEL_NOT_LOADED" and err.value.status_code == 503


def test_low_confidence_warning(monkeypatch):
    monkeypatch.setattr(
        ms.ModelService,
        "mock_predict",
        staticmethod(lambda: [{"label": "Tomato___Late_blight", "confidence": 0.40}, {"label": "Tomato___healthy", "confidence": 0.35}]),
    )
    result = analysis.run_analysis(Image.new("RGB", (300, 300)))
    assert result["confidence_level"] == "low"
    assert any("not sure" in w for w in result["warnings"])


# ---------- Gemini parsing (no network) ----------
GOOD = json.dumps({
    "summary": "It may be blight.",
    "visible_symptoms": ["Dark spots on leaves"],
    "safe_next_steps": ["Remove leaves"],
    "when_to_seek_expert": "Consult expert promptly.",
})


def test_parse_guidance_plain_and_fenced():
    assert gemini_service.parse_guidance(GOOD)["summary"] == "It may be blight."
    assert gemini_service.parse_guidance("```json\n" + GOOD + "\n```")["safe_next_steps"] == ["Remove leaves"]


@pytest.mark.parametrize("bad", ["", "no json here", "{ broken", '{"summary": "incomplete"}'])
def test_parse_guidance_rejects_bad(bad):
    with pytest.raises(Exception):
        gemini_service.parse_guidance(bad)


def test_gemini_failure_falls_back(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "fake-key")

    def boom(prompt):
        raise TimeoutError("slow")

    monkeypatch.setattr(gemini_service, "_call_gemini", boom)
    g = gemini_service.get_guidance("Tomato", "Late blight", False, "high")
    assert g["source"] == "fallback" and "TimeoutError" in g["fallback_reason"]


def test_gemini_success_path(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "fake-key")
    monkeypatch.setattr(gemini_service, "_call_gemini", lambda prompt: GOOD)
    g = gemini_service.get_guidance("Tomato", "Late blight", False, "high")
    assert g["source"] == "gemini" and g["fallback_reason"] is None


def test_healthy_fallback_has_no_symptoms():
    g = gemini_service.fallback_guidance("Tomato", "healthy", True, "test")
    assert g["visible_symptoms"] == []
