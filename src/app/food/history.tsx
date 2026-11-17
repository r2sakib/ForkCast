// app/food/history.tsx  -  Waste History: food marked as used or wasted
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import AppButton from "@/components/app-button";
import FilterPills, { PillOption } from "@/components/filter-pills";
import FoodCard from "@/components/food-card";
import { Palette } from "@/constants/palette";
import { useFoods } from "@/context/foods-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Food } from "@/types/food";
import { getErrorMessage } from "@/utils/errors";
import { formatDate, formatQuantity } from "@/utils/food";

type HistoryFilter = "all" | "used" | "wasted";

const FILTERS: PillOption<HistoryFilter>[] = [
  { value: "all", label: "All" },
  { value: "wasted", label: "Wasted" },
  { value: "used", label: "Used" },
];

export default function WasteHistoryScreen() {
  const { colors } = useAppTheme();
  const { items, status, error, refresh, editFood } = useFoods();

  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [undoingId, setUndoingId] = useState<number | null>(null); // the row whose Undo is running
  const [actionError, setActionError] = useState<string | null>(null);

  // Derived during render (Week 5: never copy context data into useState)
  const finished = items.filter((f) => f.status !== "active");
  const usedCount = finished.filter((f) => f.status === "used").length;
  const wastedCount = finished.length - usedCount;
  const wasteRate = finished.length === 0 ? 0 : Math.round((wastedCount / finished.length) * 100);
  const visible = finished
    .filter((f) => filter === "all" || f.status === filter)
    // newest first; ISO date-times sort correctly as text
    .sort((a, b) => (b.finishedAt ?? "").localeCompare(a.finishedAt ?? ""));

  // Undo = PATCH /foods/:id { status: "active" }. The food goes back to Home.
  const handleUndo = async (food: Food) => {
    setUndoingId(food.id);
    setActionError(null);
    try {
      await editFood(food.id, { status: "active" });
    } catch (e) {
      setActionError(getErrorMessage(e));
    } finally {
      setUndoingId(null);
    }
  };

  const openFood = (food: Food) => {
    router.push({ pathname: "/food/[id]", params: { id: String(food.id) } });
  };

  // One red line: a failed Undo, or a failed refresh while the list is on screen
  const bannerError = actionError ?? (status === "error" ? error : null);

  if (status === "loading" && items.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Palette.accent} />
      </View>
    );
  }

  if (status === "error" && items.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Could not load your history</Text>
        <Text style={[styles.errorText, { color: colors.subtext }]}>{error}</Text>
        <View style={styles.retry}>
          <AppButton title="TRY AGAIN" onPress={refresh} />
        </View>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.list}
      data={visible}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <FoodCard
          food={item}
          subtitle={`${formatQuantity(item)} · ${item.status === "wasted" ? "Wasted" : "Used"} on ${formatDate(item.finishedAt)}`}
          onPress={openFood}
          right={
            <Pressable
              style={[styles.undo, { borderColor: colors.border }]}
              onPress={() => handleUndo(item)}
              disabled={undoingId !== null}
              accessibilityLabel={`Move ${item.name} back to my list`}
            >
              {undoingId === item.id ? (
                <ActivityIndicator size="small" color={Palette.accent} />
              ) : (
                <Text style={styles.undoText}>Undo</Text>
              )}
            </Pressable>
          }
        />
      )}
      refreshControl={
        <RefreshControl
          refreshing={status === "loading"}
          onRefresh={refresh}
          tintColor={Palette.accent}
          colors={[Palette.accent]}
        />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          {/* Summary: the "how much do I waste?" answer from the proposal */}
          <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, styles.used]}>{usedCount}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Used</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, styles.wasted]}>{wastedCount}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Wasted</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{wasteRate}%</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Waste rate</Text>
            </View>
          </View>

          <FilterPills options={FILTERS} selected={filter} onSelect={setFilter} />

          {bannerError ? (
            <Text style={[styles.banner, { color: colors.danger }]}>{bannerError}</Text>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <Text style={[styles.empty, { color: colors.subtext }]}>
          {finished.length === 0
            ? "Nothing here yet.\nFood you mark as used or wasted appears here."
            : "No food in this filter."}
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  errorTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  errorText: { fontSize: 14, textAlign: "center" },
  retry: { marginTop: 18, alignSelf: "stretch" },
  list: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 12, gap: 12 },
  summary: { flexDirection: "row", borderWidth: 1, borderRadius: 16, paddingVertical: 16 },
  stat: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 26, fontWeight: "900" },
  statLabel: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  used: { color: "#15803D" },
  wasted: { color: "#B91C1C" },
  banner: { fontSize: 13, fontWeight: "600" },
  undo: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 60,
    alignItems: "center",
  },
  undoText: { color: Palette.accent, fontWeight: "800", fontSize: 12 },
  empty: { textAlign: "center", marginTop: 40, fontSize: 14, lineHeight: 20 },
});
