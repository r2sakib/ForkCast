import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "React";
import { getNotifications, markNotificationRead } from "@/lib/insights-api";
import { AppNotification } from "@/types/insights";

// ── State + actions ────────────────────────────────────
interface State {
  items: AppNotification[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: AppNotification[] }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "MARK_READ"; payload: string };

const initialState: State = { items: [], loading: true, error: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: null };
    case "LOAD_SUCCESS":
      return { items: action.payload, loading: false, error: null };
    case "LOAD_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "MARK_READ":
      return {
        ...state,
        items: state.items.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────
interface NotificationsContextValue {
  items: AppNotification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refresh = useCallback(async () => {
    dispatch({ type: "LOAD_START" });
    try {
      const data = await getNotifications();
      dispatch({ type: "LOAD_SUCCESS", payload: data });
    } catch (e) {
      dispatch({
        type: "LOAD_ERROR",
        payload: e instanceof Error ? e.message : "Something went wrong",
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Optimistic update: change the UI first, then call the API.
  // If the API fails, reload the real data from the server.
  const markRead = useCallback(
    async (id: string) => {
      dispatch({ type: "MARK_READ", payload: id });
      try {
        await markNotificationRead(id);
      } catch {
        await refresh();
      }
    },
    [refresh]
  );

  const markAllRead = useCallback(async () => {
    const unread = state.items.filter((n) => !n.read);
    await Promise.all(unread.map((n) => markRead(n.id)));
  }, [state.items, markRead]);

  const unreadCount = state.items.filter((n) => !n.read).length;

  const value = useMemo(
    () => ({
      items: state.items,
      loading: state.loading,
      error: state.error,
      unreadCount,
      refresh,
      markRead,
      markAllRead,
    }),
    [state, unreadCount, refresh, markRead, markAllRead]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used inside a NotificationsProvider");
  }
  return ctx;
}
