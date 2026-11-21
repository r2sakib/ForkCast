// context/notifications-context.tsx
// The alerts for the whole app (Member 3). The Alerts screen and the tab badge both read it.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { useExpiryReminders } from "@/hooks/use-expiry-reminders"; // ← NEW (edit 1)
import { fetchNotifications, markNotificationRead } from "@/services/insights";
import { AppNotification } from "@/types/insights";
import { getErrorMessage } from "@/utils/errors";
import { useAuth } from "./auth-context";
import { useFoods } from "./foods-context";
import {
  initialNotificationsState,
  notificationsReducer,
  NotificationsStatus,
} from "./notifications-reducer";

interface NotificationsContextValue {
  items: AppNotification[];
  status: NotificationsStatus;
  error: string | null;
  unreadCount: number; // derived: not stored
  refresh: () => Promise<void>; // GET /notifications
  markRead: (id: number) => Promise<void>; // PATCH /notifications/:id/read
  markAllRead: () => Promise<void>; // one PATCH per unread alert
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  useExpiryReminders(); // phone reminders follow the food list and Ayan's Reminders switch  ← NEW (edit 2)
  const { user } = useAuth();
  const userId = user?.id;
  const { items: foods } = useFoods();
  const [state, dispatch] = useReducer(notificationsReducer, initialNotificationsState);

  const refresh = useCallback(async () => {
    dispatch({ type: "LOAD_START" });
    try {
      const items = await fetchNotifications();
      dispatch({ type: "LOAD_SUCCESS", payload: items });
    } catch (error) {
      dispatch({ type: "LOAD_ERROR", payload: getErrorMessage(error) });
    }
  }, []);

  // Load when somebody logs in, clear when they log out (same as FoodsProvider).
  // `foods` is in the list on purpose: when the food list changes (add, edit, used,
  // wasted, delete) the alerts may change too, so we ask the server again.
  useEffect(() => {
    if (userId === undefined) {
      dispatch({ type: "CLEAR" });
      return;
    }
    refresh();
  }, [userId, foods, refresh]);

  // Optimistic update: the dot disappears at once. If the server fails, we reload the truth.
  const markRead = useCallback(
    async (id: number) => {
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
      status: state.status,
      error: state.error,
      unreadCount,
      refresh,
      markRead,
      markAllRead,
    }),
    [state.items, state.status, state.error, unreadCount, refresh, markRead, markAllRead]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used inside a NotificationsProvider");
  }
  return ctx;
}