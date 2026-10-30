/**
 * useZakatReminder — the once-a-year "your ḥawl is complete" reminder.
 *
 * The Zakat worksheet records when the holding period (ḥawl) began. This hook
 * turns that anchor into a single scheduled notification: it derives the due
 * date (one lunar year on), brings it forward by the chosen lead time, and
 * (re)schedules — or cancels — whenever the preference or the anchor changes.
 * Preferences persist under 'adl.zakatReminder.v1'. The maths lives in
 * lib/zakat; this hook owns the stored prefs and the scheduling.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { hawlStatus } from '../lib/zakat';
import {
  cancelZakatDueReminder,
  scheduleZakatDueReminder,
  sendTestZakatDue,
} from '../lib/notifications';

const STORE_KEY = 'adl.zakatReminder.v1';
const DAY_MS = 86_400_000;

export const MIN_DAYS_BEFORE = 0;
export const MAX_DAYS_BEFORE = 30;
export const DAYS_BEFORE_STEP = 1;

export type ZakatReminderPrefs = {
  enabled: boolean;
  /** Lead time before the due date, in days (0 = on the day). */
  daysBefore: number;
};

const DEFAULT_PREFS: ZakatReminderPrefs = {
  enabled: false,
  daysBefore: 3,
};

export function clampDaysBefore(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_PREFS.daysBefore;
  return Math.max(MIN_DAYS_BEFORE, Math.min(MAX_DAYS_BEFORE, Math.round(n)));
}

export type UseZakatReminder = {
  ready: boolean;
  prefs: ZakatReminderPrefs;
  /** ISO date the ḥawl completes, or null when no ḥawl has started. */
  dueDateISO: string | null;
  /** ISO date the reminder will fire (due minus lead time), or null. */
  reminderDateISO: string | null;
  setEnabled: (on: boolean) => void;
  setDaysBefore: (days: number) => void;
  sendTest: () => Promise<boolean>;
};

export default function useZakatReminder(hawlStartISO: string | null): UseZakatReminder {
  const [prefs, setPrefs] = useState<ZakatReminderPrefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  // Load persisted preferences once.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<ZakatReminderPrefs>;
          setPrefs({
            ...DEFAULT_PREFS,
            ...parsed,
            daysBefore: clampDaysBefore(parsed.daysBefore ?? DEFAULT_PREFS.daysBefore),
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

  const persist = useCallback((next: ZakatReminderPrefs) => {
    AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const update = useCallback(
    (patch: Partial<ZakatReminderPrefs>) => {
      setPrefs((prev) => {
        const next = { ...prev, ...patch };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setEnabled = useCallback((on: boolean) => update({ enabled: on }), [update]);
  const setDaysBefore = useCallback(
    (days: number) => update({ daysBefore: clampDaysBefore(days) }),
    [update],
  );

  const dueDateISO = useMemo(() => hawlStatus(hawlStartISO).dueDateISO, [hawlStartISO]);

  const reminderDateISO = useMemo(() => {
    if (!dueDateISO) return null;
    const t = new Date(dueDateISO).getTime() - prefs.daysBefore * DAY_MS;
    return new Date(t).toISOString();
  }, [dueDateISO, prefs.daysBefore]);

  // (Re)schedule whenever the preference or the resolved fire-date changes, and
  // cancel when the reminder is switched off or no ḥawl is running.
  const lastSig = useRef<string>('');
  useEffect(() => {
    if (!ready) return;
    const sig = [prefs.enabled, prefs.daysBefore, reminderDateISO ?? 'none'].join('|');
    if (sig === lastSig.current) return;
    lastSig.current = sig;

    if (!prefs.enabled || !reminderDateISO) {
      cancelZakatDueReminder().catch(() => {});
      return;
    }
    scheduleZakatDueReminder(new Date(reminderDateISO)).catch(() => {});
  }, [ready, prefs.enabled, prefs.daysBefore, reminderDateISO]);

  const sendTest = useCallback(() => sendTestZakatDue(5), []);

  return { ready, prefs, dueDateISO, reminderDateISO, setEnabled, setDaysBefore, sendTest };
}
