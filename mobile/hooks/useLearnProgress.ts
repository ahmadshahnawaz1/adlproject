/**
 * useLearnProgress — the persisted state behind the Learning Hub (F12).
 *
 * It remembers which lessons a reader has marked as read, which steps of the
 * "New Muslim" path they have completed, and the section they last opened — so
 * the hub can show progress and resume where they left off. The progress maths
 * lives in lib/learn; this hook only stores the sets and persists them.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';
import {
  NEW_MUSLIM_TRACK,
  trackProgress as computeTrackProgress,
  isTrackComplete as computeTrackComplete,
} from '../lib/learn';
import { DEFAULT_TOPIC_ID } from '../content/learn';

const STORE_KEY = 'adl.learn.v1';

export type LearnProgressState = {
  /** Ids of lessons (ʿAqīdah/Fiqh) the reader has marked as read. */
  completedLessonIds: string[];
  /** Ids of New-Muslim track steps the reader has completed. */
  completedStepIds: string[];
  /** The section last opened, so the hub can highlight it. */
  lastTopicId: string;
};

function freshState(): LearnProgressState {
  return { completedLessonIds: [], completedStepIds: [], lastTopicId: DEFAULT_TOPIC_ID };
}

export type UseLearnProgress = {
  ready: boolean;
  lastTopicId: string;
  /** A live set of completed lesson ids for O(1) lookups. */
  completedLessons: Set<string>;
  /** A live set of completed track-step ids for O(1) lookups. */
  completedSteps: Set<string>;
  /** Completion fraction of the New-Muslim path (0..1). */
  trackProgress: number;
  /** Whether the New-Muslim path is fully complete. */
  trackComplete: boolean;
  isLessonComplete: (id: string) => boolean;
  isStepComplete: (id: string) => boolean;
  toggleLesson: (id: string) => void;
  setLessonComplete: (id: string, complete: boolean) => void;
  setStepComplete: (id: string, complete: boolean) => void;
  setLastTopic: (id: string) => void;
  /** Forget all progress (lessons + steps). */
  reset: () => void;
};

function persist(state: LearnProgressState): void {
  AsyncStorage.setItem(STORE_KEY, JSON.stringify(state)).catch(() => {});
}

/** Add or remove an id from a string array immutably; returns the same ref if unchanged. */
function withId(list: string[], id: string, present: boolean): string[] {
  const has = list.includes(id);
  if (present === has) return list;
  return present ? [...list, id] : list.filter((x) => x !== id);
}

export default function useLearnProgress(): UseLearnProgress {
  const [state, setState] = useState<LearnProgressState>(freshState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<LearnProgressState>;
          setState({
            ...freshState(),
            ...parsed,
            completedLessonIds: Array.isArray(parsed.completedLessonIds)
              ? parsed.completedLessonIds
              : [],
            completedStepIds: Array.isArray(parsed.completedStepIds)
              ? parsed.completedStepIds
              : [],
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

  const setLessonComplete = useCallback((id: string, complete: boolean) => {
    setState((prev) => {
      const completedLessonIds = withId(prev.completedLessonIds, id, complete);
      if (completedLessonIds === prev.completedLessonIds) return prev;
      const updated = { ...prev, completedLessonIds };
      persist(updated);
      return updated;
    });
  }, []);

  const toggleLesson = useCallback((id: string) => {
    setState((prev) => {
      const completedLessonIds = withId(
        prev.completedLessonIds,
        id,
        !prev.completedLessonIds.includes(id),
      );
      const updated = { ...prev, completedLessonIds };
      persist(updated);
      return updated;
    });
  }, []);

  const setStepComplete = useCallback((id: string, complete: boolean) => {
    setState((prev) => {
      const completedStepIds = withId(prev.completedStepIds, id, complete);
      if (completedStepIds === prev.completedStepIds) return prev;
      const updated = { ...prev, completedStepIds };
      persist(updated);
      return updated;
    });
  }, []);

  const setLastTopic = useCallback((id: string) => {
    setState((prev) => {
      if (prev.lastTopicId === id) return prev;
      const updated = { ...prev, lastTopicId: id };
      persist(updated);
      return updated;
    });
  }, []);

  const reset = useCallback(() => {
    setState((prev) => {
      const updated = { ...prev, completedLessonIds: [], completedStepIds: [] };
      persist(updated);
      return updated;
    });
  }, []);

  const completedLessons = useMemo(
    () => new Set(state.completedLessonIds),
    [state.completedLessonIds],
  );
  const completedSteps = useMemo(
    () => new Set(state.completedStepIds),
    [state.completedStepIds],
  );

  const trackProgress = useMemo(
    () => computeTrackProgress(state.completedStepIds, NEW_MUSLIM_TRACK),
    [state.completedStepIds],
  );
  const trackComplete = useMemo(
    () => computeTrackComplete(state.completedStepIds, NEW_MUSLIM_TRACK),
    [state.completedStepIds],
  );

  const isLessonComplete = useCallback((id: string) => completedLessons.has(id), [completedLessons]);
  const isStepComplete = useCallback((id: string) => completedSteps.has(id), [completedSteps]);

  return {
    ready,
    lastTopicId: state.lastTopicId,
    completedLessons,
    completedSteps,
    trackProgress,
    trackComplete,
    isLessonComplete,
    isStepComplete,
    toggleLesson,
    setLessonComplete,
    setStepComplete,
    setLastTopic,
    reset,
  };
}
