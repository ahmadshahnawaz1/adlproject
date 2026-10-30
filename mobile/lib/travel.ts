/**
 * lib/travel — the pure logic behind Travel Mode (F24).
 *
 * Decides whether the user counts as a traveller (distance from the home point
 * they set), what each prayer becomes under qaṣr, and which prayers may be
 * joined. It never decides a school for the user: the distance threshold is a
 * setting and joining is offered, not asserted. Pure & tested.
 */
import { haversineMeters, type LatLng } from './places';
import {
  DEFAULT_THRESHOLD_KM,
  MAX_THRESHOLD_KM,
  MIN_THRESHOLD_KM,
  type JoinKind,
} from '../content/travel';
import type { PrayerName } from './prayerTimes';

export { DEFAULT_THRESHOLD_KM, MIN_THRESHOLD_KM, MAX_THRESHOLD_KM };

/** The five obligatory prayers, as Travel Mode addresses them. */
export type ObligatoryPrayer = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const TRAVEL_PRAYERS: ObligatoryPrayer[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

/** Rakʿahs of each obligatory prayer when resident. */
export const FULL_RAKAHS: Record<ObligatoryPrayer, number> = {
  fajr: 2,
  dhuhr: 4,
  asr: 4,
  maghrib: 3,
  isha: 4,
};

/** Only the four-rakʿah prayers are shortened. */
export function isShortenable(prayer: ObligatoryPrayer): boolean {
  return FULL_RAKAHS[prayer] === 4;
}

/** Rakʿahs actually prayed, given whether the concession is being taken. */
export function rakahsFor(prayer: ObligatoryPrayer, travelling: boolean): number {
  return travelling && isShortenable(prayer) ? 2 : FULL_RAKAHS[prayer];
}

/** The pairs that may be joined. Fajr is never joined. */
export const JOIN_PAIRS: { first: ObligatoryPrayer; second: ObligatoryPrayer }[] = [
  { first: 'dhuhr', second: 'asr' },
  { first: 'maghrib', second: 'isha' },
];

/** The prayer this one may be joined with, or null. */
export function joinPartner(prayer: ObligatoryPrayer): ObligatoryPrayer | null {
  for (const pair of JOIN_PAIRS) {
    if (pair.first === prayer) return pair.second;
    if (pair.second === prayer) return pair.first;
  }
  return null;
}

/** Whether a prayer may be joined with another at all. */
export function canJoin(prayer: ObligatoryPrayer): boolean {
  return joinPartner(prayer) !== null;
}

/** A prayer as Travel Mode presents it. */
export type TravelPrayer = {
  prayer: ObligatoryPrayer;
  fullRakahs: number;
  rakahs: number;
  shortened: boolean;
  joinsWith: ObligatoryPrayer | null;
};

/** The five prayers under the current travel state. */
export function travelPrayers(travelling: boolean): TravelPrayer[] {
  return TRAVEL_PRAYERS.map((prayer) => ({
    prayer,
    fullRakahs: FULL_RAKAHS[prayer],
    rakahs: rakahsFor(prayer, travelling),
    shortened: travelling && isShortenable(prayer),
    joinsWith: joinPartner(prayer),
  }));
}

/** Clamp a user-chosen threshold into a sane range. */
export function clampThreshold(km: number): number {
  if (!Number.isFinite(km)) return DEFAULT_THRESHOLD_KM;
  return Math.max(MIN_THRESHOLD_KM, Math.min(MAX_THRESHOLD_KM, Math.round(km)));
}

/** Kilometres between two points. */
export function distanceKm(a: LatLng, b: LatLng): number {
  return haversineMeters(a, b) / 1000;
}

/** Where the user stands relative to their home point. */
export type TravelStatus = {
  /** Null when no home point has been set yet. */
  distanceKm: number | null;
  thresholdKm: number;
  /** Whether the distance alone qualifies as travel. */
  qualifies: boolean;
  /** Whether the concession is actually in effect (override wins). */
  travelling: boolean;
  /** How the answer was reached. */
  reason: 'no-home' | 'distance' | 'manual-on' | 'manual-off';
};

/** A manual switch that overrides the distance check either way. */
export type TravelOverride = 'auto' | 'on' | 'off';

/**
 * Resolve the travel state. The manual override always wins so the user can
 * follow a ruling the distance check cannot know about (an intention to stay,
 * a school with a different threshold, a journey by custom).
 */
export function travelStatus(opts: {
  home: LatLng | null;
  current: LatLng | null;
  thresholdKm?: number;
  override?: TravelOverride;
}): TravelStatus {
  const thresholdKm = clampThreshold(opts.thresholdKm ?? DEFAULT_THRESHOLD_KM);
  const override = opts.override ?? 'auto';

  const km =
    opts.home && opts.current ? Math.round(distanceKm(opts.home, opts.current) * 10) / 10 : null;
  const qualifies = km != null && km >= thresholdKm;

  if (override === 'on') {
    return { distanceKm: km, thresholdKm, qualifies, travelling: true, reason: 'manual-on' };
  }
  if (override === 'off') {
    return { distanceKm: km, thresholdKm, qualifies, travelling: false, reason: 'manual-off' };
  }
  if (km == null) {
    return { distanceKm: null, thresholdKm, qualifies: false, travelling: false, reason: 'no-home' };
  }
  return { distanceKm: km, thresholdKm, qualifies, travelling: qualifies, reason: 'distance' };
}

/** A short, human summary of the state. */
export function statusLabel(status: TravelStatus): string {
  switch (status.reason) {
    case 'no-home':
      return 'Set your home to detect travel';
    case 'manual-on':
      return 'Travel mode on — set manually';
    case 'manual-off':
      return 'Travel mode off — set manually';
    default:
      return status.travelling
        ? `${status.distanceKm} km from home — you are a traveller`
        : `${status.distanceKm} km from home — resident`;
  }
}

/** Map the app's PrayerName onto the obligatory set (sunrise is not a prayer). */
export function toObligatory(name: PrayerName): ObligatoryPrayer | null {
  return name === 'sunrise' ? null : (name as ObligatoryPrayer);
}

export type { JoinKind };
