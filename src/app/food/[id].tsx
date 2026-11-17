// app/food/[id].tsx  -  TEMPORARY placeholder, replaced in Part 11
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function FoodDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.center}>
      <Text>Details of food {id} come in Part 11.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
});
