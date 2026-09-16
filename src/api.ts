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
// Apple rejected build 5 under 5.2.2: the app showed a catalogue containing content
// we cannot document the right to use. The fix is a store gate on the server: this
// header makes /api/mobile/v1 return ONLY rows a human has cleared for the App Store
// build, each with an evidence link. Without the header the API still serves the full
// public catalogue — which is what the website and the Android build receive, and they
// are unaffected.
//
// If a row is not cleared it is simply absent, and a deep link to it returns 404.
// This build ships a small, provable catalogue on purpose. That is the point.
//
// iOS ONLY. This file is compiled into BOTH the iOS and the Android build
// (app.json: tv.whisco.app for both). Sending the header unconditionally would hand the
// Android app the narrowed App Store catalogue too — and Android is already live in
// closed testing on the full one. So Android keeps the fat catalogue and only the App
// Store build asks for the cleared set.
const STORE_HEADER =
  Platform.OS === "ios" ? ({ "X-Whisco-Store": "ios" } as const) : ({} as const);

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
