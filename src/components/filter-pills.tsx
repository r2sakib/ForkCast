// components/filter-pills.tsx
// A horizontal row of pills, like the category filter in Week 3 (Exercise 1).
// One component for: storage filter, unit, storage place, category and history filter.
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Palette } from "@/constants/palette";
import { useAppTheme } from "@/hooks/use-app-theme";

export interface PillOption<T> {
  value: T;
  label: string;
}

interface FilterPillsProps<T> {
  options: PillOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

// <T> = the type of the values (a string union, a number id ...).
// TypeScript then checks that `selected` and `onSelect` use the same type as `options`.
export default function FilterPills<T extends string | number | null>({
  options,
  selected,
  onSelect,
}: FilterPillsProps<T>) {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onSelect(option.value)}
            style={[
              styles.pill,
              {
                backgroundColor: active ? Palette.accent : colors.surface,
                borderColor: active ? Palette.accent : colors.border,
              },
            ]}
          >
            <Text style={[styles.text, { color: active ? "#FFFFFF" : colors.text }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  pill: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  text: { fontSize: 13, fontWeight: "700" },
});
