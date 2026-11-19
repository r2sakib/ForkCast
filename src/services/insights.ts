// services/insights.ts
// One function per endpoint (Member 3):
// GET /notifications, PATCH /notifications/:id/read, GET /foods/stats
// The login token is added automatically by the interceptor in services/api.ts.
import { AppNotification, FoodStats } from "@/types/insights";
import { api } from "./api";

export async function fetchNotifications(): Promise<AppNotification[]> {
  const response = await api.get<AppNotification[]>("/notifications");
  return response.data;
}

export async function markNotificationRead(id: number): Promise<AppNotification> {
  const response = await api.patch<AppNotification>(`/notifications/${id}/read`);
  return response.data;
}

export async function fetchFoodStats(): Promise<FoodStats> {
  const response = await api.get<FoodStats>("/foods/stats");
  return response.data;
}
