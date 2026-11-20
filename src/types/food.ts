// types/food.ts
// Shapes of the food data that comes from our REST API (GET /foods ...)
// and from Open Food Facts. Kept in its own file so Member 2's types/index.ts is not touched.

export type StoragePlace = "fridge" | "freezer" | "pantry";
export type FoodStatus = "active" | "used" | "wasted";
export type Unit = "pcs" | "g" | "kg" | "ml" | "L" | "pack";

export interface Food {
  id: number;
  name: string;
  quantity: number;
  unit: Unit;
  storage: StoragePlace;
  categoryId: number;
  expiryDate: string | null; // "YYYY-MM-DD"; null = no date (grey badge)
  status: FoodStatus; // "active" = still in the kitchen
  brand: string | null;
  barcode: string | null;
  imageUrl: string | null; // picture from Open Food Facts
  createdAt: string; // ISO date-time, set by the server
  finishedAt: string | null; // set by the server when marked used / wasted
}

// What the app sends for POST /foods
export interface FoodInput {
  name: string;
  quantity: number;
  unit: Unit;
  storage: StoragePlace;
  categoryId: number;
  expiryDate: string | null;
  brand?: string | null;
  barcode?: string | null;
  imageUrl?: string | null;
}

// What the app sends for PATCH /foods/:id
// Any field can change, or only the status ("Mark as used").
export type FoodUpdate = Partial<FoodInput> & { status?: FoodStatus };

// A product found on Open Food Facts, already cleaned up for our app
export interface OffProduct {
  barcode: string;
  name: string;
  brand: string; // "" when unknown
  quantity: string; // as printed on the package, e.g. "400 g"
  imageUrl: string | null;
  categoryTags: string[]; // e.g. ["en:dairies", "en:milks"]
}
