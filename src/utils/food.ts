// utils/food.ts
// Small pure helpers for dates and labels. No React here, so they are easy to test.
import { EXPIRY_COLOURS, SOON_DAYS, STORAGE_OPTIONS } from "@/constants/food";
import { Category } from "@/types";
import { Food, StoragePlace } from "@/types/food";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-11-25" -> Date at LOCAL midnight, or null when the text is not a real date.
// (new Date("2026-11-25") would be UTC midnight, which is the wrong day in some time zones.)
export function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  // new Date(2026, 1, 30) silently becomes 2 March, so check it did not roll over
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

// Date -> "2026-11-25"
export function toDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayString(): string {
  return toDateString(new Date());
}

// Today + n days, as "YYYY-MM-DD" (used by the quick date chips in the form)
export function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

// Whole days from today: 0 = today, 1 = tomorrow, -1 = yesterday, null = no date
export function daysUntil(dateString: string | null): number | null {
  if (!dateString) return null;
  const date = parseDate(dateString);
  const today = parseDate(todayString());
  if (!date || !today) return null;
  return Math.round((date.getTime() - today.getTime()) / MS_PER_DAY);
}

export type ExpiryLevel = "red" | "orange" | "green" | "grey";

export interface ExpiryInfo {
  level: ExpiryLevel;
  label: string;
  colors: { bg: string; text: string };
}

// The badge for one food: colour + text
export function getExpiryInfo(expiryDate: string | null): ExpiryInfo {
  const days = daysUntil(expiryDate);
  if (days === null) {
    return { level: "grey", label: "No date", colors: EXPIRY_COLOURS.grey };
  }
  if (days < 0) {
    const ago = -days;
    return {
      level: "red",
      label: `Expired ${ago} day${ago === 1 ? "" : "s"} ago`,
      colors: EXPIRY_COLOURS.red,
    };
  }
  if (days === 0) {
    return { level: "red", label: "Expires today", colors: EXPIRY_COLOURS.red };
  }
  const label = `${days} day${days === 1 ? "" : "s"} left`;
  if (days <= SOON_DAYS) {
    return { level: "orange", label, colors: EXPIRY_COLOURS.orange };
  }
  return { level: "green", label, colors: EXPIRY_COLOURS.green };
}

// Home order: soonest date first, items without a date last, then A-Z
export function sortByExpiry(foods: Food[]): Food[] {
  return [...foods].sort((a, b) => {
    if (a.expiryDate === b.expiryDate) return a.name.localeCompare(b.name);
    if (a.expiryDate === null) return 1;
    if (b.expiryDate === null) return -1;
    // "YYYY-MM-DD" text sorts in the same order as the dates
    return a.expiryDate.localeCompare(b.expiryDate);
  });
}

export function storageLabel(storage: StoragePlace): string {
  return STORAGE_OPTIONS.find((s) => s.value === storage)?.label ?? storage;
}

export function categoryName(categories: Category[], categoryId: number): string {
  return categories.find((c) => c.id === categoryId)?.name ?? "Other";
}

export function formatQuantity(food: Pick<Food, "quantity" | "unit">): string {
  return `${food.quantity} ${food.unit}`;
}

// "2026-11-25" or an ISO date-time -> "25 Nov 2026"
export function formatDate(value: string | null): string {
  if (!value) return "No date";
  const date = parseDate(value) ?? new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
