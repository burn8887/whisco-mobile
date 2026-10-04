import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { api, TitleDetail } from "../../src/api";
import Player from "../../src/components/Player";
import { colors, spacing, tv } from "../../src/theme";

/**
 * Television film screen — the Internet Archive rows on the TV build.
 *
 * WHAT PLAYS HERE
 * An MP4 from archive.org, rendered by the SHARED Player component through its
 * native branch (expo-video / ExoPlayer on Android) — not the WebView branch, so
 * the remote question does not arise: the film autoplays and BACK leaves, exactly
 * like the news rows (Desk ruling, 4 Oct 2026: "Films may start the same way").
 * The shared player is imported, never modified.
 *
 * WHY A SEPARATE ROUTE FROM app/title/[slug].tsx
 * app/title/[slug].tsx is the PHONE route and was rewritten in build 8 to the
 * "Live news only in this version." empty state, because the iOS build carries no
 * on-demand titles. Reusing it would either show a TV viewer that empty state or
 * require changing the phone route — and the phone app must not change. Hence a
 * television-only route, unreachable on a phone (Platform.isTV guard below).
 *
 * FILM DATA
 * The film list endpoint carries no stream URL (measured: /vod items have
 * id/slug/name/posterUrl/type/releaseYear/imdbRating/collection/isNew), so the
 * playable URL comes from /title/{slug} — the same call the phone's film screen
 * would make. streamUrl is null for anything without a playable source, and the
 * screen says so plainly instead of rendering an empty player.
 */

export default function TVFilmScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const isTV = Platform.isTV;

  const [title, setTitle] = useState<TitleDetail | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isTV) router.replace("/");
  }, [isTV, router]);

  useEffect(() => {
    if (!isTV || !slug) return;
    let alive = true;
    api
      .title(String(slug))
      .then((d) => alive && setTitle(d.title))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [isTV, slug]);

  if (!isTV) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: title?.name ?? "", headerBackTitle: "Back" }} />
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        {failed ? (
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>This film is not available right now</Text>
            <Text style={styles.noticeBody}>
              Press Back to return to the list. We check every source automatically.
            </Text>
          </View>
        ) : !title ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.orange} />
          </View>
        ) : (
          <>
            {title.streamUrl ? (
              <Player src={title.streamUrl} title={title.name} />
            ) : (
              <View style={styles.notice}>
                <Text style={styles.noticeTitle}>No playable source for this film</Text>
                <Text style={styles.noticeBody}>Press Back to return to the list.</Text>
              </View>
            )}

            <Text style={styles.title}>{title.name}</Text>
            <Text style={styles.meta}>
              {[title.releaseYear, title.collection].filter(Boolean).join(" · ")}
            </Text>

            {title.rightsBasis ? (
              <View style={styles.sourceBox}>
                <Text style={styles.sourceLabel}>SOURCE</Text>
                <Text style={styles.sourceText}>{title.rightsBasis}</Text>
                {title.evidenceUrl ? (
                  <Text style={styles.sourceLink}>{title.evidenceUrl}</Text>
                ) : null}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tv.bg },
  content: { paddingHorizontal: tv.gutter, paddingTop: tv.gutter, paddingBottom: tv.gutter * 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, backgroundColor: tv.bg },

  title: { color: colors.text, fontSize: 26, fontWeight: "800", marginTop: spacing.lg },
  meta: { color: colors.textDim, fontSize: tv.rowMetaSize, marginTop: spacing.xs },

  sourceBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  sourceLabel: { color: colors.orange, fontSize: 12, fontWeight: "800", letterSpacing: 1.2 },
  sourceText: { color: colors.textDim, fontSize: tv.rowMetaSize, lineHeight: 20 },
  sourceLink: { color: colors.textFaint, fontSize: 13 },

  notice: { padding: spacing.xl, alignItems: "center", gap: spacing.sm },
  noticeTitle: { color: colors.text, fontSize: tv.rowTitleSize, fontWeight: "700", textAlign: "center" },
  noticeBody: { color: colors.textDim, fontSize: tv.rowMetaSize, textAlign: "center" },
});
