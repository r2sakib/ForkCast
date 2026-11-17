export type NotificationType = "EXPIRING_SOON" | "EXPIRES_TODAY" | "EXPIRED";

export interface AppNotification {
  id: string;
  foodId: string;
  foodName: string;
  type: NotificationType;
  message: string;
  createdAt: string; // ISO date string
  read: boolean;
}

export interface CategoryStat {
  category: string;
  used: number;
  wasted: number;
}

export interface FoodStats {
  used: number;
  wasted: number;
  active: number;
  expiringSoon: number;
  byCategory: CategoryStat[];
}

// Minimal food shape needed for recipe matching (from Member 1's GET /foods)
export interface PantryFood {
  id: string;
  name: string;
  status: "ACTIVE" | "USED" | "WASTED";
}

