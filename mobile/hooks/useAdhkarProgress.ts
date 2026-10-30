/**
 * useAdhkarProgress — the persisted state of the daily remembrances.
 *
 * It remembers how far you are through each set today, resets that progress
 * when a new day begins (the sets are renewed each morning and evening), keeps
 * a lasting history of which sets you completed on which days — from which the
 * streak is drawn — and speaks gentle haptics: a light tap on each repetition,
 * a softer note when a single dhikr is finished, and a warm success when a whole
 * set is complete. The counting maths lives in lib/adhkar; this hook owns the
 * stored numbers, persists them and answers with vibration.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  currentStreak,
  dayKey,
  isCategoryComplete,
  recordCompletion,
  tapDhikr,
  undoDhikr,
  type AdhkarHistory,
  type DhikrCounts,
} from '../lib/adhkar';
import type { AdhkarCategory, AdhkarCategoryId, Dhikr } from '../content/adhkar';

const STORE_KEY = 'adl.adhkar.v1';

type CountsByCategory = Partial<Record<AdhkarCategoryId, DhikrCounts>>;

export type AdhkarState = {
  /** The day the live counts belong to ('YYYY-MM-DD'). */
  day: string;
  /** Live per-dhikr counts for the current day, per set. */
  counts: CountsByCategory;
  /** Lasting record: day → ids of the sets completed that day. */
  history: AdhkarHistory;
  /** Soft haptic feedback on each tap. */
  haptics: boolean;
};

function freshState(): AdhkarState {
  return { day: dayKey(), counts: {}, history: {}, haptics: true };
}

export type UseAdhkarProgress = {
  ready: boolean;
  /** Today's key; the counts reset when it changes. */
  day: string;
  haptics: boolean;
  /** Consecutive days (ending today/yesterday) with at least one set completed. */
  streak: number;
  /** The set ids completed today. */
  completedToday: string[];
  /** Lasting record: day → ids of the sets completed that day. */
  history: AdhkarHistory;
  /** The live counts for one set. */
  countsFor: (id: AdhkarCategoryId) => DhikrCounts;
  /** Register one repetition of a dhikr within its set. */
  tap: (category: AdhkarCategory, dhikr: Dhikr) => void;
  /** Step one repetition back (eases a miscount). */
  undo: (category: AdhkarCategory, dhikr: Dhikr) => void;
  /** Clear the live progress of one set (the history is kept). */
  resetCategory: (id: AdhkarCategoryId) => void;
  /** Toggle the soft haptics. */
  setHaptics: (on: boolean) => void;
};

function persist(state: AdhkarState): void {
  AsyncStorage.setItem(STORE_KEY, JSON.stringify(state)).catch(() => {});
}

/** Renew the live counts when the calendar day has turned over. */
function rolledOver(state: AdhkarState): AdhkarState {
  const today = dayKey();
  if (state.day === today) return state;
  return { ...state, day: today, counts: {} };
}

export default function useAdhkarProgress(): UseAdhkarProgress {
  const [state, setState] = useState<AdhkarState>(freshState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<AdhkarState>;
          const merged: AdhkarState = { ...freshState(), ...parsed };
          const renewed = rolledOver(merged);
          if (renewed !== merged) persist(renewed);
          setState(renewed);
        }
      } catch {
        // Fall back to a fresh state.
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const tap = useCallback((category: AdhkarCategory, dhikr: Dhikr) => {
    setState((prev) => {
      const base = rolledOver(prev);
      const catCounts = base.counts[category.id] ?? {};
      const wasComplete = isCategoryComplete(catCounts, category);
      const { counts: nextCatCounts, dhikrCompleted } = tapDhikr(catCounts, dhikr);

      const advanced = nextCatCounts !== catCounts;
      if (base === prev && !advanced) return prev; // nothing changed at all

      const nowComplete = advanced && isCategoryComplete(nextCatCounts, category);
      const justCompleted = nowComplete && !wasComplete;

      if (base.haptics && advanced) {
        if (justCompleted) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        } else if (dhikrCompleted) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
      }

      const updated: AdhkarState = {
        ...base,
        counts: { ...base.counts, [category.id]: nextCatCounts },
        history: justCompleted ? recordCompletion(base.history, category.id) : base.history,
      };
      persist(updated);
      return updated;
    });
  }, []);

  const undo = useCallback((category: AdhkarCategory, dhikr: Dhikr) => {
    setState((prev) => {
      const base = rolledOver(prev);
      const catCounts = base.counts[category.id] ?? {};
      const nextCatCounts = undoDhikr(catCounts, dhikr);
      if (base === prev && nextCatCounts === catCounts) return prev;
      if (base.haptics && nextCatCounts !== catCounts) {
        Haptics.selectionAsync().catch(() => {});
      }
      const updated: AdhkarState = {
        ...base,
        counts: { ...base.counts, [category.id]: nextCatCounts },
      };
      persist(updated);
      return updated;
    });
  }, []);

  const resetCategory = useCallback((id: AdhkarCategoryId) => {
    setState((prev) => {
      const base = rolledOver(prev);
      if (base === prev && !base.counts[id]) return prev;
      const nextCounts = { ...base.counts };
      delete nextCounts[id];
      if (base.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const updated: AdhkarState = { ...base, counts: nextCounts };
      persist(updated);
      return updated;
    });
  }, []);

  const setHaptics = useCallback((on: boolean) => {
    setState((prev) => {
      const updated: AdhkarState = { ...prev, haptics: on };
      persist(updated);
      return updated;
    });
  }, []);

  const countsFor = useCallback(
    (id: AdhkarCategoryId): DhikrCounts => state.counts[id] ?? {},
    [state.counts],
  );

  const streak = useMemo(() => currentStreak(state.history), [state.history]);
  const completedToday = useMemo(
    () => state.history[state.day] ?? [],
    [state.history, state.day],
  );

  return {
    ready,
    day: state.day,
    haptics: state.haptics,
    streak,
    completedToday,
    history: state.history,
    countsFor,
    tap,
    undo,
    resetCategory,
    setHaptics,
  };
}
