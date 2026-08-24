import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { api, TitleDetail, SlimTitle, Episode } from "../../src/api";
import Player from "../../src/components/Player";
import { TitleCard } from "../../src/components/Cards";
import { colors, font, radius, spacing } from "../../src/theme";

export default function TitleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<{ title: TitleDetail; similar: SlimTitle[] } | null>(null);
  const [playing, setPlaying] = useState<string | null>(null); // streamUrl currently playing
  const [season, setSeason] = useState(0);

  useEffect(() => {
    if (slug) api.title(String(slug)).then(setDetail).catch(() => {});
  }, [slug]);

  if (!detail) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  const { title, similar } = detail;
  const isSeries = title.seasons.length > 0;
  const firstEpisode = title.seasons[0]?.episodes[0];

  const startPlayback = () => {
    if (title.streamUrl) setPlaying(title.streamUrl);
    else if (firstEpisode) setPlaying(firstEpisode.streamUrl);
  };

  return (
    <>
      <Stack.Screen options={{ title: title.name }} />
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        {playing ? (
          <View style={{ padding: spacing.md }}>
            <Player src={playing} title={title.name} />
          </View>
        ) : (
          <Pressable onPress={startPlayback} style={styles.backdropWrap}>
            <Image source={{ uri: title.backdropUrl || title.posterUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <View style={styles.backdropOverlay} />
            <View style={styles.playCircle}>
              <Text style={{ fontSize: 26 }}>▶️</Text>
            </View>
          </Pressable>
        )}

        <View style={{ paddingHorizontal: spacing.md }}>
          <Text style={styles.name}>{title.name}</Text>
          <Text style={styles.meta}>
            ★ {title.imdbRating.toFixed(1)} · {title.releaseYear} · {title.rating}
            {title.durationMins ? ` · ${title.durationMins} min` : ""} · {title.language}
          </Text>
          <Text style={styles.synopsis}>{title.synopsis}</Text>

          {isSeries && (
            <>
              {title.seasons.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }}>
                  {title.seasons.map((s, i) => (
                    <Pressable key={s.number} onPress={() => setSeason(i)} style={[styles.seasonPill, i === season && styles.seasonPillActive]}>
                      <Text style={[styles.seasonText, i === season && { color: "#fff" }]}>Season {s.number}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
              <Text style={styles.sectionLabel}>Episodes</Text>
              {title.seasons[season]?.episodes.map((e) => (
                <EpisodeRow key={e.id} e={e} active={playing === e.streamUrl} onPress={() => setPlaying(e.streamUrl)} />
              ))}
            </>
          )}

          {similar.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>More like this</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {similar.map((t) => (
                  <TitleCard key={t.id} item={t} onPress={() => router.push(`/title/${t.slug}`)} />
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}

function EpisodeRow({ e, active, onPress }: { e: Episode; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.epRow, active && styles.epActive]}>
      <Image source={{ uri: e.stillUrl }} style={styles.epThumb} contentFit="cover" />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={styles.epName}>
          {e.number}. {e.name}
        </Text>
        <Text style={styles.epMeta}>{e.durationMins} min</Text>
      </View>
      {active && <Text style={{ color: colors.orange }}>▶</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  backdropWrap: { height: 210, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  backdropOverlay: { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(10,10,15,0.35)" },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { color: colors.text, fontSize: font.title, fontWeight: "900", marginTop: spacing.md },
  meta: { color: colors.textDim, fontSize: font.small, marginTop: 4 },
  synopsis: { color: colors.textDim, fontSize: font.body, lineHeight: 21, marginTop: spacing.sm },
  sectionLabel: { color: colors.text, fontSize: font.heading, fontWeight: "800", marginTop: spacing.lg, marginBottom: spacing.sm },
  seasonPill: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.ring,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginRight: spacing.sm,
  },
  seasonPillActive: { backgroundColor: colors.orange, borderColor: colors.orange },
  seasonText: { color: colors.textDim, fontSize: font.small, fontWeight: "700" },
  epRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ring,
  },
  epActive: { borderColor: colors.orange },
  epThumb: { width: 96, height: 54, borderRadius: radius.sm, backgroundColor: colors.surfaceLight },
  epName: { color: colors.text, fontSize: font.body, fontWeight: "600" },
  epMeta: { color: colors.textFaint, fontSize: font.tiny, marginTop: 2 },
});
