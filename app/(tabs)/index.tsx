import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, RefreshControl, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";
import WhiscoHeader from "../../src/components/WhiscoHeader";
import { api, HomePayload } from "../../src/api";
import { ChannelCard } from "../../src/components/Cards";
import { colors, font, radius, spacing } from "../../src/theme";

/**
 * HOME — build 8. Eight official news live streams and nothing else.
 *
 * Apple rejected 1.0 (7) a second time on 2026-09-28 under 5.2.2: documentary
 * evidence "from the rights holder" for the films, or remove them. We hold no
 * signed carriage letters for films, so every on-demand title is out of this
 * binary and the Home screen is the live list.
 *
 * What left this screen, and why it matters:
 *   - the hero — it rendered an on-demand title's backdrop, i.e. a poster wall
 *     on the first frame a reviewer sees;
 *   - the "N+ live channels · N+ free titles" line — a count claim for content
 *     this build does not carry (Guideline 2.3.1(a));
 *   - the shelf rails — those were the eight public-domain films;
 *   - the old tagline, which the Whisco design system §1.4 forbids. Build 8 is
 *     the first binary that can carry the corrected line, because a copy change
 *     needs a new binary to ship.
 *
 * The API enforces all of this server-side; this screen simply renders what it
 * is given, and the given is eight live rows.
 */

export default function HomeScreen() {
  const router = useRouter();
  // The brand's zoom strip, bundled in the app. Brand asset, not third-party
  // content, and it is muted and non-interactive.
  const bannerPlayer = useVideoPlayer(require("../../assets/brand/zoom-banner.mp4"), (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  const [data, setData] = useState<HomePayload | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(false);
      setData(await api.home());
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errTitle}>Couldn't reach Whisco TV</Text>
        <Text style={styles.errBody}>Check your connection and pull to retry.</Text>
        <Pressable onPress={load} style={styles.retryBtn}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <WhiscoHeader subtitle="Free live news" />
      <ScrollView
        style={{ backgroundColor: colors.bg }}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.orange}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
      >
        {/* Brand strip. Tagline corrected in build 8 — the previous line is
            forbidden by the design system, and only a new binary could carry
            the replacement. */}
        <View style={styles.bannerWrap}>
          <VideoView player={bannerPlayer} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} nativeControls={false} contentFit="cover" />
          <LinearGradient colors={["rgba(10,10,15,0.85)", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 0.4 }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
          <LinearGradient colors={["transparent", "rgba(10,10,15,0.9)"]} start={{ x: 0, y: 0.6 }} end={{ x: 0, y: 1 }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
          <Text style={styles.bannerTagline}>
            Official news, live — <Text style={{ color: colors.orange }}>no sign-up.</Text>
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Live news channels</Text>
        {data.featuredChannels.map((c) => (
          <ChannelCard key={c.id} item={c as any} onPress={() => router.push(`/live/${c.id}`)} />
        ))}

        <Pressable onPress={() => router.push("/login")} style={styles.signinRow}>
          <Text style={styles.signinText}>Have a whisco.tv account? Sign in →</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/about")} style={{ marginTop: spacing.xs }}>
          <Text style={styles.aboutLink}>About Whisco TV · Contact us 🐾</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg, padding: spacing.lg },
  errTitle: { color: colors.text, fontSize: font.heading, fontWeight: "800" },
  errBody: { color: colors.textDim, fontSize: font.body, marginTop: spacing.sm },
  retryBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.orange,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryText: { color: "#fff", fontWeight: "800" },
  bannerWrap: {
    height: 190,
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
    backgroundColor: "#000",
    justifyContent: "flex-end",
  },
  bannerTagline: { color: colors.text, fontSize: font.body, fontWeight: "800", textAlign: "center", marginBottom: spacing.sm },
  signinRow: { marginTop: spacing.lg, alignItems: "center" },
  signinText: { color: colors.orange, fontSize: font.small, fontWeight: "700" },
  aboutLink: { color: colors.textFaint, fontSize: font.small, textAlign: "center", marginTop: spacing.sm },
  sectionLabel: { color: colors.text, fontSize: font.heading, fontWeight: "800", marginBottom: spacing.sm },
});
