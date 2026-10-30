/**
 * useFastingLog — the per-day fasting record as live React state.
 *
 * Loads the persisted log once, then exposes a tiny API the hub and month grid
 * share: read a day, set or cycle its status, mark exempt with a reason, clear
 * a day, and read derived stats (streak, totals) and a Ramadan tally. Every
 * mutation writes through to storage so progress survives a restart.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  computeFastStats,
  dayKey,
  entryOf,
  loadFastingLog,
  nextFastStatus,
  ramadanTally,
  saveFastingLog,
  type FastEntry,
  type FastingLog,
  type FastStats,
  type RamadanTally,
} from '../lib/fastingLog';
import type { ExemptReason, FastingStatus } from '../content/fasting/fasting';

export type UseFastingLog = {
  log: FastingLog;
  ready: boolean;
  /** The entry for a day key (defaults to today). */
  entry: (key?: string) => FastEntry;
  /** Set a day to an explicit status (with an optional exempt reason). */
  setStatus: (status: FastingStatus, key?: string, reason?: ExemptReason) => void;
  /** Advance a day one step around the logging cycle (tap-to-log). */
  cycle: (key?: string) => void;
  /** Mark a day exempt with a specific reason. */
  setReason: (reason: ExemptReason, key?: string) => void;
  /** Reset a day back to unlogged. */
  clearDay: (key?: string) => void;
  /** Roll up a list of Ramadan dates against the log. */
  tally: (dates: Date[]) => RamadanTally;
  stats: FastStats;
};

export default function useFastingLog(): UseFastingLog {
  const [log, setLog] = useState<FastingLog>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const loaded = await loadFastingLog();
      if (alive) {
        setLog(loaded);
        setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((updater: (prev: FastingLog) => FastingLog) => {
    setLog((prev) => {
      const next = updater(prev);
      void saveFastingLog(next);
      return next;
    });
  }, []);

  const setStatus = useCallback(
    (status: FastingStatus, key: string = dayKey(), reason?: ExemptReason) => {
      persist((prev) => {
        const next = { ...prev };
        if (status === 'none') delete next[key];
        else next[key] = reason ? { status, reason } : { status };
        return next;
      });
    },
    [persist],
  );

  const cycle = useCallback(
    (key: string = dayKey()) => {
      persist((prev) => {
        const ns = nextFastStatus(prev[key]?.status);
        const next = { ...prev };
        if (ns === 'none') {
          delete next[key];
        } else {
          const reason = ns === 'exempt' ? prev[key]?.reason : undefined;
          next[key] = reason ? { status: ns, reason } : { status: ns };
        }
        return next;
      });
    },
    [persist],
  );

  const setReason = useCallback(
    (reason: ExemptReason, key: string = dayKey()) => {
      persist((prev) => ({ ...prev, [key]: { status: 'exempt', reason } }));
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

  const entry = useCallback((key: string = dayKey()) => entryOf(log, key), [log]);
  const tally = useCallback((dates: Date[]) => ramadanTally(log, dates), [log]);
  const stats = useMemo(() => computeFastStats(log), [log]);

  return { log, ready, entry, setStatus, cycle, setReason, clearDay, tally, stats };
}
