// services/local-backend/db.ts
// The "database" of the local backend: tables saved as JSON in AsyncStorage,
// plus the small helpers every route uses.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_CATEGORY_NAMES } from "@/utils/categories";

// What a route answers: an HTTP status and an optional JSON body
export interface LocalResult {
  status: number;
  body?: unknown;
}

export function ok(status: number, body?: unknown): LocalResult {
  return { status, body };
}

// Same error shape as NestJS: { statusCode, message, error }
export function fail(status: number, message: string | string[], error: string): LocalResult {
  return { status, body: { statusCode: status, message, error } };
}

// ── Tables ─────────────────────────────────────────────
// One AsyncStorage key per table. The "forkcast_local_" prefix keeps them apart
// from anything else the app saves.
export async function readTable<T>(key: string, fallback: T[]): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : fallback;
  } catch {
    return fallback; // broken data -> start again from the fallback
  }
}

export async function writeTable<T>(key: string, rows: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(rows));
}

// Like an auto-increment id in a database: biggest id + 1
export function nextId(rows: { id: number }[]): number {
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

// ── Categories table (used by the categories AND the foods routes) ──
export const CATEGORIES_KEY = "forkcast_local_categories";

// userId null = one of the 9 default categories, a number = a user's own category
export interface StoredCategory {
  id: number;
  name: string;
  userId: number | null;
}

export async function readCategories(): Promise<StoredCategory[]> {
  const defaults = DEFAULT_CATEGORY_NAMES.map((name, i) => ({ id: i + 1, name, userId: null }));
  return readTable<StoredCategory>(CATEGORIES_KEY, defaults);
}

// A user may use the default categories and their own ones
export function canUseCategory(category: StoredCategory, userId: number): boolean {
  return category.userId === null || category.userId === userId;
}
