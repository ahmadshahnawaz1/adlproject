/**
 * useFastingLedger — the make-up (qaḍāʾ) fasting ledger as live React state.
 *
 * Loads the persisted ledger once, then exposes a small API to record fasts
 * owed, fasts made up, and free-form adjustments. Every mutation writes through
 * to storage. Derived totals (outstanding, lifetime owed/repaid, history,
 * sparkline) are memoised for the card.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addEntry,
  balanceSeries,
  history,
  loadFastLedger,
  rawBalance,
  removeEntry,
  repaidFraction,
  saveFastLedger,
  totalAdded,
  totalOutstanding,
  totalRepaid,
  type FastHistoryRow,
  type FastLedger,
} from '../lib/fastingLedger';

export type UseFastingLedger = {
  ledger: FastLedger;
  ready: boolean;
  /** Record `count` newly owed fasts. */
  addDebt: (count?: number, note?: string) => void;
  /** Record `count` made-up fasts (won't drive the shown balance below 0). */
  repay: (count?: number, note?: string) => void;
  /** Apply a signed adjustment directly. */
  adjust: (delta: number, note?: string) => void;
  /** Delete a single ledger movement. */
  remove: (id: string) => void;
  /** Wipe the whole ledger. */
  clear: () => void;
  total: number;
  added: number;
  repaid: number;
  progress: number;
  rows: FastHistoryRow[];
  series: number[];
};

export default function useFastingLedger(): UseFastingLedger {
  const [ledger, setLedger] = useState<FastLedger>({ entries: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const loaded = await loadFastLedger();
      if (alive) {
        setLedger(loaded);
        setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((updater: (prev: FastLedger) => FastLedger) => {
    setLedger((prev) => {
      const next = updater(prev);
      void saveFastLedger(next);
      return next;
    });
  }, []);

  const adjust = useCallback(
    (delta: number, note?: string) => {
      persist((prev) => addEntry(prev, delta, note));
    },
    [persist],
  );

  const addDebt = useCallback(
    (count = 1, note?: string) => {
      persist((prev) => addEntry(prev, Math.abs(count), note));
    },
    [persist],
  );

  const repay = useCallback(
    (count = 1, note?: string) => {
      persist((prev) => {
        // Never repay more than is actually owed.
        const owed = Math.max(0, rawBalance(prev));
        const amount = Math.min(Math.abs(count), owed);
        if (amount <= 0) return prev;
        return addEntry(prev, -amount, note);
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

  const total = useMemo(() => totalOutstanding(ledger), [ledger]);
  const added = useMemo(() => totalAdded(ledger), [ledger]);
  const repaid = useMemo(() => totalRepaid(ledger), [ledger]);
  const progress = useMemo(() => repaidFraction(ledger), [ledger]);
  const rows = useMemo(() => history(ledger), [ledger]);
  const series = useMemo(() => balanceSeries(ledger), [ledger]);

  return { ledger, ready, addDebt, repay, adjust, remove, clear, total, added, repaid, progress, rows, series };
}
