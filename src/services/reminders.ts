// services/reminders.ts
// Phone reminders (local notifications, scheduled on the phone) for food that is about to expire.
// Local notifications work in Expo Go. Remote push does not (Android, SDK 53+), and we do not need it.
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { SOON_DAYS } from "@/constants/food";
import { Food } from "@/types/food";
import { parseDate } from "@/utils/food";

const CHANNEL_ID = "expiry-reminders";
const REMINDER_HOUR = 9; // 09:00
const MAX_REMINDERS = 60; // iOS keeps at most 64 scheduled local notifications

export interface Reminder {
  when: Date;
  body: string;
}

// Pure function (easy to test): which reminders should exist right now?
export function buildReminders(foods: Food[], now: Date = new Date()): Reminder[] {
  const reminders: Reminder[] = [];

  for (const food of foods) {
    if (food.status !== "active" || !food.expiryDate) continue;
    const expiry = parseDate(food.expiryDate); // local midnight of the expiry day
    if (!expiry) continue;

    const plan = [
      { daysBefore: SOON_DAYS, body: `${food.name} expires in ${SOON_DAYS} days.` },
      { daysBefore: 0, body: `${food.name} expires today. Use it now!` },
    ];

    for (const item of plan) {
      const when = new Date(expiry);
      when.setDate(when.getDate() - item.daysBefore);
      when.setHours(REMINDER_HOUR, 0, 0, 0);
      // A moment that has already passed is skipped
      if (when.getTime() > now.getTime()) reminders.push({ when, body: item.body });
    }
  }

  return reminders.sort((a, b) => a.when.getTime() - b.when.getTime()).slice(0, MAX_REMINDERS);
}

// Call once when the app starts: show a reminder as a banner even while the app is open
export function configureReminders() {
  if (Platform.OS === "web") return; // notifications are Android / iOS only
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    // Android 13+ asks the user only after at least one channel exists
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Expiry reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function cancelReminders(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Replaces all scheduled reminders with the right ones for this food list.
// Returns false when the user did not allow notifications.
export async function scheduleReminders(foods: Food[]): Promise<boolean> {
  if (Platform.OS === "web") return false;
  if (!(await ensurePermission())) return false;

  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const reminder of buildReminders(foods)) {
    await Notifications.scheduleNotificationAsync({
      content: { title: "ForkCast", body: reminder.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.when,
        channelId: CHANNEL_ID,
      },
    });
  }
  return true;
}
