/**
 * useHifzProgress — the persisted memorisation record (F23).
 *
 * Holds the review state of every āyah the user has begun memorising. Writes
 * are per-user scoped; the Qurʾān text itself is static bundled content.
 */
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';
import { gradeReview, newReview, type ReviewGrade, type ReviewMap } from '../lib/hifz';

const STORE_KEY = 'adl.hifz.v1';

export type UseHifzProgress = {
  ready: boolean;
  reviews: ReviewMap;
  /** Begin memorising an āyah (no-op if already started). */
  start: (id: string) => void;
  /** Stop tracking an āyah. */
  drop: (id: string) => void;
  /** Record a recall and reschedule. */
  grade: (id: string, grade: ReviewGrade) => void;
  /** Begin every āyah of a range at once. */
  startRange: (ids: string[]) => void;
  reset: () => void;
};

export default function useHifzProgress(): UseHifzProgress {
  const [reviews, setReviews] = useState<ReviewMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as ReviewMap;
          if (parsed && typeof parsed === 'object') setReviews(parsed);
        }
      } catch {
        // fall back to an empty record
      }
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const write = useCallback((next: ReviewMap) => {
    AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => {});
    return next;
  }, []);

  const start = useCallback(
    (id: string) =>
      setReviews((prev) => (prev[id] ? prev : write({ ...prev, [id]: newReview(id) }))),
    [write],
  );

  const startRange = useCallback(
    (ids: string[]) =>
      setReviews((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const id of ids) {
          if (!next[id]) {
            next[id] = newReview(id);
            changed = true;
          }
        }
        return changed ? write(next) : prev;
      }),
    [write],
  );

  const drop = useCallback(
    (id: string) =>
      setReviews((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return write(next);
      }),
    [write],
  );

  const grade = useCallback(
    (id: string, g: ReviewGrade) =>
      setReviews((prev) => {
        const state = prev[id] ?? newReview(id);
        return write({ ...prev, [id]: gradeReview(state, g) });
      }),
    [write],
  );

  return { ready, reviews, start, startRange, drop, grade, reset: () => setReviews(write({})) };
}
