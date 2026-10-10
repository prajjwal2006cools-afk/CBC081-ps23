import { mockChat, mockPredict } from "../utils/mock";

const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const API_URL = RAW_API_URL.replace(/\/$/, "");
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const MAX_MB = 5;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

async function parse(res) {
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok || (data && data.success === false)) {
    const err = data?.error;
    const message =
      err?.message ||
      (typeof data?.detail === "string"
        ? data.detail
        : typeof data?.detail === "object"
        ? JSON.stringify(data.detail)
        : null) ||
      `Server error (${res.status}). Please try again.`;
    throw new ApiError(err?.code || "SERVER_ERROR", message);
  }
  return data;
}

async function request(url, options) {
  try {
    return await fetch(url, options);
  } catch {
    throw new ApiError(
      "NETWORK_ERROR",
      "Cannot reach the server. Check your connection and ensure the backend is running on http://localhost:8000."
    );
  }
}

export function validateImage(file) {
  if (!file) return "Please choose an image.";
  if (!ALLOWED.includes(file.type)) return "Only JPG, PNG or WEBP images are allowed.";
  if (file.size > MAX_MB * 1024 * 1024) return `Image is too large. Max size is ${MAX_MB} MB.`;
  return null;
}

export async function checkHealth() {
  if (USE_MOCK) {
    return {
      status: "ok",
      ai_model_loaded: true,
      mock_mode_enabled: true,
      gemini_configured: true,
      gemini_model: "gemini-2.5-flash",
    };
  }
  const res = await request(`${API_URL}/api/health`);
  return parse(res);
}

export async function analyzeImage(file) {
  if (USE_MOCK) return mockPredict();

  const form = new FormData();
  // Antigravity Directive requires strict field name "image"
  form.append("image", file);

  const res = await request(`${API_URL}/api/analyze`, {
    method: "POST",
    body: form,
  });
  return parse(res);
}

export async function sendChat({ message, context, history }) {
  if (USE_MOCK) return mockChat(message);

  const res = await request(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context, history }),
  });
  return parse(res);
}
