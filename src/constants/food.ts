// constants/food.ts
// Fixed lists and colours for the food screens (Member 1).
import { StoragePlace, Unit } from "@/types/food";

export const STORAGE_OPTIONS: { value: StoragePlace; label: string }[] = [
  { value: "fridge", label: "Fridge" },
  { value: "freezer", label: "Freezer" },
  { value: "pantry", label: "Pantry" },
];

export const UNIT_OPTIONS: Unit[] = ["pcs", "g", "kg", "ml", "L", "pack"];

// An item turns orange this many days before it expires.
// Same number as the "2 days before" reminder in the proposal.
export const SOON_DAYS = 2;

// Badge colours: red = expired / today, orange = soon, green = fine, grey = no date
export const EXPIRY_COLOURS = {
  red: { bg: "#FEE2E2", text: "#B91C1C" },
  orange: { bg: "#FFEDD5", text: "#C2410C" },
  green: { bg: "#DCFCE7", text: "#15803D" },
  grey: { bg: "#E2E8F0", text: "#475569" },
};
