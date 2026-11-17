// context/categories-reducer.ts
import { Category } from "@/types";

export type CategoriesStatus = "idle" | "loading" | "ready" | "error";

export interface CategoriesState {
  items: Category[];
  status: CategoriesStatus;
  error: string | null;
}

export const initialCategoriesState: CategoriesState = {
  items: [],
  status: "idle",
  error: null,
};

export type CategoriesAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: Category[] }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "ADD"; payload: Category }
  | { type: "REMOVE"; payload: number } // payload = category id
  | { type: "CLEAR" };

export function categoriesReducer(
  state: CategoriesState,
  action: CategoriesAction
): CategoriesState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, status: "loading", error: null };
    case "LOAD_SUCCESS":
      return { items: action.payload, status: "ready", error: null };
    case "LOAD_ERROR":
      return { ...state, status: "error", error: action.payload };
    case "ADD":
      return { ...state, items: [...state.items, action.payload] };
    case "REMOVE":
      return { ...state, items: state.items.filter((c) => c.id !== action.payload) };
    case "CLEAR":
      return initialCategoriesState;
    default:
      return state;
  }
}
