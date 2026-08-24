import React from "react";
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { colors, font, radius, spacing } from "../theme";
import type { SlimTitle, Channel } from "../api";

// Poster card for VOD shelves/grids. TV-friendly: visible focus ring when
// navigated with a D-pad (hasTVPreferredFocus handled by parents).
export function TitleCard({ item, onPress, width = 120 }: { item: SlimTitle; onPress: () => void; width?: number }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ focused, pressed }: any) => [
        styles.card,
        { width },
        (focused || pressed) && styles.focused,
      ]}
    >
      <Image
        source={{ uri: item.posterUrl }}
        style={[styles.poster, { width, height: width * 1.5 }]}
        contentFit="cover"
        placeholder={null}
        transition={150}
      />
      {item.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
      <Text numberOfLines={2} style={[styles.cardName, { width }]}>
        {item.name}
      </Text>
      <Text style={styles.cardMeta}>
        ★ {item.imdbRating.toFixed(1)} · {item.releaseYear}
      </Text>
    </Pressable>
  );
}

// Live channel row card.
export function ChannelCard({ item, onPress }: { item: Channel | (Partial<Channel> & { id: string; name: string; logoUrl: string }); onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ focused, pressed }: any) => [styles.channelRow, (focused || pressed) && styles.focused]}
    >
      <Image source={{ uri: item.logoUrl }} style={styles.channelLogo} contentFit="cover" transition={100} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={styles.channelName}>
          {item.name}
        </Text>
        <Text numberOfLines={1} style={styles.cardMeta}>
          {[item.country, item.category].filter(Boolean).join(" · ")}
        </Text>
      </View>
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
    </Pressable>
  );
}

// Horizontal shelf of poster cards.
export function Shelf({
  label,
  items,
  onItem,
  count,
}: {
  label: string;
  items: SlimTitle[];
  onItem: (t: SlimTitle) => void;
  count?: number;
}) {
  const { width } = useWindowDimensions();
  const cardW = Math.max(110, Math.min(150, width / 3.4));
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <View style={styles.shelfHeader}>
        <Text style={styles.shelfLabel}>{label}</Text>
        {count !== undefined && <Text style={styles.shelfCount}>{count}</Text>}
      </View>
      <View style={styles.shelfRow}>
        {items.map((t) => (
          <TitleCard key={t.id} item={t} width={cardW} onPress={() => onItem(t)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginRight: spacing.sm },
  focused: { transform: [{ scale: 1.04 }], opacity: 0.92 },
  poster: { borderRadius: radius.md, backgroundColor: colors.surface },
  newBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: colors.orange,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  newBadgeText: { color: "#fff", fontSize: font.tiny, fontWeight: "800" },
  cardName: { color: colors.text, fontSize: font.small, fontWeight: "600", marginTop: 6 },
  cardMeta: { color: colors.textFaint, fontSize: font.tiny, marginTop: 2 },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ring,
  },
  channelLogo: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceLight },
  channelName: { color: colors.text, fontSize: font.body, fontWeight: "600" },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.red },
  liveText: { color: colors.red, fontSize: font.tiny, fontWeight: "800" },
  shelfHeader: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm, marginBottom: spacing.sm },
  shelfLabel: { color: colors.text, fontSize: font.heading, fontWeight: "800" },
  shelfCount: { color: colors.textFaint, fontSize: font.small },
  shelfRow: { flexDirection: "row", flexWrap: "nowrap", overflow: "scroll" as any },
});
