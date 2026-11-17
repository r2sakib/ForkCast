// context/auth-context.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { setUnauthorizedHandler } from "@/services/api";
import { fetchMe, loginRequest, registerRequest } from "@/services/auth";
import { clearToken, getToken, saveToken } from "@/services/storage";
import { User } from "@/types";
import { getStatus } from "@/utils/errors";
import { AuthStatus, authReducer, initialAuthState } from "./auth-reducer";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const logout = useCallback(async () => {
    await clearToken();
    dispatch({ type: "SIGN_OUT" });
  }, []);

  // 1) App start: is there a saved token? If yes, ask the API who we are (GET /auth/me)
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const token = await getToken();
        if (!token) {
          if (!cancelled) dispatch({ type: "SIGN_OUT" });
          return;
        }
        const user = await fetchMe();
        if (!cancelled) dispatch({ type: "SIGN_IN", payload: user });
      } catch (error) {
        // Only delete the token when the API says it is invalid (401).
        // If the server is just unreachable, keep it for the next start.
        if (getStatus(error) === 401) await clearToken();
        if (!cancelled) dispatch({ type: "SIGN_OUT" });
      }
    }

    restoreSession();
    return () => {
      cancelled = true; // cleanup, same idea as clearTimeout in Week 4
    };
  }, []);

  // 2) If any request gets 401 later (token expired), log out automatically
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await loginRequest(email, password);
    await saveToken(token);
    dispatch({ type: "SIGN_IN", payload: user });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { token, user } = await registerRequest(name, email, password);
    await saveToken(token);
    dispatch({ type: "SIGN_IN", payload: user });
  }, []);

  const value = useMemo(
    () => ({ status: state.status, user: state.user, login, register, logout }),
    [state.status, state.user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
}
