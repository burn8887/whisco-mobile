import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import { api, Channel, SlimTitle } from "../src/api";
import { colors, spacing, tv } from "../src/theme";

/**
 * The television screen — Android TV / Google TV only.
 *
 * WRITTEN FOR THE REMOTE (Desk ruling, 4 Oct 2026, Option B):
 *   - the stream autoplays; the player carries NO remote controls
 *   - UP / DOWN move focus between channels and films
 *   - OK (centre) opens the focused row
 *   - BACK leaves — it is the OS back gesture, we do not intercept it
 *
 * There is no pause and no seek anywhere on this screen, by ruling. The player
 * component is shared with the phone and is NOT modified.
 *
 * WHY THIS FILE EXISTS AT ALL
 * The phone app must not change (it is live on Play as versionCode 7). So the TV
 * surface is a separate route that is unreachable on a phone: Platform.isTV is
 * false there and this screen immediately replaces itself with the phone home.
 * Android reports TV via Configuration.uiMode == 'tv', which is what
 * Platform.isTV reads — measured in react-native 0.86.2
 * (Libraries/Utilities/Platform.android.js), not assumed.
 *
 * CATALOGUE
 * Deliberately the ANDROID catalogue and nothing else: the eight official news
 * lives from the top ten-news header, then the eight Internet Archive films.
 * The API returns exactly that for `X-Whisco-Store: android` (measured 4 Oct
 * 2026: /live 8 rows, /vod 8 items), so this screen needs no new header, no gate
 * change and no catalogue work. Capped at eight per shelf on purpose — if the
 * API ever returns more, the TV build still ships the ruled catalogue.
 */

const LIVE_CAP = 8;
const FILM_CAP = 8;

type FocusKey = string | null;

export default function TVScreen() {
  const router = useRouter();
  const isTV = Platform.isTV;

  const [live, setLive] = useState<Channel[] | null>(null);
  const [films, setFilms] = useState<SlimTitle[] | null>(null);
  const [focusKey, setFocusKey] = useState<FocusKey>(null);

  // Phone (or web): this route is television-only. Bounce to the phone home.
  useEffect(() => {
    if (!isTV) router.replace("/");
  }, [isTV, router]);

  useEffect(() => {
    if (!isTV) return;
    let alive = true;
    api
      .live()
      .then((p) => alive && setLive(p.channels.slice(0, LIVE_CAP)))
      .catch(() => alive && setLive([]));
    api
      .vodShelves()
      .then((p) => {
        if (!alive) return;
        const flat: SlimTitle[] = [];
        const seen = new Set<string>();
        for (const shelf of p.shelves ?? []) {
          for (const item of shelf.items ?? []) {
            if (seen.has(item.slug)) continue;
            seen.add(item.slug);
            flat.push(item);
          }
        }
        setFilms(flat.slice(0, FILM_CAP));
      })
      .catch(() => alive && setFilms([]));
    return () => {
      alive = false;
    };
  }, [isTV]);

  const openLive = useCallback(
    (id: string) => router.push(`/live/${id}`),
    [router]
  );
  const openFilm = useCallback(
    (slug: string) => router.push(`/tv-film/${slug}`),
    [router]
  );

  if (!isTV) {
    // Replaced a tick ago; this only prevents a flash of TV layout on a phone.
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  const loading = live === null || films === null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.wordmark} accessibilityRole="header">
            Whisco<Text style={styles.wordmarkTv}>.tv</Text>
          </Text>
          <Text style={styles.hint}>Up / Down to choose · OK to open · Back to leave</Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.orange} />
          </View>
        ) : (
          <>
            <Section label="Live news">
              {(live ?? []).map((c, i) => (
                <TVRow
                  key={c.id}
                  focusKey={`live-${c.id}`}
                  current={focusKey}
                  onFocus={setFocusKey}
                  onPress={() => openLive(c.id)}
                  first={i === 0}
                  image={c.logoUrl}
                  title={c.name}
                  meta={[c.country, c.category].filter(Boolean).join(" · ")}
                  badge="LIVE"
                />
              ))}
            </Section>

            <Section label="Archive film">
              {(films ?? []).map((t, i) => (
                <TVRow
                  key={t.slug}
                  focusKey={`film-${t.slug}`}
                  current={focusKey}
                  onFocus={setFocusKey}
                  onPress={() => openFilm(t.slug)}
                  // Only takes initial focus if the live section is empty (e.g. the
                  // news API failed) — the remote must always start somewhere.
                  first={i === 0 && (live ?? []).length === 0}
                  image={t.posterUrl}
                  title={t.name}
                  meta={[t.releaseYear, t.collection].filter(Boolean).join(" · ")}
                  square
                />
              ))}
            </Section>
          </>
        )}
      </ScrollView>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel} accessibilityRole="header">
        {label.toUpperCase()}
      </Text>
      <View style={{ gap: tv.rowGap }}>{children}</View>
    </View>
  );
}

/**
 * One focusable row. Focus is tracked in the parent (Pressable's style callback
 * only reports `pressed`, so a sibling-level map is the reliable way to keep
 * exactly one row lit), and rendered as: ember ring + raised background +
 * a small scale-up — the three cues a viewer can read from a sofa.
 *
 * hasTVPreferredFocus on the first row: standard Android TV practice so the
 * remote has somewhere to start. [UNMEASURED on a device — see store/tv-build.md]
 */
function TVRow({
  focusKey,
  current,
  onFocus,
  onPress,
  first,
  image,
  title,
  meta,
  badge,
  square,
}: {
  focusKey: string;
  current: FocusKey;
  onFocus: (k: string) => void;
  onPress: () => void;
  first?: boolean;
  image?: string | null;
  title: string;
  meta: string;
  badge?: string;
  square?: boolean;
}) {
  const focused = current === focusKey;
  return (
    <Pressable
      focusable
      hasTVPreferredFocus={first}
      onFocus={() => onFocus(focusKey)}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={meta ? `${title}. ${meta}` : title}
      style={[styles.row, focused && styles.rowFocused, focused && styles.rowScaled]}
    >
      {image ? (
        <Image
          source={{ uri: image }}
          style={[styles.thumb, square ? styles.thumbSquare : styles.thumbWide]}
          contentFit={square ? "cover" : "contain"}
          transition={120}
        />
      ) : (
        <View style={[styles.thumb, square ? styles.thumbSquare : styles.thumbWide, styles.thumbEmpty]} />
      )}

      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {meta}
        </Text>
      </View>

      {badge ? (
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tv.bg },
  content: { paddingHorizontal: tv.gutter, paddingTop: tv.gutter, paddingBottom: tv.gutter * 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, backgroundColor: tv.bg },

  header: { marginBottom: tv.sectionGap },
  wordmark: { color: colors.text, fontSize: tv.titleSize, fontWeight: "800", letterSpacing: 0.2 },
  wordmarkTv: { color: colors.orange },
  hint: { color: colors.textFaint, fontSize: tv.hintSize, marginTop: spacing.sm },

  section: { marginBottom: tv.sectionGap },
  sectionLabel: {
    color: colors.textDim,
    fontSize: tv.rowMetaSize,
    fontWeight: "700",
    letterSpacing: 1.6,
    marginBottom: spacing.md,
  },

  row: {
    height: tv.rowHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: "transparent",
  },
  rowFocused: {
    backgroundColor: tv.focusBg,
    borderColor: tv.focusRing,
  },
  rowScaled: { transform: [{ scale: 1.02 }] },

  thumb: { height: tv.rowHeight - 24, borderRadius: 6, backgroundColor: colors.surfaceLight },
  thumbWide: { width: (tv.rowHeight - 24) * (16 / 9) },
  thumbSquare: { width: tv.rowHeight - 24 },
  thumbEmpty: { opacity: 0.4 },

  rowText: { flex: 1, minWidth: 0 },
  rowTitle: { color: colors.text, fontSize: tv.rowTitleSize, fontWeight: "700" },
  rowMeta: { color: colors.textDim, fontSize: tv.rowMetaSize, marginTop: 2 },

  badge: { flexDirection: "row", alignItems: "center", gap: 6, paddingRight: spacing.sm },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red },
  badgeText: { color: colors.red, fontSize: 12, fontWeight: "800", letterSpacing: 0.8 },
});
