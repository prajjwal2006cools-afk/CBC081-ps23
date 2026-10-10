# BACKEND.md — Crop Disease Identification Assistant
Owner: Backend teammate · Stack: Python + FastAPI · Talks to: React frontend and TensorFlow/Keras model + Gemini API.

## Summary
This backend service runs FastAPI to provide:
1. `GET /api/health` — Service and model health status.
2. `POST /api/analyze` — Leaf image disease classifier and agricultural guidance. Accepts multipart/form-data with field name `image`.
3. `POST /api/chat` — Follow-up interactive questions for agronomic advice.

## Quickstart
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac / Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```
