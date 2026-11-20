// types/insights.ts
// Shapes of the data from Member 3's endpoints:
// GET /notifications, PATCH /notifications/:id/read, GET /foods/stats.
// Kept in its own file so Member 1's types/food.ts and Member 2's types/index.ts are not touched.

// expired = the date has passed, today = expires today, expiring = within SOON_DAYS (2)
export type AlertType = "expiring" | "today" | "expired";

export interface AppNotification {
  id: number;
  foodId: number;
  foodName: string;
  type: AlertType;
  message: string;
  createdAt: string; // ISO date-time, set by the server
  read: boolean;
}

export interface CategoryStat {
  categoryId: number;
  category: string; // the category name, e.g. "Dairy"
  used: number;
  wasted: number;
}

export interface FoodStats {
  used: number;
  wasted: number;
  active: number;
  expiringSoon: number; // active foods that expire within SOON_DAYS, or are already expired
  byCategory: CategoryStat[];
}
