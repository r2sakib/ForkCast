// components/category-row.tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Palette } from "@/constants/palette";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Category } from "@/types";
import { isCustomCategory } from "@/utils/categories";

interface CategoryRowProps {
  category: Category;
  onDelete: (category: Category) => void;
}

export default function CategoryRow({ category, onDelete }: CategoryRowProps) {
  const { colors } = useAppTheme();
  const custom = isCustomCategory(category);

  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.name, { color: colors.text }]}>{category.name}</Text>

      {custom ? (
        <Pressable
          onPress={() => onDelete(category)}
          hitSlop={10}
          accessibilityLabel={`Delete ${category.name}`}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </Pressable>
      ) : (
        // Default categories are fixed: no delete button, only a small badge
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Default</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  name: { fontSize: 15, fontWeight: "600" },
  badge: {
    backgroundColor: "rgba(193, 106, 60, 0.18)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: "700", color: Palette.muted },
});
