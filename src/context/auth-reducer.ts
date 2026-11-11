// context/auth-reducer.ts
// Pure TypeScript, no React imports (same as students-reducer.ts in Week 5).
import { User } from "@/types";

// "loading" = we are still checking if a saved token exists
export type AuthStatus = "loading" | "signedOut" | "signedIn";

export interface AuthState {
  status: AuthStatus;
  user: User | null;
}

export const initialAuthState: AuthState = { status: "loading", user: null };

export type AuthAction = { type: "SIGN_IN"; payload: User } | { type: "SIGN_OUT" };

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SIGN_IN":
      return { status: "signedIn", user: action.payload };
    case "SIGN_OUT":
      return { status: "signedOut", user: null };
    default:
      return state;
  }
}
