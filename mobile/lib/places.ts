/**
 * lib/places — the pure logic for the Mosque & Halal finder (F15).
 *
 * Builds OpenStreetMap Overpass QL queries for nearby mosques and halal food,
 * parses the response into a clean `Place[]`, and provides distance maths,
 * sorting, filtering and formatting. This is the one place the app reaches the
 * network (in lib/placesFetch); everything here is pure and fully tested.
 *
 * Data © OpenStreetMap contributors (ODbL) — attribution is required wherever
 * results are shown.
 */
import type { LatLng } from './prayerTimes';

export type { LatLng };

/** What a result is. */
export type PlaceKind = 'mosque' | 'halal';

/** The filter shown to the user. */
export type PlaceFilter = 'all' | PlaceKind;

/** A resolved nearby place. */
export type Place = {
  /** Stable id, e.g. 'node/123'. */
  id: string;
  kind: PlaceKind;
  name: string;
  coords: LatLng;
  /** Great-circle distance from the search centre, in metres. */
  distanceMeters: number;
  /** A one-line address assembled from addr:* tags, if any. */
  address?: string;
  /** The raw OSM tags, for cuisine hints etc. */
  tags?: Record<string, string>;
};

const EARTH_RADIUS_M = 6371000;
const toRad = (deg: number): number => (deg * Math.PI) / 180;

/** Great-circle distance between two points, in metres (haversine). */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

const FOOD_AMENITIES = '^(restaurant|cafe|fast_food|food_court)$';

/**
 * Build an Overpass QL query for the requested kinds around a centre. Mosques
 * are Muslim places of worship; halal results are food venues tagged halal.
 * `out center tags` yields a representative point for ways/relations too.
 */
export function buildOverpassQuery(
  center: LatLng,
  radiusMeters: number,
  kinds: PlaceKind[],
  limit = 60,
): string {
  const lat = center.latitude.toFixed(6);
  const lon = center.longitude.toFixed(6);
  const around = `(around:${Math.round(radiusMeters)},${lat},${lon})`;
  const parts: string[] = [];
  if (kinds.includes('mosque')) {
    parts.push(`nwr["amenity"="place_of_worship"]["religion"="muslim"]${around};`);
  }
  if (kinds.includes('halal')) {
    parts.push(`nwr["diet:halal"~"yes|only"]["amenity"~"${FOOD_AMENITIES}"]${around};`);
  }
  return `[out:json][timeout:25];(${parts.join('')});out center tags ${limit};`;
}

/** Decide what an element is from its tags, or null if it is neither. */
export function classifyElement(tags: Record<string, string>): PlaceKind | null {
  if (tags.amenity === 'place_of_worship' && (tags.religion ?? '').toLowerCase() === 'muslim') {
    return 'mosque';
  }
  const halal = (tags['diet:halal'] ?? '').toLowerCase();
  if (halal === 'yes' || halal === 'only') return 'halal';
  return null;
}

/** Assemble a readable one-line address from addr:* tags. */
export function addressFromTags(tags: Record<string, string>): string | undefined {
  const parts = [
    [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '),
    tags['addr:city'] ?? tags['addr:suburb'],
  ].filter((s) => s && s.length > 0);
  return parts.length ? parts.join(', ') : undefined;
}

type OverpassElement = {
  type?: string;
  id?: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

/**
 * Parse an Overpass JSON payload into clean `Place[]`. Elements without a name
 * or a usable coordinate are dropped; each place carries its distance from the
 * centre. Unsorted — call `sortByDistance` to order the list.
 */
export function parseOverpassResponse(json: unknown, center: LatLng): Place[] {
  const elements = (json as { elements?: OverpassElement[] } | null)?.elements;
  if (!Array.isArray(elements)) return [];

  const places: Place[] = [];
  for (const el of elements) {
    const tags = el.tags;
    if (!tags) continue;
    const name = tags.name;
    if (!name) continue; // unnamed places are not useful to a user

    const kind = classifyElement(tags);
    if (!kind) continue;

    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (typeof lat !== 'number' || typeof lon !== 'number') continue;

    const coords: LatLng = { latitude: lat, longitude: lon };
    places.push({
      id: `${el.type ?? 'node'}/${el.id ?? `${lat},${lon}`}`,
      kind,
      name,
      coords,
      distanceMeters: haversineMeters(center, coords),
      address: addressFromTags(tags),
      tags,
    });
  }
  return places;
}

/** A new array ordered nearest-first. */
export function sortByDistance(places: Place[]): Place[] {
  return [...places].sort((a, b) => a.distanceMeters - b.distanceMeters);
}

/** Keep only the places matching a filter ('all' keeps everything). */
export function filterPlaces(places: Place[], filter: PlaceFilter): Place[] {
  if (filter === 'all') return places;
  return places.filter((p) => p.kind === filter);
}

/** A short human distance, e.g. "800 m" or "1.2 km". */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** The kinds to request for a given filter. */
export function kindsForFilter(filter: PlaceFilter): PlaceKind[] {
  if (filter === 'all') return ['mosque', 'halal'];
  return [filter];
}
