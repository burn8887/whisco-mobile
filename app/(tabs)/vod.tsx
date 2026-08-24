import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TextInput, FlatList, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { api, VodShelvesPayload, VodGridPayload, SlimTitle } from "../../src/api";
import { Shelf, TitleCard } from "../../src/components/Cards";
import { colors, font, radius, spacing } from "../../src/theme";

export default function VodScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [shelves, setShelves] = useState<VodShelvesPayload | null>(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<VodGridPayload | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.vodShelves().then(setShelves).catch(() => {});
  }, []);

  const runSearch = useCallback(async () => {
    if (!search.trim()) {
      setResults(null);
      return;
    }
    setBusy(true);
    try {
      setResults(await api.vodSearch(search.trim()));
    } catch {
      setResults(null);
    }
    setBusy(false);
  }, [search]);

  const open = (t: SlimTitle) => router.push(`/title/${t.slug}`);
  const numCols = Math.max(3, Math.floor(width / 130));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: spacing.md, paddingBottom: 0 }}>
        <TextInput
          placeholder={`Search ${shelves ? shelves.total.toLocaleString() : ""}+ titles…`}
          placeholderTextColor={colors.textFaint}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={runSearch}
          returnKeyType="search"
          style={styles.search}
        />
      </View>

      {busy && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.orange} />
        </View>
      )}

      {!busy && results && (
        <FlatList
          key={`grid-${numCols}`}
          contentContainerStyle={{ padding: spacing.md }}
          numColumns={numCols}
          data={results.items}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <View style={{ flex: 1 / numCols, alignItems: "center", marginBottom: spacing.md }}>
              <TitleCard item={item} width={(width - spacing.md * 2) / numCols - 8} onPress={() => open(item)} />
            </View>
          )}
          ListHeaderComponent={
            <Text style={styles.count}>
              {results.filteredCount} results for “{results.q}”
            </Text>
          }
          ListEmptyComponent={<Text style={styles.empty}>Nothing found — try a different search.</Text>}
        />
      )}

      {!busy && !results && (
        <ScrollView contentContainerStyle={{ padding: spacing.md }}>
          {!shelves ? (
            <ActivityIndicator size="large" color={colors.orange} style={{ marginTop: spacing.xl }} />
          ) : (
            shelves.shelves.map((s) => (
              <ShelfBlock key={s.name} name={s.name} count={s.count} items={s.items} onItem={open} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

function ShelfBlock({
  name,
  count,
  items,
  onItem,
}: {
  name: string;
  count: number;
  items: SlimTitle[];
  onItem: (t: SlimTitle) => void;
}) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <View style={styles.shelfHead}>
        <Text style={styles.shelfName}>{name}</Text>
        <Text style={styles.shelfCount}>{count}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {items.map((t) => (
          <TitleCard key={t.id} item={t} onPress={() => onItem(t)} />
        ))}
      </ScrollView>
    </View>
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
  count: { color: colors.textFaint, fontSize: font.small, marginBottom: spacing.md },
  empty: { color: colors.textDim, textAlign: "center", marginTop: spacing.xl },
  shelfHead: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm, marginBottom: spacing.sm },
  shelfName: { color: colors.text, fontSize: font.heading, fontWeight: "800" },
  shelfCount: { color: colors.textFaint, fontSize: font.small },
});
