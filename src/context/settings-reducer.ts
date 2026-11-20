// context/settings-reducer.ts
export interface SettingsState {
  darkMode: boolean;
  remindersEnabled: boolean;
  loaded: boolean; // true after the saved settings were read from the phone
}

export const initialSettingsState: SettingsState = {
  darkMode: false,
  remindersEnabled: true,
  loaded: false,
};

export type SettingsAction =
  | { type: "LOAD"; payload: { darkMode?: boolean; remindersEnabled?: boolean } }
  | { type: "SET_DARK_MODE"; payload: boolean }
  | { type: "SET_REMINDERS"; payload: boolean };

export function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case "LOAD":
      return { ...state, ...action.payload, loaded: true };
    case "SET_DARK_MODE":
      return { ...state, darkMode: action.payload };
    case "SET_REMINDERS":
      return { ...state, remindersEnabled: action.payload };
    default:
      return state;
  }
}
