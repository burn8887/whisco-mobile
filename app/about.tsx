import React from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, Linking } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { colors, font, radius, spacing } from "../src/theme";

const CONTACTS = [
  { label: "Partnerships & Advertising", email: "partnerships@whisco.tv", glyph: "🤝" },
  { label: "Rights Holders & Legal", email: "legal@whisco.tv", glyph: "⚖️" },
  { label: "Privacy", email: "privacy@whisco.tv", glyph: "🛡️" },
];

export default function AboutScreen() {
  // Whisco's clinic clip — the same one on the website's "Meet Whisco" section.
  const player = useVideoPlayer(require("../assets/brand/clinic.mp4"), (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <>
      <Stack.Screen options={{ title: "About Whisco TV" }} />
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        {/* Meet Whisco */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={["rgba(249,115,22,0.18)", "rgba(219,39,119,0.14)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View style={styles.clipWrap}>
            <VideoView player={player} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} nativeControls={false} contentFit="cover" />
          </View>
          <Text style={styles.heroTitle}>
            Hi, I'm <Text style={{ color: colors.orange }}>Whisco</Text> 🐾
          </Text>
          <Text style={styles.heroBody}>
            Yes, Whisco TV is genuinely named after a real Shih Tzu. This whole platform is his — hundreds of live
            channels and thousands of movies, free for every household, no credit card ever. He personally supervises
            every new channel we add (mostly by napping nearby).
          </Text>
        </View>

        {/* What we are */}
        <Text style={styles.section}>What is Whisco TV?</Text>
        <Text style={styles.body}>
          A 100% free, ad-supported streaming service built for expatriate communities in the Gulf — South Asian,
          Filipino, Arab, Indonesian, Turkish-drama audiences and more — and for anyone anywhere who wants TV from
          home. No subscription, no signup required, no catch.
        </Text>

        <Text style={styles.section}>Where our content comes from</Text>
        <Text style={styles.body}>
          Everything comes from legitimate sources: free-to-air broadcasts, official broadcaster channels, and
          public-domain archives. Our catalog is monitored automatically around the clock — dead or unavailable
          sources are removed within hours. Rights holders can request review or removal anytime.
        </Text>

        {/* Contact */}
        <Text style={styles.section}>Contact us</Text>
        {CONTACTS.map((c) => (
          <Pressable key={c.email} style={styles.contactRow} onPress={() => Linking.openURL(`mailto:${c.email}`)}>
            <Text style={{ fontSize: 20 }}>{c.glyph}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>{c.label}</Text>
              <Text style={styles.contactEmail}>{c.email}</Text>
            </View>
            <Text style={{ color: colors.textFaint }}>›</Text>
          </Pressable>
        ))}

        {/* Legal links */}
        <View style={styles.legalRow}>
          <Pressable onPress={() => Linking.openURL("https://whisco.tv/privacy")}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Pressable>
          <Text style={{ color: colors.textFaint }}>·</Text>
          <Pressable onPress={() => Linking.openURL("https://whisco.tv/terms")}>
            <Text style={styles.legalLink}>Terms of Use</Text>
          </Pressable>
          <Text style={{ color: colors.textFaint }}>·</Text>
          <Pressable onPress={() => Linking.openURL("https://whisco.tv")}>
            <Text style={styles.legalLink}>whisco.tv</Text>
          </Pressable>
        </View>

        <Image source={require("../assets/brand/sticker.png")} style={styles.footerMascot} contentFit="contain" />
        <Text style={styles.woof}>Woof! Thanks for watching 🐶</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.ring,
    padding: spacing.md,
    overflow: "hidden",
  },
  clipWrap: { width: "100%", aspectRatio: 612 / 828, maxHeight: 340, borderRadius: radius.lg, overflow: "hidden", alignSelf: "center", backgroundColor: "#000" },
  heroTitle: { color: colors.text, fontSize: font.title, fontWeight: "900", marginTop: spacing.md },
  heroBody: { color: colors.textDim, fontSize: font.body, lineHeight: 21, marginTop: spacing.sm },
  section: { color: colors.text, fontSize: font.heading, fontWeight: "800", marginTop: spacing.lg, marginBottom: spacing.sm },
  body: { color: colors.textDim, fontSize: font.body, lineHeight: 21 },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.ring,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  contactLabel: { color: colors.text, fontSize: font.body, fontWeight: "700" },
  contactEmail: { color: colors.orange, fontSize: font.small, marginTop: 1 },
  legalRow: { flexDirection: "row", justifyContent: "center", gap: spacing.sm, marginTop: spacing.lg },
  legalLink: { color: colors.textDim, fontSize: font.small, textDecorationLine: "underline" },
  footerMascot: { width: 80, height: 80, alignSelf: "center", marginTop: spacing.xl },
  woof: { color: colors.textFaint, fontSize: font.small, textAlign: "center", marginTop: spacing.xs },
});
