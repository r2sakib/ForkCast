import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/forkcast-colors";

interface Props {
  label: string;
  value: string;
  color: string;
  bg: string;
}

export default function StatCard({ label, value, color, bg }: Props) {
  return (
    <View style={[styles.card, { backgroundColor: bg }]}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: "48%", borderRadius: 14, padding: 16, marginBottom: 12 },
  value: { fontSize: 28, fontWeight: "800" },
  label: { fontSize: 13, color: COLORS.muted, marginTop: 2, fontWeight: "600" },
});
```

### 4.2 `src/components/split-bar.tsx`
```tsx
import { StyleSheet, View } from "react-native";
import { COLORS } from "@/constants/forkcast-colors";

interface Props {
  used: number;
  wasted: number;
  height?: number;
}

// A horizontal bar split into green (used) and red (wasted) by proportion.
export default function SplitBar({ used, wasted, height = 14 }: Props) {
  const total = used + wasted;

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      {total === 0 ? (
        <View style={{ flex: 1, backgroundColor: COLORS.border }} />
      ) : (
        <>
          {used > 0 && <View style={{ flex: used, backgroundColor: COLORS.green }} />}
          {wasted > 0 && <View style={{ flex: wasted, backgroundColor: COLORS.red }} />}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: "row", overflow: "hidden", backgroundColor: COLORS.border },
});
```

### 4.3 `src/app/(tabs)/statistics.tsx`
```tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SplitBar from "@/components/split-bar";
import StatCard from "@/components/stat-card";
import { COLORS } from "@/constants/forkcast-colors";
import { getFoodStats } from "@/lib/insights-api";
import { FoodStats } from "@/types/insights";

type Mode = "items" | "percent";

export default function StatisticsScreen() {
  const [stats, setStats] = useState<FoodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("items");

  const load = useCallback(async () => {
    setError(null);
    try {
      setStats(await getFoodStats());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload every time the user opens this tab (data may have changed).
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

  const renderBody = () => {
    if (loading && !stats) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.teal} />
          <Text style={styles.centerText}>Loading statistics…</Text>
        </View>
      );
    }
    if (error && !stats) {
      return (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={44} color={COLORS.faint} />
          <Text style={styles.centerText}>Could not load statistics.{"\n"}{error}</Text>
          <Pressable style={styles.retry} onPress={retry}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    if (!stats) return null;

    const finished = stats.used + stats.wasted;
    const wastePercent = finished > 0 ? Math.round((stats.wasted / finished) * 100) : 0;

    const fmt = (n: number) =>
      mode === "percent"
        ? finished > 0
          ? `${Math.round((n / finished) * 100)}%`
          : "0%"
        : String(n);

    return (
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.teal} />
        }
      >
        {/* Toggle: Items / Percent */}
        <View style={styles.toggle}>
          {(["items", "percent"] as Mode[]).map((m) => (
            <Pressable
              key={m}
              style={[styles.toggleBtn, mode === m && styles.toggleBtnActive]}
              onPress={() => setMode(m)}
            >
              <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
                {m === "items" ? "Items" : "Percent"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Summary cards */}
        <View style={styles.grid}>
          <StatCard label="Used" value={fmt(stats.used)} color={COLORS.green} bg={COLORS.greenBg} />
          <StatCard label="Wasted" value={fmt(stats.wasted)} color={COLORS.red} bg={COLORS.redBg} />
          <StatCard label="Active now" value={String(stats.active)} color={COLORS.teal} bg={COLORS.tealBg} />
          <StatCard label="Expiring soon" value={String(stats.expiringSoon)} color={COLORS.orange} bg={COLORS.orangeBg} />
        </View>

        {finished === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No finished food yet. Mark items as used or wasted to see your waste statistics.
            </Text>
          </View>
        ) : (
          <>
            {/* Used vs wasted */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Used vs wasted</Text>
              <SplitBar used={stats.used} wasted={stats.wasted} height={18} />
              <View style={styles.legend}>
                <Text style={[styles.legendText, { color: COLORS.green }]}>● Used {stats.used}</Text>
                <Text style={[styles.legendText, { color: COLORS.red }]}>● Wasted {stats.wasted}</Text>
              </View>
              <Text style={styles.verdict}>
                You wasted {wastePercent}% of the food you finished.{" "}
                {wastePercent <= 20 ? "Great job! 🎉" : "Try to use items before they expire."}
              </Text>
            </View>

            {/* By category */}
            {stats.byCategory.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>By category</Text>
                {stats.byCategory.map((c) => (
                  <View key={c.category} style={styles.catRow}>
                    <View style={styles.catHeader}>
                      <Text style={styles.catName}>{c.category}</Text>
                      <Text style={styles.catNumbers}>
                        {c.used} used · {c.wasted} wasted
                      </Text>
                    </View>
                    <SplitBar used={c.used} wasted={c.wasted} height={8} />
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>Statistics</Text>
      </View>
      {renderBody()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  titleBar: { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.navy },
  title: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF" },
  content: { padding: 16, paddingBottom: 40 },
  toggle: {
    flexDirection: "row",
    alignSelf: "flex-end",
    backgroundColor: COLORS.border,
    borderRadius: 20,
    padding: 3,
    marginBottom: 14,
  },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 17 },
  toggleBtnActive: { backgroundColor: COLORS.teal },
  toggleText: { fontSize: 12, fontWeight: "600", color: COLORS.muted },
  toggleTextActive: { color: "#FFFFFF" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  section: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.navy, marginBottom: 12 },
  legend: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  legendText: { fontSize: 12, fontWeight: "600" },
  verdict: { marginTop: 12, fontSize: 13, color: COLORS.muted, lineHeight: 19 },
  catRow: { marginBottom: 14 },
  catHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  catName: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  catNumbers: { fontSize: 12, color: COLORS.faint },
  emptyBox: { backgroundColor: COLORS.card, borderRadius: 14, padding: 20 },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: "center", lineHeight: 21 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  centerText: { marginTop: 12, fontSize: 14, color: COLORS.muted, textAlign: "center", lineHeight: 21 },
  retry: { marginTop: 16, backgroundColor: COLORS.teal, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: "#FFFFFF", fontWeight: "700" },
});