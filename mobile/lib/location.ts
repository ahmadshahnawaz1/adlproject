/**
 * Location — precise positioning for prayer times.
 *
 * Location is the #1 accuracy factor: a few kilometres can shift Fajr or
 * Maghrib by minutes. This module owns everything about *where* the user is:
 *   • high-accuracy GPS via `expo-location`
 *   • a device-derived timezone (auto, recomputed on change)
 *   • a cached last-known location so we open instantly and work offline
 *   • a manual city override for travel or privacy (GPS denied)
 *
 * It contains NO prayer math and NO UI — just the resolved place + timezone.
 */
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LatLng } from './prayerTimes';

/** How we arrived at the current location — drives the UI hint. */
export type LocationSource = 'gps' | 'manual' | 'cache' | 'default';

/** A fully resolved place: where to compute, what to label it, which tz. */
export type ResolvedLocation = {
  coords: LatLng;
  /** Human label, e.g. "Makkah al-Mukarramah". */
  label: string;
  /** IANA timezone, e.g. "Asia/Riyadh" — taken from the device. */
  timeZone: string;
  /** ISO 3166-1 alpha-2 country code, drives the official-source overlay. */
  countryCode?: string;
  /** Observer elevation in metres (GPS altitude), for the horizon correction. */
  elevation?: number;
  source: LocationSource;
};

const CACHE_KEY = 'adl.location.v1';

/** The heart of the ummah — our graceful fallback before any fix. */
export const DEFAULT_LOCATION: ResolvedLocation = {
  coords: { latitude: 21.4225, longitude: 39.8262 },
  label: 'Makkah al-Mukarramah',
  timeZone: 'Asia/Riyadh',
  countryCode: 'SA',
  elevation: 277,
  source: 'default',
};

/**
 * A small, curated set of cities for manual override. Coordinates are city
 * centres; timezones are IANA. Enough to cover travel without a network.
 */
export type City = {
  name: string;
  country: string;
  /** ISO 3166-1 alpha-2 — selects the recognised authority. */
  countryCode: string;
  coords: LatLng;
  timeZone: string;
  /** Approximate city elevation in metres. */
  elevation?: number;
};

export const CITIES: City[] = [
  { name: 'Makkah', country: 'Saudi Arabia', countryCode: 'SA', coords: { latitude: 21.4225, longitude: 39.8262 }, timeZone: 'Asia/Riyadh', elevation: 277 },
  { name: 'Madinah', country: 'Saudi Arabia', countryCode: 'SA', coords: { latitude: 24.4709, longitude: 39.6121 }, timeZone: 'Asia/Riyadh', elevation: 620 },
  { name: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', coords: { latitude: 24.7136, longitude: 46.6753 }, timeZone: 'Asia/Riyadh', elevation: 612 },
  { name: 'Dubai', country: 'UAE', countryCode: 'AE', coords: { latitude: 25.2048, longitude: 55.2708 }, timeZone: 'Asia/Dubai', elevation: 5 },
  { name: 'Cairo', country: 'Egypt', countryCode: 'EG', coords: { latitude: 30.0444, longitude: 31.2357 }, timeZone: 'Africa/Cairo', elevation: 23 },
  { name: 'Istanbul', country: 'Türkiye', countryCode: 'TR', coords: { latitude: 41.0082, longitude: 28.9784 }, timeZone: 'Europe/Istanbul', elevation: 39 },
  { name: 'Karachi', country: 'Pakistan', countryCode: 'PK', coords: { latitude: 24.8607, longitude: 67.0011 }, timeZone: 'Asia/Karachi', elevation: 8 },
  { name: 'Lahore', country: 'Pakistan', countryCode: 'PK', coords: { latitude: 31.5204, longitude: 74.3587 }, timeZone: 'Asia/Karachi', elevation: 217 },
  { name: 'Delhi', country: 'India', countryCode: 'IN', coords: { latitude: 28.6139, longitude: 77.209 }, timeZone: 'Asia/Kolkata', elevation: 216 },
  { name: 'Jakarta', country: 'Indonesia', countryCode: 'ID', coords: { latitude: -6.2088, longitude: 106.8456 }, timeZone: 'Asia/Jakarta', elevation: 8 },
  { name: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', coords: { latitude: 3.139, longitude: 101.6869 }, timeZone: 'Asia/Kuala_Lumpur', elevation: 66 },
  { name: 'London', country: 'United Kingdom', countryCode: 'GB', coords: { latitude: 51.5074, longitude: -0.1278 }, timeZone: 'Europe/London', elevation: 11 },
  { name: 'Paris', country: 'France', countryCode: 'FR', coords: { latitude: 48.8566, longitude: 2.3522 }, timeZone: 'Europe/Paris', elevation: 35 },
  { name: 'New York', country: 'United States', countryCode: 'US', coords: { latitude: 40.7128, longitude: -74.006 }, timeZone: 'America/New_York', elevation: 10 },
  { name: 'Toronto', country: 'Canada', countryCode: 'CA', coords: { latitude: 43.6532, longitude: -79.3832 }, timeZone: 'America/Toronto', elevation: 76 },
  { name: 'Sydney', country: 'Australia', countryCode: 'AU', coords: { latitude: -33.8688, longitude: 151.2093 }, timeZone: 'Australia/Sydney', elevation: 19 },
];

/** The device's current IANA timezone — recompute whenever this changes. */
export function getDeviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_LOCATION.timeZone;
  } catch {
    return DEFAULT_LOCATION.timeZone;
  }
}

/** Read the last resolved location from disk (instant, offline startup). */
export async function loadCachedLocation(): Promise<ResolvedLocation | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ResolvedLocation;
    if (!parsed?.coords) return null;
    // Always trust the *current* device timezone over a stale cached one.
    return { ...parsed, source: 'cache', timeZone: getDeviceTimeZone() };
  } catch {
    return null;
  }
}

/** Persist a resolved location for next launch. */
export async function saveCachedLocation(loc: ResolvedLocation): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(loc));
  } catch {
    // Caching is best-effort; never block the user on storage.
  }
}

/** Clear the cached location (e.g. when switching back to GPS). */
export async function clearCachedLocation(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}

/** Build a label from a reverse-geocode result, gracefully degrading. */
function labelFromGeocode(place: Location.LocationGeocodedAddress | undefined, coords: LatLng): string {
  if (!place) return `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`;
  const city = place.city || place.subregion || place.region || place.district;
  const country = place.country;
  if (city && country) return `${city}, ${country}`;
  return city || country || `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`;
}

export type GpsResult =
  | { ok: true; location: ResolvedLocation }
  | { ok: false; reason: 'denied' | 'unavailable' };

/**
 * Request permission and fetch a high-accuracy GPS fix, then reverse-geocode
 * it for a friendly label. The timezone always comes from the device. The
 * result is cached on success.
 */
export async function fetchGpsLocation(): Promise<GpsResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { ok: false, reason: 'denied' };

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const coords: LatLng = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    // GPS altitude feeds the elevation (mountains) correction when available.
    const elevation =
      typeof position.coords.altitude === 'number' && position.coords.altitude > 0
        ? Math.round(position.coords.altitude)
        : undefined;

    let label = `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`;
    let countryCode: string | undefined;
    try {
      const places = await Location.reverseGeocodeAsync(coords);
      label = labelFromGeocode(places[0], coords);
      countryCode = places[0]?.isoCountryCode ?? undefined;
    } catch {
      // Reverse geocoding can fail offline — keep the coordinate label.
    }

    const location: ResolvedLocation = {
      coords,
      label,
      timeZone: getDeviceTimeZone(),
      countryCode,
      elevation,
      source: 'gps',
    };
    await saveCachedLocation(location);
    return { ok: true, location };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

/** Turn a manually chosen city into a resolved location (and cache it). */
export async function resolveCity(city: City): Promise<ResolvedLocation> {
  const location: ResolvedLocation = {
    coords: city.coords,
    label: `${city.name}, ${city.country}`,
    // A manual city carries its own canonical timezone (the user is "there").
    timeZone: city.timeZone,
    countryCode: city.countryCode,
    elevation: city.elevation,
    source: 'manual',
  };
  await saveCachedLocation(location);
  return location;
}
