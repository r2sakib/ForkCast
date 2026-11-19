// hooks/use-expiry-reminders.ts
// Keeps the phone's scheduled reminders in step with the food list and Ayan's Reminders switch.
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useFoods } from "@/context/foods-context";
import { useSettings } from "@/context/settings-context";
import { cancelReminders, configureReminders, scheduleReminders } from "@/services/reminders";

export function useExpiryReminders() {
  const { user } = useAuth();
  const { items } = useFoods();
  const { remindersEnabled, loaded } = useSettings();
  const signedIn = user !== null;

  useEffect(() => {
    configureReminders();
  }, []);

  useEffect(() => {
    if (!loaded) return; // wait until the saved settings are read
    if (!signedIn || !remindersEnabled) {
      cancelReminders().catch(() => undefined);
      return;
    }
    scheduleReminders(items).catch((e) =>
      console.log("reminders:", e instanceof Error ? e.message : e)
    );
  }, [loaded, signedIn, remindersEnabled, items]);
}
