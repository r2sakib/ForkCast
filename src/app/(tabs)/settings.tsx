// app/(tabs)/settings.tsx  -  TEMPORARY (replaced in Part 9)
import { Button, Text, View } from "react-native";
import { useAuth } from "@/context/auth-context";

export default function TempSettings() {
  const { user, logout } = useAuth();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
      <Text>{user?.email}</Text>
      <Button title="Log out" onPress={() => logout()} />
    </View>
  );
}
