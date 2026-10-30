/**
 * useCharityLog — the ṣadaqah & zakat giving ledger as live React state.
 *
 * Loads the persisted log once, then exposes a small API to record, amend and
 * remove gifts. Every mutation writes through to storage. Derived figures
 * (lifetime total, history rows, per-category split, sparkline) are memoised,
 * and the ḥawl/range totals are exposed as callbacks the caller drives with the
 * zakat settings it already holds.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  addEntry,
  byCategory,
  countGifts,
  editEntry,
  givingSeries,
  history,
  loadCharityLog,
  monthlyTotals,
  removeEntry,
  saveCharityLog,
  totalGiven,
  totalInRange,
  totalThisHawl,
  type CategoryTotal,
  type CharityEntry,
  type CharityInput,
  type CharityLog,
  type MonthBucket,
} from '../lib/charity';

export type UseCharityLog = {
  log: CharityLog;
  ready: boolean;
  /** Record a gift. */
  addPayment: (input: CharityInput) => void;
  /** Amend an existing gift. */
  edit: (id: string, patch: Partial<CharityInput>) => void;
  /** Delete a single gift. */
  remove: (id: string) => void;
  /** Wipe the whole log. */
  clear: () => void;
  total: number;
  count: number;
  rows: CharityEntry[];
  series: number[];
  categories: CategoryTotal[];
  /** Totals bucketed into the last `n` calendar months. */
  months: (n: number) => MonthBucket[];
  /** Total given within the current ḥawl (since the holding period began). */
  givenThisHawl: (hawlStartISO: string | null) => number;
  /** Total given within an inclusive date window. */
  givenInRange: (fromISO: string, toISO: string) => number;
};

export default function useCharityLog(): UseCharityLog {
  const [log, setLog] = useState<CharityLog>({ entries: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const loaded = await loadCharityLog();
      if (alive) {
        setLog(loaded);
        setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((updater: (prev: CharityLog) => CharityLog) => {
    setLog((prev) => {
      const next = updater(prev);
      void saveCharityLog(next);
      return next;
    });
  }, []);

  const addPayment = useCallback(
    (input: CharityInput) => {
      persist((prev) => addEntry(prev, input));
    },
    [persist],
  );

  const edit = useCallback(
    (id: string, patch: Partial<CharityInput>) => {
      persist((prev) => editEntry(prev, id, patch));
    },
    [persist],
  );

  const remove = useCallback(
    (id: string) => {
      persist((prev) => removeEntry(prev, id));
    },
    [persist],
  );

  const clear = useCallback(() => {
    persist(() => ({ entries: [] }));
  }, [persist]);

  const total = useMemo(() => totalGiven(log), [log]);
  const count = useMemo(() => countGifts(log), [log]);
  const rows = useMemo(() => history(log), [log]);
  const series = useMemo(() => givingSeries(log), [log]);
  const categories = useMemo(() => byCategory(log), [log]);

  const months = useCallback((n: number) => monthlyTotals(log, n), [log]);
  const givenThisHawl = useCallback(
    (hawlStartISO: string | null) => totalThisHawl(log, hawlStartISO),
    [log],
  );
  const givenInRange = useCallback(
    (fromISO: string, toISO: string) => totalInRange(log, fromISO, toISO),
    [log],
  );

  return {
    log,
    ready,
    addPayment,
    edit,
    remove,
    clear,
    total,
    count,
    rows,
    series,
    categories,
    months,
    givenThisHawl,
    givenInRange,
  };
}
