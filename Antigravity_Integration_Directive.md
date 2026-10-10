# Project: Crop Disease Detection Assistant
## (Antigravity Integration Directive)

### Layer 1: The Directive (High-Level Goals & System Architecture)
This project is a monorepo application consisting of three tightly coupled components:
1. **Frontend (`/frontend`)**: React + Vite + Tailwind CSS running on `http://localhost:5173`.
2. **Backend (`/backend`)**: FastAPI + Uvicorn server running on `http://localhost:8000`.
3. **AI Model Pipeline (`/backend/model` & `/ai_model`)**: TensorFlow/Keras plant disease classifier (`plant_disease_model.keras`) combined with Gemini API for expert agricultural remediation advice.

#### Non-Negotiable Integration Contracts
- **API Port Binding**: Backend must always initialize on port `8000`; Frontend dev server on `5173`.
- **Multipart Form Payload**: The frontend must send image payloads via `POST /api/analyze` using `image` as the strict form-data field name.
- **Model Storage**: The Keras model artifact and class mapping file must live inside `backend/model/plant_disease_model.keras` and `backend/model/class_names.json`.

---

### Layer 2: Orchestration (Agent Rules & Code Standards)
When spawning agents or assigning subtasks in Antigravity, adhere to these rules:
- **Cross-Layer Awareness**: Never modify API contracts in backend (`app/main.py`) without simultaneously updating the client fetch handler in frontend (`src/services/api.js` or `src/api/client.js`).
- **Environment Safety**: Never hardcode API keys. All service lookups must rely on `backend/.env` for `GEMINI_API_KEY` and `frontend/.env` for `VITE_API_URL`.
- **Error Handling**: If the local Keras model fails to load, the backend must fail gracefully with `ai_model_loaded: false` instead of crashing the process, allowing fallback mock logic if explicitly permitted.

---

### Layer 3: Execution & Verification Commands
Use these commands when directing Antigravity agents to execute or verify builds:

#### Backend Initialization & Testing
```bash
cd backend
python -m venv venv
# Activate venv: venv\Scripts\activate on Windows or source venv/bin/activate on Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend Initialization
```bash
cd frontend
npm install
npm run dev
```

#### Integrated Smoke Test Verification
```bash
cd backend
python scripts/smoke_test.py http://localhost:8000 sample_images/leaf.jpg
```
*(Agents must ensure this script outputs PASS across all integration checks before submitting changes).*
