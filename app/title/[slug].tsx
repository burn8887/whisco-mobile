import React from "react";
import LiveOnlyNotice from "../../src/components/LiveOnlyNotice";

/**
 * Title detail — EMPTY ON PURPOSE in build 8.
 *
 * The API already answers 404 for every title on this store (see
 * src/lib/store-ios-live.ts and the title route in Whisco-TV-), so this screen
 * could never load one. It exists so a deep link from build 6 or 7 — a shared
 * URL, a bookmark, a hand-typed archive slug — lands on a plain sentence
 * instead of an error screen or a spinner that never resolves.
 */
export default function TitleScreen() {
  return <LiveOnlyNotice subtitle="Title" />;
}
