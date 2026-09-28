import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, font, spacing } from "../theme";

/**
 * The one empty state for every surface this binary does not carry.
 *
 * Build 8 ships eight official news live streams and NO on-demand titles
 * (Apple 5.2.2, second rejection 2026-09-28). The On Demand tab, My List and
 * the title route still exist so an old link does not dead-end, but they must
 * show nothing: no posters, no titles, no placeholder artwork that could read
 * as a film. One line, in plain words.
 *
 * Deliberately NOT here: any link or sentence pointing the viewer off to the
 * web catalogue, under any wording. Apple's guideline covers the app AND its
 * metadata — sending a reviewer elsewhere for content the app does not carry is
 * the same problem in a different font.
 */
export default function LiveOnlyNotice({ subtitle }: { subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <Text style={styles.line}>Live news only in this version.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
    padding: spacing.lg,
  },
  subtitle: {
    color: colors.textFaint,
    fontSize: font.small,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  line: {
    color: colors.textDim,
    fontSize: font.body,
    textAlign: "center",
  },
});
