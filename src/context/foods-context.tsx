// context/foods-context.tsx
// The food list for the whole app. Member 3 can read it too: const { items } = useFoods();
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { createFood, deleteFood, fetchFood, fetchFoods, updateFood } from "@/services/foods";
import { Food, FoodInput, FoodUpdate } from "@/types/food";
import { getErrorMessage } from "@/utils/errors";
import { useAuth } from "./auth-context";
import { foodsReducer, FoodsStatus, initialFoodsState } from "./foods-reducer";

interface FoodsContextValue {
  items: Food[];
  status: FoodsStatus;
  error: string | null;
  refresh: () => Promise<void>; // GET /foods
  loadFood: (id: number) => Promise<void>; // GET /foods/:id   (throws when the API fails)
  addFood: (input: FoodInput) => Promise<void>; // POST /foods   (throws when the API fails)
  editFood: (id: number, changes: FoodUpdate) => Promise<void>; // PATCH (throws)
  removeFood: (id: number) => Promise<void>; // DELETE (throws)
}

const FoodsContext = createContext<FoodsContextValue | null>(null);

export function FoodsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [state, dispatch] = useReducer(foodsReducer, initialFoodsState);

  const refresh = useCallback(async () => {
    dispatch({ type: "LOAD_START" });
    try {
      const items = await fetchFoods();
      dispatch({ type: "LOAD_SUCCESS", payload: items });
    } catch (error) {
      dispatch({ type: "LOAD_ERROR", payload: getErrorMessage(error) });
    }
  }, []);

  // Load when somebody logs in, clear when they log out (same as CategoriesProvider)
  useEffect(() => {
    if (userId === undefined) {
      dispatch({ type: "CLEAR" });
      return;
    }
    refresh();
  }, [userId, refresh]);

  // The list only changes AFTER the server said yes (dispatch runs after await)
  const loadFood = useCallback(async (id: number) => {
    const food = await fetchFood(id);
    dispatch({ type: "UPDATE", payload: food });
  }, []);

  const addFood = useCallback(async (input: FoodInput) => {
    const created = await createFood(input);
    dispatch({ type: "ADD", payload: created });
  }, []);

  const editFood = useCallback(async (id: number, changes: FoodUpdate) => {
    const updated = await updateFood(id, changes);
    dispatch({ type: "UPDATE", payload: updated });
  }, []);

  const removeFood = useCallback(async (id: number) => {
    await deleteFood(id);
    dispatch({ type: "REMOVE", payload: id });
  }, []);

  const value = useMemo(
    () => ({
      items: state.items,
      status: state.status,
      error: state.error,
      refresh,
      loadFood,
      addFood,
      editFood,
      removeFood,
    }),
    [state.items, state.status, state.error, refresh, loadFood, addFood, editFood, removeFood]
  );

  return <FoodsContext.Provider value={value}>{children}</FoodsContext.Provider>;
}

export function useFoods(): FoodsContextValue {
  const ctx = useContext(FoodsContext);
  if (!ctx) {
    throw new Error("useFoods must be used inside a FoodsProvider");
  }
  return ctx;
}
