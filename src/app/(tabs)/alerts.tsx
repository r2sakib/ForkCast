// app/(tabs)/alerts.tsx  -  Member 3: alerts for food that is expiring or expired
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
import NotificationItem from "@/components/notification-item";
import { Palette } from "@/constants/palette";
import { useNotifications } from "@/context/notifications-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { AppNotification } from "@/types/insights";

type AlertFilter = "all" | "unread";

const FILTERS: PillOption<AlertFilter>[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
];

export default function AlertsScreen() {
  const { colors } = useAppTheme();
  const { items, status, error, unreadCount, refresh, markRead, markAllRead } = useNotifications();

  // Local state: only this screen needs it (Week 5 rule)
  const [filter, setFilter] = useState<AlertFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Derived value: calculated during render, never copied into state
  const visible = filter === "unread" ? items.filter((n) => !n.read) : items;

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const openAlert = (n: AppNotification) => {
    if (!n.read) markRead(n.id);
    router.push({ pathname: "/food/[id]", params: { id: String(n.foodId) } });
  };

  const renderBody = () => {
    // Loading state: first load, nothing to show yet
    if ((status === "loading" || status === "idle") && items.length === 0) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Palette.accent} />
        </View>
      );
    }

    // Error state: first load failed
    if (status === "error" && items.length === 0) {
      return (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={44} color={Palette.muted} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Could not load your alerts</Text>
          <Text style={[styles.errorText, { color: colors.subtext }]}>{error}</Text>
          <View style={styles.retry}>
            <AppButton title="TRY AGAIN" onPress={refresh} />
          </View>
        </View>
      );
    }

    // Success state (with an empty message)
    return (
      <FlatList
        data={visible}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <NotificationItem notification={item} onPress={openAlert} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Palette.accent}
            colors={[Palette.accent]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={44} color={Palette.muted} />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              {filter === "unread"
                ? "No unread alerts. You are all caught up!"
                : "No alerts yet. You will see food here when it is about to expire."}
            </Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.titleTexts}>
          <Text style={[styles.title, { color: colors.text }]}>Alerts</Text>
          <Text style={[styles.summary, { color: colors.subtext }]}>
            {unreadCount === 0 ? "You are all caught up" : `${unreadCount} unread`}
          </Text>
        </View>
        <Pressable onPress={markAllRead} disabled={unreadCount === 0} hitSlop={10}>
          <Text style={[styles.markAll, unreadCount === 0 && styles.markAllOff]}>Mark all read</Text>
        </Pressable>
      </View>

      <View style={styles.pills}>
        <FilterPills options={FILTERS} selected={filter} onSelect={setFilter} />
      </View>

      {renderBody()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8 },
  titleTexts: { flex: 1 },
  title: { fontSize: 28, fontWeight: "900" },
  summary: { fontSize: 13, marginTop: 2 },
  markAll: { color: Palette.accent, fontWeight: "800", fontSize: 13 },
  markAllOff: { opacity: 0.35 },
  pills: { paddingHorizontal: 16, marginTop: 10, marginBottom: 6 },
  list: { padding: 16, paddingBottom: 24, flexGrow: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  empty: { alignItems: "center", marginTop: 48, gap: 10 },
  emptyText: { textAlign: "center", fontSize: 14, lineHeight: 20 },
  errorTitle: { fontSize: 18, fontWeight: "800", marginTop: 12, marginBottom: 6 },
  errorText: { fontSize: 14, textAlign: "center" },
  retry: { marginTop: 18, alignSelf: "stretch" },
});
