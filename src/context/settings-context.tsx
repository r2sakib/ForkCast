// context/settings-context.tsx
import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { loadPrefs, savePrefs } from "@/services/storage";
import { initialSettingsState, settingsReducer } from "./settings-reducer";

interface SettingsContextValue {
  darkMode: boolean;
  remindersEnabled: boolean;
  loaded: boolean;
  setDarkMode: (value: boolean) => void;
  setRemindersEnabled: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, initialSettingsState);

  // Read the saved settings once, when the app starts
  useEffect(() => {
    loadPrefs().then((prefs) => dispatch({ type: "LOAD", payload: prefs ?? {} }));
  }, []);

  // Save again every time a setting changes (but not before the first load finished,
  // otherwise we would overwrite the saved values with the defaults)
  useEffect(() => {
    if (!state.loaded) return;
    savePrefs({ darkMode: state.darkMode, remindersEnabled: state.remindersEnabled });
  }, [state.loaded, state.darkMode, state.remindersEnabled]);

  const value = useMemo(
    () => ({
      darkMode: state.darkMode,
      remindersEnabled: state.remindersEnabled,
      loaded: state.loaded,
      setDarkMode: (v: boolean) => dispatch({ type: "SET_DARK_MODE", payload: v }),
      setRemindersEnabled: (v: boolean) => dispatch({ type: "SET_REMINDERS", payload: v }),
    }),
    [state.darkMode, state.remindersEnabled, state.loaded]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used inside a SettingsProvider");
  }
  return ctx;
}
