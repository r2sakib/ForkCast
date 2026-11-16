import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RecipeCard from "@/components/recipe-card";
import { COLORS } from "@/constants/forkcast-colors";
import { RECIPES } from "@/data/recipes";
import { useActiveFoods } from "@/hooks/use-active-foods";
import { RecipeMatch, rankRecipes } from "@/lib/recipe-match";

export default function RecipesScreen() {
  const { foods, loading, error, reload } = useActiveFoods();
  const [query, setQuery] = useState("");
  const [readyOnly, setReadyOnly] = useState(false);

  // Derived values — recomputed when foods / query / switch change
  const ranked = useMemo(
    () => rankRecipes(RECIPES, foods.map((f) => f.name)),
    [foods]
  );

  const visible = ranked.filter(
    (m) =>
      m.score > 0 &&
      m.recipe.title.toLowerCase().includes(query.toLowerCase()) &&
      (!readyOnly || m.missing.length === 0)
  );

  const openRecipe = (m: RecipeMatch) => {
    router.push({ pathname: "/recipe/[id]", params: { id: m.recipe.id } });
  };

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.teal} />
          <Text style={styles.centerText}>Checking your food…</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={44} color={COLORS.faint} />
          <Text style={styles.centerText}>Could not load your food.{"\n"}{error}</Text>
          <Pressable style={styles.retry} onPress={reload}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <FlatList
        data={visible}
        keyExtractor={(item) => item.recipe.id}
        renderItem={({ item }) => <RecipeCard match={item} onPress={openRecipe} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>🥣</Text>
            <Text style={styles.centerText}>
              {foods.length === 0
                ? "You have no active food. Add food on the Home tab to get recipe ideas."
                : "No recipes match. Try clearing the search or the Ready filter."}
            </Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>What can I cook?</Text>
      </View>

      {/* Image banner */}
      <ImageBackground
        source={require("../../../assets/images/recipe-banner.jpg")}
        style={styles.banner}
        imageStyle={styles.bannerImage}
      >
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerText}>
            {foods.length} active food items → {visible.length} recipe ideas
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Search recipes..."
          placeholderTextColor={COLORS.faint}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Ready to cook only</Text>
        <Switch
          value={readyOnly}
          onValueChange={setReadyOnly}
          trackColor={{ true: COLORS.teal }}
        />
      </View>

      {renderBody()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  titleBar: { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.navy },
  title: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF" },
  banner: { height: 120, margin: 14, marginBottom: 8 },
  bannerImage: { borderRadius: 14 },
  bannerOverlay: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "rgba(13,31,78,0.45)",
    justifyContent: "flex-end",
    padding: 12,
  },
  bannerText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  searchWrap: { paddingHorizontal: 14, paddingBottom: 6 },
  search: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  switchLabel: { fontSize: 13, fontWeight: "600", color: COLORS.muted },
  list: { paddingTop: 4, paddingBottom: 24, flexGrow: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyEmoji: { fontSize: 44 },
  centerText: { marginTop: 12, fontSize: 14, color: COLORS.muted, textAlign: "center", lineHeight: 21 },
  retry: { marginTop: 16, backgroundColor: COLORS.teal, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: "#FFFFFF", fontWeight: "700" },
});