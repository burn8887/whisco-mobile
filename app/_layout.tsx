import React from "react";
import { Platform } from "react-native";
import { Redirect, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../src/theme";

/**
 * TvLaunchGate — put a television on the TV screen.
 *
 * WHY THIS EXISTS (Desk ruling, 5 Oct 2026)
 * The Android TV build shipped as versionCode 8 declared LEANBACK_LAUNCHER, the
 * banner and both `required=false` features correctly — and then opened the
 * PHONE home on a television. `app/tv.tsx` existed but nothing ever navigated to
 * it: every `isTV` check in the codebase was a guard INSIDE the TV routes
 * bouncing non-TV devices away, with no matching redirect TOWARDS them. The
 * launch route is the phone home, because `(tabs)` is declared first in the
 * Stack below.
 *
 * WHY A RENDER-TIME REDIRECT AND NOT `useEffect` + `router.replace`
 * The Desk was explicit: an effect-based redirect paints the phone home first,
 * and "a slow redirect is how this bug shipped". Returning `<Redirect>` instead
 * of `children` means the navigator — and therefore the phone UI — is never
 * rendered at all while the redirect is in flight. Nothing paints but the
 * background colour.
 *
 * WHY IT GATES EVERY ROUTE, NOT JUST THE INDEX
 * A redirect in `(tabs)/index.tsx` would cover a cold start but leave every
 * other entry (deep link, restored navigation stack, tab press) showing phone
 * UI on a television. This wraps the navigator itself, so any non-TV route on a
 * TV device is caught.
 *
 * THE ALLOW-LIST, AND WHAT HAPPENS ON A PHONE
 * Only `/tv` and `/tv-film/[slug]` are TV surface. `Platform.isTV` is false on
 * phones and tablets, so the `if` below never fires there and `children` render
 * exactly as before — the phone app cannot change. That is the whole safety
 * argument for touching a shared file.
 *
 * AN EMPTY SEGMENT LIST IS NOT A TV ROUTE
 * On the first frame `useSegments()` can be empty before the navigation state
 * hydrates. `undefined !== "tv"` and `undefined !== "tv-film"`, so an empty list
 * still redirects — which is the desired behaviour, and is why this compares
 * against the allow-list instead of testing for a known-bad route.
 *
 * NOTE ON `Redirect` ITSELF
 * expo-router implements `<Redirect>` with `useFocusEffect` + `router.replace`
 * internally (build/link/Redirect.js), so the navigation call is still an
 * effect. That is fine and is not what the Desk objected to: the objection was
 * to rendering the phone UI before redirecting, and this gate never renders it.
 * Verified against the installed expo-router 57.0.15 source, not assumed.
 *
 * The guards in `app/tv.tsx` and `app/tv-film/[slug].tsx` are untouched and
 * stay in place: a phone hitting those routes still gets `replace("/")`.
 */
function TvLaunchGate({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const root = segments[0];
  const onTvRoute = root === "tv" || root === "tv-film";
  if (Platform.isTV && !onTvRoute) {
    return <Redirect href="/tv" />;
  }
  return children;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <TvLaunchGate>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: "800" },
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="title/[slug]" options={{ title: "", headerBackTitle: "Back" }} />
          <Stack.Screen name="live/[id]" options={{ title: "", headerBackTitle: "Back" }} />
          <Stack.Screen name="about" options={{ headerBackTitle: "Back" }} />
          <Stack.Screen name="login" options={{ headerBackTitle: "Back" }} />
        </Stack>
      </TvLaunchGate>
    </SafeAreaProvider>
  );
}
