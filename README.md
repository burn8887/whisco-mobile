# Whisco TV — Mobile App (React Native / Expo)

Native app for Android phones, Android TV / Google TV, Fire TV (Amazon
Appstore), tablets, and Chromebooks; same codebase later produces iOS.

- Data: versioned mobile API at https://www.whisco.tv/api/mobile/v1 (cached, zero extra DB load)
- Video: expo-video (native ExoPlayer) for HLS/MP4; official YouTube iframe via WebView for embeds
- Branding mirrors whisco.tv (dark #0a0a0f, orange→pink)
- Build: `npx eas build --platform android --profile production` (EAS cloud — no local Android SDK needed)

Structure: `app/` (expo-router screens: tabs Home/Live/VOD + title/[slug] + live/[id]) · `src/` (api client, theme, Player, Cards)
