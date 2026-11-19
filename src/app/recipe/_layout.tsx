// app/recipe/_layout.tsx
// A Stack for the recipe screens (same idea as app/food/_layout.tsx).
import { Stack } from "expo-router";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function RecipeLayout() {
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
      <Stack.Screen name="[id]" options={{ title: "Recipe" }} />
    </Stack>
  );
}
