// Local-first personalization — AsyncStorage-backed watchlist + resume.
// Matches the Whisco TV philosophy: accounts are optional, personalization
// works instantly with zero sign-up friction. (Server-side account sync can
// layer on top later without changing these call sites.)
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SlimTitle } from "./api";

const WATCHLIST_KEY = "whisco.watchlist.v1";
const RESUME_KEY = "whisco.resume.v1";

export type WatchlistItem = Pick<SlimTitle, "id" | "slug" | "name" | "posterUrl" | "type" | "releaseYear" | "imdbRating" | "collection">;

export type ResumeEntry = {
  slug: string;            // title slug
  name: string;
  posterUrl: string;
  type: string;
  episodeId?: string;      // set for series
  episodeLabel?: string;   // "S1 E12"
  streamUrl: string;       // what to resume
  positionSecs?: number;   // native player position (YouTube embeds: undefined)
  updatedAt: number;
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ---------- Watchlist ----------
export async function getWatchlist(): Promise<WatchlistItem[]> {
  return readJson<WatchlistItem[]>(WATCHLIST_KEY, []);
}

export async function isInWatchlist(id: string): Promise<boolean> {
  return (await getWatchlist()).some((w) => w.id === id);
}

export async function toggleWatchlist(item: WatchlistItem): Promise<boolean> {
  const list = await getWatchlist();
  const idx = list.findIndex((w) => w.id === item.id);
  if (idx >= 0) {
    list.splice(idx, 1);
    await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
    return false;
  }
  list.unshift(item);
  await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(list.slice(0, 200)));
  return true;
}

// ---------- Resume watching ----------
export async function getResumeList(): Promise<ResumeEntry[]> {
  const list = await readJson<ResumeEntry[]>(RESUME_KEY, []);
  return list.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveResume(entry: Omit<ResumeEntry, "updatedAt">): Promise<void> {
  const list = await readJson<ResumeEntry[]>(RESUME_KEY, []);
  const filtered = list.filter((r) => r.slug !== entry.slug);
  filtered.unshift({ ...entry, updatedAt: Date.now() });
  await AsyncStorage.setItem(RESUME_KEY, JSON.stringify(filtered.slice(0, 50)));
}

export async function getResumeFor(slug: string): Promise<ResumeEntry | null> {
  const list = await readJson<ResumeEntry[]>(RESUME_KEY, []);
  return list.find((r) => r.slug === slug) || null;
}

export async function removeResume(slug: string): Promise<void> {
  const list = await readJson<ResumeEntry[]>(RESUME_KEY, []);
  await AsyncStorage.setItem(RESUME_KEY, JSON.stringify(list.filter((r) => r.slug !== slug)));
}
