// Whisco TV mobile API client — talks to the versioned mobile API.

import { Platform } from "react-native";
const BASE = "https://www.whisco.tv/api/mobile/v1";

export type SlimTitle = {
  id: string;
  slug: string;
  name: string;
  posterUrl: string;
  backdropUrl?: string;
  type: "MOVIE" | "SERIES" | "DOCUMENTARY";
  releaseYear: number;
  imdbRating: number;
  collection: string;
  isNew?: boolean;
};

export type Channel = {
  id: string;
  name: string;
  logoUrl: string;
  streamUrl: string;
  country: string;
  language: string;
  category: string;
  isHD: boolean;
  isActive?: boolean;
  /** Why we believe we may carry this channel — shown in the app as the Source note. */
  rightsBasis?: string | null;
  /** The official URL a viewer can check: the broadcaster's own channel. */
  evidenceUrl?: string | null;
};

export type Episode = {
  id: string;
  number: number;
  name: string;
  synopsis: string;
  durationMins: number;
  stillUrl: string;
  streamUrl: string;
};

export type TitleDetail = SlimTitle & {
  synopsis: string;
  rating: string;
  durationMins: number | null;
  genres: string;
  cast: string;
  country: string;
  language: string;
  streamUrl: string | null;
  seasons: { number: number; episodes: Episode[] }[];
  /** Why we believe we may carry this title — shown in the app as the Source note. */
  rightsBasis?: string | null;
  /** The official URL a viewer can check: the archive item page. */
  evidenceUrl?: string | null;
  /** Set when the item came from an official uploader channel. */
  uploaderUrl?: string | null;
};

export type HomePayload = {
  stats: { channels: number; titles: number };
  hero: SlimTitle[];
  rows: { key: string; label: string; items: SlimTitle[] }[];
  featuredChannels: Pick<Channel, "id" | "name" | "logoUrl" | "category" | "country">[];
};

export type LivePayload = {
  page: number;
  filteredCount: number;
  total: number;
  channels: Channel[];
  facets: { countries: string[]; categories: string[]; languages: { language: string; count: number }[] };
};

export type VodShelvesPayload = {
  mode: "shelves";
  total: number;
  shelves: { name: string; count: number; items: SlimTitle[] }[];
};

export type VodGridPayload = {
  mode: "grid";
  collection: string;
  q: string;
  page: number;
  filteredCount: number;
  items: SlimTitle[];
};

// The App Store build reads a NARROWED catalogue, not the public one.
//
// Apple rejected build 5, then build 7, under 5.2.2. The build-8 ruling
// (2026-09-28) makes the split sharper than "cleared":
//
//   iOS            -> EIGHT official news live streams. Zero on-demand titles.
//                     /vod is empty, every /title/<slug> is a 404.
//   Android / Play -> the cleared 8 live + 8 films it is in review with.
//   no header      -> the full public catalogue (the website).
//
// The server decides all of that; this file only says who is asking. The live
// eight are an allow-list of YouTube channel ids on the server side
// (src/lib/store-ios-live.ts in Whisco-TV-), so no database flag can widen the
// Apple catalogue by accident, and a deep link to anything else returns 404.
//
  // BOTH STORES, SAME CLEARED CATALOGUE (Grok, 2026-09-17).
  //
  // This one file is compiled into the iOS AND the Android build (app.json:
  // tv.whisco.app for both), so the header is sent per platform rather than
  // unconditionally:
  //   iOS            -> X-Whisco-Store: ios
  //   Android / Play -> X-Whisco-Store: android
  //
  // Grok's Android brief: Play must ship the same 8 live + 8 VOD catalogue as iOS
  // build 7, under the same doctrine - no harvested HLS, no cinema/dizi, no counts
  // the app cannot honour. The API accepts "android" and "play" as the same cleared
  // catalogue (store-gate.ts, Option A), so both stores read one code path and
  // cannot drift apart.
  //
  // Why a per-platform value rather than one constant: a Play client claiming to be
  // an iOS client is dishonest naming, and the API echoes the value back as `store`,
  // so the response would lie about who asked.
  //
  // A client sending NO header still gets the fat catalogue. Deliberate: the Play
  // closed-test binary installed on testers predates this change and must keep
  // working until those testers update.
  const STORE_HEADER: Record<string, string> =
    Platform.OS === "ios"
      ? { "X-Whisco-Store": "ios" }
      : Platform.OS === "android"
        ? { "X-Whisco-Store": "android" }
        : {};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: "application/json", ...STORE_HEADER },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const api = {
  home: () => get<HomePayload>("/home"),
  live: (params: { country?: string; category?: string; language?: string; q?: string; page?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.country) qs.set("country", params.country);
    if (params.category) qs.set("category", params.category);
    if (params.language) qs.set("language", params.language);
    if (params.q) qs.set("q", params.q);
    if (params.page) qs.set("page", String(params.page));
    return get<LivePayload>(`/live?${qs}`);
  },
  vodShelves: () => get<VodShelvesPayload>("/vod"),
  vodGrid: (collection: string, q = "", page = 1) =>
    get<VodGridPayload>(`/vod?collection=${encodeURIComponent(collection)}&q=${encodeURIComponent(q)}&page=${page}`),
  vodSearch: (q: string, page = 1) => get<VodGridPayload>(`/vod?q=${encodeURIComponent(q)}&page=${page}`),
  title: (slug: string) => get<{ title: TitleDetail; similar: SlimTitle[] }>(`/title/${slug}`),
  channel: (id: string) => get<{ channel: Channel; related: Channel[] }>(`/channel/${id}`),
};
