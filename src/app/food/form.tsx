// app/food/form.tsx  -  Add / Edit Food
// Add mode:  /food/form                      (empty form)
//            /food/form?name=...&barcode=... (pre-filled from Find Product)
// Edit mode: /food/form?id=12
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AppButton from "@/components/app-button";
import FilterPills, { PillOption } from "@/components/filter-pills";
import FormField from "@/components/form-field";
import { STORAGE_OPTIONS, UNIT_OPTIONS } from "@/constants/food";
import { Palette } from "@/constants/palette";
import { useCategories } from "@/context/categories-context";
import { useFoods } from "@/context/foods-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Category } from "@/types";
import { Food, FoodInput, StoragePlace, Unit } from "@/types/food";
import { getErrorMessage } from "@/utils/errors";
import { addDays } from "@/utils/food";
import { FoodFormData, FoodFormErrors, validateFood } from "@/utils/food-validation";

// Route params are always text (or missing)
type FormParams = {
  id?: string;
  name?: string;
  brand?: string;
  barcode?: string;
  imageUrl?: string;
  quantity?: string;
  unit?: string;
  categoryHint?: string;
};

const UNIT_PILLS: PillOption<Unit>[] = UNIT_OPTIONS.map((u) => ({ value: u, label: u }));
const STORAGE_PILLS: PillOption<StoragePlace>[] = STORAGE_OPTIONS.map((s) => ({
  value: s.value,
  label: s.label,
}));
const DATE_CHIPS = [
  { label: "Today", days: 0 },
  { label: "+3 days", days: 3 },
  { label: "+1 week", days: 7 },
  { label: "+1 month", days: 30 },
];

// The first values of the form: from the food (Edit), from Open Food Facts (Add), or empty
function initialFormData(food: Food | undefined, params: FormParams, categories: Category[]): FoodFormData {
  if (food) {
    return {
      name: food.name,
      quantity: String(food.quantity),
      unit: food.unit,
      storage: food.storage,
      categoryId: food.categoryId,
      expiryDate: food.expiryDate ?? "",
    };
  }
  const hinted = categories.find((c) => c.name === params.categoryHint);
  const unit = UNIT_OPTIONS.find((u) => u === params.unit) ?? "pcs";
  return {
    name: params.name ?? "",
    quantity: params.quantity ?? "1",
    unit,
    storage: "fridge",
    categoryId: hinted?.id ?? null,
    expiryDate: "",
  };
}

export default function FoodFormScreen() {
  const params = useLocalSearchParams<FormParams>();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const { items: categories } = useCategories();
  const { items, addFood, editFood } = useFoods();

  const editId = params.id ? Number(params.id) : null;
  const isEdit = editId !== null;
  const food = isEdit ? items.find((f) => f.id === editId) : undefined;

  // Combined state for the field values (Week 4). The () => ... form runs only on the first render.
  const [formData, setFormData] = useState<FoodFormData>(() =>
    initialFormData(food, params, categories)
  );
  // Separate state for everything that is not a field value
  const [errors, setErrors] = useState<FoodFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Product info from Open Food Facts. Not editable: it is saved as it is.
  const brand = food ? food.brand : params.brand || null;
  const barcode = food ? food.barcode : params.barcode || null;
  const imageUrl = food ? food.imageUrl : params.imageUrl || null;

  // Header title (Week 3: setOptions inside useEffect, never directly in render)
  useEffect(() => {
    navigation.setOptions({ title: isEdit ? "Edit Food" : "Add Food" });
  }, [navigation, isEdit]);

  // Live validation (Week 4): runs again every time a field changes
  useEffect(() => {
    setErrors(validateFood(formData, isEdit));
  }, [formData, isEdit]);

  // One updater for every field. <K> makes TypeScript check that the value fits the field:
  // updateField("unit", "kg") is fine, updateField("unit", 5) is an error.
  const updateField = <K extends keyof FoodFormData>(field: K, value: FoodFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setServerError(null);
  };

  const markTouched = (field: keyof FoodFormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Show an error only after the field was touched OR Save was pressed (Week 4)
  const getFieldError = (field: keyof FoodFormErrors) =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  const isFormValid = Object.keys(errors).length === 0;

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (!isFormValid || formData.categoryId === null) return;

    const input: FoodInput = {
      name: formData.name.trim(),
      quantity: Number(formData.quantity),
      unit: formData.unit,
      storage: formData.storage,
      categoryId: formData.categoryId,
      expiryDate: formData.expiryDate.trim() || null,
      brand,
      barcode,
      imageUrl,
    };

    setIsSubmitting(true);
    setServerError(null);
    try {
      if (editId !== null) {
        await editFood(editId, input); // PATCH /foods/:id
      } else {
        await addFood(input); // POST /foods
      }
      // Success: Home and Details read the list from the context, so they are already up to date.
      // This screen closes, so we do NOT call setIsSubmitting(false) here.
      router.back();
    } catch (e) {
      setServerError(getErrorMessage(e));
      setIsSubmitting(false);
    }
  };

  // Edit mode, but the food is not in the list (for example it was deleted meanwhile)
  if (isEdit && !food) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.subtext }]}>This food no longer exists.</Text>
      </View>
    );
  }

  const categoryPills: PillOption<number | null>[] = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const categoryError = getFieldError("categoryId");

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      {/* Only when the food came from Open Food Facts */}
      {imageUrl || brand ? (
        <View style={[styles.product, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="contain" /> : null}
          <View style={styles.productTexts}>
            <Text style={[styles.productLabel, { color: colors.subtext }]}>From Open Food Facts</Text>
            {brand ? <Text style={[styles.productBrand, { color: colors.text }]}>{brand}</Text> : null}
            {barcode ? <Text style={[styles.productBarcode, { color: colors.subtext }]}>Barcode {barcode}</Text> : null}
          </View>
        </View>
      ) : null}

      <FormField
        label="Food name"
        value={formData.name}
        onChangeText={(text) => updateField("name", text)}
        onBlur={() => markTouched("name")}
        error={getFieldError("name")}
        placeholder="e.g. Milk"
      />

      <FormField
        label="Quantity"
        value={formData.quantity}
        onChangeText={(text) => updateField("quantity", text)}
        onBlur={() => markTouched("quantity")}
        error={getFieldError("quantity")}
        placeholder="e.g. 2"
        keyboardType="decimal-pad"
      />

      <Text style={[styles.label, { color: colors.text }]}>Unit</Text>
      <FilterPills options={UNIT_PILLS} selected={formData.unit} onSelect={(u) => updateField("unit", u)} />

      <Text style={[styles.label, styles.spaced, { color: colors.text }]}>Stored in</Text>
      <FilterPills
        options={STORAGE_PILLS}
        selected={formData.storage}
        onSelect={(s) => updateField("storage", s)}
      />

      <View style={[styles.labelRow, styles.spaced]}>
        <Text style={[styles.label, { color: colors.text }]}>Category</Text>
        {/* Member 2's screen: the new category appears here at once (shared context) */}
        <Pressable onPress={() => router.push("/categories")} hitSlop={8}>
          <Text style={styles.link}>Manage</Text>
        </Pressable>
      </View>
      <FilterPills
        options={categoryPills}
        selected={formData.categoryId}
        onSelect={(id) => updateField("categoryId", id)}
      />
      {categoryError ? <Text style={styles.error}>{categoryError}</Text> : null}

      <View style={styles.spaced}>
        <FormField
          label="Expiry date (optional)"
          value={formData.expiryDate}
          onChangeText={(text) => updateField("expiryDate", text)}
          onBlur={() => markTouched("expiryDate")}
          error={getFieldError("expiryDate")}
          placeholder="YYYY-MM-DD, e.g. 2026-11-25"
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.chips}>
        {DATE_CHIPS.map((chip) => (
          <Pressable
            key={chip.label}
            style={[styles.chip, { borderColor: colors.border }]}
            onPress={() => updateField("expiryDate", addDays(chip.days))}
          >
            <Text style={[styles.chipText, { color: colors.text }]}>{chip.label}</Text>
          </Pressable>
        ))}
        <Pressable
          style={[styles.chip, { borderColor: colors.border }]}
          onPress={() => updateField("expiryDate", "")}
        >
          <Text style={[styles.chipText, { color: colors.subtext }]}>No date</Text>
        </Pressable>
      </View>

      {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

      <View style={styles.submit}>
        <AppButton
          title={isEdit ? "SAVE CHANGES" : "SAVE FOOD"}
          onPress={handleSubmit}
          loading={isSubmitting}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  notFound: { fontSize: 15 },
  product: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
    gap: 12,
  },
  productImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: "#FFFFFF" },
  productTexts: { flex: 1 },
  productLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  productBrand: { fontSize: 15, fontWeight: "700", marginTop: 2 },
  productBarcode: { fontSize: 12, marginTop: 2 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  spaced: { marginTop: 14 },
  link: { color: Palette.accent, fontWeight: "800", fontSize: 13 },
  error: { fontSize: 12, color: "#DC2626", marginTop: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: -4 },
  chip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 12, fontWeight: "700" },
  serverError: { color: "#DC2626", fontWeight: "700", textAlign: "center", marginTop: 16 },
  submit: { marginTop: 22 },
});
