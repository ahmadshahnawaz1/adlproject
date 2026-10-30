/**
 * lib/streak.ts — a small, pure day-streak engine shared by the newer
 * engagement features (Dhikr Goals F10, Tahajjud F11).
 *
 * The older features (prayer log, adhkār, fasting) each grew their own copy of
 * this logic before it was worth extracting; those stay as they are so their
 * tests keep passing. New features build on this single, well-tested core.
 * No React, no storage, no side effects — dates and predicates in, numbers out.
 */
import { dayKey } from './clock';

// dayKey is centralized in lib/clock; re-exported for existing importers.
export { dayKey };

/** Whether `key` is the calendar day immediately after `prevKey`. */
export function isConsecutiveDay(prevKey: string, key: string): boolean {
  const a = new Date(`${prevKey}T00:00:00`);
  const b = new Date(`${key}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000) === 1;
}

/** Tuning for {@link computeStreak}. */
export type StreakOptions = {
  /**
   * When today's entry isn't complete yet, don't break the run — start the
   * walk from yesterday instead. Defaults to true (the kind, forgiving behaviour
   * shared by every streak in the app).
   */
  allowTodayPending?: boolean;
  /** Safety cap on how many days to walk back. Defaults to ~10 years. */
  maxLookback?: number;
};

/**
 * The current streak: consecutive days for which `isComplete(dayKey)` returns
 * true, ending today. With `allowTodayPending` (the default), a today that is
 * not complete yet does not break the run — the walk simply starts at yesterday.
 */
export function computeStreak(
  isComplete: (key: string) => boolean,
  today: Date = new Date(),
  opts: StreakOptions = {},
): number {
  const { allowTodayPending = true, maxLookback = 3660 } = opts;
  let streak = 0;
  const cursor = new Date(today);

  if (allowTodayPending && !isComplete(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  for (let i = 0; i < maxLookback; i += 1) {
    if (isComplete(dayKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/**
 * The longest run of consecutive complete days anywhere in `completedKeys`
 * (an iterable of 'YYYY-MM-DD' keys that each count as a complete day). Order
 * and duplicates do not matter.
 */
export function longestStreak(completedKeys: Iterable<string>): number {
  const keys = Array.from(new Set(completedKeys)).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const key of keys) {
    run = prev && isConsecutiveDay(prev, key) ? run + 1 : 1;
    if (run > best) best = run;
    prev = key;
  }
  return best;
}

/** The keys of the last `n` days, oldest → newest, ending today. */
export function lastNDayKeys(n: number, today: Date = new Date()): string[] {
  const keys: string[] = [];
  const cursor = new Date(today);
  cursor.setDate(cursor.getDate() - (n - 1));
  for (let i = 0; i < n; i += 1) {
    keys.push(dayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}
