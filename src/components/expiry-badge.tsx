// components/expiry-badge.tsx
// The green / orange / red / grey badge. The colour logic lives in utils/food.ts.
import { StyleSheet, Text, View } from "react-native";
import { getExpiryInfo } from "@/utils/food";

interface ExpiryBadgeProps {
  expiryDate: string | null;
}

export default function ExpiryBadge({ expiryDate }: ExpiryBadgeProps) {
  const info = getExpiryInfo(expiryDate);

  return (
    <View style={[styles.badge, { backgroundColor: info.colors.bg }]}>
      <Text style={[styles.text, { color: info.colors.text }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  text: { fontSize: 11, fontWeight: "800" },
});
