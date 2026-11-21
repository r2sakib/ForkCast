// app/(tabs)/recipes.tsx  -  Member 3: recipe suggestions from the food the user has
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from "@/components/app-button";
import FilterPills, { PillOption } from "@/components/filter-pills";
import RecipeCard from "@/components/recipe-card";
import SearchBar from "@/components/search-bar";
import { Palette } from "@/constants/palette";
import { useFoods } from "@/context/foods-context";
import { RECIPES } from "@/data/recipes";
import { useAppTheme } from "@/hooks/use-app-theme";
import { RecipeMatch, rankRecipes } from "@/utils/recipe-match";

type RecipeFilter = "all" | "ready";

const FILTERS: PillOption<RecipeFilter>[] = [
  { value: "all", label: "All matches" },
  { value: "ready", label: "Ready to cook" },
];

export default function RecipesScreen() {
  const { colors } = useAppTheme();
  const { items, status, error, refresh } = useFoods();

  // Local state: only this screen needs it (Week 5 rule)
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RecipeFilter>("all");

  // Derived values: calculated during render, never copied into state
  const foodNames = useMemo(
    () => items.filter((f) => f.status === "active").map((f) => f.name),
    [items]
  );
  const ranked = useMemo(() => rankRecipes(RECIPES, foodNames), [foodNames]);

  const q = query.trim().toLowerCase();
  const visible = ranked.filter(
    (m) =>
      m.score > 0 &&
      m.recipe.title.toLowerCase().includes(q) &&
      (filter === "all" || m.missing.length === 0)
  );

  const openRecipe = (match: RecipeMatch) => {
    router.push({ pathname: "/recipe/[id]", params: { id: match.recipe.id } });
  };

  // Loading state: first load, nothing to show yet
  if (status === "loading" && items.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Palette.accent} />
      </View>
    );
  }

  // Error state: first load failed
  if (status === "error" && items.length === 0) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Could not load your food</Text>
        <Text style={[styles.errorText, { color: colors.subtext }]}>{error}</Text>
        <View style={styles.retry}>
          <AppButton title="TRY AGAIN" onPress={refresh} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={visible}
        keyExtractor={(item) => item.recipe.id}
        renderItem={({ item }) => <RecipeCard match={item} onPress={openRecipe} />}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        // A JSX element (not a component function), so the keyboard stays open while typing
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>What can I cook?</Text>

            <ImageBackground
              source={require("../../../assets/images/recipe-banner.jpg")}
              style={styles.banner}
              imageStyle={styles.bannerImage}
            >
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerText}>
                  {foodNames.length} food items in your kitchen → {visible.length} recipe ideas
                </Text>
              </View>
            </ImageBackground>

            <SearchBar value={query} onChangeText={setQuery} placeholder="Search recipes..." />
            <View style={styles.pills}>
              <FilterPills options={FILTERS} selected={filter} onSelect={setFilter} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="restaurant-outline" size={44} color={Palette.muted} />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              {foodNames.length === 0
                ? "You have no food yet. Add food on the Home tab to get recipe ideas."
                : "No recipes match. Try clearing the search or the Ready to cook filter."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  list: { padding: 16, paddingBottom: 24 },
  header: { marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "900", marginBottom: 12 },
  banner: { height: 120, marginBottom: 12 },
  bannerImage: { borderRadius: 14 },
  bannerOverlay: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "rgba(56,26,11,0.45)",
    justifyContent: "flex-end",
    padding: 12,
  },
  bannerText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  pills: { marginTop: 10, marginBottom: 6 },
  empty: { alignItems: "center", marginTop: 32, gap: 10 },
  emptyText: { textAlign: "center", fontSize: 14, lineHeight: 20 },
  errorTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  errorText: { fontSize: 14, textAlign: "center" },
  retry: { marginTop: 18, alignSelf: "stretch" },
});