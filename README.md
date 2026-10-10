# Crop Disease Detection Assistant

> **Monorepo Application** integrating React + Vite + Tailwind CSS frontend, FastAPI backend, and TensorFlow/Keras MobileNetV2 disease classifier with Gemini API agronomic advisory.

---

## 🌟 Architecture Overview

```
crop-disease-assistant/
├── frontend/               # React 18 + Vite + Tailwind CSS (Port 5173)
├── backend/                # FastAPI + TensorFlow/Keras Inference + Gemini API (Port 8000)
│   ├── model/              # MobileNetV2 plant_disease_model.keras + class_names.json
│   ├── sample_images/      # leaf.jpg sample images for verification
│   └── scripts/            # smoke_test.py integration validator
└── ai_model/               # Standalone AI/ML pipeline (dataset validation, training, calibration)
```

---

## 🚀 Quickstart Guide

### 1. Start the Backend (Port 8000)

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

Verify backend health at: [http://localhost:8000/api/health](http://localhost:8000/api/health)  
Interactive API docs at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Start the Frontend (Port 5173)

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open application at: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Integration Verification & Smoke Test

With the backend running on port 8000, run the integration smoke test:

```bash
cd backend
python scripts/smoke_test.py http://localhost:8000 sample_images/leaf.jpg
```

All integration assertions must report `PASS`:
- ✅ Server is up (`/api/health`)
- ✅ AI model loaded (`plant_disease_model.keras` + `class_names.json`)
- ✅ Endpoint `POST /api/analyze` returned HTTP 200 with required schema
- ✅ Real prediction verified (non-mock output)
- ✅ Agricultural remediation guidance generated

### Automated Backend Tests
```bash
cd backend
python -m pytest -v
```

---

## 🌿 Key Features
- **Mobile-first Farmer Interface**: Clean high-contrast UI, drag-and-drop, phone camera capture, 48px+ tap targets.
- **Multilingual Support**: Instant toggle between English, Hindi (हिंदी), and Kannada (ಕನ್ನಡ).
- **1-Click Test Samples**: Test Healthy Leaf, Tomato Late Blight, or Apple Scab instantly.
- **Safe Advisory Guardrails**: Low-risk cultural practices, sanitation recommendations, and explicit advice to consult local extension officers before chemical application.
- **Interactive Agronomist Chat**: Follow-up Q&A on watering, spacing, disease prevention, and organic care.
