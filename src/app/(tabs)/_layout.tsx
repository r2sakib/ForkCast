import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
  NotificationsProvider,
  useNotifications,
} from "@/context/notifications-context";

// Your teammates' existing <Tabs> code goes inside TabsNavigator.
function TabsNavigator() {
  const { unreadCount } = useNotifications();

  return (
    <Tabs screenOptions={{ headerShown: false /* keep teammates' options */ }}>
      {/* ... Member 1 / Member 2 Tabs.Screen entries stay here ... */}

      {/* ---------- MEMBER 3 ---------- */}
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      {/* ---------- END MEMBER 3 ---------- */}
      <Tabs.Screen
  name="statistics"
  options={{
    title: "Statistics",
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="stats-chart-outline" size={size} color={color} />
    ),
  }}
/>
<Tabs.Screen
  name="recipes"
  options={{
    title: "Recipes",
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="restaurant-outline" size={size} color={color} />
    ),
  }}
/>
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <NotificationsProvider>
      <TabsNavigator />
    </NotificationsProvider>
  );
}

