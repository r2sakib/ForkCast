// app/(tabs)/home.tsx  -  Member 1: the food list (search, filter, colour badges)
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from "@/components/app-button";
import FilterPills, { PillOption } from "@/components/filter-pills";
import FoodCard from "@/components/food-card";
import SearchBar from "@/components/search-bar";
import { SOON_DAYS, STORAGE_OPTIONS } from "@/constants/food";
import { Palette } from "@/constants/palette";
import { useAuth } from "@/context/auth-context";
import { useCategories } from "@/context/categories-context";
import { useFoods } from "@/context/foods-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Food, StoragePlace } from "@/types/food";
import { categoryName, daysUntil, formatQuantity, sortByExpiry, storageLabel } from "@/utils/food";

type StorageFilter = StoragePlace | "all";

const STORAGE_FILTERS: PillOption<StorageFilter>[] = [
  { value: "all", label: "All" },
  ...STORAGE_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
];

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { items: categories } = useCategories();
  const { items, status, error, refresh } = useFoods();

  // Local state: only this screen needs it (Week 5 rule)
  const [query, setQuery] = useState("");
  const [storage, setStorage] = useState<StorageFilter>("all");

  // Derived values: calculated during render, never copied into state
  const activeFoods = items.filter((f) => f.status === "active");
  const q = query.trim().toLowerCase();
  const visible = sortByExpiry(
    activeFoods.filter((f) => {
      const matchesStorage = storage === "all" || f.storage === storage;
      const matchesQuery =
        q.length === 0 ||
        f.name.toLowerCase().includes(q) ||
        (f.brand ?? "").toLowerCase().includes(q) ||
        categoryName(categories, f.categoryId).toLowerCase().includes(q);
      return matchesStorage && matchesQuery;
    })
  );
  const urgentCount = activeFoods.filter((f) => {
    const days = daysUntil(f.expiryDate);
    return days !== null && days <= SOON_DAYS;
  }).length;
  const firstName = (user?.name ?? "").trim().split(" ")[0];

  const openFood = (food: Food) => {
    router.push({ pathname: "/food/[id]", params: { id: String(food.id) } });
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
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <FoodCard
            food={item}
            subtitle={`${formatQuantity(item)} · ${storageLabel(item.storage)} · ${categoryName(categories, item.categoryId)}`}
            onPress={openFood}
          />
        )}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={status === "loading"}
            onRefresh={refresh}
            tintColor={Palette.accent}
            colors={[Palette.accent]}
          />
        }
        // A JSX element (not a component function), so the search box keeps focus while typing
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.titleTexts}>
                <Text style={[styles.hello, { color: colors.subtext }]}>Hello, {firstName}!</Text>
                <Text style={[styles.title, { color: colors.text }]}>My Kitchen</Text>
              </View>
              <Pressable
                style={[styles.historyButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push("/food/history")}
                accessibilityLabel="Waste history"
              >
                <Ionicons name="time-outline" size={22} color={Palette.gold} />
              </Pressable>
            </View>

            <Text style={[styles.summary, { color: colors.subtext }]}>
              {activeFoods.length} item{activeFoods.length === 1 ? "" : "s"}
              {urgentCount > 0 ? ` · ${urgentCount} to use soon` : ""}
            </Text>

            <SearchBar value={query} onChangeText={setQuery} placeholder="Search food, brand or category" />
            <View style={styles.pills}>
              <FilterPills options={STORAGE_FILTERS} selected={storage} onSelect={setStorage} />
            </View>

            {status === "error" ? (
              <Text style={[styles.banner, { color: colors.danger }]}>{error}</Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="nutrition-outline" size={44} color={Palette.muted} />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              {activeFoods.length === 0
                ? "Your kitchen is empty.\nTap + to add the food you bought."
                : "No food matches your search."}
            </Text>
          </View>
        }
      />

      {/* Floating "+" button: start with the Open Food Facts search */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push("/food/search")}
        accessibilityLabel="Add food"
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  list: { padding: 16, paddingBottom: 110 },
  header: { marginBottom: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  titleTexts: { flex: 1 },
  hello: { fontSize: 14, fontWeight: "600" },
  title: { fontSize: 28, fontWeight: "900" },
  historyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  summary: { fontSize: 13, marginBottom: 12 },
  pills: { marginTop: 10, marginBottom: 6 },
  banner: { fontSize: 13, fontWeight: "600", marginTop: 6 },
  empty: { alignItems: "center", marginTop: 48, gap: 10 },
  emptyText: { textAlign: "center", fontSize: 14, lineHeight: 20 },
  errorTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  errorText: { fontSize: 14, textAlign: "center" },
  retry: { marginTop: 18, alignSelf: "stretch" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Palette.accent,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabPressed: { opacity: 0.85 },
});
