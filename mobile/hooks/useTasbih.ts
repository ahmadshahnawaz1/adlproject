/**
 * useTasbih — the persisted state of the digital prayer-beads.
 *
 * It remembers the chosen dhikr, the live count and rounds of the current
 * sitting, the all-time lifetime total and whether the beads answer with a soft
 * haptic. The counting maths lives in lib/tasbih; this hook simply owns the
 * stored numbers, persists them, and speaks the gentle vibrations — a light tap
 * on each bead, a softer note at each phrase of a guided set, and a warm
 * success when a full round closes.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  DEFAULT_PRESET_ID,
  presetById,
  resetCounter as resetCounterState,
  tapCounter,
  undoCounter,
  type TasbihCounter,
  type TasbihPreset,
} from '../lib/tasbih';

const STORE_KEY = 'adl.tasbih.v1';

export type TasbihState = {
  /** The id of the chosen dhikr. */
  presetId: string;
  /** Progress within the current round, 0..target. */
  count: number;
  /** Full rounds completed in this sitting. */
  rounds: number;
  /** All-time remembrances counted, across every preset. */
  lifetime: number;
  /** Soft haptic feedback on each bead. */
  vibrate: boolean;
};

export const DEFAULT_TASBIH_STATE: TasbihState = {
  presetId: DEFAULT_PRESET_ID,
  count: 0,
  rounds: 0,
  lifetime: 0,
  vibrate: true,
};

export type UseTasbih = {
  ready: boolean;
  state: TasbihState;
  /** The resolved preset object for the current `presetId`. */
  preset: TasbihPreset;
  /** Register one bead. */
  tap: () => void;
  /** Step a single count back (eases a miscount). */
  undo: () => void;
  /** Clear the current sitting (count and rounds); the lifetime is kept. */
  reset: () => void;
  /** Switch dhikr; the live count and rounds reset for a fresh sitting. */
  selectPreset: (id: string) => void;
  /** Toggle the soft haptics. */
  setVibrate: (on: boolean) => void;
};

function persist(state: TasbihState): void {
  AsyncStorage.setItem(STORE_KEY, JSON.stringify(state)).catch(() => {});
}

/** Optional side-effects wired into the beads (e.g. feeding a goals ledger). */
export type UseTasbihOptions = {
  /** Called with the number of remembrances added on each counted bead (1). */
  onIncrement?: (delta: number) => void;
};

export default function useTasbih(options: UseTasbihOptions = {}): UseTasbih {
  const [state, setState] = useState<TasbihState>(DEFAULT_TASBIH_STATE);
  const [ready, setReady] = useState(false);

  // Keep the latest callback in a ref so `tap` stays referentially stable.
  const onIncrementRef = useRef(options.onIncrement);
  onIncrementRef.current = options.onIncrement;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<TasbihState>;
          setState({ ...DEFAULT_TASBIH_STATE, ...parsed });
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

  const tap = useCallback(() => {
    setState((prev) => {
      const preset = presetById(prev.presetId);
      const counter: TasbihCounter = { count: prev.count, rounds: prev.rounds, lifetime: prev.lifetime };
      const { next, roundCompleted, phraseCompleted } = tapCounter(counter, preset);

      if (prev.vibrate) {
        if (roundCompleted) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        } else if (phraseCompleted) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
      }

      const updated: TasbihState = { ...prev, count: next.count, rounds: next.rounds, lifetime: next.lifetime };
      persist(updated);
      onIncrementRef.current?.(1);
      return updated;
    });
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      const counter: TasbihCounter = { count: prev.count, rounds: prev.rounds, lifetime: prev.lifetime };
      const stepped = undoCounter(counter);
      if (stepped.count === prev.count && stepped.lifetime === prev.lifetime) return prev;
      if (prev.vibrate) Haptics.selectionAsync().catch(() => {});
      const updated: TasbihState = { ...prev, count: stepped.count, rounds: stepped.rounds, lifetime: stepped.lifetime };
      persist(updated);
      return updated;
    });
  }, []);

  const reset = useCallback(() => {
    setState((prev) => {
      const counter: TasbihCounter = { count: prev.count, rounds: prev.rounds, lifetime: prev.lifetime };
      const cleared = resetCounterState(counter);
      if (prev.vibrate) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const updated: TasbihState = { ...prev, count: cleared.count, rounds: cleared.rounds, lifetime: cleared.lifetime };
      persist(updated);
      return updated;
    });
  }, []);

  const selectPreset = useCallback((id: string) => {
    setState((prev) => {
      if (id === prev.presetId) return prev;
      if (prev.vibrate) Haptics.selectionAsync().catch(() => {});
      const updated: TasbihState = { ...prev, presetId: presetById(id).id, count: 0, rounds: 0 };
      persist(updated);
      return updated;
    });
  }, []);

  const setVibrate = useCallback((on: boolean) => {
    setState((prev) => {
      const updated: TasbihState = { ...prev, vibrate: on };
      persist(updated);
      return updated;
    });
  }, []);

  return {
    ready,
    state,
    preset: presetById(state.presetId),
    tap,
    undo,
    reset,
    selectPreset,
    setVibrate,
  };
}
