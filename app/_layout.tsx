import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../src/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "800" },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="title/[slug]" options={{ title: "", headerBackTitle: "Back" }} />
        <Stack.Screen name="live/[id]" options={{ title: "", headerBackTitle: "Back" }} />
        <Stack.Screen name="about" options={{ headerBackTitle: "Back" }} />
        <Stack.Screen name="login" options={{ headerBackTitle: "Back" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
