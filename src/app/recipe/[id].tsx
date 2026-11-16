
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { COLORS } from "@/constants/forkcast-colors";
import { RECIPES } from "@/data/recipes";
import { useActiveFoods } from "@/hooks/use-active-foods";
import { matchRecipe } from "@/lib/recipe-match";

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const recipeId = Array.isArray(id) ? id[0] : id;

  const recipe = RECIPES.find((r) => r.id === recipeId);

  const { foods, loading, error } = useActiveFoods();

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Recipe",
          }}
        />
        <Text style={styles.centerText}>Recipe not found.</Text>
      </View>
    );
  }

  const match = matchRecipe(
    recipe,
    foods.map((f) => f.name)
  );

  const have = new Set(match.have);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: recipe.title,
          headerStyle: {
            backgroundColor: COLORS.navy,
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />

      <Image
        source={require("../../../assets/images/recipe-banner.jpg")}
        style={styles.hero}
        resizeMode="cover"
      />

      <View style={styles.body}>
        <Text style={styles.emoji}>{recipe.emoji}</Text>

        <Text style={styles.title}>{recipe.title}</Text>

        <View style={styles.chips}>
          <View style={styles.chip}>
            <Ionicons
              name="time-outline"
              size={14}
              color={COLORS.teal}
            />
            <Text style={styles.chipText}>{recipe.time}</Text>
          </View>

          <View style={styles.chip}>
            <Ionicons
              name="speedometer-outline"
              size={14}
              color={COLORS.teal}
            />
            <Text style={styles.chipText}>{recipe.difficulty}</Text>
          </View>
        </View>

        {/* Ingredients */}
        <Text style={styles.sectionTitle}>Ingredients</Text>

        {loading && (
          <ActivityIndicator
            color={COLORS.teal}
            style={{ marginBottom: 8 }}
          />
        )}

        {error && (
          <Text style={styles.errorText}>
            Could not check your food ({error}). Showing the plain list.
          </Text>
        )}

        {recipe.ingredients.map((ing) => {
          const owned = have.has(ing.name);
          const showStatus = !loading && !error;

          return (
            <View key={ing.name} style={styles.ingRow}>
              {showStatus ? (
                <Ionicons
                  name={
                    owned
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={22}
                  color={owned ? COLORS.green : COLORS.red}
                />
              ) : (
                <Ionicons
                  name="ellipse-outline"
                  size={22}
                  color={COLORS.faint}
                />
              )}

              <Text style={styles.ingName}>{ing.name}</Text>

              <Text style={styles.ingAmount}>{ing.amount}</Text>
            </View>
          );
        })}

        {!loading && !error && (
          <View
            style={[
              styles.summary,
              match.missing.length === 0
                ? styles.summaryOk
                : styles.summaryWarn,
            ]}
          >
            <Text style={styles.summaryText}>
              {match.missing.length === 0
                ? "You have everything you need. Time to cook! 🎉"
                : `You still need: ${match.missing.join(", ")}`}
            </Text>
          </View>
        )}

        {/* Steps */}
        <Text style={styles.sectionTitle}>Steps</Text>

        {recipe.steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>
                {i + 1}
              </Text>
            </View>

            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.card,
  },

  content: {
    paddingBottom: 40,
  },

  hero: {
    width: "100%",
    height: 200,
  },

  body: {
    padding: 20,
  },

  emoji: {
    fontSize: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.navy,
    marginTop: 4,
    marginBottom: 12,
  },

  chips: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.tealBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.teal,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.navy,
    marginTop: 8,
    marginBottom: 12,
  },

  ingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  ingName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.text,
    textTransform: "capitalize",
  },

  ingAmount: {
    fontSize: 13,
    color: COLORS.faint,
  },

  summary: {
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 8,
  },

  summaryOk: {
    backgroundColor: COLORS.greenBg,
  },

  summaryWarn: {
    backgroundColor: COLORS.orangeBg,
  },

  summaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },

  errorText: {
    fontSize: 12,
    color: COLORS.orange,
    marginBottom: 8,
  },

  stepRow: {
    flexDirection: "row",
    marginBottom: 14,
  },

  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  stepNumText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    lineHeight: 22,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  centerText: {
    color: COLORS.faint,
  },
});
