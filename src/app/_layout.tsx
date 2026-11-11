// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { Palette } from "@/constants/palette";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { CategoriesProvider } from "@/context/categories-context";
import { SettingsProvider, useSettings } from "@/context/settings-context";
import { useAppTheme } from "@/hooks/use-app-theme";

function RootNavigator() {
  const { status } = useAuth();
  const { loaded } = useSettings();
  const { colors, isDark } = useAppTheme();

  // Wait until we know (1) the saved settings and (2) if a saved login exists
  if (status === "loading" || !loaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Palette.authBackground }}>
        <ActivityIndicator size="large" color={Palette.primary} />
      </View>
    );
  }

  const signedIn = status === "signedIn";

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Screens only a logged-in user can open */}
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>

        {/* Screens only a logged-out user can open */}
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  // Order matters: Categories needs Auth (it reads the user), the theme needs Settings
  return (
    <SettingsProvider>
      <AuthProvider>
        <CategoriesProvider>
          <RootNavigator />
        </CategoriesProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
