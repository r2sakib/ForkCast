// hooks/use-app-theme.ts
// Any screen calls useAppTheme() and gets the colours for the current mode.
import { DarkColors, LightColors } from "@/constants/palette";
import { useSettings } from "@/context/settings-context";

export function useAppTheme() {
  const { darkMode } = useSettings();
  return { isDark: darkMode, colors: darkMode ? DarkColors : LightColors };
}
