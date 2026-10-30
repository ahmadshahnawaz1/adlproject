/**
 * useTahajjud — tonight's night window, a live countdown, and the wake reminder.
 *
 * It resolves the user's location and calculation settings, picks the correct
 * Maghrib → Fajr pair around "now" (before today's Fajr you are still in last
 * night's window; afterwards you look ahead to tonight), and computes the night
 * geometry via lib/nightPrayer. A one-second tick drives the countdown. Reminder
 * preferences persist under 'adl.tahajjud.v1', and when enabled a clean set of
 * wake reminders is scheduled a few nights ahead. The maths is pure; this hook
 * owns the clock, the stored prefs and the notification scheduling.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useResolvedSettings from './useResolvedSettings';
import { getPrayerTimes, type LatLng, type PrayerSettings } from '../lib/prayerTimes';
import {
  computeNightWindow,
  nightCountdown,
  reminderTimeFor,
  type NightCountdown,
  type NightWindow,
  type ReminderMode,
} from '../lib/nightPrayer';
import {
  cancelTahajjudReminder,
  scheduleTahajjudReminder,
} from '../lib/notifications';
import { dayKey } from '../lib/streak';

const STORE_KEY = 'adl.tahajjud.v1';

/** How many nights ahead to queue wake reminders. */
const SCHEDULE_NIGHTS = 3;

export const MIN_BEFORE_FAJR = 5;
export const MAX_BEFORE_FAJR = 120;
export const BEFORE_FAJR_STEP = 5;

export type TahajjudPrefs = {
  reminderEnabled: boolean;
  mode: ReminderMode;
  beforeFajrMinutes: number;
};

const DEFAULT_PREFS: TahajjudPrefs = {
  reminderEnabled: false,
  mode: 'lastThirdStart',
  beforeFajrMinutes: 30,
};

export function clampBeforeFajr(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_PREFS.beforeFajrMinutes;
  return Math.max(MIN_BEFORE_FAJR, Math.min(MAX_BEFORE_FAJR, Math.round(n)));
}

export type UseTahajjud = {
  ready: boolean;
  now: Date;
  window: NightWindow;
  countdown: NightCountdown;
  timeZone: string;
  prefs: TahajjudPrefs;
  setReminderEnabled: (on: boolean) => void;
  setMode: (mode: ReminderMode) => void;
  setBeforeFajrMinutes: (minutes: number) => void;
};

/** The Maghrib → Fajr window in effect around `now`. */
function windowAround(now: Date, coords: LatLng, settings: PrayerSettings): NightWindow {
  const today = getPrayerTimes(coords, now, settings);
  if (now.getTime() < today.fajr.getTime()) {
    // Still inside last night's window (after Maghrib yesterday, before Fajr today).
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const maghrib = getPrayerTimes(coords, yesterday, settings).maghrib;
    return computeNightWindow(maghrib, today.fajr);
  }
  // The night ahead: tonight's Maghrib → tomorrow's Fajr.
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fajr = getPrayerTimes(coords, tomorrow, settings).fajr;
  return computeNightWindow(today.maghrib, fajr);
}

/** The forward-looking night windows for scheduling (tonight onward). */
function upcomingWindows(
  base: Date,
  coords: LatLng,
  settings: PrayerSettings,
  nights: number,
): NightWindow[] {
  const out: NightWindow[] = [];
  for (let d = 0; d < nights; d += 1) {
    const day = new Date(base);
    day.setDate(day.getDate() + d);
    const maghrib = getPrayerTimes(coords, day, settings).maghrib;
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const fajr = getPrayerTimes(coords, next, settings).fajr;
    out.push(computeNightWindow(maghrib, fajr));
  }
  return out;
}

/**
 * The live night window + countdown, with no persistence or scheduling — light
 * enough for a glanceable card (e.g. on the home dashboard).
 */
export function useTahajjudWindow(): {
  now: Date;
  window: NightWindow;
  countdown: NightCountdown;
  coords: LatLng;
  settings: PrayerSettings;
  timeZone: string;
} {
  const { location, settings, timeZone } = useResolvedSettings();
  const coords = location.coords;

  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Recompute the window at most once per minute (cheap pure maths).
  const minuteBucket = Math.floor(now.getTime() / 60000);
  const window = useMemo(
    () => windowAround(new Date(minuteBucket * 60000), coords, settings),
    [minuteBucket, coords, settings],
  );
  const countdown = useMemo(() => nightCountdown(now, window), [now, window]);

  return { now, window, countdown, coords, settings, timeZone };
}

export default function useTahajjud(): UseTahajjud {
  const { now, window, countdown, coords, settings, timeZone } = useTahajjudWindow();

  const [prefs, setPrefs] = useState<TahajjudPrefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  // Load persisted reminder preferences once.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<TahajjudPrefs>;
          setPrefs({ ...DEFAULT_PREFS, ...parsed });
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

  const persist = useCallback((next: TahajjudPrefs) => {
    AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const update = useCallback(
    (patch: Partial<TahajjudPrefs>) => {
      setPrefs((prev) => {
        const next = { ...prev, ...patch };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setReminderEnabled = useCallback(
    (on: boolean) => update({ reminderEnabled: on }),
    [update],
  );
  const setMode = useCallback((mode: ReminderMode) => update({ mode }), [update]);
  const setBeforeFajrMinutes = useCallback(
    (minutes: number) => update({ beforeFajrMinutes: clampBeforeFajr(minutes) }),
    [update],
  );

  // (Re)schedule the wake reminders when prefs, location, settings, or the day
  // change — and clear them when the reminder is switched off.
  const todayKey = dayKey(now);
  const lastScheduleSig = useRef<string>('');
  useEffect(() => {
    if (!ready) return;
    const sig = [
      prefs.reminderEnabled,
      prefs.mode,
      prefs.beforeFajrMinutes,
      coords.latitude,
      coords.longitude,
      todayKey,
    ].join('|');
    if (sig === lastScheduleSig.current) return;
    lastScheduleSig.current = sig;

    if (!prefs.reminderEnabled) {
      cancelTahajjudReminder().catch(() => {});
      return;
    }
    const times = upcomingWindows(new Date(), coords, settings, SCHEDULE_NIGHTS).map(
      (w) => reminderTimeFor(w, prefs.mode, prefs.beforeFajrMinutes),
    );
    scheduleTahajjudReminder(times).catch(() => {});
  }, [
    ready,
    prefs.reminderEnabled,
    prefs.mode,
    prefs.beforeFajrMinutes,
    coords.latitude,
    coords.longitude,
    settings,
    todayKey,
  ]);

  return {
    ready,
    now,
    window,
    countdown,
    timeZone,
    prefs,
    setReminderEnabled,
    setMode,
    setBeforeFajrMinutes,
  };
}
