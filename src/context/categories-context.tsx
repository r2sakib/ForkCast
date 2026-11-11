// context/categories-context.tsx
// Shared by everyone: Member 1's Add Food form reads the list with useCategories().
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { createCategory, deleteCategory, fetchCategories } from "@/services/categories";
import { Category } from "@/types";
import { getErrorMessage } from "@/utils/errors";
import { useAuth } from "./auth-context";
import { categoriesReducer, CategoriesStatus, initialCategoriesState } from "./categories-reducer";

interface CategoriesContextValue {
  items: Category[];
  status: CategoriesStatus;
  error: string | null;
  refresh: () => Promise<void>;
  addCategory: (name: string) => Promise<void>; // throws when the API fails
  removeCategory: (id: number) => Promise<void>; // throws when the API fails
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [state, dispatch] = useReducer(categoriesReducer, initialCategoriesState);

  const refresh = useCallback(async () => {
    dispatch({ type: "LOAD_START" });
    try {
      const items = await fetchCategories();
      dispatch({ type: "LOAD_SUCCESS", payload: items });
    } catch (error) {
      dispatch({ type: "LOAD_ERROR", payload: getErrorMessage(error) });
    }
  }, []);

  // Load when somebody logs in, clear when they log out
  useEffect(() => {
    if (userId === undefined) {
      dispatch({ type: "CLEAR" });
      return;
    }
    refresh();
  }, [userId, refresh]);

  const addCategory = useCallback(async (name: string) => {
    const created = await createCategory(name);
    dispatch({ type: "ADD", payload: created });
  }, []);

  const removeCategory = useCallback(async (id: number) => {
    await deleteCategory(id);
    dispatch({ type: "REMOVE", payload: id });
  }, []);

  const value = useMemo(
    () => ({
      items: state.items,
      status: state.status,
      error: state.error,
      refresh,
      addCategory,
      removeCategory,
    }),
    [state.items, state.status, state.error, refresh, addCategory, removeCategory]
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories(): CategoriesContextValue {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    throw new Error("useCategories must be used inside a CategoriesProvider");
  }
  return ctx;
}
