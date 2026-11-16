import { Ionicons } from "@expo/vector-icons";
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
import NotificationItem from "@/components/notification-item";
import { COLORS } from "@/constants/forkcast-colors";
import { useNotifications } from "@/context/notifications-context";
import { AppNotification } from "@/types/insights";

type Filter = "all" | "unread";

export default function AlertsScreen() {
  const { items, loading, error, unreadCount, refresh, markRead, markAllRead } =
    useNotifications();
  const [filter, setFilter] = useState<Filter>("all");

  // Derived value (not state) — computed on every render
  const visible = filter === "unread" ? items.filter((n) => !n.read) : items;

  const handlePress = (n: AppNotification) => {
    if (!n.read) markRead(n.id);
    // Optional: open Member 1's Food Details screen here, e.g.
    // router.push({ pathname: "/food/[id]", params: { id: n.foodId } });
  };

  const renderBody = () => {
    // 1) Loading state (first load)
    if (loading && items.length === 0) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.teal} />
          <Text style={styles.centerText}>Loading alerts…</Text>
        </View>
      );
    }
    // 2) Error state
    if (error && items.length === 0) {
      return (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={44} color={COLORS.faint} />
          <Text style={styles.centerText}>Could not load alerts.{"\n"}{error}</Text>
          <Pressable style={styles.retry} onPress={refresh}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    // 3) Success state (with empty message)
    return (
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={handlePress} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={COLORS.teal} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="notifications-off-outline" size={44} color={COLORS.faint} />
            <Text style={styles.centerText}>
              {filter === "unread" ? "No unread alerts. You are all caught up!" : "No alerts yet."}
            </Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.titleBar}>
        <View>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.subtitle}>{unreadCount} unread</Text>
        </View>
        <Pressable
          onPress={markAllRead}
          disabled={unreadCount === 0}
          style={[styles.markAll, unreadCount === 0 && styles.markAllDisabled]}
        >
          <Text style={styles.markAllText}>Mark all read</Text>
        </Pressable>
      </View>

      <View style={styles.pills}>
        {(["all", "unread"] as Filter[]).map((f) => (
          <Pressable
            key={f}
            style={[styles.pill, filter === f && styles.pillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>
              {f === "all" ? "All" : "Unread"}
            </Text>
          </Pressable>
        ))}
      </View>

      {renderBody()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  titleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.navy,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF" },
  subtitle: { fontSize: 12, color: "#CCFBF1", marginTop: 2 },
  markAll: { backgroundColor: COLORS.teal, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  markAllDisabled: { opacity: 0.4 },
  markAllText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
  pills: { flexDirection: "row", gap: 8, padding: 14 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.teal,
    backgroundColor: "transparent",
  },
  pillActive: { backgroundColor: COLORS.teal },
  pillText: { color: COLORS.teal, fontWeight: "600", fontSize: 13 },
  pillTextActive: { color: "#FFFFFF" },
  list: { paddingBottom: 24, flexGrow: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  centerText: { marginTop: 12, fontSize: 14, color: COLORS.muted, textAlign: "center", lineHeight: 21 },
  retry: { marginTop: 16, backgroundColor: COLORS.teal, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: "#FFFFFF", fontWeight: "700" },
});