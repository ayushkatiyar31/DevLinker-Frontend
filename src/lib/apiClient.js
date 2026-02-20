export const DEFAULT_API_URL = "http://localhost:4000/api/v1";

const TOKEN_STORAGE_PREFIX = "devlinker.token@";

function sanitizeToken(raw) {
  const token = String(raw || "").trim();
  if (!token) return "";
  if (token === "undefined" || token === "null") return "";
  return token;
}

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, "");
}

function getTokenStorageKey() {
  const origin = getBackendOrigin();
  return `${TOKEN_STORAGE_PREFIX}${origin || "default"}`;
}

export function getAuthToken() {
  const key = getTokenStorageKey();
  const fromScopedKey = sanitizeToken(localStorage.getItem(key));
  if (fromScopedKey) return fromScopedKey;

  // Backwards-compat: older builds stored token under generic keys.
  const legacyRaw =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    "";

  const legacyToken = sanitizeToken(legacyRaw);
  if (legacyToken) {
    // Migrate to scoped storage to avoid signature mismatch when switching backends.
    localStorage.setItem(key, legacyToken);
  }
  return legacyToken;
}

export function setAuthToken(token) {
  const sanitized = sanitizeToken(token);
  const key = getTokenStorageKey();

  if (!sanitized) {
    clearAuthToken();
    return;
  }

  localStorage.setItem(key, sanitized);
  // Keep generic key for any older code paths.
  localStorage.setItem("token", sanitized);
}

export function clearAuthToken() {
  localStorage.removeItem(getTokenStorageKey());
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("authToken");
}

export function getBackendOrigin() {
  const base = getApiBaseUrl();
  return base.replace(/\/api\/v1\/?$/i, "");
}

// Normalizes upload URLs so avatars/media hosted by the backend keep working
// across reloads and across environment/host changes.
//
// Handles:
// - Relative URLs like "/uploads/..."
// - Absolute URLs pointing at a different origin (e.g., Vite proxy rewriting host)
//
// Returns empty string for falsy input.
export function resolveBackendAssetUrl(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";

  // Leave browser-managed URLs alone.
  if (raw.startsWith("blob:") || raw.startsWith("data:")) return raw;

  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) return raw;

  if (raw.startsWith("/uploads/")) {
    return `${backendOrigin}${raw}`;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.pathname.startsWith("/uploads/")) {
      return `${backendOrigin}${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // Not a valid URL; fall back to raw.
  }

  return raw;
}

async function parseErrorResponse(response) {
  // Backend sometimes returns plain-text like: "ERROR : message"
  const text = await response.text();

  try {
    const json = JSON.parse(text);
    if (json?.message) return String(json.message);
  } catch {
    // ignore
  }

  return text || `Request failed with status ${response.status}`;
}

export async function apiRequest(path, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const token = getAuthToken();

  const isFormData = Boolean(options?.isFormData);
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  if (!isFormData) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await parseErrorResponse(response);
    const messageStr = String(message || "");
    const lower = messageStr.toLowerCase();

    // If the user switches from localhost <-> Render, an old token can fail JWT verification.
    // Clear it so future requests don't keep spamming 401s.
    if (
      response.status === 401 ||
      lower.includes("invalid signature") ||
      lower.includes("jwt") ||
      lower.includes("token expired")
    ) {
      clearAuthToken();
    }
    throw new Error(message);
  }

  // Try json first, fall back to text
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
