/**
 * useDhikrGoals — the persisted state behind the Dhikr Goals hub (F10).
 *
 * It owns two things: the user's chosen daily goals (which adhkār count, the
 * tasbīḥ target) and a lasting per-day ledger of how many remembrances were
 * counted on the beads. The morning/evening adhkār themselves live in F2; this
 * hub only reads that history. The goal/streak/trend maths lives in
 * lib/dhikrGoals — this hook simply stores the numbers and persists them.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';
import {
  clampTasbihTarget,
  dayRecord,
  DEFAULT_GOAL_CONFIG,
  recordTasbih as recordTasbihInLedger,
  type DhikrDayRecord,
  type DhikrGoalConfig,
  type DhikrLedger,
} from '../lib/dhikrGoals';
import { dayKey } from '../lib/streak';

const STORE_KEY = 'adl.dhikrGoals.v1';

export type DhikrGoalsState = {
  /** The user's chosen daily goals. */
  config: DhikrGoalConfig;
  /** day key → that day's tasbīḥ tally (historical, never wiped). */
  ledger: DhikrLedger;
  /** The day the live tally belongs to ('YYYY-MM-DD'). */
  day: string;
};

function freshState(): DhikrGoalsState {
  return { config: { ...DEFAULT_GOAL_CONFIG }, ledger: {}, day: dayKey() };
}

export type UseDhikrGoals = {
  ready: boolean;
  config: DhikrGoalConfig;
  /** Today's key; updates as the calendar day turns over. */
  day: string;
  /** The whole tasbīḥ ledger (for streak + trend computation). */
  ledger: DhikrLedger;
  /** Today's tasbīḥ record. */
  todayRecord: DhikrDayRecord;
  /** Merge a partial change into the goal config. */
  setConfig: (patch: Partial<DhikrGoalConfig>) => void;
  /** Add (or subtract) tasbīḥ counted today. */
  recordTasbih: (delta: number) => void;
};

function persist(state: DhikrGoalsState): void {
  AsyncStorage.setItem(STORE_KEY, JSON.stringify(state)).catch(() => {});
}

/** Roll the live `day` forward when the calendar turns; the ledger is kept. */
function rolledOver(state: DhikrGoalsState): DhikrGoalsState {
  const today = dayKey();
  if (state.day === today) return state;
  return { ...state, day: today };
}

export default function useDhikrGoals(): UseDhikrGoals {
  const [state, setState] = useState<DhikrGoalsState>(freshState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<DhikrGoalsState>;
          const merged: DhikrGoalsState = {
            ...freshState(),
            ...parsed,
            config: { ...DEFAULT_GOAL_CONFIG, ...(parsed.config ?? {}) },
          };
          const renewed = rolledOver(merged);
          setState(renewed);
          if (renewed !== merged) persist(renewed);
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

  const setConfig = useCallback((patch: Partial<DhikrGoalConfig>) => {
    setState((prev) => {
      const next: DhikrGoalConfig = { ...prev.config, ...patch };
      if (patch.tasbihTarget != null) {
        next.tasbihTarget = clampTasbihTarget(patch.tasbihTarget);
      }
      const updated: DhikrGoalsState = { ...prev, config: next };
      persist(updated);
      return updated;
    });
  }, []);

  const recordTasbih = useCallback((delta: number) => {
    if (!delta) return;
    setState((prev) => {
      const base = rolledOver(prev);
      const ledger = recordTasbihInLedger(base.ledger, base.day, delta);
      if (ledger === base.ledger && base === prev) return prev;
      const updated: DhikrGoalsState = { ...base, ledger };
      persist(updated);
      return updated;
    });
  }, []);

  const todayRecord = useMemo(
    () => dayRecord(state.ledger, state.day),
    [state.ledger, state.day],
  );

  return {
    ready,
    config: state.config,
    day: state.day,
    ledger: state.ledger,
    todayRecord,
    setConfig,
    recordTasbih,
  };
}
