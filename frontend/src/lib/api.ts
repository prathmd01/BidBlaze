import axios from "axios";

/**
 * Shared Axios client — uses Vite proxy (/api → backend:8080).
 * Attaches JWT from localStorage when present.
 */
export const backendUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
export const apiBaseUrl = backendUrl ? `${backendUrl}/api` : "/api";

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
