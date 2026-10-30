/**
 * usePilgrimageJourney — the persisted companion through the rites.
 *
 * It remembers which journey is open (ʿUmrah or Ḥajj), the chosen Ḥajj type,
 * the mode (Learn to scrub freely, or Perform to advance step by step), the
 * current step, which steps are done, and the tallies of the counted rituals
 * (Ṭawāf, Saʿī, Ramī) keyed by step — so the pilgrim can close the app in the
 * crowd of the Masʿā and return exactly where they were.
 *
 * State is stored per journey kind, so ʿUmrah and Ḥajj progress independently.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';
import { journeyOf } from '../content/pilgrimage';
import type { HajjType, PilgrimageKind } from '../content/pilgrimage';
import { clampStepIndex, incrementCount, journeyStepCount } from '../lib/pilgrimage';

const STORE_KEY = 'adl.pilgrimageJourney.v1';

/** How the pilgrim is engaging with a journey. */
export type JourneyMode = 'learn' | 'perform';

/** The mutable state of one journey (ʿUmrah or Ḥajj). */
export type JourneyState = {
  /** Chosen Ḥajj type — null until selected; ignored for ʿUmrah. */
  type: HajjType | null;
  mode: JourneyMode;
  /** Current global step index. */
  stepIndex: number;
  /** Ids of steps marked complete. */
  completed: string[];
  /** Tally of each counted ritual, keyed by step id. */
  counts: Record<string, number>;
};

/** The full persisted shape — one state per kind, plus the active kind. */
type Persisted = {
  active: PilgrimageKind | null;
  umrah: JourneyState;
  hajj: JourneyState;
};

function freshState(): JourneyState {
  return { type: null, mode: 'learn', stepIndex: 0, completed: [], counts: {} };
}

const DEFAULT_PERSISTED: Persisted = {
  active: null,
  umrah: freshState(),
  hajj: freshState(),
};

export type UsePilgrimageJourney = {
  ready: boolean;
  /** The open journey, or null when at the chooser. */
  active: PilgrimageKind | null;
  /** The active journey's state, or null when none is open. */
  state: JourneyState | null;
  /** Open a journey (resuming any saved progress). */
  selectJourney: (kind: PilgrimageKind) => void;
  /** Return to the chooser without losing progress. */
  exitJourney: () => void;
  setType: (type: HajjType) => void;
  setMode: (mode: JourneyMode) => void;
  goToStep: (index: number) => void;
  next: () => void;
  prev: () => void;
  /** Whether more steps remain after the current one. */
  hasNext: boolean;
  hasPrev: boolean;
  isComplete: (stepId: string) => boolean;
  markComplete: (stepId: string) => void;
  toggleComplete: (stepId: string) => void;
  count: (stepId: string) => number;
  /** Advance a counted ritual by one (clamped to `total`). */
  tapCounter: (stepId: string, total: number) => number;
  resetCounter: (stepId: string) => void;
  /** Reset the active journey (or a given kind) to a fresh state. */
  resetJourney: (kind?: PilgrimageKind) => void;
};

export default function usePilgrimageJourney(): UsePilgrimageJourney {
  const [data, setData] = useState<Persisted>(DEFAULT_PERSISTED);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<Persisted>;
          setData({
            active: parsed.active ?? null,
            umrah: { ...freshState(), ...(parsed.umrah ?? {}) },
            hajj: { ...freshState(), ...(parsed.hajj ?? {}) },
          });
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

  /** Persist and update in one move. */
  const commit = useCallback((next: Persisted) => {
    setData(next);
    AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  /** Apply a change to the active journey's state. */
  const mutateActive = useCallback(
    (fn: (s: JourneyState) => JourneyState) => {
      setData((prev) => {
        if (!prev.active) return prev;
        const next: Persisted = { ...prev, [prev.active]: fn(prev[prev.active]) };
        AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  const active = data.active;
  const state = active ? data[active] : null;

  const selectJourney = useCallback(
    (kind: PilgrimageKind) => {
      setData((prev) => {
        const next: Persisted = { ...prev, active: kind };
        AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  const exitJourney = useCallback(() => {
    setData((prev) => {
      const next: Persisted = { ...prev, active: null };
      AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const setType = useCallback(
    (type: HajjType) => mutateActive((s) => ({ ...s, type })),
    [mutateActive],
  );

  const setMode = useCallback(
    (mode: JourneyMode) => mutateActive((s) => ({ ...s, mode })),
    [mutateActive],
  );

  const goToStep = useCallback(
    (index: number) =>
      mutateActive((s) => {
        if (!active) return s;
        return { ...s, stepIndex: clampStepIndex(journeyOf(active), index) };
      }),
    [active, mutateActive],
  );

  const next = useCallback(
    () =>
      mutateActive((s) => {
        if (!active) return s;
        return { ...s, stepIndex: clampStepIndex(journeyOf(active), s.stepIndex + 1) };
      }),
    [active, mutateActive],
  );

  const prev = useCallback(
    () =>
      mutateActive((s) => {
        if (!active) return s;
        return { ...s, stepIndex: clampStepIndex(journeyOf(active), s.stepIndex - 1) };
      }),
    [active, mutateActive],
  );

  const isComplete = useCallback(
    (stepId: string) => !!state && state.completed.includes(stepId),
    [state],
  );

  const markComplete = useCallback(
    (stepId: string) =>
      mutateActive((s) =>
        s.completed.includes(stepId) ? s : { ...s, completed: [...s.completed, stepId] },
      ),
    [mutateActive],
  );

  const toggleComplete = useCallback(
    (stepId: string) =>
      mutateActive((s) => ({
        ...s,
        completed: s.completed.includes(stepId)
          ? s.completed.filter((id) => id !== stepId)
          : [...s.completed, stepId],
      })),
    [mutateActive],
  );

  const count = useCallback((stepId: string) => (state ? state.counts[stepId] ?? 0 : 0), [state]);

  const tapCounter = useCallback(
    (stepId: string, total: number): number => {
      const nextValue = incrementCount(state?.counts[stepId] ?? 0, total);
      mutateActive((s) => ({ ...s, counts: { ...s.counts, [stepId]: nextValue } }));
      return nextValue;
    },
    [state, mutateActive],
  );

  const resetCounter = useCallback(
    (stepId: string) => mutateActive((s) => ({ ...s, counts: { ...s.counts, [stepId]: 0 } })),
    [mutateActive],
  );

  const resetJourney = useCallback(
    (kind?: PilgrimageKind) => {
      setData((prev) => {
        const target = kind ?? prev.active;
        if (!target) return prev;
        const next: Persisted = { ...prev, [target]: freshState() };
        AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  const stepCount = active ? journeyStepCount(journeyOf(active)) : 0;
  const hasNext = !!state && state.stepIndex < stepCount - 1;
  const hasPrev = !!state && state.stepIndex > 0;

  return useMemo(
    () => ({
      ready,
      active,
      state,
      selectJourney,
      exitJourney,
      setType,
      setMode,
      goToStep,
      next,
      prev,
      hasNext,
      hasPrev,
      isComplete,
      markComplete,
      toggleComplete,
      count,
      tapCounter,
      resetCounter,
      resetJourney,
    }),
    [
      ready,
      active,
      state,
      selectJourney,
      exitJourney,
      setType,
      setMode,
      goToStep,
      next,
      prev,
      hasNext,
      hasPrev,
      isComplete,
      markComplete,
      toggleComplete,
      count,
      tapCounter,
      resetCounter,
      resetJourney,
    ],
  );
}
