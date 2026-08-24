import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, RefreshControl, Pressable, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { api, HomePayload, SlimTitle } from "../../src/api";
import { Shelf, ChannelCard } from "../../src/components/Cards";
import { colors, font, radius, spacing } from "../../src/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
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
            <View style={styles.heroPlay}>
              <Text style={styles.heroPlayText}>▶ Watch now</Text>
            </View>
          </View>
        </Pressable>
      )}

      <Text style={styles.stats}>
        {data.stats.channels}+ live channels · {data.stats.titles.toLocaleString()}+ free titles
      </Text>

      {data.rows.map((row) => (
        <Shelf key={row.key} label={row.label} items={row.items} onItem={openTitle} />
      ))}

      <Text style={styles.sectionLabel}>Featured live channels</Text>
      {data.featuredChannels.map((c) => (
        <ChannelCard key={c.id} item={c as any} onPress={() => router.push(`/live/${c.id}`)} />
      ))}
    </ScrollView>
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
    backgroundColor: "#fff",
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginTop: spacing.sm,
  },
  heroPlayText: { color: "#000", fontWeight: "800", fontSize: font.small },
  stats: { color: colors.textDim, fontSize: font.small, marginBottom: spacing.md },
  sectionLabel: { color: colors.text, fontSize: font.heading, fontWeight: "800", marginBottom: spacing.sm },
});
