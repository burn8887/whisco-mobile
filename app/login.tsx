import React, { useState } from "react";
import { ScrollView, View, Text, TextInput, StyleSheet, Pressable, Linking } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, font, radius, spacing } from "../src/theme";

// Sign-in for registered whisco.tv viewers. v1 validates against the site's
// NextAuth credentials endpoint; on success we store a lightweight session
// marker (name/email) for a personalized greeting. Full server-side
// watchlist sync ships in a later version — local personalization already
// works for everyone without an account.
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const signIn = async () => {
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      // NextAuth CSRF + credentials flow against the live site.
      const csrfRes = await fetch("https://www.whisco.tv/api/auth/csrf");
      const { csrfToken } = await csrfRes.json();
      const res = await fetch("https://www.whisco.tv/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ csrfToken, email: email.trim(), password, json: "true" }).toString(),
      });
      // NextAuth returns 200 + a redirect URL on success; error URLs contain "error"
      const ok = res.ok && !(res.url && res.url.includes("error"));
      if (ok) {
        await AsyncStorage.setItem("whisco.session.v1", JSON.stringify({ email: email.trim(), at: Date.now() }));
        router.back();
      } else {
        setError("Email or password didn't match. Try again or reset on whisco.tv.");
      }
    } catch {
      setError("Couldn't reach Whisco TV — check your connection.");
    }
    setBusy(false);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Sign in" }} />
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg }}>
        <Image source={require("../assets/brand/sticker.png")} style={styles.mascot} contentFit="contain" />
        <Text style={styles.title}>Welcome back 🐾</Text>
        <Text style={styles.sub}>
          Sign in with your whisco.tv account. No account? You don't need one — everything is free without signing in.
        </Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.textFaint}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable onPress={signIn} disabled={busy}>
          <LinearGradient
            colors={[colors.orange, colors.pink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.btn, busy && { opacity: 0.6 }]}
          >
            <Text style={styles.btnText}>{busy ? "Signing in…" : "Sign in"}</Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={() => Linking.openURL("https://www.whisco.tv/signup")} style={{ marginTop: spacing.md }}>
          <Text style={styles.link}>New here? Create a free account on whisco.tv →</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  mascot: { width: 96, height: 96, alignSelf: "center", marginBottom: spacing.sm },
  title: { color: colors.text, fontSize: font.title, fontWeight: "900", textAlign: "center" },
  sub: { color: colors.textDim, fontSize: font.body, textAlign: "center", marginTop: spacing.sm, marginBottom: spacing.lg, lineHeight: 20 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.ring,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: font.body,
    marginBottom: spacing.sm,
  },
  error: { color: colors.red, fontSize: font.small, marginBottom: spacing.sm, textAlign: "center" },
  btn: { borderRadius: radius.full, paddingVertical: 14, alignItems: "center", marginTop: spacing.sm },
  btnText: { color: "#fff", fontWeight: "900", fontSize: font.body },
  link: { color: colors.orange, fontSize: font.small, textAlign: "center" },
});
