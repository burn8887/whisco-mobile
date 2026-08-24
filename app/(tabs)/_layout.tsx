import React from "react";
import { Tabs } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../src/theme";

// Whisco-themed tab bar: dog/home-life glyphs instead of generic icons, with
// a sunset-gradient pill behind the active tab — carries the website's
// orange→pink identity into the app chrome.
const GLYPHS: Record<string, { active: string; idle: string }> = {
  index: { active: "🐶", idle: "🐾" },   // Home = Whisco himself
  live: { active: "📡", idle: "📺" },    // Live TV
  vod: { active: "🍿", idle: "🎬" },     // On Demand = movie night
  mylist: { active: "🦴", idle: "🦴" },  // My List = Whisco's buried bones
};

function TabIcon({ route, focused }: { route: string; focused: boolean }) {
  const g = GLYPHS[route] ?? GLYPHS.index;
  return (
    <View style={styles.iconWrap}>
      {focused && (
        <LinearGradient
          colors={["rgba(249,115,22,0.28)", "rgba(219,39,119,0.28)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activePill}
        />
      )}
      <Text style={{ fontSize: focused ? 22 : 19, opacity: focused ? 1 : 0.75 }}>
        {focused ? g.active : g.idle}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0d0d13",
          borderTopColor: "rgba(249,115,22,0.15)",
          borderTopWidth: 1,
          height: 62,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", paddingBottom: 6 },
        tabBarIcon: ({ focused }) => <TabIcon route={route.name} focused={focused} />,
        sceneStyle: { backgroundColor: colors.bg },
      })}
    >
      <Tabs.Screen name="index" options={{ tabBarLabel: "Home" }} />
      <Tabs.Screen name="live" options={{ tabBarLabel: "Live TV" }} />
      <Tabs.Screen name="vod" options={{ tabBarLabel: "On Demand" }} />
      <Tabs.Screen name="mylist" options={{ tabBarLabel: "My List" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: "center", justifyContent: "center", width: 52, height: 34 },
  activePill: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 999 },
});
