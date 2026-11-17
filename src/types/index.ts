// types/index.ts
// Shapes of the data that come from the REST API (camelCase, see PROJECT_GUIDE section 7).

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  // true = created by the user. The API may not send it, see utils/categories.ts
  isCustom?: boolean;
}
