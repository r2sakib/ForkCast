import { USE_MOCK } from "@/constants/config";
import { AppNotification, FoodStats, PantryFood } from "@/types/insights";
import { apiRequest } from "./api";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ago = (hours: number) =>
  new Date(Date.now() - hours * 3600_000).toISOString();

// ---------- mock data (used only when USE_MOCK = true) ----------
let mockNotifications: AppNotification[] = [
  { id: "1", foodId: "f1", foodName: "Milk", type: "EXPIRES_TODAY", message: "Milk expires today. Use it now!", createdAt: ago(1), read: false },
  { id: "2", foodId: "f2", foodName: "Eggs", type: "EXPIRING_SOON", message: "Eggs expire in 2 days.", createdAt: ago(5), read: false },
  { id: "3", foodId: "f3", foodName: "Spinach", type: "EXPIRED", message: "Spinach has expired.", createdAt: ago(30), read: false },
  { id: "4", foodId: "f4", foodName: "Chicken", type: "EXPIRING_SOON", message: "Chicken expires in 2 days.", createdAt: ago(52), read: true },
  { id: "5", foodId: "f5", foodName: "Yogurt", type: "EXPIRES_TODAY", message: "Yogurt expires today.", createdAt: ago(75), read: true },
];

const mockStats: FoodStats = {
  used: 18,
  wasted: 6,
  active: 11,
  expiringSoon: 3,
  byCategory: [
    { category: "Dairy", used: 6, wasted: 2 },
    { category: "Vegetables", used: 5, wasted: 3 },
    { category: "Meat", used: 4, wasted: 1 },
    { category: "Grains", used: 3, wasted: 0 },
  ],
};

const mockFoods: PantryFood[] = [
  { id: "f1", name: "Milk", status: "ACTIVE" },
  { id: "f2", name: "Eggs", status: "ACTIVE" },
  { id: "f4", name: "Chicken", status: "ACTIVE" },
  { id: "f6", name: "Tomato", status: "ACTIVE" },
  { id: "f7", name: "Onion", status: "ACTIVE" },
  { id: "f8", name: "Rice", status: "ACTIVE" },
  { id: "f9", name: "Potato", status: "ACTIVE" },
  { id: "f3", name: "Spinach", status: "WASTED" },
];

// ---------- API functions ----------
export async function getNotifications(): Promise<AppNotification[]> {
  if (USE_MOCK) {
    await wait(700);
    return mockNotifications.map((n) => ({ ...n }));
  }
  return apiRequest<AppNotification[]>("/notifications");
}

export async function markNotificationRead(id: string): Promise<void> {
  if (USE_MOCK) {
    await wait(200);
    mockNotifications = mockNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    return;
  }
  await apiRequest<void>(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function getFoodStats(): Promise<FoodStats> {
  if (USE_MOCK) {
    await wait(700);
    return mockStats;
  }
  return apiRequest<FoodStats>("/foods/stats");
}

// Member 1's endpoint — used only to know which foods the user has.
export async function getFoods(): Promise<PantryFood[]> {
  if (USE_MOCK) {
    await wait(500);
    return mockFoods;
  }
  return apiRequest<PantryFood[]>("/foods");
}