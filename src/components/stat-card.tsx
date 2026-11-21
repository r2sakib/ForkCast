// components/stat-card.tsx
// One number with a label, for the 2 x 2 grid on the Statistics screen.
import { StyleSheet, Text, View } from "react-native";

interface StatCardProps {
  label: string;
  value: string;
  color: string; // colour of the number and the label
  background: string;
  borderColor?: string;
}

export default function StatCard({ label, value, color, background, borderColor }: StatCardProps) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: background },
        borderColor ? { borderColor, borderWidth: 1 } : null,
      ]}
    >
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: "48%", borderRadius: 14, padding: 16, marginBottom: 12 },
  value: { fontSize: 28, fontWeight: "900" },
  label: { fontSize: 13, fontWeight: "700", marginTop: 2 },
});