import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { api, Channel } from "../../src/api";
import Player from "../../src/components/Player";
import { ChannelCard } from "../../src/components/Cards";
import { colors, font, spacing } from "../../src/theme";

export default function ChannelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<{ channel: Channel; related: Channel[] } | null>(null);

  useEffect(() => {
    if (id) api.channel(String(id)).then(setData).catch(() => {});
  }, [id]);

  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  const { channel, related } = data;

  return (
    <>
      <Stack.Screen options={{ title: channel.name }} />
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.md }}>
        <Player src={channel.streamUrl} title={channel.name} />
        <View style={styles.header}>
          <Text style={styles.name}>{channel.name}</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <Text style={styles.meta}>
          {channel.country} · {channel.category} · {channel.language}
          {channel.isHD ? " · HD" : ""}
        </Text>

        <Text style={styles.sectionLabel}>More {channel.category} channels</Text>
        {related.map((c) => (
          <ChannelCard key={c.id} item={c} onPress={() => router.replace(`/live/${c.id}`)} />
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.md },
  name: { color: colors.text, fontSize: font.title, fontWeight: "900", flex: 1 },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red },
  liveText: { color: colors.red, fontSize: font.small, fontWeight: "800" },
  meta: { color: colors.textDim, fontSize: font.small, marginTop: 4 },
  sectionLabel: { color: colors.text, fontSize: font.heading, fontWeight: "800", marginTop: spacing.lg, marginBottom: spacing.sm },
});
