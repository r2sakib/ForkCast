// components/app-button.tsx
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { Palette } from "@/constants/palette";

type Variant = "primary" | "dark" | "gold" | "outline" | "danger";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
}

const VARIANTS: Record<Variant, { bg: string; text: string; border: string }> = {
  primary: { bg: Palette.accent, text: "#FFFFFF", border: Palette.accent },
  dark: { bg: Palette.primary, text: "#FFE9CF", border: Palette.primary },
  gold: { bg: Palette.gold, text: Palette.primary, border: Palette.gold },
  outline: { bg: "transparent", text: "#FFFFFF", border: Palette.gold },
  danger: { bg: "transparent", text: "#DC2626", border: "#DC2626" },
};

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: AppButtonProps) {
  const look = VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: look.bg, borderColor: look.border },
        isDisabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={look.text} />
      ) : (
        <Text style={[styles.text, { color: look.text }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});
