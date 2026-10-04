/**
 * withAndroidTV — make the Android build installable and launchable on
 * Android TV / Google TV, without changing anything the phone sees.
 *
 * WHY THIS FILE EXISTS
 * Desk ruling, 4 Oct 2026: Whisco TV ships to televisions as a TV release track
 * of the SAME package (tv.whisco.app) — not a second app. Google's TV
 * requirements for that are manifest-level, and none of them were declared:
 *
 *   1. <uses-feature android:name="android.software.leanback" .../>  — declares
 *      the app is TV-capable, which is what makes it appear on televisions.
 *   2. <uses-feature android:name="android.hardware.touchscreen"
 *      android:required="false"/> — without this, Play filters the app OFF
 *      every touchscreen-less device (i.e. every TV). This is the single most
 *      common reason a TV app never appears on the TV.
 *   3. android:banner on <application> — the banner Play shows on the TV home
 *      screen / launcher. Google's spec is a 320x180 xhdpi drawable.
 *
 * WHY ATTRIBUTES ARE SET WITH QUALIFIED KEYS
 * The manifest object is a plain JS mirror of the XML: attribute keys must be
 * written exactly as they appear in the file, i.e. with the "android:" prefix.
 * `prefixAndroidKeys` from @expo/config-plugins does this for us.
 *
 * WHY IT ASSERTS THE BANNER SIZE
 * Google rejects a TV listing whose banner is not 320x180. Failing prebuild with
 * a clear message is better than discovering it in Play Console, so this plugin
 * reads the PNG's IHDR header and throws if the dimensions are wrong. It parses
 * the header directly — no image dependency, no new package.
 *
 * WHAT IT DELIBERATELY DOES NOT TOUCH
 * - No new activity, no launcher-intent change: the existing MAIN/LAUNCHER
 *   activity keeps the phone behaviour byte-for-byte.
 * - No leanback <intent-filter> is added yet. A LEANBACK_LAUNCHER filter on the
 *   same activity changes how it is resolved on TV devices, and that is a
 *   runtime behaviour we cannot verify in this sandbox. It is the documented
 *   remaining step before a TV release — see store/tv-build.md.
 * - No iOS surface, no permissions, no versionCode (EAS owns that remotely).
 *
 * PLUGIN ORDER
 * Registered last in app.json, so it runs after expo-router / expo-video.
 * Nothing else in the plugin stack writes these three keys today.
 *
 * WHY THE PLUGIN ALSO COPIES THE PNG
 * Measured, not assumed: `expo prebuild --platform android` does NOT collect
 * ./assets/tv/ into the Android resources — after a prebuild the manifest
 * referenced @drawable/tv_banner while no such drawable existed, which would
 * have built an APK with a broken banner reference. So this plugin writes the
 * file into res/drawable-xhdpi/ itself (see withDangerousMod below). A file at
 * res/drawable-xhdpi/tv_banner.png resolves as @drawable/tv_banner.
 */
const {
  withAndroidManifest,
  withDangerousMod,
  AndroidConfig,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const BANNER_REL = "assets/tv/tv_banner.png";
const BANNER_REQUIRED_W = 320;
const BANNER_REQUIRED_H = 180;

/** Read width/height straight out of the PNG IHDR — no image library needed. */
function pngSize(absPath) {
  const buf = fs.readFileSync(absPath);
  const isPng =
    buf.length > 24 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47; // \x89PNG
  if (!isPng) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function withAndroidTV(config) {
  // Fail early, with a useful message, if the banner is missing or mis-sized.
  const projectRoot = config._internal?.projectRoot || process.cwd();
  const bannerAbs = path.join(projectRoot, BANNER_REL);
  if (!fs.existsSync(bannerAbs)) {
    throw new Error(
      `[withAndroidTV] TV banner missing at ${BANNER_REL}. ` +
        `Google requires a 320x180 xhdpi banner for a TV listing.`
    );
  }
  const size = pngSize(bannerAbs);
  if (!size) {
    throw new Error(`[withAndroidTV] ${BANNER_REL} is not a valid PNG.`);
  }
  if (size.width !== BANNER_REQUIRED_W || size.height !== BANNER_REQUIRED_H) {
    throw new Error(
      `[withAndroidTV] Banner must be exactly ${BANNER_REQUIRED_W}x${BANNER_REQUIRED_H} ` +
        `(Google's xhdpi TV banner spec). Found ${size.width}x${size.height}.`
    );
  }

  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    // ---- 1 & 2. uses-feature declarations (deduped by android:name) ----------
    const wanted = [
      // TV-capable. `required: false` keeps the SAME apk installable on phones.
      { "android:name": "android.software.leanback", "android:required": "false" },
      // THE critical one: without it, Play filters televisions out entirely.
      { "android:name": "android.hardware.touchscreen", "android:required": "false" },
    ];
    const existing = Array.isArray(manifest.manifest["uses-feature"])
      ? manifest.manifest["uses-feature"]
      : manifest.manifest["uses-feature"]
        ? [manifest.manifest["uses-feature"]]
        : [];

    for (const feature of wanted) {
      const name = feature["android:name"];
      const already = existing.find((f) => f?.$ && f.$["android:name"] === name);
      if (already) {
        // Correct a wrong value rather than duplicating the element.
        Object.assign(already.$, feature);
      } else {
        existing.push({ $: { ...feature } });
      }
    }
    manifest.manifest["uses-feature"] = existing;

    // ---- 3. android:banner on <application> ---------------------------------
    // The drawable itself is written by the dangerous mod below; the assertion
    // above guarantees it is a real 320x180 PNG before we ever reference it.
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    mainApplication.$ = mainApplication.$ || {};
    mainApplication.$["android:banner"] = "@drawable/tv_banner";

    return cfg;
  });

  // Attach the resource-copy mod. `withDangerousMod` runs after the android
  // project exists on disk, which is exactly when res/ can be written.
  // (See comments at the top of the file for why this is necessary.)
}

/** Copy the (already size-verified) banner into the Android res tree. */
function withBannerResource(config) {
  return withDangerousMod(config, [
    "android",
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const resDir = path.join(
        cfg.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "drawable-xhdpi"
      );
      fs.mkdirSync(resDir, { recursive: true });
      fs.copyFileSync(
        path.join(projectRoot, BANNER_REL),
        path.join(resDir, "tv_banner.png")
      );
      return cfg;
    },
  ]);
}

module.exports = (config) => withBannerResource(withAndroidTV(config));
