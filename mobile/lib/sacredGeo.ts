/**
 * sacredGeo.ts — the location-aware layer of the pilgrimage hub. Pure
 * geometry: the great-circle (haversine) distance between two coordinates, the
 * nearest known site, and whether the pilgrim is "at" a given site (within its
 * radius). No network, no GPS calls here — the caller supplies coordinates
 * (from useLocation), this file only does the maths.
 *
 * These power the "you are at ʿArafah" awareness and the proximity hints in
 * the journey, never turn-by-turn navigation.
 */

import { SITES } from '../content/pilgrimage';
import type { Site } from '../content/pilgrimage';

export type LatLng = { latitude: number; longitude: number };

/** Mean Earth radius in metres. */
const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance in metres between two coordinates (haversine). */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type SiteProximity = {
  site: Site;
  distanceM: number;
  /** True when the coordinate falls within the site's radius. */
  within: boolean;
};

/**
 * The nearest known site to a coordinate, with its distance and whether the
 * pilgrim is within it. Returns null only if no sites are supplied.
 */
export function nearestSite(coords: LatLng, sites: Site[] = SITES): SiteProximity | null {
  let best: SiteProximity | null = null;
  for (const site of sites) {
    const distanceM = haversineMeters(coords, site.coords);
    if (!best || distanceM < best.distanceM) {
      best = { site, distanceM, within: distanceM <= site.radiusM };
    }
  }
  return best;
}

/** Whether the coordinate is within a particular site's radius. */
export function atSite(coords: LatLng, siteId: string, sites: Site[] = SITES): boolean {
  const site = sites.find((s) => s.id === siteId);
  if (!site) return false;
  return haversineMeters(coords, site.coords) <= site.radiusM;
}

/** The site the pilgrim is currently within (the closest, if several), or null. */
export function currentSite(coords: LatLng, sites: Site[] = SITES): Site | null {
  const near = nearestSite(coords, sites);
  return near && near.within ? near.site : null;
}

/** A compact human label for a distance, e.g. "320 m" or "4.1 km". */
export function formatDistance(meters: number): string {
  if (!isFinite(meters) || meters < 0) return '—';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
