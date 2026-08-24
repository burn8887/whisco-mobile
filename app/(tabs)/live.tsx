import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TextInput, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { api, LivePayload } from "../../src/api";
import { ChannelCard } from "../../src/components/Cards";
import { colors, font, radius, spacing } from "../../src/theme";

export default function LiveScreen() {
  const router = useRouter();
  const [data, setData] = useState<LivePayload | null>(null);
  const [language, setLanguage] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (lang: string, query: string) => {
    setLoading(true);
    try {
      setData(await api.live({ language: lang || undefined, q: query || undefined }));
    } catch {
      setData(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load(language, q);
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: spacing.md, paddingBottom: 0 }}>
        <TextInput
          placeholder="Search channels…"
          placeholderTextColor={colors.textFaint}
          value={q}
          onChangeText={setQ}
          onSubmitEditing={() => load(language, q)}
          returnKeyType="search"
          style={styles.search}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
          <Pill label="All" active={!language} onPress={() => setLanguage("")} />
          {(data?.facets.languages || []).map((l) => (
            <Pill
              key={l.language}
              label={`${l.language} ${l.count}`}
              active={language === l.language}
              onPress={() => setLanguage(l.language)}
            />
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.orange} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: spacing.md }}
          data={data?.channels || []}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => <ChannelCard item={item} onPress={() => router.push(`/live/${item.id}`)} />}
          ListHeaderComponent={
            <Text style={styles.count}>
              {data?.filteredCount ?? 0} channels{language ? ` · ${language}` : ""}
            </Text>
          }
          ListEmptyComponent={<Text style={styles.empty}>No channels match — try another filter.</Text>}
        />
      )}
    </View>
  );
}

function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  search: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ring,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: font.body,
  },
  pill: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.ring,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginRight: spacing.sm,
  },
  pillActive: { backgroundColor: colors.orange, borderColor: colors.orange },
  pillText: { color: colors.textDim, fontSize: font.small, fontWeight: "600" },
  pillTextActive: { color: "#fff" },
  count: { color: colors.textFaint, fontSize: font.small, marginBottom: spacing.sm },
  empty: { color: colors.textDim, textAlign: "center", marginTop: spacing.xl },
});
