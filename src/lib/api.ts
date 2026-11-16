import { API_BASE_URL } from "@/constants/config";

let authToken: string | null = null;

// Member 2 must call setAuthToken(token) after login and setAuthToken(null) on logout.
export function setAuthToken(token: string | null) {
  authToken = token;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...((options.headers as Record<string, string>) ?? {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }

  // PATCH may return an empty body
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}