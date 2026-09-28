import React from "react";
import LiveOnlyNotice from "../../src/components/LiveOnlyNotice";

/**
 * My List — EMPTY ON PURPOSE in build 8.
 *
 * This screen used to read the local watchlist and the resume list, and both
 * can hold Archive films saved by an older build. A saved poster wall is the
 * same 5.2.2 problem as a live one, so build 8 shows neither. The route stays
 * so an old link lands here instead of on a crash.
 */
export default function MyListScreen() {
  return <LiveOnlyNotice subtitle="My List" />;
}
