// app/(auth)/index.tsx  -  Welcome screen (first screen for a logged-out user)
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from "@/components/app-button";
import { Palette } from "@/constants/palette";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.top}>
        <Text style={styles.brand}>FORKCAST</Text>
      </View>

      <View style={styles.bottom}>
        <View style={styles.titleBox}>
          <Text style={styles.title}>{"KNOW WHAT'S IN YOUR FRIDGE"}</Text>
        </View>

        <View style={styles.buttons}>
          <View style={styles.buttonCell}>
            <AppButton title="SIGN UP" variant="gold" onPress={() => router.push("/register")} />
          </View>
          <View style={styles.buttonCell}>
            <AppButton title="LOG IN" variant="outline" onPress={() => router.push("/login")} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.primary, paddingHorizontal: 24 },
  top: { flex: 1, justifyContent: "center", alignItems: "center" },
  brand: { fontSize: 38, fontWeight: "900", letterSpacing: 4, color: Palette.gold },
  bottom: { paddingBottom: 24 },
  titleBox: {
    backgroundColor: Palette.gold,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 22,
    marginBottom: 24,
  },
  title: { fontSize: 30, fontWeight: "900", color: Palette.primary, lineHeight: 36 },
  buttons: { flexDirection: "row", gap: 12 },
  buttonCell: { flex: 1 },
});
