import { Stack } from "expo-router";
import { useEffect } from "react";
import { useSegments, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../context/auth";

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/sign-in");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/");
    }
  }, [isAuthenticated]);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerShadowVisible: false,
        headerTintColor: "#007AFF",
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerTitleAlign: "center",
        headerTitle: "ChatUp",
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "ChatUp",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="(app)/friends"
        options={{
          title: "Friends",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="(app)/groups/index"
        options={{
          title: "Groups",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="(app)/messages/index"
        options={{
          title: "Messages",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="(app)/groups/create"
        options={{
          title: "New Group",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="(app)/groups/[id]"
        options={{
          title: "Group Details",
        }}
      />
      <Stack.Screen
        name="(app)/groups/chat/[id]"
        options={{
          title: "Group Chat",
        }}
      />
      <Stack.Screen
        name="(app)/messages/[id]"
        options={{
          title: "Chat",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
