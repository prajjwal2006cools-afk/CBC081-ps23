"""Describes the exact JSON schemas for API endpoints."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class Prediction(BaseModel):
    label: str
    crop: str
    disease: str
    is_healthy: bool
    is_background: bool
    confidence: float  # 0.0 to 1.0


class Guidance(BaseModel):
    summary: str
    visible_symptoms: List[str]
    safe_next_steps: List[str]
    when_to_seek_expert: str
    source: str  # "gemini" or "fallback"
    fallback_reason: Optional[str] = None


class AnalyzeResponse(BaseModel):
    success: bool
    mock_mode: bool
    top_prediction: Prediction
    predictions: List[Prediction]
    confidence_level: str  # "high" | "medium" | "low"
    guidance: Guidance
    warnings: List[str]
    disclaimer: str


class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorBody


class HealthResponse(BaseModel):
    status: str
    ai_model_loaded: bool
    ai_model_error: Optional[str] = None
    mock_mode_enabled: bool
    gemini_configured: bool
    gemini_model: str


class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    history: Optional[List[Dict[str, Any]]] = None


class ChatResponse(BaseModel):
    success: bool
    reply: str
