// app/categories.tsx  -  Manage Categories screen
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppButton from "@/components/app-button";
import CategoryRow from "@/components/category-row";
import FormField from "@/components/form-field";
import { Palette } from "@/constants/palette";
import { useCategories } from "@/context/categories-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Category } from "@/types";
import { confirmAction } from "@/utils/confirm";
import { getErrorMessage } from "@/utils/errors";
import { validateCategoryName } from "@/utils/validation";

export default function ManageCategoriesScreen() {
  const { colors } = useAppTheme();
  const { items, status, error, refresh, addCategory, removeCategory } = useCategories();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Live validation, same pattern as the Week 4 form.
  // It depends on `items` too, so "duplicate" is re-checked when the list changes.
  useEffect(() => {
    setNameError(validateCategoryName(name, items));
  }, [name, items]);

  const handleAdd = async () => {
    setTouched(true);
    setActionError(null);
    if (nameError) return;

    setIsAdding(true);
    try {
      await addCategory(name.trim());
      setName("");
      setTouched(false);
    } catch (e) {
      setActionError(getErrorMessage(e));
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = (category: Category) => {
    confirmAction(
      "Delete category",
      `Delete "${category.name}"? Food items that use it may be affected.`,
      "Delete",
      async () => {
        setActionError(null);
        try {
          await removeCategory(category.id);
        } catch (e) {
          setActionError(getErrorMessage(e));
        }
      }
    );
  };

  // One red message line: a failed add / delete, or a failed refresh while the list is on screen
  const bannerError = actionError ?? (status === "error" ? error : null);

  // Loading state: first load, nothing to show yet
  if (status === "loading" && items.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Palette.accent} />
      </View>
    );
  }

  // Error state: first load failed
  if (status === "error" && items.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Could not load categories</Text>
        <Text style={[styles.errorText, { color: colors.subtext }]}>{error}</Text>
        <View style={styles.retry}>
          <AppButton title="TRY AGAIN" onPress={refresh} />
        </View>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.list}
      data={items}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <CategoryRow category={item} onDelete={handleDelete} />}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={status === "loading"}
          onRefresh={refresh}
          tintColor={Palette.accent}
          colors={[Palette.accent]}
        />
      }
      // A JSX element (not an inline component) so the TextInput keeps focus while typing
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.text }]}>Add your own category</Text>
          <FormField
            label="Category name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setActionError(null);
            }}
            onBlur={() => setTouched(true)}
            placeholder="e.g. Spices"
            error={touched ? nameError : undefined}
            autoCapitalize="words"
          />
          <AppButton title="ADD CATEGORY" onPress={handleAdd} loading={isAdding} />

          {bannerError ? (
            <Text style={[styles.actionError, { color: colors.danger }]}>{bannerError}</Text>
          ) : null}

          <Text style={[styles.heading, styles.listHeading, { color: colors.text }]}>
            All categories ({items.length})
          </Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={[styles.empty, { color: colors.subtext }]}>No categories yet.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  list: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 6 },
  heading: { fontSize: 16, fontWeight: "800", marginBottom: 12 },
  listHeading: { marginTop: 26, marginBottom: 12 },
  actionError: { marginTop: 10, fontSize: 13, fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 20, fontSize: 14 },
  errorTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  errorText: { fontSize: 14, textAlign: "center" },
  retry: { marginTop: 18, alignSelf: "stretch" },
});
