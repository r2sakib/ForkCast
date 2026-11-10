// utils/confirm.ts
import { Alert, Platform } from "react-native";

// Alert.alert does nothing on the web version, so use window.confirm there.
export function confirmAction(
  title: string,
  message: string,
  confirmText: string,
  onConfirm: () => void
) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: confirmText, style: "destructive", onPress: onConfirm },
  ]);
}
