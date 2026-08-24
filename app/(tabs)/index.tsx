import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, RefreshControl, Pressable, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";
import WhiscoHeader from "../../src/components/WhiscoHeader";
import { api, HomePayload, SlimTitle } from "../../src/api";
import { Shelf, ChannelCard } from "../../src/components/Cards";
import { colors, font, radius, spacing } from "../../src/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  // The website's cinematic Whisco zoom strip, bundled in the app.
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

  const openTitle = (t: SlimTitle) => router.push(`/title/${t.slug}`);

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

  const hero = data.hero[0];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
    <WhiscoHeader subtitle="Free live TV & movies" />
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
      {hero && (
        <Pressable onPress={() => openTitle(hero)} style={styles.hero}>
          <Image
            source={{ uri: hero.backdropUrl || hero.posterUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroFree}>100% FREE · NO SUBSCRIPTION</Text>
            <Text numberOfLines={2} style={styles.heroName}>
              {hero.name}
            </Text>
            <LinearGradient
              colors={["#f97316", "#db2777"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.heroPlay}
            >
              <Text style={styles.heroPlayTextGrad}>▶ Watch now</Text>
            </LinearGradient>
          </View>
        </Pressable>
      )}

      <Text style={styles.stats}>
        {data.stats.channels}+ live channels · {data.stats.titles.toLocaleString()}+ free titles
      </Text>

      {/* Whisco zoom strip — same cinematic moment as the website */}
      <View style={styles.bannerWrap}>
        <VideoView player={bannerPlayer} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} nativeControls={false} contentFit="cover" />
        <LinearGradient colors={["rgba(10,10,15,0.85)", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 0.4 }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
        <LinearGradient colors={["transparent", "rgba(10,10,15,0.9)"]} start={{ x: 0, y: 0.6 }} end={{ x: 0, y: 1 }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
        <Text style={styles.bannerTagline}>
          Life's better at full speed — <Text style={{ color: colors.orange }}>and full free.</Text>
        </Text>
      </View>

      {data.rows.map((row) => (
        <Shelf key={row.key} label={row.label} items={row.items} onItem={openTitle} />
      ))}

      <Text style={styles.sectionLabel}>Featured live channels</Text>
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
  hero: {
    height: 220,
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  heroOverlay: { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(10,10,15,0.45)" },
  heroContent: { flex: 1, justifyContent: "flex-end", padding: spacing.md },
  heroFree: { color: colors.emerald, fontSize: font.tiny, fontWeight: "800", letterSpacing: 1 },
  heroName: { color: colors.text, fontSize: font.title, fontWeight: "900", marginTop: 4 },
  heroPlay: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginTop: spacing.sm,
  },
  heroPlayText: { color: "#000", fontWeight: "800", fontSize: font.small },
  heroPlayTextGrad: { color: "#fff", fontWeight: "800", fontSize: font.small },
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
  stats: { color: colors.textDim, fontSize: font.small, marginBottom: spacing.md },
  sectionLabel: { color: colors.text, fontSize: font.heading, fontWeight: "800", marginBottom: spacing.sm },
});
