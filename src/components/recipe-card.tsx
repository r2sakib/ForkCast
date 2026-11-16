import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/forkcast-colors";
import { RecipeMatch } from "@/lib/recipe-match";

interface Props {
  match: RecipeMatch;
  onPress: (match: RecipeMatch) => void;
}

export default function RecipeCard({ match, onPress }: Props) {
  const { recipe, have, missing, score } = match;
  const ready = missing.length === 0;

  return (
    <Pressable style={styles.card} onPress={() => onPress(match)}>
      <View style={styles.top}>
        <Text style={styles.emoji}>{recipe.emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.meta}>
            {recipe.time} · {recipe.difficulty}
          </Text>
        </View>
        {ready && (
          <View style={styles.readyBadge}>
            <Text style={styles.readyText}>Ready!</Text>
          </View>
        )}
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.round(score * 100)}%`, backgroundColor: ready ? COLORS.green : COLORS.teal },
          ]}
        />
      </View>
      <Text style={styles.matchText}>
        You have {have.length} of {recipe.ingredients.length} ingredients
      </Text>
      {!ready && (
        <Text style={styles.missing} numberOfLines={1}>
          Missing: {missing.join(", ")}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: 14,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  top: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  emoji: { fontSize: 34, marginRight: 12 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700", color: COLORS.navy },
  meta: { fontSize: 12, color: COLORS.faint, marginTop: 2 },
  readyBadge: { backgroundColor: COLORS.greenBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  readyText: { color: COLORS.green, fontSize: 11, fontWeight: "700" },
  track: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
  matchText: { fontSize: 12, color: COLORS.muted, marginTop: 6, fontWeight: "600" },
  missing: { fontSize: 12, color: COLORS.orange, marginTop: 2 },
});