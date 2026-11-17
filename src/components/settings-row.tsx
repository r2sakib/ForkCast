// components/settings-row.tsx
// One row of the Settings screen: icon + text + (a Switch OR an arrow)
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Palette } from "@/constants/palette";
import { useAppTheme } from "@/hooks/use-app-theme";

interface SettingsRowProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  subtitle?: string;
  right?: React.ReactNode; // for example a <Switch />
  onPress?: () => void; // when given, the row is tappable and shows an arrow
}

export default function SettingsRow({ icon, label, subtitle, right, onPress }: SettingsRowProps) {
  const { colors } = useAppTheme();

  const content = (
    <>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color={Palette.gold} />
      </View>
      <View style={styles.texts}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.subtext }]}>{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={20} color={colors.subtext} /> : null)}
    </>
  );

  const rowStyle = [styles.row, { borderBottomColor: colors.border }];

  if (onPress) {
    return (
      <Pressable style={rowStyle} onPress={onPress}>
        {content}
      </Pressable>
    );
  }
  return <View style={rowStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(210, 132, 40, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  texts: { flex: 1 },
  label: { fontSize: 15, fontWeight: "600" },
  subtitle: { fontSize: 12, marginTop: 2 },
});
