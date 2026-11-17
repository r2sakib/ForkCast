// app/food/search.tsx  -  Find Product: search Open Food Facts, then open the form pre-filled
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import AppButton from "@/components/app-button";
import ProductRow from "@/components/product-row";
import SearchBar from "@/components/search-bar";
import { Palette } from "@/constants/palette";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  getOffErrorMessage,
  getProductByBarcode,
  isBarcode,
  searchProducts,
} from "@/services/open-food-facts";
import { OffProduct } from "@/types/food";
import { guessCategoryName, parseOffQuantity } from "@/utils/open-food-facts";

type SearchStatus = "idle" | "loading" | "success" | "error";

export default function FindProductScreen() {
  const { colors } = useAppTheme();

  const [query, setQuery] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  // The search that was submitted. A NEW object every time, so the effect
  // runs again even when the user searches the same word twice.
  const [submitted, setSubmitted] = useState<{ text: string } | null>(null);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [results, setResults] = useState<OffProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Runs the request when a search is submitted (same idea as the Week 4 submit effect)
  useEffect(() => {
    if (!submitted) return;
    let cancelled = false;

    async function runSearch(text: string) {
      try {
        let found: OffProduct[];
        if (isBarcode(text)) {
          const product = await getProductByBarcode(text);
          found = product ? [product] : [];
        } else {
          found = await searchProducts(text);
        }
        if (!cancelled) {
          setResults(found);
          setStatus("success");
        }
      } catch (e) {
        if (!cancelled) {
          setError(getOffErrorMessage(e));
          setStatus("error");
        }
      }
    }

    runSearch(submitted.text);
    // Cleanup: if the user searches again or leaves the screen,
    // the old answer must not overwrite the screen.
    return () => {
      cancelled = true;
    };
  }, [submitted]);

  // We search only when the user presses Search: Open Food Facts allows
  // only 10 searches per minute, so search-as-you-type is not allowed.
  const handleSearch = () => {
    const text = query.trim();
    if (text.length < 2) {
      setInputError("Type at least 2 letters, or a barcode number.");
      return;
    }
    setInputError(null);
    setError(null);
    setStatus("loading");
    setSubmitted({ text });
  };

  // Tap a product: open the form with the product's data as route params (Week 3)
  const handlePick = (product: OffProduct) => {
    const { quantity, unit } = parseOffQuantity(product.quantity);
    router.replace({
      pathname: "/food/form",
      params: {
        name: product.name,
        brand: product.brand,
        barcode: product.barcode,
        imageUrl: product.imageUrl ?? "",
        quantity,
        unit,
        categoryHint: guessCategoryName(product.categoryTags),
      },
    });
  };

  const addByHand = () => router.replace("/food/form");

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.list}
      data={status === "success" ? results : []}
      keyExtractor={(item) => item.barcode}
      renderItem={({ item }) => <ProductRow product={item} onPress={handlePick} />}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.header}>
          <SearchBar
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setInputError(null);
            }}
            onSubmit={handleSearch}
            placeholder="e.g. milk, Nutella or 3017624010701"
            autoFocus
          />
          {inputError ? (
            <Text style={[styles.inputError, { color: colors.danger }]}>{inputError}</Text>
          ) : null}
          <View style={styles.searchButton}>
            <AppButton title="SEARCH" onPress={handleSearch} loading={status === "loading"} />
          </View>
          <Pressable style={styles.manual} onPress={addByHand}>
            <Ionicons name="create-outline" size={16} color={Palette.accent} />
            <Text style={styles.manualText}>Add food by hand instead</Text>
          </Pressable>
          {status === "success" && results.length > 0 ? (
            <Text style={[styles.count, { color: colors.subtext }]}>
              {results.length} product{results.length === 1 ? "" : "s"} found. Tap one to add it.
            </Text>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <View style={styles.state}>
          {status === "idle" ? (
            <Text style={[styles.stateText, { color: colors.subtext }]}>
              Search by product name, or type the barcode number printed under the bar lines.
            </Text>
          ) : null}
          {status === "loading" ? <ActivityIndicator size="large" color={Palette.accent} /> : null}
          {status === "error" ? (
            <>
              <Text style={[styles.stateTitle, { color: colors.text }]}>Search failed</Text>
              <Text style={[styles.stateText, { color: colors.subtext }]}>{error}</Text>
              <View style={styles.retry}>
                <AppButton title="TRY AGAIN" variant="dark" onPress={handleSearch} />
              </View>
            </>
          ) : null}
          {status === "success" ? (
            <Text style={[styles.stateText, { color: colors.subtext }]}>
              No products found for &quot;{submitted?.text}&quot;. Try another word, or add it by hand.
            </Text>
          ) : null}
        </View>
      }
      ListFooterComponent={
        // Open Food Facts data is free under the ODbL licence, which asks us to credit it
        <Text style={[styles.credit, { color: colors.subtext }]}>
          Product data from Open Food Facts (openfoodfacts.org)
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 12 },
  inputError: { fontSize: 12, fontWeight: "600", marginTop: 6 },
  searchButton: { marginTop: 12 },
  manual: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 },
  manualText: { color: Palette.accent, fontWeight: "800", fontSize: 14 },
  count: { fontSize: 12, marginTop: 16 },
  state: { alignItems: "center", marginTop: 32, paddingHorizontal: 12 },
  stateTitle: { fontSize: 17, fontWeight: "800", marginBottom: 6 },
  stateText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  retry: { marginTop: 16, alignSelf: "stretch" },
  credit: { fontSize: 11, textAlign: "center", marginTop: 24 },
});
