/**
 * Prayer Times — the core engine.
 *
 * A thin, strongly-typed wrapper around `adhan` (Batoul Apps). Given a
 * location, a date, and the user's chosen conventions, it deterministically
 * computes the five daily prayers plus sunrise — fully offline, no network.
 *
 * This file is ONLY the engine: pure calculation, no UI, no location lookup,
 * no notifications. Those are layered on top separately.
 */
import {
  CalculationMethod,
  Coordinates,
  Madhab,
  HighLatitudeRule,
  PolarCircleResolution,
  PrayerTimes,
  Qibla,
  SunnahTimes,
} from 'adhan';

/** A geographic point. Elevation is reserved for future precision work. */
export type LatLng = {
  latitude: number;
  longitude: number;
};

/** The Fajr/Isha sun-angle conventions, keyed for the UI. */
export type CalculationMethodKey =
  | 'MuslimWorldLeague'
  | 'UmmAlQura'
  | 'Egyptian'
  | 'Karachi'
  | 'NorthAmerica'
  | 'Dubai'
  | 'Kuwait'
  | 'Qatar'
  | 'Singapore'
  | 'Tehran'
  | 'Turkey'
  | 'Other';

/** Asr school: Standard (Shafi'i/Maliki/Hanbali) or Hanafi (later Asr). */
export type MadhabKey = 'Standard' | 'Hanafi';

/** Rule for places where the sun barely sets at high latitudes. */
export type HighLatitudeRuleKey =
  | 'MiddleOfTheNight'
  | 'SeventhOfTheNight'
  | 'TwilightAngle';

/** Everything that influences the computed times, all user-selectable. */
export type PrayerSettings = {
  method: CalculationMethodKey;
  madhab: MadhabKey;
  highLatitudeRule: HighLatitudeRuleKey;
  /** Override the Fajr twilight angle (degrees) for a specific authority. */
  fajrAngle?: number;
  /** Override the Isha twilight angle (degrees) for a specific authority. */
  ishaAngle?: number;
  /** Fixed minutes after Maghrib for Isha (used by Umm al-Qura, Gulf). */
  ishaInterval?: number;
  /** Committee/authority per-prayer minute offsets (the "official" overlay). */
  methodAdjustments?: Partial<Record<PrayerName, number>>;
  /** Per-prayer minute nudges (e.g. a local mosque buffer). */
  adjustments?: Partial<Record<PrayerName, number>>;
  /** Observer elevation in metres — shifts sunrise/Maghrib via horizon dip. */
  elevation?: number;
  /**
   * How to resolve days inside the polar circle, where the sun may never rise
   * or set. Defaults to the nearest valid latitude so times never break.
   */
  polarCircleResolution?: PolarCircleResolutionKey;
};

/** Strategy for polar day/night, where there is no real sunrise or sunset. */
export type PolarCircleResolutionKey = 'AqrabBalad' | 'AqrabYaum' | 'Unresolved';

export type PrayerName =
  | 'fajr'
  | 'sunrise'
  | 'dhuhr'
  | 'asr'
  | 'maghrib'
  | 'isha';

/** One computed day of times. */
export type DayPrayerTimes = {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
};

export const DEFAULT_SETTINGS: PrayerSettings = {
  method: 'MuslimWorldLeague',
  madhab: 'Standard',
  highLatitudeRule: 'MiddleOfTheNight',
};

const METHOD_FACTORIES: Record<CalculationMethodKey, () => ReturnType<typeof CalculationMethod.MuslimWorldLeague>> = {
  MuslimWorldLeague: CalculationMethod.MuslimWorldLeague,
  UmmAlQura: CalculationMethod.UmmAlQura,
  Egyptian: CalculationMethod.Egyptian,
  Karachi: CalculationMethod.Karachi,
  NorthAmerica: CalculationMethod.NorthAmerica,
  Dubai: CalculationMethod.Dubai,
  Kuwait: CalculationMethod.Kuwait,
  Qatar: CalculationMethod.Qatar,
  Singapore: CalculationMethod.Singapore,
  Tehran: CalculationMethod.Tehran,
  Turkey: CalculationMethod.Turkey,
  Other: CalculationMethod.Other,
};

const MADHAB: Record<MadhabKey, (typeof Madhab)[keyof typeof Madhab]> = {
  Standard: Madhab.Shafi,
  Hanafi: Madhab.Hanafi,
};

const HIGH_LAT: Record<HighLatitudeRuleKey, (typeof HighLatitudeRule)[keyof typeof HighLatitudeRule]> = {
  MiddleOfTheNight: HighLatitudeRule.MiddleOfTheNight,
  SeventhOfTheNight: HighLatitudeRule.SeventhOfTheNight,
  TwilightAngle: HighLatitudeRule.TwilightAngle,
};

const POLAR: Record<PolarCircleResolutionKey, (typeof PolarCircleResolution)[keyof typeof PolarCircleResolution]> = {
  AqrabBalad: PolarCircleResolution.AqrabBalad,
  AqrabYaum: PolarCircleResolution.AqrabYaum,
  Unresolved: PolarCircleResolution.Unresolved,
};

/**
 * Elevation correction (the mountains problem).
 *
 * A higher observer sees the sun for longer: sunrise comes earlier and sunset
 * (Maghrib) later. The geometric horizon dip is δ ≈ 0.0347·√h degrees (h in
 * metres, refraction-inclusive). Near the horizon the sun descends about 1° per
 * 4 minutes, slowed toward the poles by 1/cos(latitude). Twilight prayers
 * (Fajr/Isha) are defined by sun-angle, not the visible horizon, so they are
 * left untouched — only sunrise and Maghrib shift.
 */
function elevationAdjustmentMinutes(elevation: number, latitude: number): number {
  if (!elevation || elevation <= 0) return 0;
  const dipDeg = 0.0347 * Math.sqrt(elevation);
  const latRad = (latitude * Math.PI) / 180;
  const minutes = (dipDeg * 4) / Math.max(Math.cos(latRad), 0.2);
  // Keep it sane; even very high peaks stay within a few minutes.
  return Math.min(Math.round(minutes), 8);
}

/** Public helper: how many minutes elevation shifts sunrise/Maghrib (for UI). */
export function elevationShiftMinutes(elevation: number, latitude: number): number {
  return elevationAdjustmentMinutes(elevation, latitude);
}

function mergeAdjustments(
  base: Partial<Record<PrayerName, number>> | undefined,
  extra: Partial<Record<PrayerName, number>>,
): Record<PrayerName, number> {
  return {
    fajr: (base?.fajr ?? 0) + (extra.fajr ?? 0),
    sunrise: (base?.sunrise ?? 0) + (extra.sunrise ?? 0),
    dhuhr: (base?.dhuhr ?? 0) + (extra.dhuhr ?? 0),
    asr: (base?.asr ?? 0) + (extra.asr ?? 0),
    maghrib: (base?.maghrib ?? 0) + (extra.maghrib ?? 0),
    isha: (base?.isha ?? 0) + (extra.isha ?? 0),
  };
}

/** Build the `adhan` calculation parameters from the user's settings. */
function buildParams(settings: PrayerSettings, latitude: number) {
  const params = METHOD_FACTORIES[settings.method]();
  params.madhab = MADHAB[settings.madhab];
  params.highLatitudeRule = HIGH_LAT[settings.highLatitudeRule];
  // Never let polar day/night produce NaN times — fall back to nearest latitude.
  params.polarCircleResolution = POLAR[settings.polarCircleResolution ?? 'AqrabBalad'];

  // Authority-specific twilight angles / Isha interval (the official overlay).
  if (typeof settings.fajrAngle === 'number') params.fajrAngle = settings.fajrAngle;
  if (typeof settings.ishaAngle === 'number') params.ishaAngle = settings.ishaAngle;
  if (typeof settings.ishaInterval === 'number') params.ishaInterval = settings.ishaInterval;

  // Committee minute offsets baked into the recognised source.
  if (settings.methodAdjustments) {
    params.methodAdjustments = mergeAdjustments(
      params.methodAdjustments,
      settings.methodAdjustments,
    );
  }

  // User nudges + elevation horizon correction (sunrise earlier, Maghrib later).
  const elev = elevationAdjustmentMinutes(settings.elevation ?? 0, latitude);
  const elevAdj = elev ? { sunrise: -elev, maghrib: elev } : {};
  if (settings.adjustments || elev) {
    params.adjustments = mergeAdjustments(settings.adjustments, elevAdj);
  }

  return params;
}

/** Low-level: get the raw `adhan` PrayerTimes object for a location + day. */
export function getRawPrayerTimes(
  location: LatLng,
  date: Date,
  settings: PrayerSettings = DEFAULT_SETTINGS,
): PrayerTimes {
  const coordinates = new Coordinates(location.latitude, location.longitude);
  return new PrayerTimes(coordinates, date, buildParams(settings, location.latitude));
}

/** The five prayers + sunrise for a given location and day. */
export function getPrayerTimes(
  location: LatLng,
  date: Date = new Date(),
  settings: PrayerSettings = DEFAULT_SETTINGS,
): DayPrayerTimes {
  const t = getRawPrayerTimes(location, date, settings);
  return {
    fajr: t.fajr,
    sunrise: t.sunrise,
    dhuhr: t.dhuhr,
    asr: t.asr,
    maghrib: t.maghrib,
    isha: t.isha,
  };
}

/** The currently active prayer at `date`, or null before Fajr. */
export function getCurrentPrayer(
  location: LatLng,
  date: Date = new Date(),
  settings: PrayerSettings = DEFAULT_SETTINGS,
): PrayerName | null {
  const t = getRawPrayerTimes(location, date, settings);
  const current = t.currentPrayer(date);
  return current === 'none' ? null : (current as PrayerName);
}

/** The next upcoming prayer at `date`, or null after Isha. */
export function getNextPrayer(
  location: LatLng,
  date: Date = new Date(),
  settings: PrayerSettings = DEFAULT_SETTINGS,
): { name: PrayerName; time: Date } | null {
  const t = getRawPrayerTimes(location, date, settings);
  const next = t.nextPrayer(date);
  if (next === 'none') return null;
  return { name: next as PrayerName, time: t.timeForPrayer(next) as Date };
}

/** Sunnah reference points (last third of the night, etc.) for a location. */
export function getSunnahTimes(
  location: LatLng,
  date: Date = new Date(),
  settings: PrayerSettings = DEFAULT_SETTINGS,
): SunnahTimes {
  return new SunnahTimes(getRawPrayerTimes(location, date, settings));
}

/** Compass bearing (degrees from true north) toward the Qibla in Makkah. */
export function getQiblaDirection(location: LatLng): number {
  return Qibla(new Coordinates(location.latitude, location.longitude));
}
