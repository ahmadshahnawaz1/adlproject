/**
 * useNotificationPrefs — the user's adhan alert choices, persisted.
 *
 * Independent from the calculation prefs: a person can fine-tune *how* they are
 * called (silent / vibrate / chime / full adhan, which voice, an optional
 * heads-up, and which prayers) without touching *how the times are computed*.
 *
 * Defaults are deliberately gentle: notifications are OFF until the user opts
 * in (so we never buzz someone who never asked), but every prayer except
 * sunrise is pre-selected and the full adhan is the default voice — so opting
 * in is a single tap to a beautiful experience.
 */
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PrayerName } from '../lib/prayerTimes';
import {
  DEFAULT_VOICE_ID,
  type AlertMode,
  type PrayerNotifyConfig,
} from '../lib/notifications';

const PREFS_KEY = 'adl.notifyPrefs.v1';

export type NotificationPrefs = {
  /** Master switch. Nothing is scheduled while this is off. */
  enabled: boolean;
  /** How every call is delivered. */
  mode: AlertMode;
  /** Which muezzin plays for the full adhan. */
  voiceId: string;
  /** Optional heads-up minutes before each prayer (0 = off). */
  reminderMinutes: number;
  /** Per-prayer opt-in. */
  prayers: Record<PrayerName, boolean>;
  /** A gentle end-of-day nudge to log/make up any missed prayers. */
  qazaReminder: boolean;
  /** Hour of day (0–23) the qaza nudge fires. */
  qazaReminderHour: number;
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  enabled: false,
  mode: 'adhan',
  voiceId: DEFAULT_VOICE_ID,
  reminderMinutes: 0,
  prayers: {
    fajr: true,
    sunrise: false,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  qazaReminder: false,
  qazaReminderHour: 21,
};

export type UseNotificationPrefs = {
  prefs: NotificationPrefs;
  ready: boolean;
  setPref: <K extends keyof NotificationPrefs>(key: K, value: NotificationPrefs[K]) => void;
  togglePrayer: (prayer: PrayerName) => void;
  /** The slice the scheduler consumes. */
  toConfig: (prefs: NotificationPrefs) => PrayerNotifyConfig;
};

function toConfig(prefs: NotificationPrefs): PrayerNotifyConfig {
  return {
    enabled: prefs.prayers,
    mode: prefs.mode,
    voiceId: prefs.voiceId,
    reminderMinutes: prefs.reminderMinutes,
  };
}

export default function useNotificationPrefs(): UseNotificationPrefs {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFS_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
          setPrefs({
            ...DEFAULT_NOTIFICATION_PREFS,
            ...parsed,
            prayers: { ...DEFAULT_NOTIFICATION_PREFS.prayers, ...(parsed.prayers ?? {}) },
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

  const persist = useCallback((next: NotificationPrefs) => {
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setPref = useCallback(
    <K extends keyof NotificationPrefs>(key: K, value: NotificationPrefs[K]) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const togglePrayer = useCallback(
    (prayer: PrayerName) => {
      setPrefs((prev) => {
        const next = {
          ...prev,
          prayers: { ...prev.prayers, [prayer]: !prev.prayers[prayer] },
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  return { prefs, ready, setPref, togglePrayer, toConfig };
}
