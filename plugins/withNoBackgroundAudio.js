/**
 * withNoBackgroundAudio — strip the iOS "audio" background mode for good.
 *
 * WHY THIS FILE EXISTS
 * Apple rejected build 5 under Guideline 2.5.4: the app declared
 * UIBackgroundModes = ["audio"] in Info.plist but played no audible content in
 * the background. Verified against our own generated plist, the declaration was
 * real, so Apple's finding was correct.
 *
 * WHY WE CANNOT JUST DELETE THE KEY FROM app.json
 * expo-video's own config plugin writes this key. In its source:
 *
 *   const shouldEnableBackgroundAudio =
 *       supportsBackgroundPlayback || supportsPictureInPicture;
 *   if (shouldEnableBackgroundAudio && !currentBackgroundModes.includes('audio')) {
 *       config.modResults.UIBackgroundModes = [...currentBackgroundModes, 'audio'];
 *   }
 *
 * Our app.json configures ["expo-video", { "supportsPictureInPicture": true }],
 * so shouldEnableBackgroundAudio is true and the plugin RE-ADDS "audio" during
 * prebuild — even after the key is deleted from app.json.
 *
 * This was tested, not assumed: removing UIBackgroundModes from app.json and
 * running `expo prebuild` still produced a plist containing ["audio"]. Shipping
 * that would have earned a third rejection on the same guideline.
 *
 * WHY NOT JUST SET supportsPictureInPicture: false INSTEAD
 * That would fix iOS but also delete `android:supportsPictureInPicture` from the
 * Android manifest, silently removing picture-in-picture from the Android app —
 * which is live in closed testing on Play. We should not break one store to fix
 * the other.
 *
 * WHAT THIS DOES INSTEAD
 * Runs as a config plugin AFTER expo-video (plugin order is array order, and the
 * last writer wins), and removes "audio" from UIBackgroundModes on iOS only.
 * expo-video's Android handling is untouched, so Android keeps PiP.
 *
 * NOTE ON iOS PiP: expo-video's iOS branch makes no change to Info.plist other
 * than this key, so picture-in-picture on iOS is unaffected — PiP is a runtime
 * presentation feature (AVPlayerViewController), not a background-audio
 * declaration. Re-verify PiP on a device build before submitting.
 */
const { withInfoPlist } = require('expo/config-plugins');

function withNoBackgroundAudio(config) {
  return withInfoPlist(config, (config) => {
    const modes = config.modResults.UIBackgroundModes ?? [];
    const filtered = modes.filter((mode) => mode !== 'audio');

    if (filtered.length === 0) {
      // Remove the key entirely rather than declare an empty array.
      delete config.modResults.UIBackgroundModes;
    } else {
      config.modResults.UIBackgroundModes = filtered;
    }

    return config;
  });
}

module.exports = withNoBackgroundAudio;
