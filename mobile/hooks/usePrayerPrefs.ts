/**
 * usePrayerPrefs — the user's calculation choices, persisted.
 *
 * These sit on top of the auto-detected official source and location:
 *   • which authority to trust (or "Automatic" by country)
 *   • Asr school (or follow the authority's default)
 *   • the high-latitude rule (a genuine choice communities disagree on)
 *   • whether to apply the elevation/horizon correction
 *
 * Sensible defaults mean a fresh user never has to touch any of this.
 */
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HighLatitudeRuleKey, MadhabKey, PrayerName } from '../lib/prayerTimes';
import type { OfficialSourceId } from '../lib/officialSources';

const PREFS_KEY = 'adl.prayerPrefs.v1';

export type PrayerPrefs = {
  /** 'auto' follows the country; otherwise a pinned authority. */
  sourceId: OfficialSourceId | 'auto';
  /** 'auto' follows the authority's regional default. */
  madhab: MadhabKey | 'auto';
  highLatitudeRule: HighLatitudeRuleKey;
  /** Apply the elevation (mountains) horizon correction. */
  useElevation: boolean;
  /** Manual per-prayer minute nudges (a local mosque's buffer). */
  adjustments: Partial<Record<PrayerName, number>>;
};

export const DEFAULT_PREFS: PrayerPrefs = {
  sourceId: 'auto',
  madhab: 'auto',
  highLatitudeRule: 'MiddleOfTheNight',
  useElevation: true,
  adjustments: {},
};

export type UsePrayerPrefs = {
  prefs: PrayerPrefs;
  ready: boolean;
  setPref: <K extends keyof PrayerPrefs>(key: K, value: PrayerPrefs[K]) => void;
  /** Nudge a single prayer by an absolute minute offset (clamped). */
  setAdjustment: (prayer: PrayerName, minutes: number) => void;
  /** Clear every manual offset back to zero. */
  resetAdjustments: () => void;
};

export default function usePrayerPrefs(): UsePrayerPrefs {
  const [prefs, setPrefs] = useState<PrayerPrefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFS_KEY);
        if (alive && raw) {
          setPrefs({ ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<PrayerPrefs>) });
        }
      } catch {
        // Fall back to defaults.
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setPref = useCallback(
    <K extends keyof PrayerPrefs>(key: K, value: PrayerPrefs[K]) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  const setAdjustment = useCallback((prayer: PrayerName, minutes: number) => {
    const clamped = Math.max(-60, Math.min(60, Math.round(minutes)));
    setPrefs((prev) => {
      const adjustments = { ...prev.adjustments };
      if (clamped === 0) delete adjustments[prayer];
      else adjustments[prayer] = clamped;
      const next = { ...prev, adjustments };
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const resetAdjustments = useCallback(() => {
    setPrefs((prev) => {
      const next = { ...prev, adjustments: {} };
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return { prefs, ready, setPref, setAdjustment, resetAdjustments };
}
