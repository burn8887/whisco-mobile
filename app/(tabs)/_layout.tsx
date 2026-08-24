import React from "react";
import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "../../src/theme";

const icon = (glyph: string) => ({ color }: { color: any }) => (
  <Text style={{ fontSize: 20, color: String(color) }}>{glyph}</Text>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "800" },
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.ring },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.textFaint,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Whisco TV", tabBarLabel: "Home", tabBarIcon: icon("🏠") }} />
      <Tabs.Screen name="live" options={{ title: "Live TV", tabBarIcon: icon("📺") }} />
      <Tabs.Screen name="vod" options={{ title: "On Demand", tabBarIcon: icon("🎬") }} />
    </Tabs>
  );
}
