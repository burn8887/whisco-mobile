# Television build (Android TV / Google TV) — branch notes

**Desk ruling:** 4 Oct 2026 — **Option B**. TV ships as a **TV release track of the same Play package** `tv.whisco.app`, not a second app.
**Status:** branch only. **Not submitted to Play.** No production profile was run. No new binary was uploaded anywhere.

---

## 1. What the ruling fixed, and what this branch implements

| Ruling | Implemented |
|---|---|
| Stream autoplays; **no pause**; **up/down changes channel**; **back leaves** | `app/tv.tsx` — autoplay comes from the existing player (`autoplay=1`, `mediaPlaybackRequiresUserAction={false}`); up/down move focus; OK opens; BACK is the OS gesture, never intercepted |
| **Do not wire the YouTube IFrame API** | No `enablejsapi`, no `postMessage`, no bridge. `src/components/Player.tsx` is **untouched** |
| **Do not edit the shared phone player** | Untouched — the TV screens import it as-is |
| **Do not harvest streams** | None. Live rows still use the official broadcaster embeds |
| Catalogue = **eight news lives + eight Archive films** | `app/tv.tsx` renders the `android` header payload, capped at 8 + 8 |
| Wordmark is the text **"Whisco.tv"** | `app/tv.tsx` header — text, not an image |
| Dark field **#0a0a0f** | `tv.bg` = `colors.bg` = `#0a0a0f` |
| **LEANBACK_LAUNCHER** | Added 4 Oct 2026 (second Desk ruling) — see §3 |
| **touchscreen not required, 320×180 banner** | `plugins/withAndroidTV.js` — see §3 |
| Films may start the same way | `app/tv-film/[slug].tsx` — native ExoPlayer (archive.org MP4), autoplay, BACK leaves |
| No "Free", no "500+", no invented titles | Zero occurrences in the TV copy; only channel/film names from the API |

**No new dependency. No gate change. No catalogue change. No Connect, no Play, no EAS.**

## 2. Why a phone can never see this

`Platform.isTV` (Android: `Configuration.uiMode == "tv"`, read from react-native 0.86.2 source) is the guard.
On a phone both TV routes immediately `router.replace("/")`, so the phone UI, the phone tab bar and the phone catalogue are unchanged. The TV routes are outside the `(tabs)` group and unreachable by any phone navigation.

## 3. Manifest changes — exactly what is declared

`plugins/withAndroidTV.js` (registered last in `app.json`, runs after `expo-router`/`expo-video`):

| Declaration | Value | Why |
|---|---|---|
| `uses-feature android.software.leanback` | `required="false"` | Declares TV capability while keeping the same APK installable on phones |
| `uses-feature android.hardware.touchscreen` | `required="false"` | **Without this Play filters televisions out entirely** — the single most common reason a TV app never appears on a TV |
| `category android.intent.category.LEANBACK_LAUNCHER` | on the MainActivity's existing MAIN/LAUNCHER filter | **Added 4 Oct 2026 (second Desk ruling).** Google: without this filter the app "is not visible to users running Google Play on TV devices" and "does not appear in the TV user interface" |
| `android:banner` on `<application>` | `@drawable/tv_banner` | Google's TV banner; the PNG is 320×180 xhdpi, verified by the plugin before use |
| resource file | `res/drawable-xhdpi/tv_banner.png` | Written by the plugin's dangerous mod — **measured**: `expo prebuild` does *not* auto-collect `assets/tv/`, so without the copy the manifest would reference a drawable that does not exist |

### Why the category went into the existing filter

React Native ships **one** activity (`MainActivity`) that serves phone and TV; the split happens in JS via `Platform.isTV`. Google's documented pattern for that case puts both categories in the **same** intent-filter:

```xml
<intent-filter>
  <action android:name="android.intent.action.MAIN" />
  <category android:name="android.intent.category.LAUNCHER" />
  <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
</intent-filter>
```

*(developer.android.com/training/tv/get-started/create — fetched 4 Oct 2026; page updated 2026-09-28. The separate-activity form shown earlier on the same page is for apps with a distinct TV activity. We do not have one, and adding one would mean native code that cannot be built or tested in this workspace.)*

`LAUNCHER` is left in place, so the **phone icon and phone launch path are unchanged** — the change is purely additive.

Verified by running `npx expo prebuild --platform android` locally and reading the generated manifest, then reverting the prebuild (no `android/` committed; `package.json` restored):

```xml
<activity android:name=".MainActivity" ... android:exported="true"
          android:supportsPictureInPicture="true">
  <intent-filter>
    <action android:name="android.intent.action.MAIN"/>
    <category android:name="android.intent.category.LAUNCHER"/>
    <category android:name="android.intent.category.LEANBACK_LAUNCHER"/>
  </intent-filter>
  <intent-filter>
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT"/>
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:scheme="whiscotv"/>
  </intent-filter>
</activity>
```

```
<uses-feature android:name="android.software.leanback" android:required="false"/>
<uses-feature android:name="android.hardware.touchscreen" android:required="false"/>
<application ... android:banner="@drawable/tv_banner">
```

The plugin also **fails prebuild** if the banner is missing or not exactly 320×180 — tested by temporarily swapping in a 300×180 file and confirming the build refused with a clear message. It also throws if the main activity has no intent-filter, rather than guessing where the category belongs.

## 4. Focus order (the remote's whole UI)

Top to bottom, exactly as rendered: wordmark/header → **Live news** (8 rows) → **Archive film** (8 rows). Each row is one focus target: ember ring + raised background + slight scale-up. First row takes initial focus (`hasTVPreferredFocus`). No horizontal focus traps, no nested scrollables, no player controls — so every up/down press has exactly one meaning and BACK always leaves.

## 5. UNMEASURED — what has to be checked on a real device before any release

Marked [UNMEASURED] rather than guessed. There is no Android device or emulator in this workspace, and this branch was not built with EAS.

1. **[UNMEASURED]** That `hasTVPreferredFocus` on the first row is honoured by this RN version on Android TV (the prop is typed "Apple TV only" in RN 0.86's TS types, though ReactAndroid implements it; harmless if ignored — focus simply starts wherever the OS puts it).
2. **[UNMEASURED]** That the ScrollView auto-scrolls to keep the focused row on screen on a TV device when focus moves down past the fold.
3. **[UNMEASURED]** That BACK from `app/tv-film/[slug].tsx` returns to the TV list and then exits, in the order a viewer expects.
4. **[UNMEASURED]** Whether the YouTube embed renders correctly at 1080p/4K TV density and TV user-agent (the code carries an "error 153" workaround for the WebView origin that has never been exercised on TV).
5. **[UNMEASURED]** Whether the device reports `uiMode == "tv"` as expected on every Google TV/Android TV device class the Desk intends to reach (this is what the phone guard depends on).
6. **[UNMEASURED]** That the `LEANBACK_LAUNCHER` entry actually appears on a real TV home screen and launches this build — the manifest line is verified (§3), the runtime behaviour on a device is not. **This is the first thing to check on a device.**
7. **[UNMEASURED]** The film screen uses the shared player's **native (ExoPlayer) controls**, which the ruling did not ask us to remove and which the phone shares. Whether a TV remote can drive those native controls is not known here, and does not need to be — **autoplay and BACK are the ruled behaviour and neither depends on them**. If the Desk wants a controls-free film screen later, that is a change to the TV route only, not to the shared component.

## 6. Before this could ship (nothing below is done, and none of it is started)

1. A device check of §5.1–5.6 — the manifest side is complete; nothing about how the TV behaves has been run anywhere.
2. A TV **form-factor release track** in Play Console — a release the founder presses. The phone track stays on versionCode 7; **EAS owns the version code remotely** (`eas.json`: `appVersionSource: "remote"`, `production.autoIncrement: true`), so the plan for a TV track's versionCode must be ruled before any build exists.
3. A TV listing (banner already 320×180; screenshots of the TV layout do not exist yet).
4. Only then: build and submit — neither by this agent.

## 7. Files in this branch

| File | Purpose |
|---|---|
| `app/tv.tsx` | the TV screen: curated 8 + 8, focus ring, remote-only navigation |
| `app/tv-film/[slug].tsx` | TV film playback (native, autoplay, BACK leaves) |
| `plugins/withAndroidTV.js` | leanback + touchscreen-not-required + banner (+ size assertion, + resource copy) |
| `assets/tv/tv_banner.png` | the 320×180 banner drawable |
| `app.json` | registers the plugin (one line) |
| `src/theme.ts` | `tv` tokens (TV-only; phone screens never read them) |
