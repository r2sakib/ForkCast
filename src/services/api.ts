// services/api.ts
// The one Axios instance for the whole app. Every request goes through it.
import axios from "axios";
import { localAdapter } from "./local-backend";
import { getToken } from "./storage";

// Midterm: no backend yet. When EXPO_PUBLIC_API_URL is NOT set, every request is answered
// on the phone by the local backend (services/local-backend). Final term: put the NestJS
// address in .env.local and the same requests go to the real server. Nothing else changes.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
export const USE_LOCAL_BACKEND = API_URL === "";

export const api = axios.create({
  baseURL: API_URL || undefined,
  timeout: 10000, // give up after 10 seconds
  headers: { "Content-Type": "application/json" },
  // The adapter is the part of Axios that sends the request. undefined = the normal network one.
  adapter: USE_LOCAL_BACKEND ? localAdapter : undefined,
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
