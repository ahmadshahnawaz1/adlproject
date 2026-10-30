/**
 * usePilgrimagePrefs — the pilgrim's comfort and study preferences, persisted.
 *
 * Whether to show Arabic, the soft haptics on each tap, the cinematic tilt
 * parallax (the "4D" depth — off by default for reduce-motion users), the
 * school of law whose notes to emphasise, the pilgrim's gender (for the
 * gender-specific rulings of iḥrām, raml and ḥalq), the reminder toggles for
 * the blessed ten and ʿArafah, and a dev-only preview of the Ḥajj days so the
 * whole hub can be seen off-season.
 */
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';
import type { Gender, Madhhab } from '../content/pilgrimage';

const PREFS_KEY = 'adl.pilgrimagePrefs.v1';

/** The madhhab whose notes are emphasised, or 'all' to show every school. */
export type MadhhabPref = Madhhab | 'all';

export type PilgrimageReminderToggles = {
  /** A nudge as the blessed ten of Dhū al-Ḥijjah begin. */
  dhulHijjah: boolean;
  /** A reminder on the eve of ʿArafah (its great fast and duʿā). */
  arafah: boolean;
  /** A countdown reminder as the Ḥajj season approaches. */
  hajj: boolean;
};

export type PilgrimagePrefs = {
  /** Show Arabic alongside labels and duʿās. */
  showArabic: boolean;
  /** Soft haptic on taps and ritual counts. */
  haptics: boolean;
  /** Cinematic device-tilt parallax on the scenes (the "4D" depth). */
  tiltParallax: boolean;
  /** Which school's notes to emphasise. */
  madhhab: MadhhabPref;
  /** The pilgrim's gender, for gender-specific rulings. */
  gender: Gender;
  /** Master switch for all scheduled pilgrimage reminders. */
  remindersOn: boolean;
  reminders: PilgrimageReminderToggles;
  /** DEV only: force the Ḥajj-season view (and which day) for previewing. */
  previewHajj: boolean;
  previewHijriDay: number;
};

export const DEFAULT_PILGRIMAGE_PREFS: PilgrimagePrefs = {
  showArabic: true,
  haptics: true,
  tiltParallax: true,
  madhhab: 'all',
  gender: 'male',
  remindersOn: true,
  reminders: {
    dhulHijjah: true,
    arafah: true,
    hajj: false,
  },
  previewHajj: false,
  previewHijriDay: 9,
};

export const MADHHAB_OPTIONS: { value: MadhhabPref; label: string }[] = [
  { value: 'all', label: 'All schools' },
  { value: 'hanafi', label: 'Ḥanafī' },
  { value: 'maliki', label: 'Mālikī' },
  { value: 'shafii', label: 'Shāfiʿī' },
  { value: 'hanbali', label: 'Ḥanbalī' },
];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

/** The Ḥajj days offered by the dev preview switch. */
export const PREVIEW_HAJJ_DAYS = [8, 9, 10, 11, 12, 13];

export type UsePilgrimagePrefs = {
  prefs: PilgrimagePrefs;
  ready: boolean;
  setPref: <K extends keyof PilgrimagePrefs>(key: K, value: PilgrimagePrefs[K]) => void;
  setReminder: (key: keyof PilgrimageReminderToggles, value: boolean) => void;
  reset: () => void;
};

export default function usePilgrimagePrefs(): UsePilgrimagePrefs {
  const [prefs, setPrefs] = useState<PilgrimagePrefs>(DEFAULT_PILGRIMAGE_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFS_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<PilgrimagePrefs>;
          setPrefs({
            ...DEFAULT_PILGRIMAGE_PREFS,
            ...parsed,
            reminders: { ...DEFAULT_PILGRIMAGE_PREFS.reminders, ...(parsed.reminders ?? {}) },
          });
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
    <K extends keyof PilgrimagePrefs>(key: K, value: PilgrimagePrefs[K]) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  const setReminder = useCallback((key: keyof PilgrimageReminderToggles, value: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, reminders: { ...prev.reminders, [key]: value } };
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setPrefs(DEFAULT_PILGRIMAGE_PREFS);
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify(DEFAULT_PILGRIMAGE_PREFS)).catch(() => {});
  }, []);

  return { prefs, ready, setPref, setReminder, reset };
}
