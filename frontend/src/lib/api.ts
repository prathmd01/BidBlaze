import axios from "axios";

/**
 * Shared Axios client — uses Vite proxy (/api → backend:8080).
 * Attaches JWT from localStorage when present.
 */
const api = axios.create({
  baseURL: "/api",
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
