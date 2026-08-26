import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/theme";
import { PawIcon, BoneClapperIcon, PlayScreenIcon, CollarTagIcon } from "../../src/components/TabIcons";

// Whisco tab bar — custom-designed brand icons (user spec):
//   Home → paw print · Live TV → bone clapperboard · On Demand → play screen
//   My List → collar tag with engraved star.
// Active icon renders in the sunset gradient with a soft gradient pill.

const ICONS: Record<string, React.ComponentType<{ focused: boolean; size?: number }>> = {
  index: PawIcon,
  live: BoneClapperIcon,
  vod: PlayScreenIcon,
  mylist: CollarTagIcon,
};

function TabIcon({ route, focused }: { route: string; focused: boolean }) {
  const Icon = ICONS[route] ?? PawIcon;
  return (
    <View style={styles.iconWrap}>
      {focused && (
        <LinearGradient
          colors={["rgba(249,115,22,0.16)", "rgba(219,39,119,0.16)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activePill}
        />
      )}
      <Icon focused={focused} size={24} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0d0d13",
          borderTopColor: "rgba(249,115,22,0.15)",
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 6),
        },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
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
