// services/storage.ts
// Everything that is saved on the phone lives here.
//  - the login token  -> expo-secure-store (encrypted). Not available on web, so web uses AsyncStorage.
//  - the settings     -> AsyncStorage (plain, not secret)
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "forkcast_token";
const PREFS_KEY = "forkcast_prefs";
const isWeb = Platform.OS === "web";

// ── Token ──────────────────────────────────────────────
export async function saveToken(token: string): Promise<void> {
  if (isWeb) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (isWeb) return AsyncStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  if (isWeb) await AsyncStorage.removeItem(TOKEN_KEY);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ── Settings (dark mode, reminders switch) ─────────────
export interface Prefs {
  darkMode: boolean;
  remindersEnabled: boolean;
}

export async function loadPrefs(): Promise<Partial<Prefs> | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as Partial<Prefs>) : null;
  } catch {
    return null; // broken or missing data -> use the defaults
  }
}

export async function savePrefs(prefs: Prefs): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // saving a setting must never crash the app
  }
}
