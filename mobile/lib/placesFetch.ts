/**
 * lib/placesFetch — the networked layer for the Mosque & Halal finder (F15).
 *
 * Sends the Overpass query built in lib/places to the public OpenStreetMap
 * Overpass API (keyless), trying mirror endpoints in turn, with a hard timeout.
 * Results are cached to AsyncStorage so a later offline visit still shows the
 * last nearby places. This is the app's only networked feature — by design it
 * degrades gracefully when offline.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  buildOverpassQuery,
  kindsForFilter,
  parseOverpassResponse,
  sortByDistance,
  type LatLng,
  type Place,
  type PlaceFilter,
} from './places';

/** Public Overpass mirrors, tried in order. */
export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const REQUEST_TIMEOUT_MS = 15000;
const CACHE_KEY = 'adl.places.cache.v1';
const CACHE_MAX_ENTRIES = 12;

/** A cached search, keyed by rounded centre + radius + filter. */
type CacheEntry = { at: number; places: Place[] };
type CacheMap = Record<string, CacheEntry>;

/** Round a search into a stable cache key (~110 m grid). */
export function cacheKey(center: LatLng, radiusMeters: number, filter: PlaceFilter): string {
  const lat = center.latitude.toFixed(3);
  const lon = center.longitude.toFixed(3);
  return `${lat},${lon}|${Math.round(radiusMeters)}|${filter}`;
}

async function readCache(): Promise<CacheMap> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheMap) : {};
  } catch {
    return {};
  }
}

/** The cached places for a search, or null if none were stored. */
export async function loadCachedPlaces(
  center: LatLng,
  radiusMeters: number,
  filter: PlaceFilter,
): Promise<Place[] | null> {
  const map = await readCache();
  return map[cacheKey(center, radiusMeters, filter)]?.places ?? null;
}

/** Store a search result, pruning the oldest entries beyond the cap. */
export async function saveCachedPlaces(
  center: LatLng,
  radiusMeters: number,
  filter: PlaceFilter,
  places: Place[],
): Promise<void> {
  try {
    const map = await readCache();
    map[cacheKey(center, radiusMeters, filter)] = { at: Date.now(), places };
    const entries = Object.entries(map);
    if (entries.length > CACHE_MAX_ENTRIES) {
      entries
        .sort((a, b) => a[1].at - b[1].at)
        .slice(0, entries.length - CACHE_MAX_ENTRIES)
        .forEach(([key]) => delete map[key]);
    }
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {
    // Caching is best-effort.
  }
}

/** POST the query to one endpoint with a timeout. Throws on any failure. */
async function postOverpass(endpoint: string, query: string, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Overpass request failed (${res.status})`);
    return await res.json();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

/**
 * Fetch nearby places for a filter, trying each mirror in turn. On success the
 * sorted result is cached. Throws only if every endpoint fails (the caller then
 * falls back to the cache).
 */
export async function fetchNearbyPlaces(
  center: LatLng,
  radiusMeters: number,
  filter: PlaceFilter,
  signal?: AbortSignal,
): Promise<Place[]> {
  const query = buildOverpassQuery(center, radiusMeters, kindsForFilter(filter));
  let lastError: unknown;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const json = await postOverpass(endpoint, query, signal);
      const places = sortByDistance(parseOverpassResponse(json, center));
      await saveCachedPlaces(center, radiusMeters, filter, places);
      return places;
    } catch (err) {
      lastError = err;
      if (signal?.aborted) break;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Overpass request failed');
}
