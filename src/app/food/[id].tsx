// app/food/[id].tsx  -  Food Details (dynamic route, Week 3)
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AppButton from "@/components/app-button";
import ExpiryBadge from "@/components/expiry-badge";
import { Palette } from "@/constants/palette";
import { useCategories } from "@/context/categories-context";
import { useFoods } from "@/context/foods-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { FoodStatus } from "@/types/food";
import { confirmAction } from "@/utils/confirm";
import { getErrorMessage } from "@/utils/errors";
import { categoryName, formatDate, formatQuantity, storageLabel } from "@/utils/food";

type DetailParams = { id: string };

export default function FoodDetailsScreen() {
  const { id } = useLocalSearchParams<DetailParams>();
  const foodId = Number(id);
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const { items: categories } = useCategories();
  const { items, loadFood, editFood, removeFood } = useFoods();

  // The food comes from the shared list, so every change shows here at once
  const food = items.find((f) => f.id === foodId);

  const [loading, setLoading] = useState(true); // GET /foods/:id is running
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0); // "Try again" adds 1, which re-runs the effect
  const [busy, setBusy] = useState(false); // used / wasted / delete is running
  const [actionError, setActionError] = useState<string | null>(null);

  // Ask the server for the newest version (GET /foods/:id). Cleanup = Week 4 idea.
  useEffect(() => {
    let cancelled = false;
    loadFood(foodId)
      .then(() => {
        if (!cancelled) setLoadError(null);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(getErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [foodId, loadFood, reloadCount]);

  // Header: the food's name + an edit button on the right (Week 3, Exercise 2)
  useEffect(() => {
    navigation.setOptions({
      title: food?.name ?? "Food Details",
      headerRight:
        food && food.status === "active"
          ? () => (
              <Pressable
                onPress={() => router.push({ pathname: "/food/form", params: { id: String(food.id) } })}
                hitSlop={10}
                accessibilityLabel="Edit food"
              >
                <Ionicons name="create-outline" size={22} color="#FFFFFF" />
              </Pressable>
            )
          : undefined,
    });
  }, [navigation, food]);

  const retry = () => {
    setLoading(true);
    setLoadError(null);
    setReloadCount((n) => n + 1);
  };

  // Not in the list yet: loading, failed, or the id does not exist
  if (!food) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        {loading ? (
          <ActivityIndicator size="large" color={Palette.accent} />
        ) : (
          <>
            <Text style={[styles.errorTitle, { color: colors.text }]}>Food not found</Text>
            <Text style={[styles.errorText, { color: colors.subtext }]}>
              {loadError ?? "It may have been deleted."}
            </Text>
            <View style={styles.retry}>
              <AppButton title="TRY AGAIN" onPress={retry} />
            </View>
          </>
        )}
      </View>
    );
  }

  // PATCH /foods/:id { status } and go back to the list
  const changeStatus = async (status: FoodStatus) => {
    setBusy(true);
    setActionError(null);
    try {
      await editFood(food.id, { status });
      router.back();
    } catch (e) {
      setActionError(getErrorMessage(e));
      setBusy(false);
    }
  };

  const handleUsed = () => changeStatus("used");

  const handleWasted = () => {
    confirmAction(
      "Threw it away?",
      `Mark "${food.name}" as wasted? It will count in your waste statistics.`,
      "Wasted",
      () => changeStatus("wasted")
    );
  };

  const handleDelete = () => {
    confirmAction(
      "Delete food",
      `Delete "${food.name}" for good? Use this only for mistakes. It will not count as used or wasted.`,
      "Delete",
      async () => {
        setBusy(true);
        setActionError(null);
        try {
          await removeFood(food.id);
          router.back();
        } catch (e) {
          setActionError(getErrorMessage(e));
          setBusy(false);
        }
      }
    );
  };

  const isActive = food.status === "active";
  const rows: { label: string; value: string }[] = [
    { label: "Quantity", value: formatQuantity(food) },
    { label: "Category", value: categoryName(categories, food.categoryId) },
    { label: "Stored in", value: storageLabel(food.storage) },
    { label: "Expiry date", value: formatDate(food.expiryDate) },
    { label: "Added on", value: formatDate(food.createdAt) },
  ];
  if (!isActive) {
    rows.push({ label: food.status === "used" ? "Used on" : "Thrown away on", value: formatDate(food.finishedAt) });
  }
  if (food.barcode) rows.push({ label: "Barcode", value: food.barcode });

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {food.imageUrl ? (
          <Image source={{ uri: food.imageUrl }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Ionicons name="nutrition-outline" size={48} color={Palette.gold} />
          </View>
        )}
        <Text style={[styles.name, { color: colors.text }]}>{food.name}</Text>
        {food.brand ? <Text style={[styles.brand, { color: colors.subtext }]}>{food.brand}</Text> : null}
        <View style={styles.badgeRow}>
          {isActive ? (
            <ExpiryBadge expiryDate={food.expiryDate} />
          ) : (
            <View style={[styles.status, food.status === "wasted" ? styles.statusWasted : styles.statusUsed]}>
              <Text style={styles.statusText}>{food.status === "wasted" ? "Wasted" : "Used"}</Text>
            </View>
          )}
        </View>
      </View>

      {/* A refresh failed, but we still have the saved copy */}
      {loadError ? (
        <Text style={[styles.warning, { color: colors.subtext }]}>Could not refresh: {loadError}</Text>
      ) : null}

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {rows.map((row, index) => (
          <View
            key={row.label}
            style={[
              styles.row,
              index < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.rowLabel, { color: colors.subtext }]}>{row.label}</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}

      <View style={styles.actions}>
        {isActive ? (
          <>
            <AppButton title="MARK AS USED" onPress={handleUsed} loading={busy} />
            <AppButton title="THREW IT AWAY" variant="danger" onPress={handleWasted} disabled={busy} />
          </>
        ) : (
          <AppButton title="MOVE BACK TO MY LIST" onPress={() => changeStatus("active")} loading={busy} />
        )}
        <Pressable onPress={handleDelete} disabled={busy} style={styles.delete}>
          <Text style={[styles.deleteText, { color: colors.subtext }]}>Delete (added by mistake)</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  errorTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  errorText: { fontSize: 14, textAlign: "center" },
  retry: { marginTop: 18, alignSelf: "stretch" },
  content: { padding: 20, paddingBottom: 48 },
  hero: { alignItems: "center", borderWidth: 1, borderRadius: 18, padding: 20 },
  image: { width: 120, height: 120, borderRadius: 14, backgroundColor: "#FFFFFF", marginBottom: 12 },
  placeholder: { alignItems: "center", justifyContent: "center", backgroundColor: "rgba(210, 132, 40, 0.15)" },
  name: { fontSize: 22, fontWeight: "900", textAlign: "center" },
  brand: { fontSize: 14, marginTop: 2 },
  badgeRow: { marginTop: 10 },
  status: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  statusUsed: { backgroundColor: "#DCFCE7" },
  statusWasted: { backgroundColor: "#FEE2E2" },
  statusText: { fontSize: 12, fontWeight: "800", color: Palette.primary },
  warning: { fontSize: 12, textAlign: "center", marginTop: 10 },
  card: { borderWidth: 1, borderRadius: 14, marginTop: 16, paddingHorizontal: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 13, gap: 12 },
  rowLabel: { fontSize: 14 },
  rowValue: { fontSize: 14, fontWeight: "700", flexShrink: 1, textAlign: "right" },
  actionError: { color: "#DC2626", fontWeight: "700", textAlign: "center", marginTop: 14 },
  actions: { marginTop: 22, gap: 12 },
  delete: { alignItems: "center", paddingVertical: 8 },
  deleteText: { fontSize: 13, fontWeight: "700", textDecorationLine: "underline" },
});
