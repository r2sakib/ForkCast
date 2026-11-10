// utils/categories.ts
import { Category } from "@/types";

// The 9 fixed categories from the ER diagram (CATEGORY.name)
export const DEFAULT_CATEGORY_NAMES = [
  "Dairy",
  "Vegetables",
  "Fruits",
  "Meat",
  "Fish",
  "Eggs",
  "Rice and Grains",
  "Bakery",
  "Other",
];

// A category is custom when the API says so. If the API does not send
// isCustom, we treat every name that is not in the default list as custom.
export function isCustomCategory(category: Category): boolean {
  return category.isCustom ?? !DEFAULT_CATEGORY_NAMES.includes(category.name);
}
