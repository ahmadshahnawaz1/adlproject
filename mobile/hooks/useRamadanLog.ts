/**
 * useRamadanLog — the persisted night-worship record for Ramaḍān (F22).
 *
 * Rakʿahs of Tarāwīḥ per night, the nightly checklist, and the nights marked as
 * revived in the last ten. Keyed by the civil day the night began on.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';
import type { HabitLog, TaraweehLog } from '../lib/ramadan';

const STORE_KEY = 'adl.ramadan.v1';

type RamadanState = {
  taraweeh: TaraweehLog;
  habits: HabitLog;
  revivedNights: string[];
};

function fresh(): RamadanState {
  return { taraweeh: {}, habits: {}, revivedNights: [] };
}

export type UseRamadanLog = {
  ready: boolean;
  taraweeh: TaraweehLog;
  habits: HabitLog;
  revived: Set<string>;
  setTaraweeh: (key: string, rakahs: number) => void;
  toggleHabit: (key: string, habitId: string) => void;
  toggleRevived: (key: string) => void;
  reset: () => void;
};

export default function useRamadanLog(): UseRamadanLog {
  const [state, setState] = useState<RamadanState>(fresh);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<RamadanState>;
          setState({
            taraweeh: parsed.taraweeh && typeof parsed.taraweeh === 'object' ? parsed.taraweeh : {},
            habits: parsed.habits && typeof parsed.habits === 'object' ? parsed.habits : {},
            revivedNights: Array.isArray(parsed.revivedNights) ? parsed.revivedNights : [],
          });
        }
      } catch {
        // fall back to a fresh slate
      }
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const write = useCallback((next: RamadanState) => {
    AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => {});
    return next;
  }, []);

  const setTaraweeh = useCallback(
    (key: string, rakahs: number) =>
      setState((prev) => write({ ...prev, taraweeh: { ...prev.taraweeh, [key]: Math.max(0, rakahs) } })),
    [write],
  );

  const toggleHabit = useCallback(
    (key: string, habitId: string) =>
      setState((prev) => {
        const current = prev.habits[key] ?? [];
        const next = current.includes(habitId)
          ? current.filter((id) => id !== habitId)
          : [...current, habitId];
        return write({ ...prev, habits: { ...prev.habits, [key]: next } });
      }),
    [write],
  );

  const toggleRevived = useCallback(
    (key: string) =>
      setState((prev) => {
        const has = prev.revivedNights.includes(key);
        return write({
          ...prev,
          revivedNights: has
            ? prev.revivedNights.filter((k) => k !== key)
            : [...prev.revivedNights, key],
        });
      }),
    [write],
  );

  const revived = useMemo(() => new Set(state.revivedNights), [state.revivedNights]);

  return {
    ready,
    taraweeh: state.taraweeh,
    habits: state.habits,
    revived,
    setTaraweeh,
    toggleHabit,
    toggleRevived,
    reset: () => setState(write(fresh())),
  };
}
