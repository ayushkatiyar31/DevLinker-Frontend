import axios from "axios";
import { clearAuthToken, getApiBaseUrl, getAuthToken } from "@/lib/apiClient";

const API_BASE_URL = getApiBaseUrl();

export const connectionApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

connectionApi.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

connectionApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthToken();
    }
    return Promise.reject(error);
  }
);

function normalizeError(error) {
  // axios errors can be: error.response.data.message, or string, etc.
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    (typeof error?.response?.data === "string" ? error.response.data : null) ||
    error?.message ||
    "Request failed";

  const status = error?.response?.status;
  return { message, status };
}

async function unwrap(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export function sendConnectionRequest(status, toUserId, payload = undefined) {
  return unwrap(connectionApi.post(`/request/send/${status}/${toUserId}`, payload));
}

export function reviewConnectionRequest(status, requestId) {
  return unwrap(connectionApi.post(`/request/review/${status}/${requestId}`));
}

export function getReceivedRequests() {
  return unwrap(connectionApi.get(`/user/requests/received`));
}

export function getSentRequests() {
  return unwrap(connectionApi.get(`/user/requests/sent`));
}

export function getConnections() {
  return unwrap(connectionApi.get(`/user/connections`));
}
