import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { colors, font, spacing } from "../theme";

// Branded app header: Whisco mascot + wordmark with the sunset gradient,
// exactly like the website. Used across all tab screens.
export default function WhiscoHeader({ subtitle }: { subtitle?: string }) {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <Pressable style={styles.brand} onPress={() => router.push("/about")}>
        <Image source={require("../../assets/brand/sticker.png")} style={styles.mascot} contentFit="contain" />
        <View>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={styles.word}>Whisco</Text>
            <MaskedTV />
          </View>
          {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        </View>
      </Pressable>
      <View style={styles.freeBadge}>
        <Text style={styles.freeText}>100% Free</Text>
      </View>
    </View>
  );
}

// "TV" in the sunset gradient (simple two-stop text can't gradient in RN
// without masking libs — a gradient underline chip gives the same identity).
function MaskedTV() {
  return (
    <View style={{ marginLeft: 6, alignItems: "center" }}>
      <Text style={styles.tv}>TV</Text>
      <LinearGradient
        colors={[colors.orange, colors.pink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.tvUnderline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bg,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  mascot: { width: 42, height: 42 },
  word: { color: colors.text, fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  tv: { color: colors.pink, fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  tvUnderline: { height: 3, alignSelf: "stretch", borderRadius: 2, marginTop: 1 },
  sub: { color: colors.textFaint, fontSize: font.tiny, marginTop: -2 },
  freeBadge: {
    backgroundColor: "rgba(52,211,153,0.12)",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.35)",
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  freeText: { color: colors.emerald, fontSize: font.tiny, fontWeight: "800" },
});
