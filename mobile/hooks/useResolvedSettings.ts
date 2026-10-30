/**
 * useResolvedSettings — the single source of truth for the calculation settings
 * actually in effect: the user's chosen (or auto-detected) authority overlaid
 * with madhab, high-latitude rule, elevation, and per-prayer adjustments.
 *
 * Mirrors the resolution in PrayerScreen so secondary screens (Sunnah, Calendar)
 * compute against exactly the same times the user sees on the prayer schedule.
 */
import { useMemo } from 'react';
import useLocation from './useLocation';
import usePrayerPrefs from './usePrayerPrefs';
import {
  OFFICIAL_SOURCES,
  resolveOfficialSource,
  settingsForSource,
} from '../lib/officialSources';
import type { PrayerSettings } from '../lib/prayerTimes';
import type { ResolvedLocation } from '../lib/location';

export type ResolvedSettings = {
  location: ResolvedLocation;
  timeZone: string;
  settings: PrayerSettings;
  sourceLabel: string;
};

export default function useResolvedSettings(): ResolvedSettings {
  const { location } = useLocation();
  const { prefs } = usePrayerPrefs();

  const autoSource = useMemo(
    () => resolveOfficialSource(location.countryCode),
    [location.countryCode],
  );
  const activeSource = useMemo(
    () => (prefs.sourceId === 'auto' ? autoSource : OFFICIAL_SOURCES[prefs.sourceId]),
    [prefs.sourceId, autoSource],
  );

  const settings = useMemo(
    () =>
      settingsForSource(activeSource, {
        madhab: prefs.madhab === 'auto' ? undefined : prefs.madhab,
        highLatitudeRule: prefs.highLatitudeRule,
        elevation: prefs.useElevation ? location.elevation : undefined,
        adjustments: prefs.adjustments,
      }),
    [
      activeSource,
      prefs.madhab,
      prefs.highLatitudeRule,
      prefs.useElevation,
      prefs.adjustments,
      location.elevation,
    ],
  );

  return {
    location,
    timeZone: location.timeZone,
    settings,
    sourceLabel: activeSource.label,
  };
}
