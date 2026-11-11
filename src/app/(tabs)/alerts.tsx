// app/(tabs)/alerts.tsx  -  PLACEHOLDER. Member 3 replaces this file with the real Alerts screen.
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function AlertsScreen() {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.text }]}>Alerts</Text>
        <Text style={[styles.sub, { color: colors.subtext }]}>Built by Member 3.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  sub: { fontSize: 14 },
});
