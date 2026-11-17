// app/food/form.tsx  -  TEMPORARY placeholder, replaced in Part 10
// It prints the route params, so you can check what Find Product sends (Part 9 test).
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function FoodFormScreen() {
  const params = useLocalSearchParams();
  return (
    <View style={styles.center}>
      <Text>Add / Edit Food comes in Part 10. Params received:</Text>
      <Text style={styles.code}>{JSON.stringify(params, null, 2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  code: { fontFamily: "monospace", fontSize: 12, marginTop: 12 },
});
