/**
 * usePrayerLog — the prayer-tracking record as live React state.
 *
 * Loads the persisted log once, then exposes a tiny API the dashboard and
 * calendar share: read a day, set or cycle a single prayer's status, clear a
 * day, and read derived stats (streak, consistency, qaza debt). Every mutation
 * writes through to storage so progress survives a restart.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  computeStats,
  dayKey,
  dayOf,
  lastNDays,
  loadLog,
  nextStatus,
  saveLog,
  type DayLog,
  type KeptOptions,
  type LogStats,
  type ObligatoryName,
  type PrayerLog,
  type PrayerStatus,
  type RangeStat,
} from '../lib/prayerLog';

export type UsePrayerLog = {
  log: PrayerLog;
  ready: boolean;
  /** Normalised statuses for a given day key (defaults to today). */
  day: (key?: string) => DayLog;
  /** Set one prayer on one day to an explicit status. */
  setStatus: (prayer: ObligatoryName, status: PrayerStatus, key?: string) => void;
  /** Advance one prayer one step around the logging cycle (for tap-to-log). */
  cycle: (prayer: ObligatoryName, key?: string) => void;
  /** Mark every obligation of a day as prayed on time (quick "all done"). */
  completeDay: (key?: string) => void;
  /** Reset a whole day back to unlogged. */
  clearDay: (key?: string) => void;
  /** Trailing per-day stats for charts. */
  range: (days: number) => RangeStat[];
  stats: LogStats;
};

export default function usePrayerLog(windowDays = 30, kept?: KeptOptions['kept']): UsePrayerLog {
  const [log, setLog] = useState<PrayerLog>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const loaded = await loadLog();
      if (alive) {
        setLog(loaded);
        setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((updater: (prev: PrayerLog) => PrayerLog) => {
    setLog((prev) => {
      const next = updater(prev);
      void saveLog(next);
      return next;
    });
  }, []);

  const setStatus = useCallback(
    (prayer: ObligatoryName, status: PrayerStatus, key: string = dayKey()) => {
      persist((prev) => {
        const day = { ...(prev[key] ?? {}) };
        if (status === 'none') delete day[prayer];
        else day[prayer] = status;
        return { ...prev, [key]: day };
      });
    },
    [persist],
  );

  const cycle = useCallback(
    (prayer: ObligatoryName, key: string = dayKey()) => {
      persist((prev) => {
        const day = { ...(prev[key] ?? {}) };
        const next = nextStatus(day[prayer]);
        if (next === 'none') delete day[prayer];
        else day[prayer] = next;
        return { ...prev, [key]: day };
      });
    },
    [persist],
  );

  const completeDay = useCallback(
    (key: string = dayKey()) => {
      persist((prev) => ({
        ...prev,
        [key]: { fajr: 'ontime', dhuhr: 'ontime', asr: 'ontime', maghrib: 'ontime', isha: 'ontime' },
      }));
    },
    [persist],
  );

  const clearDay = useCallback(
    (key: string = dayKey()) => {
      persist((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [persist],
  );

  const day = useCallback((key: string = dayKey()) => dayOf(log, key), [log]);
  const range = useCallback(
    (days: number) => lastNDays(log, days, new Date(), kept ? { kept } : undefined),
    [log, kept],
  );
  const stats = useMemo(
    () => computeStats(log, windowDays, new Date(), kept ? { kept } : undefined),
    [log, windowDays, kept],
  );

  return { log, ready, day, setStatus, cycle, completeDay, clearDay, range, stats };
}
