// utils/food-validation.ts
// Pure validation for the Add / Edit Food form (same idea as validateForm in the Week 4 lab).
import { StoragePlace, Unit } from "@/types/food";
import { parseDate, todayString } from "./food";

// The form's own state. quantity and expiryDate are text while the user types;
// they become a number / null only when the form is sent.
export interface FoodFormData {
  name: string;
  quantity: string;
  unit: Unit;
  storage: StoragePlace;
  categoryId: number | null; // null = nothing chosen yet
  expiryDate: string; // "" = no date
}

export interface FoodFormErrors {
  name?: string;
  quantity?: string;
  categoryId?: string;
  expiryDate?: string;
}

// 2, 0.5, 1.25 (at most 2 decimals)
const QUANTITY_PATTERN = /^\d+(\.\d{1,2})?$/;

// allowPastDate: true in Edit mode (an old item may already be expired)
export function validateFood(data: FoodFormData, allowPastDate: boolean): FoodFormErrors {
  const errors: FoodFormErrors = {};

  const name = data.name.trim();
  if (name.length === 0) {
    errors.name = "Food name is required.";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (name.length > 60) {
    errors.name = "Name must be 60 characters or less.";
  }

  const quantity = data.quantity.trim();
  if (quantity.length === 0) {
    errors.quantity = "Quantity is required.";
  } else if (!QUANTITY_PATTERN.test(quantity)) {
    errors.quantity = "Use a number, e.g. 2 or 0.5";
  } else if (Number(quantity) <= 0) {
    errors.quantity = "Quantity must be more than 0.";
  } else if (Number(quantity) > 9999) {
    errors.quantity = "Quantity is too large.";
  }

  if (data.categoryId === null) {
    errors.categoryId = "Choose a category.";
  }

  // The date is optional. When it is given it must be real and (when adding) not in the past.
  const expiry = data.expiryDate.trim();
  if (expiry.length > 0) {
    if (!parseDate(expiry)) {
      errors.expiryDate = "Use the format YYYY-MM-DD, e.g. 2026-11-25";
    } else if (!allowPastDate && expiry < todayString()) {
      errors.expiryDate = "This date is already in the past.";
    }
  }

  return errors;
}
