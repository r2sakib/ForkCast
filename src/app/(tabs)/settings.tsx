// app/(tabs)/settings.tsx
import { router } from "expo-router";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from "@/components/app-button";
import SettingsRow from "@/components/settings-row";
import { Palette } from "@/constants/palette";
import { useAuth } from "@/context/auth-context";
import { useSettings } from "@/context/settings-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { confirmAction } from "@/utils/confirm";

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const { user, logout } = useAuth();
  const { darkMode, remindersEnabled, setDarkMode, setRemindersEnabled } = useSettings();

  // "Mosabbir Hossain Ayan" -> "MA" (first letter of the first and the last word)
  const words = (user?.name ?? "").trim().split(" ").filter(Boolean);
  const initials =
    words.length === 0
      ? "?"
      : (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : "")).toUpperCase();

  const handleLogout = () => {
    confirmAction("Log out", "Do you want to log out of FORKCAST?", "Log out", () => {
      logout();
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Dark profile header, like the "My Place" screen in the design */}
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </SafeAreaView>
      </View>

      <ScrollView
        style={[styles.sheet, { backgroundColor: colors.surface }]}
        contentContainerStyle={styles.sheetContent}
      >
        <Text style={[styles.section, { color: colors.subtext }]}>APPEARANCE</Text>
        <SettingsRow
          icon="moon"
          label="Dark mode"
          subtitle={darkMode ? "On" : "Off"}
          right={
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.border, true: Palette.accent }}
              thumbColor="#FFFFFF"
            />
          }
        />

        <Text style={[styles.section, { color: colors.subtext }]}>NOTIFICATIONS</Text>
        <SettingsRow
          icon="notifications"
          label="Reminders"
          subtitle="Alert before food expires"
          right={
            <Switch
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{ false: colors.border, true: Palette.accent }}
              thumbColor="#FFFFFF"
            />
          }
        />

        <Text style={[styles.section, { color: colors.subtext }]}>FOOD</Text>
        <SettingsRow
          icon="pricetags"
          label="Manage categories"
          subtitle="Add or remove your own categories"
          onPress={() => router.push("/categories")}
        />

        <View style={styles.logout}>
          <AppButton title="LOG OUT" variant="danger" onPress={handleLogout} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { backgroundColor: Palette.footer, paddingBottom: 36 },
  headerInner: { alignItems: "center", paddingHorizontal: 20 },
  headerTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", marginTop: 8, marginBottom: 14 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#F3E6D8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 30, fontWeight: "900", color: Palette.gold },
  name: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  email: { color: "#B9A593", fontSize: 13, marginTop: 2 },
  // The white card slides up over the dark header (rounded top corners)
  sheet: { flex: 1, marginTop: -24, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  sheetContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  section: { fontSize: 11, fontWeight: "800", letterSpacing: 1, marginTop: 18, marginBottom: 2 },
  logout: { marginTop: 32 },
});
