import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/forkcast-colors";
import { timeAgo } from "@/lib/time";
import { AppNotification, NotificationType } from "@/types/insights";

interface Props {
  notification: AppNotification;
  onPress: (n: AppNotification) => void;
}

const TYPE_STYLE: Record<
  NotificationType,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; label: string }
> = {
  EXPIRING_SOON: { icon: "time-outline", color: COLORS.orange, bg: COLORS.orangeBg, label: "Expiring soon" },
  EXPIRES_TODAY: { icon: "alert-circle-outline", color: COLORS.orange, bg: COLORS.orangeBg, label: "Expires today" },
  EXPIRED: { icon: "close-circle-outline", color: COLORS.red, bg: COLORS.redBg, label: "Expired" },
};

export default function NotificationItem({ notification, onPress }: Props) {
  const style = TYPE_STYLE[notification.type];

  return (
    <Pressable
      style={[styles.row, !notification.read && styles.rowUnread]}
      onPress={() => onPress(notification)}
    >
      <View style={[styles.iconWrap, { backgroundColor: style.bg }]}>
        <Ionicons name={style.icon} size={22} color={style.color} />
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={[styles.label, { color: style.color }]}>{style.label}</Text>
          <Text style={styles.time}>{timeAgo(notification.createdAt)}</Text>
        </View>
        <Text style={[styles.message, !notification.read && styles.messageUnread]}>
          {notification.message}
        </Text>
      </View>

      {!notification.read && <View style={styles.dot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    marginHorizontal: 14,
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  rowUnread: { borderLeftWidth: 4, borderLeftColor: COLORS.teal },
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
  label: { fontSize: 12, fontWeight: "700" },
  time: { fontSize: 11, color: COLORS.faint },
  message: { fontSize: 14, color: COLORS.muted },
  messageUnread: { color: COLORS.text, fontWeight: "600" },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.teal, marginLeft: 8 },
});