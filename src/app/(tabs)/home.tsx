// app/(tabs)/home.tsx  -  PLACEHOLDER. Member 1 replaces this file with the real Home screen.
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth-context";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.text }]}>Hello, {user?.name}!</Text>
        <Text style={[styles.sub, { color: colors.subtext }]}>
          Home (food list) is built by Member 1.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  sub: { fontSize: 14, textAlign: "center" },
});
