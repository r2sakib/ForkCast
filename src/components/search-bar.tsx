// components/search-bar.tsx
// The Week 2 SearchBar + theme colours, a search icon, a clear (x) button
// and an optional onSubmit for the keyboard's "search" key.
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useAppTheme } from "@/hooks/use-app-theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder,
  onSubmit,
  autoFocus = false,
}: SearchBarProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.box, { backgroundColor: colors.inputBackground }]}>
      <Ionicons name="search" size={18} color={colors.subtext} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder ?? "Search..."}
        placeholderTextColor={colors.subtext}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        returnKeyType="search"
      />
      {/* Our own clear button, because clearButtonMode only works on iOS */}
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText("")} hitSlop={10} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={18} color={colors.subtext} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 15 },
});
