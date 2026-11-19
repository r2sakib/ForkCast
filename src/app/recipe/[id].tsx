// app/recipe/[id].tsx  -  Member 3: Recipe Details
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { EXPIRY_COLOURS } from "@/constants/food";
import { Palette } from "@/constants/palette";
import { useFoods } from "@/context/foods-context";
import { RECIPES } from "@/data/recipes";
import { useAppTheme } from "@/hooks/use-app-theme";
import { matchRecipe } from "@/utils/recipe-match";

export default function RecipeDetail() {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>(); // params are always strings
  const { items, status } = useFoods();

  const recipe = RECIPES.find((r) => r.id === id);

  if (!recipe) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.subtext }]}>Recipe not found.</Text>
      </View>
    );
  }

  // Derived values: calculated during render, never copied into state
  const foodNames = items.filter((f) => f.status === "active").map((f) => f.name);
  const match = matchRecipe(recipe, foodNames);
  const have = new Set(match.have);
  const checking = status === "loading" && items.length === 0;

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      {/* The title in the header is set here, because only this screen knows the recipe */}
      <Stack.Screen options={{ title: recipe.title }} />

      <Image
        source={require("../../../assets/images/recipe-banner.jpg")}
        style={styles.hero}
        resizeMode="cover"
      />

      <View style={styles.body}>
        <Text style={styles.emoji}>{recipe.emoji}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{recipe.title}</Text>

        <View style={styles.chips}>
          <View style={[styles.chip, { backgroundColor: colors.inputBackground }]}>
            <Ionicons name="time-outline" size={14} color={Palette.accent} />
            <Text style={[styles.chipText, { color: colors.text }]}>{recipe.time}</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: colors.inputBackground }]}>
            <Ionicons name="speedometer-outline" size={14} color={Palette.accent} />
            <Text style={[styles.chipText, { color: colors.text }]}>{recipe.difficulty}</Text>
          </View>
        </View>

        <Text style={[styles.section, { color: colors.text }]}>Ingredients</Text>
        {checking ? <ActivityIndicator color={Palette.accent} style={styles.spinner} /> : null}

        {recipe.ingredients.map((ingredient) => {
          const owned = have.has(ingredient.name);
          return (
            <View key={ingredient.name} style={[styles.ingRow, { borderBottomColor: colors.border }]}>
              <Ionicons
                name={owned ? "checkmark-circle" : "close-circle"}
                size={22}
                color={owned ? EXPIRY_COLOURS.green.text : EXPIRY_COLOURS.red.text}
              />
              <Text style={[styles.ingName, { color: colors.text }]}>{ingredient.name}</Text>
              <Text style={[styles.ingAmount, { color: colors.subtext }]}>{ingredient.amount}</Text>
            </View>
          );
        })}

        <View
          style={[
            styles.summary,
            {
              backgroundColor:
                match.missing.length === 0 ? EXPIRY_COLOURS.green.bg : EXPIRY_COLOURS.orange.bg,
            },
          ]}
        >
          <Text
            style={[
              styles.summaryText,
              {
                color:
                  match.missing.length === 0
                    ? EXPIRY_COLOURS.green.text
                    : EXPIRY_COLOURS.orange.text,
              },
            ]}
          >
            {match.missing.length === 0
              ? "You have everything you need. Time to cook!"
              : `You still need: ${match.missing.join(", ")}`}
          </Text>
        </View>

        <Text style={[styles.section, { color: colors.text }]}>Steps</Text>
        {recipe.steps.map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFound: { fontSize: 15 },
  hero: { width: "100%", height: 200 },
  body: { padding: 20 },
  emoji: { fontSize: 40 },
  title: { fontSize: 24, fontWeight: "900", marginTop: 4, marginBottom: 12 },
  chips: { flexDirection: "row", gap: 8, marginBottom: 20 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  chipText: { fontSize: 12, fontWeight: "700" },
  section: { fontSize: 16, fontWeight: "800", marginTop: 8, marginBottom: 12 },
  spinner: { marginBottom: 8 },
  ingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  ingName: { flex: 1, marginLeft: 10, fontSize: 15, textTransform: "capitalize" },
  ingAmount: { fontSize: 13 },
  summary: { padding: 12, borderRadius: 10, marginTop: 12, marginBottom: 8 },
  summaryText: { fontSize: 13, fontWeight: "700" },
  stepRow: { flexDirection: "row", marginBottom: 14 },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Palette.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  stepText: { flex: 1, fontSize: 14, lineHeight: 22 },
});
