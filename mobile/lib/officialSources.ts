/**
 * Official sources — the authority & trust layer.
 *
 * A billion Muslims trust their local mosque or national body, not a math
 * library. The recognised authority in each country (Saudi → Umm al-Qura,
 * Türkiye → Diyanet, Egypt → Dar al-Iftāʾ, Indonesia → Kemenag, …) publishes
 * times that differ from a raw calculation by a minute or few, because of the
 * angles, Isha conventions and committee buffers they adopt.
 *
 * This registry encodes each authority as a precise parameter set on top of the
 * `adhan` engine: the calculation method (or custom twilight angles / Isha
 * interval) plus any standard minute offsets. We auto-select the right source
 * from the user's country and always let them override it. Everything stays
 * fully offline.
 */
import {
  DEFAULT_SETTINGS,
  type CalculationMethodKey,
  type HighLatitudeRuleKey,
  type MadhabKey,
  type PrayerName,
  type PrayerSettings,
} from './prayerTimes';

export type OfficialSourceId =
  | 'MuslimWorldLeague'
  | 'UmmAlQura'
  | 'Egyptian'
  | 'Karachi'
  | 'ISNA'
  | 'Dubai'
  | 'Kuwait'
  | 'Qatar'
  | 'MUIS'
  | 'Tehran'
  | 'Diyanet'
  | 'Kemenag'
  | 'JAKIM'
  | 'Habous'
  | 'Moonsighting';

export type OfficialSource = {
  id: OfficialSourceId;
  /** Short name shown in the UI, e.g. "Umm al-Qura". */
  label: string;
  /** The recognised authority behind it. */
  authority: string;
  /** Region/country this body governs. */
  region: string;
  /** The base `adhan` method this maps to. */
  method: CalculationMethodKey;
  /** Default Asr school for this region (user can still override). */
  madhab?: MadhabKey;
  /** Custom Fajr twilight angle when the body doesn't match a built-in method. */
  fajrAngle?: number;
  /** Custom Isha twilight angle. */
  ishaAngle?: number;
  /** Fixed minutes after Maghrib for Isha (Umm al-Qura: 90 / Ramadan 120). */
  ishaInterval?: number;
  /** Standard committee minute offsets the authority is known to apply. */
  methodAdjustments?: Partial<Record<PrayerName, number>>;
};

/**
 * The registry. Angles/intervals reflect each authority's published convention;
 * built-in `adhan` methods already encode the well-known ones precisely.
 */
export const OFFICIAL_SOURCES: Record<OfficialSourceId, OfficialSource> = {
  UmmAlQura: {
    id: 'UmmAlQura',
    label: 'Umm al-Qura',
    authority: 'Umm al-Qura University',
    region: 'Saudi Arabia',
    method: 'UmmAlQura',
  },
  Diyanet: {
    id: 'Diyanet',
    label: 'Diyanet',
    authority: 'Presidency of Religious Affairs',
    region: 'Türkiye',
    method: 'Turkey',
  },
  Egyptian: {
    id: 'Egyptian',
    label: 'Dar al-Iftāʾ',
    authority: 'Egyptian General Authority of Survey',
    region: 'Egypt',
    method: 'Egyptian',
  },
  Karachi: {
    id: 'Karachi',
    label: 'Karachi',
    authority: 'University of Islamic Sciences, Karachi',
    region: 'Pakistan · India · Bangladesh',
    method: 'Karachi',
  },
  ISNA: {
    id: 'ISNA',
    label: 'ISNA',
    authority: 'Islamic Society of North America',
    region: 'North America',
    method: 'NorthAmerica',
  },
  Dubai: {
    id: 'Dubai',
    label: 'UAE · Awqaf',
    authority: 'General Authority of Islamic Affairs & Endowments',
    region: 'United Arab Emirates',
    method: 'Dubai',
  },
  Kuwait: {
    id: 'Kuwait',
    label: 'Kuwait',
    authority: 'Ministry of Awqaf, Kuwait',
    region: 'Kuwait',
    method: 'Kuwait',
  },
  Qatar: {
    id: 'Qatar',
    label: 'Qatar',
    authority: 'Qatar Calendar House',
    region: 'Qatar',
    method: 'Qatar',
  },
  MUIS: {
    id: 'MUIS',
    label: 'MUIS',
    authority: 'Islamic Religious Council of Singapore',
    region: 'Singapore',
    method: 'Singapore',
  },
  Tehran: {
    id: 'Tehran',
    label: 'Tehran',
    authority: 'Institute of Geophysics, University of Tehran',
    region: 'Iran',
    method: 'Tehran',
  },
  Kemenag: {
    id: 'Kemenag',
    label: 'Kemenag',
    authority: 'Ministry of Religious Affairs',
    region: 'Indonesia',
    // Indonesia's BHR uses Fajr 20° / Isha 18°, not a built-in method.
    method: 'Other',
    fajrAngle: 20,
    ishaAngle: 18,
  },
  JAKIM: {
    id: 'JAKIM',
    label: 'JAKIM',
    authority: 'Department of Islamic Development Malaysia',
    region: 'Malaysia · Brunei',
    method: 'Other',
    fajrAngle: 20,
    ishaAngle: 18,
  },
  Habous: {
    id: 'Habous',
    label: 'Habous',
    authority: 'Ministry of Habous and Islamic Affairs',
    region: 'Morocco',
    method: 'Other',
    fajrAngle: 19,
    ishaAngle: 17,
  },
  Moonsighting: {
    id: 'Moonsighting',
    label: 'Moonsighting Committee',
    authority: 'Moonsighting Committee Worldwide',
    region: 'Global (seasonal twilight)',
    method: 'Other',
    fajrAngle: 18,
    ishaAngle: 18,
  },
  MuslimWorldLeague: {
    id: 'MuslimWorldLeague',
    label: 'Muslim World League',
    authority: 'Muslim World League',
    region: 'Global default',
    method: 'MuslimWorldLeague',
  },
};

/** A sensible, region-aware ordering for the picker. */
export const SOURCE_ORDER: OfficialSourceId[] = [
  'UmmAlQura',
  'Diyanet',
  'Egyptian',
  'Karachi',
  'ISNA',
  'Dubai',
  'Kuwait',
  'Qatar',
  'MUIS',
  'JAKIM',
  'Kemenag',
  'Tehran',
  'Habous',
  'Moonsighting',
  'MuslimWorldLeague',
];

/** ISO 3166-1 alpha-2 country → its recognised authority. */
const COUNTRY_DEFAULT: Record<string, OfficialSourceId> = {
  SA: 'UmmAlQura',
  TR: 'Diyanet',
  EG: 'Egyptian',
  PK: 'Karachi',
  IN: 'Karachi',
  BD: 'Karachi',
  AF: 'Karachi',
  US: 'ISNA',
  CA: 'ISNA',
  AE: 'Dubai',
  KW: 'Kuwait',
  QA: 'Qatar',
  SG: 'MUIS',
  ID: 'Kemenag',
  MY: 'JAKIM',
  BN: 'JAKIM',
  IR: 'Tehran',
  MA: 'Habous',
  DZ: 'Habous',
  TN: 'Habous',
  GB: 'Moonsighting',
  FR: 'Moonsighting',
  DE: 'Moonsighting',
};

/**
 * Pick the recognised authority for a country code, defaulting to the Muslim
 * World League when we don't know the region (the safest global convention).
 */
export function resolveOfficialSource(countryCode?: string): OfficialSource {
  const code = countryCode?.toUpperCase();
  const id = (code && COUNTRY_DEFAULT[code]) || 'MuslimWorldLeague';
  return OFFICIAL_SOURCES[id];
}

/**
 * Fold an official source plus the user's personal choices (Asr school,
 * high-latitude rule, elevation) into a complete settings object for the engine.
 */
export function settingsForSource(
  source: OfficialSource,
  prefs: {
    madhab?: MadhabKey;
    highLatitudeRule?: HighLatitudeRuleKey;
    elevation?: number;
    adjustments?: Partial<Record<PrayerName, number>>;
  } = {},
): PrayerSettings {
  return {
    method: source.method,
    madhab: prefs.madhab ?? source.madhab ?? DEFAULT_SETTINGS.madhab,
    highLatitudeRule: prefs.highLatitudeRule ?? DEFAULT_SETTINGS.highLatitudeRule,
    fajrAngle: source.fajrAngle,
    ishaAngle: source.ishaAngle,
    ishaInterval: source.ishaInterval,
    methodAdjustments: source.methodAdjustments,
    elevation: prefs.elevation,
    adjustments: prefs.adjustments,
  };
}
