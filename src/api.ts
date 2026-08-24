// Whisco TV mobile API client — talks to the versioned mobile API.
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

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: "application/json" } });
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
