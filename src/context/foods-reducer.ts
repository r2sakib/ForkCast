// context/foods-reducer.ts
// Pure TypeScript, no React imports (same as students-reducer.ts in Week 5).
import { Food } from "@/types/food";

export type FoodsStatus = "idle" | "loading" | "ready" | "error";

export interface FoodsState {
  items: Food[]; // ALL of the user's foods: active, used and wasted
  status: FoodsStatus;
  error: string | null;
}

export const initialFoodsState: FoodsState = {
  items: [],
  status: "idle",
  error: null,
};

export type FoodsAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: Food[] }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "ADD"; payload: Food }
  | { type: "UPDATE"; payload: Food } // replace the food with the same id
  | { type: "REMOVE"; payload: number } // payload = food id
  | { type: "CLEAR" };

export function foodsReducer(state: FoodsState, action: FoodsAction): FoodsState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, status: "loading", error: null };
    case "LOAD_SUCCESS":
      return { items: action.payload, status: "ready", error: null };
    case "LOAD_ERROR":
      return { ...state, status: "error", error: action.payload };
    case "ADD":
      // Newest first, like ADD_STUDENT in Week 5
      return { ...state, items: [action.payload, ...state.items] };
    case "UPDATE": {
      const exists = state.items.some((f) => f.id === action.payload.id);
      return {
        ...state,
        items: exists
          ? state.items.map((f) => (f.id === action.payload.id ? action.payload : f))
          : [action.payload, ...state.items],
      };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter((f) => f.id !== action.payload) };
    case "CLEAR":
      return initialFoodsState;
    default:
      return state;
  }
}
