// services/auth.ts
// One function per endpoint: POST /auth/register, POST /auth/login, GET /auth/me
import { AuthResponse, User } from "@/types";
import { api } from "./api";

export async function registerRequest(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", { name, email, password });
  return response.data;
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", { email, password });
  return response.data;
}

export async function fetchMe(): Promise<User> {
  const response = await api.get<User>("/auth/me");
  return response.data;
}
