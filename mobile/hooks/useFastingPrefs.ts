/**
 * useFastingPrefs — the user's fasting & Ramadan preferences, persisted.
 *
 * The Imsāk buffer and reminder lead times that shape every countdown, the
 * reminder toggles, comfort switches (Arabic, haptics), the fidyah rate, and a
 * dev-only "preview Ramadan" switch so the full hub can be seen off-season.
 * Sensible defaults mean a fresh user never has to open settings.
 */
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';

const PREFS_KEY = 'adl.fastingPrefs.v1';

export type FastingReminderToggles = {
  suhur: boolean;
  imsak: boolean;
  iftar: boolean;
  taraweeh: boolean;
  qadr: boolean;
  voluntary: boolean;
};

export type FastingPrefs = {
  /** Cautious buffer before Fajr to stop eating (minutes). */
  imsakMinutes: number;
  /** How long before Suhūr ends to nudge the early riser (minutes). */
  suhurLeadMinutes: number;
  /** Master switch for all scheduled fasting reminders. */
  remindersOn: boolean;
  reminders: FastingReminderToggles;
  /** Show Arabic alongside labels and duʿās. */
  showArabic: boolean;
  /** Soft haptic when logging a fast. */
  haptics: boolean;
  /** Cost to feed one needy person for a day (fidyah unit). */
  fidyahPerDay: number;
  /** Currency symbol shown beside fidyah / kaffārah figures. */
  fidyahCurrency: string;
  /** DEV only: force the Ramadan view (and which day) for previewing. */
  previewRamadan: boolean;
  previewDay: number;
};

export const DEFAULT_FASTING_PREFS: FastingPrefs = {
  imsakMinutes: 10,
  suhurLeadMinutes: 45,
  remindersOn: true,
  reminders: {
    suhur: true,
    imsak: true,
    iftar: true,
    taraweeh: true,
    qadr: true,
    voluntary: false,
  },
  showArabic: true,
  haptics: true,
  fidyahPerDay: 5,
  fidyahCurrency: '$',
  previewRamadan: false,
  previewDay: 1,
};

export const IMSAK_OPTIONS = [0, 5, 10, 15, 20];
export const SUHUR_LEAD_OPTIONS = [15, 30, 45, 60, 90];
export const CURRENCY_OPTIONS = ['$', '£', '€', '₹', 'RM', 'AED'];

export type UseFastingPrefs = {
  prefs: FastingPrefs;
  ready: boolean;
  setPref: <K extends keyof FastingPrefs>(key: K, value: FastingPrefs[K]) => void;
  setReminder: (key: keyof FastingReminderToggles, value: boolean) => void;
  reset: () => void;
};

export default function useFastingPrefs(): UseFastingPrefs {
  const [prefs, setPrefs] = useState<FastingPrefs>(DEFAULT_FASTING_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFS_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<FastingPrefs>;
          setPrefs({
            ...DEFAULT_FASTING_PREFS,
            ...parsed,
            reminders: { ...DEFAULT_FASTING_PREFS.reminders, ...(parsed.reminders ?? {}) },
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
    <K extends keyof FastingPrefs>(key: K, value: FastingPrefs[K]) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  const setReminder = useCallback((key: keyof FastingReminderToggles, value: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, reminders: { ...prev.reminders, [key]: value } };
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setPrefs(DEFAULT_FASTING_PREFS);
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify(DEFAULT_FASTING_PREFS)).catch(() => {});
  }, []);

  return { prefs, ready, setPref, setReminder, reset };
}
