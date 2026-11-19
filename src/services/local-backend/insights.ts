// services/local-backend/insights.ts  -  Member 3 (alerts and statistics)
// The /notifications and /foods/stats endpoints of the local backend.
// Returns null when the path is not ours, so index.ts can try the next handler.
import { SOON_DAYS } from "@/constants/food";
import { AlertType, CategoryStat, FoodStats } from "@/types/insights";
import { daysUntil } from "@/utils/food";
import { fail, LocalResult, nextId, ok, readCategories, readTable, writeTable } from "./db";

// Same key as FOODS_KEY in local-backend/foods.ts (Member 1). We only READ the foods table.
const FOODS_KEY = "forkcast_local_foods";
const NOTIFICATIONS_KEY = "forkcast_local_notifications";

// The few columns of a stored food that we need
interface FoodRow {
  id: number;
  userId: number;
  name: string;
  categoryId: number;
  expiryDate: string | null;
  status: "active" | "used" | "wasted";
}

// A notification row. Every row remembers its owner; the app never receives userId.
interface StoredNotification {
  id: number;
  userId: number;
  foodId: number;
  foodName: string;
  type: AlertType;
  message: string;
  createdAt: string;
  read: boolean;
}

function publicNotification(stored: StoredNotification) {
  const { userId, ...notification } = stored;
  return notification;
}

// Which alert does a food deserve today? null = none (far from its date, or no date)
function alertTypeFor(expiryDate: string | null): AlertType | null {
  const days = daysUntil(expiryDate);
  if (days === null) return null;
  if (days < 0) return "expired";
  if (days === 0) return "today";
  if (days <= SOON_DAYS) return "expiring";
  return null;
}

function messageFor(name: string, type: AlertType, expiryDate: string | null): string {
  if (type === "expired") return `${name} has expired.`;
  if (type === "today") return `${name} expires today. Use it now!`;
  const days = daysUntil(expiryDate) ?? SOON_DAYS;
  return `${name} expires in ${days} day${days === 1 ? "" : "s"}.`;
}

// Makes this user's notification table match their foods, then returns it.
// - keeps an old alert only while its food is still active and still near its date
// - creates the alerts that are missing (one per food and type)
async function syncNotifications(userId: number): Promise<StoredNotification[]> {
  const all = await readTable<StoredNotification>(NOTIFICATIONS_KEY, []);
  const foods = (await readTable<FoodRow>(FOODS_KEY, [])).filter(
    (f) => f.userId === userId && f.status === "active"
  );

  const others = all.filter((n) => n.userId !== userId);
  const kept = all.filter(
    (n) =>
      n.userId === userId &&
      foods.some((f) => f.id === n.foodId && alertTypeFor(f.expiryDate) !== null)
  );

  const fresh: StoredNotification[] = [];
  for (const food of foods) {
    const type = alertTypeFor(food.expiryDate);
    if (type === null) continue;
    if ([...kept, ...fresh].some((n) => n.foodId === food.id && n.type === type)) continue;
    fresh.push({
      id: nextId([...others, ...kept, ...fresh]),
      userId,
      foodId: food.id,
      foodName: food.name,
      type,
      message: messageFor(food.name, type, food.expiryDate),
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  const mine = [...kept, ...fresh];
  await writeTable(NOTIFICATIONS_KEY, [...others, ...mine]);
  return mine;
}

export async function handleInsights(
  method: string,
  path: string,
  userId: number
): Promise<LocalResult | null> {
  // ── GET /foods/stats ────────────────────────────────
  if (method === "get" && path === "/foods/stats") {
    const foods = (await readTable<FoodRow>(FOODS_KEY, [])).filter((f) => f.userId === userId);
    const categories = await readCategories();

    const active = foods.filter((f) => f.status === "active");
    const finished = foods.filter((f) => f.status !== "active");
    const expiringSoon = active.filter((f) => {
      const days = daysUntil(f.expiryDate);
      return days !== null && days <= SOON_DAYS;
    }).length;

    // One entry per category, counting only finished food (used or wasted)
    const byId = new Map<number, CategoryStat>();
    for (const food of finished) {
      const entry = byId.get(food.categoryId) ?? {
        categoryId: food.categoryId,
        category: categories.find((c) => c.id === food.categoryId)?.name ?? "Other",
        used: 0,
        wasted: 0,
      };
      if (food.status === "used") entry.used += 1;
      else entry.wasted += 1;
      byId.set(food.categoryId, entry);
    }
    const byCategory = [...byId.values()].sort(
      (a, b) => b.used + b.wasted - (a.used + a.wasted)
    );

    const stats: FoodStats = {
      used: foods.filter((f) => f.status === "used").length,
      wasted: foods.filter((f) => f.status === "wasted").length,
      active: active.length,
      expiringSoon,
      byCategory,
    };
    return ok(200, stats);
  }

  // ── /notifications ──────────────────────────────────
  if (path !== "/notifications" && !path.startsWith("/notifications/")) return null;

  // GET /notifications -> this user's alerts, newest first
  if (method === "get" && path === "/notifications") {
    const mine = await syncNotifications(userId);
    const newestFirst = [...mine].sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id
    );
    return ok(200, newestFirst.map(publicNotification));
  }

  // PATCH /notifications/:id/read -> mark one alert as read
  const match = /^\/notifications\/(\d+)\/read$/.exec(path);
  if (method === "patch" && match) {
    const all = await readTable<StoredNotification>(NOTIFICATIONS_KEY, []);
    const found = all.find((n) => n.id === Number(match[1]) && n.userId === userId);
    // Missing, or it belongs to somebody else: both are 404
    if (!found) return fail(404, "Notification not found", "Not Found");
    const updated: StoredNotification = { ...found, read: true };
    await writeTable(
      NOTIFICATIONS_KEY,
      all.map((n) => (n.id === found.id ? updated : n))
    );
    return ok(200, publicNotification(updated));
  }

  return fail(404, "Not found", "Not Found");
}
