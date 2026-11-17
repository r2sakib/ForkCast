// components/food-card.tsx
// One food in a list (Home and Waste History). Same idea as ArticleCard in Week 3.
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Palette } from "@/constants/palette";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Food, StoragePlace } from "@/types/food";
import ExpiryBadge from "./expiry-badge";

const STORAGE_ICONS: Record<StoragePlace, React.ComponentProps<typeof Ionicons>["name"]> = {
  fridge: "snow-outline",
  freezer: "cube-outline",
  pantry: "file-tray-stacked-outline",
};

interface FoodCardProps {
  food: Food;
  subtitle: string; // e.g. "2 L · Fridge · Dairy"
  onPress: (food: Food) => void;
  right?: React.ReactNode; // default: the expiry badge
}

export default function FoodCard({ food, subtitle, onPress, right }: FoodCardProps) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => onPress(food)}
      activeOpacity={0.7}
    >
      {food.imageUrl ? (
        <Image source={{ uri: food.imageUrl }} style={styles.image} />
      ) : (
        // No picture (added by hand): show the storage icon instead
        <View style={[styles.image, styles.placeholder]}>
          <Ionicons name={STORAGE_ICONS[food.storage]} size={24} color={Palette.gold} />
        </View>
      )}

      <View style={styles.texts}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {food.name}
        </Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {right ?? <ExpiryBadge expiryDate={food.expiryDate} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  image: { width: 52, height: 52, borderRadius: 10 },
  placeholder: {
    backgroundColor: "rgba(210, 132, 40, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  texts: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700" },
  subtitle: { fontSize: 12, marginTop: 3 },
});
