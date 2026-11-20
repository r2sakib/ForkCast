// components/product-row.tsx
// One Open Food Facts search result on the Find Product screen.
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Palette } from "@/constants/palette";
import { useAppTheme } from "@/hooks/use-app-theme";
import { OffProduct } from "@/types/food";

interface ProductRowProps {
  product: OffProduct;
  onPress: (product: OffProduct) => void;
}

export default function ProductRow({ product, onPress }: ProductRowProps) {
  const { colors } = useAppTheme();
  // "Ferrero · 400 g" (skip the parts that are empty)
  const details = [product.brand, product.quantity].filter((part) => part.length > 0).join(" · ");

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Ionicons name="image-outline" size={22} color={Palette.muted} />
        </View>
      )}
      <View style={styles.texts}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>
        {details ? (
          <Text style={[styles.details, { color: colors.subtext }]} numberOfLines={1}>
            {details}
          </Text>
        ) : null}
      </View>
      <Ionicons name="add-circle" size={26} color={Palette.accent} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    gap: 12,
  },
  image: { width: 48, height: 48, borderRadius: 8, backgroundColor: "#FFFFFF" },
  placeholder: { alignItems: "center", justifyContent: "center", backgroundColor: "rgba(193, 106, 60, 0.12)" },
  texts: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700" },
  details: { fontSize: 12, marginTop: 2 },
});
