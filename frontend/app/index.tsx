import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "../context/auth";

export default function Index() {
  const router = useRouter();
  const { signOut } = useAuth();

  const menuItems = [
    {
      title: "Friends",
      icon: "people",
      route: "/friends" as const,
      color: "#4CAF50",
    },
    {
      title: "Groups",
      icon: "people-circle",
      route: "/groups" as const,
      color: "#2196F3",
    },
  ] as const;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={signOut}
              style={styles.headerButton}
            >
              <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            </TouchableOpacity>
          ),
          title: "Home",
        }}
      />
      <View style={styles.container}>
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={[styles.menuItem, { backgroundColor: item.color }]}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.menuContent}>
                <Ionicons name={item.icon as any} size={32} color="white" />
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  headerButton: {
    marginRight: 8,
    padding: 8,
  },
  menuList: {
    gap: 12,
  },
  menuItem: {
    width: "100%",
    height: 80,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
