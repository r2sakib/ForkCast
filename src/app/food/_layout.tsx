// app/food/_layout.tsx
// A Stack for all food screens (same idea as the (home) Stack in Week 3).
// screenOptions = the default for every food screen; options on one screen override it.
import { Stack } from "expo-router";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function FoodLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="search" options={{ title: "Find Product" }} />
      <Stack.Screen name="form" options={{ title: "Add Food" }} />
      <Stack.Screen name="[id]" options={{ title: "Food Details" }} />
      <Stack.Screen name="history" options={{ title: "Waste History" }} />
    </Stack>
  );
}
