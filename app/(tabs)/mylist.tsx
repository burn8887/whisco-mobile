import React, { useState, useCallback } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter, useFocusEffect } from "expo-router";
import { getWatchlist, getResumeList, removeResume, type WatchlistItem, type ResumeEntry } from "../../src/store";
import { TitleCard } from "../../src/components/Cards";
import { colors, font, radius, spacing } from "../../src/theme";

export default function MyListScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [resume, setResume] = useState<ResumeEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      getWatchlist().then(setWatchlist);
      getResumeList().then(setResume);
    }, [])
  );

  const numCols = Math.max(3, Math.floor(width / 130));
  const cardW = (width - spacing.md * 2) / numCols - 8;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
      {resume.length > 0 && (
        <>
          <Text style={styles.section}>Continue watching</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
            {resume.map((r) => (
              <Pressable
                key={r.slug}
                onPress={() => router.push(`/title/${r.slug}`)}
                onLongPress={() => removeResume(r.slug).then(() => getResumeList().then(setResume))}
                style={styles.resumeCard}
              >
                <Image source={{ uri: r.posterUrl }} style={styles.resumePoster} contentFit="cover" transition={120} />
                <View style={styles.resumeBar}>
                  <View style={styles.resumeBarFill} />
                </View>
                <Text numberOfLines={1} style={styles.resumeName}>
                  {r.name}
                </Text>
                {r.episodeLabel && <Text style={styles.resumeMeta}>{r.episodeLabel}</Text>}
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}

      <Text style={styles.section}>My List</Text>
      {watchlist.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyBody}>
            Tap “＋ My List” on any movie or series and it will be waiting for you here.
          </Text>
          <Pressable onPress={() => router.push("/vod")} style={styles.browseBtn}>
            <Text style={styles.browseText}>Browse On Demand</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.grid}>
          {watchlist.map((t) => (
            <View key={t.id} style={{ width: cardW + 8, marginBottom: spacing.md }}>
              <TitleCard item={t as any} width={cardW} onPress={() => router.push(`/title/${t.slug}`)} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: { color: colors.text, fontSize: font.heading, fontWeight: "800", marginBottom: spacing.sm },
  resumeCard: { width: 150, marginRight: spacing.sm },
  resumePoster: { width: 150, height: 84, borderRadius: radius.md, backgroundColor: colors.surface },
  resumeBar: { height: 3, backgroundColor: colors.surfaceLight, borderRadius: 2, marginTop: 4, overflow: "hidden" },
  resumeBarFill: { width: "40%", height: 3, backgroundColor: colors.orange },
  resumeName: { color: colors.text, fontSize: font.small, fontWeight: "600", marginTop: 4 },
  resumeMeta: { color: colors.textFaint, fontSize: font.tiny, marginTop: 1 },
  emptyWrap: { alignItems: "center", paddingVertical: spacing.xl },
  emptyTitle: { color: colors.text, fontSize: font.heading, fontWeight: "800" },
  emptyBody: { color: colors.textDim, fontSize: font.body, textAlign: "center", marginTop: spacing.sm, maxWidth: 280 },
  browseBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.orange,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  browseText: { color: "#fff", fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
});
