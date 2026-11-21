// components/recipe-card.tsx
// One recipe in the suggestions list, with "You have X of Y ingredients".
import { Pressable, StyleSheet, Text, View } from "react-native";
import { EXPIRY_COLOURS } from "@/constants/food";
import { Palette } from "@/constants/palette";
import { useAppTheme } from "@/hooks/use-app-theme";
import { RecipeMatch } from "@/utils/recipe-match";

interface RecipeCardProps {
  match: RecipeMatch;
  onPress: (match: RecipeMatch) => void;
}

export default function RecipeCard({ match, onPress }: RecipeCardProps) {
  const { colors } = useAppTheme();
  const { recipe, have, missing, score } = match;
  const ready = missing.length === 0;

  return (
    <Pressable
      onPress={() => onPress(match)}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.top}>
        <Text style={styles.emoji}>{recipe.emoji}</Text>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>{recipe.title}</Text>
          <Text style={[styles.meta, { color: colors.subtext }]}>
            {recipe.time} · {recipe.difficulty}
          </Text>
        </View>
        {ready ? (
          <View style={[styles.badge, { backgroundColor: EXPIRY_COLOURS.green.bg }]}>
            <Text style={[styles.badgeText, { color: EXPIRY_COLOURS.green.text }]}>Ready!</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.round(score * 100)}%`,
              backgroundColor: ready ? EXPIRY_COLOURS.green.text : Palette.accent,
            },
          ]}
        />
      </View>
      <Text style={[styles.matchText, { color: colors.subtext }]}>
        You have {have.length} of {recipe.ingredients.length} ingredients
      </Text>
      {!ready ? (
        <Text style={[styles.missing, { color: EXPIRY_COLOURS.orange.text }]} numberOfLines={1}>
          Missing: {missing.join(", ")}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  top: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  emoji: { fontSize: 34, marginRight: 12 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: "800" },
  meta: { fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "800" },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
  matchText: { fontSize: 12, fontWeight: "600", marginTop: 6 },
  missing: { fontSize: 12, marginTop: 2 },
});