// hooks/use-expiry-reminders.ts
// Keeps the phone's scheduled reminders in step with the food list and Ayan's Reminders switch.
import * as Notifications from "expo-notifications"; // TEST: prints the scheduled count
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useFoods } from "@/context/foods-context";
import { useSettings } from "@/context/settings-context";
import { cancelReminders, configureReminders, scheduleReminders } from "@/services/reminders";

// ===== TEST (Member 3) — START: delete this helper, the import above and the 2 ".then(logScheduled)" after the test =====
// Prints how many reminders are scheduled on the phone, AFTER scheduling / cancelling has finished.
const logScheduled = () =>
  Notifications.getAllScheduledNotificationsAsync()
    .then((all) => console.log("SCHEDULED", all.length))
    .catch(() => undefined);
// ===== TEST (Member 3) — END =====

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
      cancelReminders().then(logScheduled).catch(() => undefined); // TEST: .then(logScheduled)
      return;
    }
    scheduleReminders(items)
      .then(logScheduled) // TEST: .then(logScheduled)
      .catch((e) => console.log("reminders:", e instanceof Error ? e.message : e));
  }, [loaded, signedIn, remindersEnabled, items]);
}