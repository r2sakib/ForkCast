// services/api.ts
// The one Axios instance for the whole app. Every request goes through it.
import axios from "axios";
import { getToken } from "./storage";

// On a real phone "localhost" is the phone itself, so set the laptop's Wi-Fi IP in .env.local
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // give up after 10 seconds
  headers: { "Content-Type": "application/json" },
});

// Before EVERY request: read the token and send it as  Authorization: Bearer <token>
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// The auth context registers a function here. We call it when the API says 401
// (token expired or invalid) so the user is logged out and sent to Login.
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const url = error.config?.url ?? "";
      // A 401 from /auth/login only means "wrong password" - not an expired session
      const isLoginCall = url.startsWith("/auth/login");
      if (error.response?.status === 401 && !isLoginCall && unauthorizedHandler) {
        unauthorizedHandler();
      }
    }
    return Promise.reject(error);
  }
);
