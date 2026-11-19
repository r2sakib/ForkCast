// context/notifications-reducer.ts
// Pure TypeScript, no React imports (same as foods-reducer.ts).
import { AppNotification } from "@/types/insights";

export type NotificationsStatus = "idle" | "loading" | "ready" | "error";

export interface NotificationsState {
  items: AppNotification[]; // newest first, as the server sends them
  status: NotificationsStatus;
  error: string | null;
}

export const initialNotificationsState: NotificationsState = {
  items: [],
  status: "idle",
  error: null,
};

export type NotificationsAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: AppNotification[] }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "MARK_READ"; payload: number } // payload = notification id
  | { type: "CLEAR" };

export function notificationsReducer(
  state: NotificationsState,
  action: NotificationsAction
): NotificationsState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, status: "loading", error: null };
    case "LOAD_SUCCESS":
      return { items: action.payload, status: "ready", error: null };
    case "LOAD_ERROR":
      return { ...state, status: "error", error: action.payload };
    case "MARK_READ":
      return {
        ...state,
        items: state.items.map((n) => (n.id === action.payload ? { ...n, read: true } : n)),
      };
    case "CLEAR":
      return initialNotificationsState;
    default:
      return state;
  }
}
