import React from "react";
import { View, Text, StyleSheet, Linking, Pressable } from "react-native";
import { colors, font, radius, spacing } from "../theme";

/**
 * THE SOURCE NOTE — one honest line per item, plus a way to challenge it.
 *
 * Why this is in the app at all:
 * Apple rejected build 5 under Guideline 5.2.2, asking for documented evidence of the
 * right to use the content shown. A rights pack in the review notes answers the
 * reviewer's question. This answers the viewer's — and it is the same question. Every
 * item the App Store build shows carries the reason we believe we may show it, and a
 * link to the place a person can check that for themselves: the broadcaster's own
 * channel, or the item's own page on the Internet Archive with its licence line.
 *
 * The second half of the note matters as much as the first. If a rights holder thinks
 * we have this wrong, there is one tap to tell us and we will remove it. We would
 * rather be told than assume.
 */
export default function RightsNote({
  rightsBasis,
  evidenceUrl,
}: {
  rightsBasis?: string | null;
  evidenceUrl?: string | null;
}) {
  // Nothing to say if the server did not send provenance — better silent than vague.
  if (!rightsBasis && !evidenceUrl) return null;

  const open = (url?: string | null) => {
    if (url) Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.wrap}>
      {!!rightsBasis && <Text style={styles.basis}>{rightsBasis}</Text>}

      {!!evidenceUrl && (
        <Pressable onPress={() => open(evidenceUrl)} style={styles.linkRow}>
          <Text style={styles.linkLabel}>Source</Text>
          <Text style={styles.link} numberOfLines={1}>
            {evidenceUrl.replace(/^https?:\/\/(www\.)?/, "")}
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={() =>
          open(
            `mailto:legal@whisco.tv?subject=${encodeURIComponent(
              "Rights enquiry — Whisco TV iOS app"
            )}`
          )
        }
        style={styles.linkRow}
      >
        <Text style={styles.report}>Report a rights issue → legal@whisco.tv</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.md,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: "#141419",
    borderWidth: 1,
    borderColor: "#26262c",
    gap: 6,
  },
  basis: { color: colors.textDim, fontSize: font.small, lineHeight: 17 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  linkLabel: {
    color: colors.orange,
    fontSize: font.small,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  link: { color: colors.textDim, fontSize: font.small, flex: 1, textDecorationLine: "underline" },
  report: { color: colors.orange, fontSize: font.small, fontWeight: "700" },
});
