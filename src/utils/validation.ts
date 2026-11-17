// utils/validation.ts
// Pure validation functions (same idea as validateForm in the Week 4 lab),
// moved here so Login, Register and Categories can share them.
import { Category } from "@/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Login ──────────────────────────────────────────────
export interface LoginData {
  email: string;
  password: string;
}
export interface LoginErrors {
  email?: string;
  password?: string;
}

export function validateLogin(data: LoginData): LoginErrors {
  const errors: LoginErrors = {};

  if (data.email.trim().length === 0) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(data.email.trim())) {
    errors.email = "Enter a valid email, e.g. nila@example.com";
  }

  if (data.password.length === 0) {
    errors.password = "Password is required.";
  }

  return errors;
}

// ── Register ───────────────────────────────────────────
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}
export interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
}

export function validateRegister(data: RegisterData): RegisterErrors {
  const errors: RegisterErrors = {};

  if (data.name.trim().length === 0) {
    errors.name = "Name is required.";
  } else if (data.name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters.";
  }

  if (data.email.trim().length === 0) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(data.email.trim())) {
    errors.email = "Enter a valid email, e.g. nila@example.com";
  }

  if (data.password.length === 0) {
    errors.password = "Password is required.";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
}

// ── Category name ──────────────────────────────────────
export function validateCategoryName(name: string, existing: Category[]): string | undefined {
  const clean = name.trim();
  if (clean.length === 0) return "Category name is required.";
  if (clean.length < 2) return "Name must be at least 2 characters.";
  if (clean.length > 30) return "Name must be 30 characters or less.";

  // Block duplicates (ignore upper / lower case), same idea as Week 5 Feature 3
  const lower = clean.toLowerCase();
  if (existing.some((c) => c.name.toLowerCase() === lower)) {
    return "This category already exists.";
  }
  return undefined;
}
