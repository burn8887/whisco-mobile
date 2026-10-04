// Whisco TV brand theme — mirrors the website exactly.
export const colors = {
  bg: "#0a0a0f",
  surface: "#18181b",
  surfaceLight: "#27272a",
  text: "#fafafa",
  textDim: "#a1a1aa",
  textFaint: "#71717a",
  orange: "#f97316",
  pink: "#db2777",
  emerald: "#34d399",
  red: "#ef4444",
  ring: "rgba(255,255,255,0.08)",
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };

export const font = {
  title: 24,
  heading: 18,
  body: 14,
  small: 12,
  tiny: 10,
};

// Television-only tokens (Android TV / Google TV). Kept separate from the phone
// scale on purpose: TV is viewed at ~3 m with a D-pad, not a thumb. Nothing here
// is consumed by the phone screens, so phone layout cannot be affected.
//
// Desk ruling, 4 Oct 2026: TV ships as a TV release track of the same package,
// on the Android catalogue (eight news lives + eight Internet Archive films).
export const tv = {
  bg: colors.bg,              // #0a0a0f dark field — as specified
  rowHeight: 68,              // generous target: focus must be obvious from a sofa
  rowGap: 10,
  gutter: 48,                 // 5% safe area on a 1080p panel
  focusRing: colors.orange,   // #f97316 ember
  focusBg: "#1c1c22",         // one step brighter than surface, for the focused row
  sectionGap: 28,
  titleSize: 34,              // the "Whisco.tv" wordmark, set in type
  sectionSize: 22,
  rowTitleSize: 20,
  rowMetaSize: 14,
  hintSize: 13,
};
