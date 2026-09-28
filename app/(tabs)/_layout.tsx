import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/theme";
import { PawIcon, BoneClapperIcon, PlayScreenIcon, CollarTagIcon } from "../../src/components/TabIcons";

// Whisco tab bar — custom-designed brand icons (user spec):
//   Home → paw print · Live TV → bone clapperboard.
// Active icon renders in the sunset gradient with a soft gradient pill.
//
// BUILD 8 (Apple 5.2.2, 2026-09-28): the On Demand and My List TABS ARE GONE
// from the bar. This binary carries eight official news live streams and no
// on-demand titles, so a tab that opens onto films — or onto a saved list of
// films — is a 5.2.2 finding waiting to happen. Both screens are pinned with
// `href: null` rather than deleted, because an old deep link or a stale
// router.push must land on the empty state, not on a crash.

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
      {/* Present as routes, absent from the bar. See the note above. */}
      <Tabs.Screen name="vod" options={{ href: null }} />
      <Tabs.Screen name="mylist" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: "center", justifyContent: "center", width: 52, height: 34 },
  activePill: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 999 },
});
