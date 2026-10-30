/**
 * useQuranKhatm — the Qurʾān completion (khatm) plan as live React state.
 *
 * Holds whether the planner is on, the target page count, the start and finish
 * dates, and how many pages have been read. Every mutation writes through to
 * storage. The pace (daily target, ahead/behind, projected finish) is computed
 * on demand for a given `now` so the live screen stays accurate as time passes.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QURAN_TOTAL_PAGES, khatmPace, type KhatmPace } from '../lib/quranKhatm';

const KHATM_KEY = 'adl.quranKhatm.v1';

export type KhatmState = {
  enabled: boolean;
  totalPages: number;
  currentPage: number;
  /** ISO date the plan started; empty until first enabled. */
  startISO: string;
  /** ISO date to finish by; empty until set (planner falls back to +29 days). */
  endISO: string;
};

export const DEFAULT_KHATM: KhatmState = {
  enabled: false,
  totalPages: QURAN_TOTAL_PAGES,
  currentPage: 0,
  startISO: '',
  endISO: '',
};

function plusDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

export type UseQuranKhatm = {
  state: KhatmState;
  ready: boolean;
  setEnabled: (on: boolean) => void;
  setTotalPages: (pages: number) => void;
  setCurrentPage: (page: number) => void;
  addPages: (delta: number) => void;
  setStartISO: (iso: string) => void;
  setEndISO: (iso: string) => void;
  reset: () => void;
  /** Compute the pace picture for a moment (defaults to now). */
  pace: (now?: Date) => KhatmPace;
};

export default function useQuranKhatm(): UseQuranKhatm {
  const [state, setState] = useState<KhatmState>(DEFAULT_KHATM);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KHATM_KEY);
        if (alive && raw) {
          setState({ ...DEFAULT_KHATM, ...(JSON.parse(raw) as Partial<KhatmState>) });
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

  const persist = useCallback((updater: (prev: KhatmState) => KhatmState) => {
    setState((prev) => {
      const next = updater(prev);
      AsyncStorage.setItem(KHATM_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const setEnabled = useCallback(
    (on: boolean) => {
      persist((prev) => {
        if (!on) return { ...prev, enabled: false };
        // First enable seeds the start date (today) if unset.
        const startISO = prev.startISO || new Date().toISOString();
        return { ...prev, enabled: true, startISO };
      });
    },
    [persist],
  );

  const setTotalPages = useCallback(
    (pages: number) => {
      persist((prev) => ({ ...prev, totalPages: Math.max(1, Math.floor(pages)) }));
    },
    [persist],
  );

  const setCurrentPage = useCallback(
    (page: number) => {
      persist((prev) => ({
        ...prev,
        currentPage: Math.min(prev.totalPages, Math.max(0, Math.floor(page))),
      }));
    },
    [persist],
  );

  const addPages = useCallback(
    (delta: number) => {
      persist((prev) => ({
        ...prev,
        currentPage: Math.min(prev.totalPages, Math.max(0, prev.currentPage + Math.round(delta))),
      }));
    },
    [persist],
  );

  const setStartISO = useCallback(
    (iso: string) => {
      persist((prev) => ({ ...prev, startISO: iso }));
    },
    [persist],
  );

  const setEndISO = useCallback(
    (iso: string) => {
      persist((prev) => ({ ...prev, endISO: iso }));
    },
    [persist],
  );

  const reset = useCallback(() => {
    persist(() => DEFAULT_KHATM);
  }, [persist]);

  const pace = useCallback(
    (now: Date = new Date()): KhatmPace => {
      const startISO = state.startISO || now.toISOString();
      const endISO = state.endISO || plusDays(new Date(startISO), 29).toISOString();
      return khatmPace({
        total: state.totalPages,
        current: state.currentPage,
        startISO,
        endISO,
        now,
      });
    },
    [state.startISO, state.endISO, state.totalPages, state.currentPage],
  );

  return useMemo(
    () => ({
      state,
      ready,
      setEnabled,
      setTotalPages,
      setCurrentPage,
      addPages,
      setStartISO,
      setEndISO,
      reset,
      pace,
    }),
    [state, ready, setEnabled, setTotalPages, setCurrentPage, addPages, setStartISO, setEndISO, reset, pace],
  );
}
