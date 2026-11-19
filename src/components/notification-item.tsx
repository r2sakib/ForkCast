// components/notification-item.tsx
// One alert in the list: icon, label, time, message and an unread dot.
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { EXPIRY_COLOURS } from "@/constants/food";
import { Palette } from "@/constants/palette";
import { useAppTheme } from "@/hooks/use-app-theme";
import { AlertType, AppNotification } from "@/types/insights";
import { timeAgo } from "@/utils/time";

interface NotificationItemProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
}

// Same colours as Sadman's expiry badge: red = expired / today, orange = soon
const ALERT_LOOK: Record<
  AlertType,
  { icon: keyof typeof Ionicons.glyphMap; label: string; colors: { bg: string; text: string } }
> = {
  expiring: { icon: "time-outline", label: "Expiring soon", colors: EXPIRY_COLOURS.orange },
  today: { icon: "alert-circle-outline", label: "Expires today", colors: EXPIRY_COLOURS.red },
  expired: { icon: "close-circle-outline", label: "Expired", colors: EXPIRY_COLOURS.red },
};

export default function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const { colors } = useAppTheme();
  const look = ALERT_LOOK[notification.type];

  return (
    <Pressable
      onPress={() => onPress(notification)}
      style={[
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border },
        !notification.read && styles.unread,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: look.colors.bg }]}>
        <Ionicons name={look.icon} size={22} color={look.colors.text} />
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={[styles.label, { color: look.colors.text }]}>{look.label}</Text>
          <Text style={[styles.time, { color: colors.subtext }]}>
            {timeAgo(notification.createdAt)}
          </Text>
        </View>
        <Text
          style={[
            styles.message,
            { color: notification.read ? colors.subtext : colors.text },
            !notification.read && styles.messageUnread,
          ]}
        >
          {notification.message}
        </Text>
      </View>

      {!notification.read ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  unread: { borderLeftWidth: 4, borderLeftColor: Palette.accent },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  info: { flex: 1 },
  topRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  label: { fontSize: 12, fontWeight: "800" },
  time: { fontSize: 11 },
  message: { fontSize: 14 },
  messageUnread: { fontWeight: "700" },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Palette.accent, marginLeft: 8 },
});
