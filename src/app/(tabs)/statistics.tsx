// app/(tabs)/statistics.tsx  -  Member 3: the statistics dashboard (GET /foods/stats)
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from "@/components/app-button";
import FilterPills, { PillOption } from "@/components/filter-pills";
import SplitBar from "@/components/split-bar";
import StatCard from "@/components/stat-card";
import { EXPIRY_COLOURS } from "@/constants/food";
import { Palette } from "@/constants/palette";
import { useAppTheme } from "@/hooks/use-app-theme";
import { fetchFoodStats } from "@/services/insights";
import { FoodStats } from "@/types/insights";
import { getErrorMessage } from "@/utils/errors";

type Mode = "items" | "percent";

const MODES: PillOption<Mode>[] = [
  { value: "items", label: "Items" },
  { value: "percent", label: "Percent" },
];

export default function StatisticsScreen() {
  const { colors } = useAppTheme();
  const [stats, setStats] = useState<FoodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("items");

  const load = useCallback(async () => {
    setError(null);
    try {
      setStats(await fetchFoodStats());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Tabs stay mounted, so a plain useEffect would load only once.
  // useFocusEffect loads again every time the user opens this tab.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const retry = () => {
    setLoading(true);
    load();
  };

  // Loading state: first load, nothing to show yet
  if (loading && !stats) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Palette.accent} />
      </View>
    );
  }

  // Error state: first load failed
  if (error && !stats) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="cloud-offline-outline" size={44} color={Palette.muted} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>Could not load statistics</Text>
        <Text style={[styles.errorText, { color: colors.subtext }]}>{error}</Text>
        <View style={styles.retry}>
          <AppButton title="TRY AGAIN" onPress={retry} />
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) return null;

  // Derived values: calculated during render, never copied into state
  const finished = stats.used + stats.wasted;
  const wastePercent = finished > 0 ? Math.round((stats.wasted / finished) * 100) : 0;
  const show = (n: number) =>
    mode === "percent" ? `${finished > 0 ? Math.round((n / finished) * 100) : 0}%` : String(n);

  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Palette.accent}
            colors={[Palette.accent]}
          />
        }
      >
        <Text style={[styles.title, { color: colors.text }]}>Statistics</Text>
        <Text style={[styles.summary, { color: colors.subtext }]}>
          How much of your food you used and how much you threw away.
        </Text>

        <View style={styles.pills}>
          <FilterPills options={MODES} selected={mode} onSelect={setMode} />
        </View>

        {/* The 4 numbers */}
        <View style={styles.grid}>
          <StatCard
            label="Used"
            value={show(stats.used)}
            color={EXPIRY_COLOURS.green.text}
            background={EXPIRY_COLOURS.green.bg}
          />
          <StatCard
            label="Wasted"
            value={show(stats.wasted)}
            color={EXPIRY_COLOURS.red.text}
            background={EXPIRY_COLOURS.red.bg}
          />
          <StatCard
            label="In your kitchen"
            value={String(stats.active)}
            color={Palette.accent}
            background={colors.surface}
            borderColor={colors.border}
          />
          <StatCard
            label="Expiring soon"
            value={String(stats.expiringSoon)}
            color={EXPIRY_COLOURS.orange.text}
            background={EXPIRY_COLOURS.orange.bg}
          />
        </View>

        {finished === 0 ? (
          <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              No finished food yet. Mark food as used or wasted on the Home tab to see your waste
              statistics here.
            </Text>
          </View>
        ) : (
          <>
            <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.boxTitle, { color: colors.text }]}>Used vs wasted</Text>
              <SplitBar used={stats.used} wasted={stats.wasted} height={18} />
              <View style={styles.legend}>
                <Text style={[styles.legendText, { color: EXPIRY_COLOURS.green.text }]}>
                  ● Used {stats.used}
                </Text>
                <Text style={[styles.legendText, { color: EXPIRY_COLOURS.red.text }]}>
                  ● Wasted {stats.wasted}
                </Text>
              </View>
              <Text style={[styles.verdict, { color: colors.subtext }]}>
                You wasted {wastePercent}% of the food you finished.{" "}
                {wastePercent <= 20 ? "Great job!" : "Try to use food before it expires."}
              </Text>
            </View>

            <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.boxTitle, { color: colors.text }]}>By category</Text>
              {stats.byCategory.map((c) => (
                <View key={c.categoryId} style={styles.catRow}>
                  <View style={styles.catHeader}>
                    <Text style={[styles.catName, { color: colors.text }]}>{c.category}</Text>
                    <Text style={[styles.catNumbers, { color: colors.subtext }]}>
                      {c.used} used · {c.wasted} wasted
                    </Text>
                  </View>
                  <SplitBar used={c.used} wasted={c.wasted} height={8} />
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "900" },
  summary: { fontSize: 13, marginTop: 2 },
  pills: { marginTop: 10, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  box: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 14 },
  boxTitle: { fontSize: 15, fontWeight: "800", marginBottom: 12 },
  legend: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  legendText: { fontSize: 12, fontWeight: "700" },
  verdict: { marginTop: 12, fontSize: 13, lineHeight: 19 },
  catRow: { marginBottom: 14 },
  catHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  catName: { fontSize: 13, fontWeight: "700" },
  catNumbers: { fontSize: 12 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 21 },
  errorTitle: { fontSize: 18, fontWeight: "800", marginTop: 12, marginBottom: 6 },
  errorText: { fontSize: 14, textAlign: "center" },
  retry: { marginTop: 18, alignSelf: "stretch" },
});