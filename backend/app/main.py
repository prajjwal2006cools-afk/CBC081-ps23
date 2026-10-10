"""The FastAPI app: the single door between the React frontend, the AI model, and Gemini."""
import logging
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, File, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.analysis import run_analysis
from app.config import settings
from app.errors import AppError
from app.gemini_service import chat_followup
from app.image_service import load_image
from app.model_service import model_service
from app.schemas import (
    AnalyzeResponse,
    ChatRequest,
    ChatResponse,
    ErrorResponse,
    HealthResponse,
)

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(name)s | %(message)s")
logger = logging.getLogger("backend")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    model_service.load()  # loads the model once, when the server starts
    yield


app = FastAPI(
    title="Crop Disease Assistant - Backend",
    description="Upload a plant photo, get possible diseases, symptoms and safe next steps.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS lets the React app call this server from the browser
allow_all = "*" in settings.cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def error_json(code: str, message: str, status_code: int) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"success": False, "error": {"code": code, "message": message}},
    )


@app.exception_handler(AppError)
async def handle_app_error(_request: Request, exc: AppError):
    return error_json(exc.code, exc.message, exc.status_code)


@app.exception_handler(RequestValidationError)
async def handle_validation_error(_request: Request, _exc: RequestValidationError):
    return error_json(
        "INVALID_REQUEST",
        "Please send the photo as form-data with a file field named 'image'.",
        400,
    )


@app.exception_handler(StarletteHTTPException)
async def handle_http_error(_request: Request, exc: StarletteHTTPException):
    codes = {404: "NOT_FOUND", 405: "METHOD_NOT_ALLOWED"}
    return error_json(codes.get(exc.status_code, "HTTP_ERROR"), str(exc.detail), exc.status_code)


@app.get("/")
def root():
    return {"message": "Crop Disease Assistant backend is running. See /docs for API documentation."}


@app.get("/api/health", response_model=HealthResponse)
@app.get("/health", response_model=HealthResponse)
def health():
    return {
        "status": "ok",
        "ai_model_loaded": model_service.is_loaded,
        "ai_model_error": model_service.load_error,
        "mock_mode_enabled": settings.allow_mock,
        "gemini_configured": bool(settings.gemini_api_key),
        "gemini_model": settings.gemini_model,
    }


@app.post(
    "/api/analyze",
    response_model=AnalyzeResponse,
    responses={
        400: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        415: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
)
@app.post(
    "/predict",
    response_model=AnalyzeResponse,
    responses={
        400: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        415: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
)
def analyze(
    image: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
):
    # This is a normal "def" (not "async def") on purpose: heavy model work then runs
    # in a worker thread and does not freeze the server for other users.
    upload = image or file
    if upload is None:
        raise AppError("INVALID_REQUEST", "No file sent, or field not named 'image'.", 400)

    try:
        data = upload.file.read(settings.max_upload_bytes + 1)
        pil_image = load_image(data)
        return run_analysis(pil_image)
    except AppError:
        raise
    except Exception:
        logger.exception("Unexpected error during /api/analyze")
        raise AppError("INTERNAL_ERROR", "Something went wrong on our side. Please try again later.", 500)


@app.post("/api/chat", response_model=ChatResponse)
@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    if not request.message or not request.message.strip():
        raise AppError("EMPTY_MESSAGE", "Chat message cannot be empty.", 400)
    reply = chat_followup(request.message.strip(), request.context, request.history)
    return {"success": True, "reply": reply}
