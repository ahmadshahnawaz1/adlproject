/**
 * useQazaLedger — the make-up (qaza) ledger as live React state.
 *
 * Loads the persisted ledger once, then exposes a small API the tracker uses to
 * record owed prayers, make-ups, and free-form adjustments. Every mutation
 * writes through to storage so the running account survives a restart. Derived
 * totals (outstanding per prayer, lifetime owed/repaid, history, sparkline) are
 * memoised for the dashboard.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addEntry,
  balanceSeries,
  history,
  loadLedger,
  outstandingByPrayer,
  rawByPrayer,
  removeEntry,
  repaidFraction,
  saveLedger,
  totalAdded,
  totalOutstanding,
  totalRepaid,
  type QazaHistoryRow,
  type QazaLedger,
} from '../lib/qazaLedger';
import type { ObligatoryName } from '../lib/prayerLog';

export type UseQazaLedger = {
  ledger: QazaLedger;
  ready: boolean;
  /** Record `count` newly owed prayers for one prayer. */
  addDebt: (prayer: ObligatoryName, count?: number, note?: string) => void;
  /** Record `count` make-ups for one prayer (won't drive the shown balance below 0). */
  repay: (prayer: ObligatoryName, count?: number, note?: string) => void;
  /** Apply a signed adjustment directly. */
  adjust: (prayer: ObligatoryName, delta: number, note?: string) => void;
  /** Delete a single ledger movement. */
  remove: (id: string) => void;
  /** Wipe the whole ledger. */
  clear: () => void;
  outstanding: Record<ObligatoryName, number>;
  total: number;
  added: number;
  repaid: number;
  progress: number;
  rows: QazaHistoryRow[];
  series: number[];
};

export default function useQazaLedger(): UseQazaLedger {
  const [ledger, setLedger] = useState<QazaLedger>({ entries: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const loaded = await loadLedger();
      if (alive) {
        setLedger(loaded);
        setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((updater: (prev: QazaLedger) => QazaLedger) => {
    setLedger((prev) => {
      const next = updater(prev);
      void saveLedger(next);
      return next;
    });
  }, []);

  const adjust = useCallback(
    (prayer: ObligatoryName, delta: number, note?: string) => {
      persist((prev) => addEntry(prev, prayer, delta, note));
    },
    [persist],
  );

  const addDebt = useCallback(
    (prayer: ObligatoryName, count = 1, note?: string) => {
      persist((prev) => addEntry(prev, prayer, Math.abs(count), note));
    },
    [persist],
  );

  const repay = useCallback(
    (prayer: ObligatoryName, count = 1, note?: string) => {
      persist((prev) => {
        // Never repay more than is actually owed for that prayer.
        const owed = Math.max(0, rawByPrayer(prev)[prayer]);
        const amount = Math.min(Math.abs(count), owed);
        if (amount <= 0) return prev;
        return addEntry(prev, prayer, -amount, note);
      });
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

  const outstanding = useMemo(() => outstandingByPrayer(ledger), [ledger]);
  const total = useMemo(() => totalOutstanding(ledger), [ledger]);
  const added = useMemo(() => totalAdded(ledger), [ledger]);
  const repaid = useMemo(() => totalRepaid(ledger), [ledger]);
  const progress = useMemo(() => repaidFraction(ledger), [ledger]);
  const rows = useMemo(() => history(ledger), [ledger]);
  const series = useMemo(() => balanceSeries(ledger), [ledger]);

  return {
    ledger,
    ready,
    addDebt,
    repay,
    adjust,
    remove,
    clear,
    outstanding,
    total,
    added,
    repaid,
    progress,
    rows,
    series,
  };
}
