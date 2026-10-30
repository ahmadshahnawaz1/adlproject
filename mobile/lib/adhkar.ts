/**
 * lib/adhkar.ts — the pure engine behind the daily remembrances.
 *
 * The content model (content/adhkar) holds the remembrances once; this file
 * counts them. A tap advances a single dhikr toward its repeat target and never
 * past it; from the per-dhikr counts it derives how much of a set is done, its
 * progress fraction, whether the whole set is complete, and where to resume.
 * It also keeps the daily-completion streak. No React, no storage, no side
 * effects — numbers in, numbers out, so it is trivially testable.
 */
import {
  ADHKAR_CATEGORIES,
  ADHKAR_DISCLAIMER,
  DEFAULT_CATEGORY_ID,
  categoryById,
  type AdhkarCategory,
  type Dhikr,
} from '../content/adhkar';
import { dayKey } from './clock';

/** Re-export the catalogue so screens can import everything from one place. */
export { ADHKAR_CATEGORIES, ADHKAR_DISCLAIMER, categoryById, DEFAULT_CATEGORY_ID };

/** The live tap counts of one set, keyed by dhikr id. */
export type DhikrCounts = Record<string, number>;

// dayKey is centralized in lib/clock; re-exported for existing importers.
export { dayKey };

/** The recorded count for one dhikr (0 if untouched). */
export function dhikrCount(counts: DhikrCounts, id: string): number {
  return counts[id] ?? 0;
}

/** Repetitions still owed for one dhikr. */
export function remaining(counts: DhikrCounts, dhikr: Dhikr): number {
  return Math.max(0, dhikr.repeat - dhikrCount(counts, dhikr.id));
}

/** Whether a single dhikr has reached its repeat target. */
export function isDhikrComplete(counts: DhikrCounts, dhikr: Dhikr): boolean {
  return dhikrCount(counts, dhikr.id) >= dhikr.repeat;
}

/** Total repetitions across a whole set. */
export function categoryReps(category: AdhkarCategory): number {
  return category.dhikr.reduce((n, d) => n + d.repeat, 0);
}

/** Repetitions completed across a set (each dhikr capped at its target). */
export function categoryDoneReps(counts: DhikrCounts, category: AdhkarCategory): number {
  return category.dhikr.reduce((n, d) => n + Math.min(dhikrCount(counts, d.id), d.repeat), 0);
}

/** How many of the set's dhikr are fully complete. */
export function completedDhikrCount(counts: DhikrCounts, category: AdhkarCategory): number {
  return category.dhikr.reduce((n, d) => n + (isDhikrComplete(counts, d) ? 1 : 0), 0);
}

/** The fraction 0..1 of a set completed, by repetitions (for the ring). */
export function categoryProgress(counts: DhikrCounts, category: AdhkarCategory): number {
  const total = categoryReps(category);
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, categoryDoneReps(counts, category) / total));
}

/** Whether every dhikr in the set has reached its target. */
export function isCategoryComplete(counts: DhikrCounts, category: AdhkarCategory): boolean {
  return category.dhikr.every((d) => isDhikrComplete(counts, d));
}

/** The index of the first not-yet-complete dhikr, or -1 when the set is done. */
export function nextIncompleteIndex(counts: DhikrCounts, category: AdhkarCategory): number {
  return category.dhikr.findIndex((d) => !isDhikrComplete(counts, d));
}

/** The outcome of advancing one dhikr by a single tap. */
export type DhikrTap = {
  counts: DhikrCounts;
  /** The new count for the tapped dhikr. */
  count: number;
  /** This dhikr just reached its repeat target on this tap. */
  dhikrCompleted: boolean;
};

/**
 * Advance one dhikr by a single repetition, never past its target. Returns a
 * fresh counts object (the input is not mutated). A tap on an already-complete
 * dhikr is a no-op that reports no completion.
 */
export function tapDhikr(counts: DhikrCounts, dhikr: Dhikr): DhikrTap {
  const prev = dhikrCount(counts, dhikr.id);
  if (prev >= dhikr.repeat) {
    return { counts, count: prev, dhikrCompleted: false };
  }
  const count = prev + 1;
  return {
    counts: { ...counts, [dhikr.id]: count },
    count,
    dhikrCompleted: count >= dhikr.repeat,
  };
}

/** Step one dhikr back by a single repetition (eases a miscount). */
export function undoDhikr(counts: DhikrCounts, dhikr: Dhikr): DhikrCounts {
  const prev = dhikrCount(counts, dhikr.id);
  if (prev <= 0) return counts;
  return { ...counts, [dhikr.id]: prev - 1 };
}

/** Mark one dhikr fully complete in a single step (its target reached). */
export function completeDhikr(counts: DhikrCounts, dhikr: Dhikr): DhikrCounts {
  if (isDhikrComplete(counts, dhikr)) return counts;
  return { ...counts, [dhikr.id]: dhikr.repeat };
}

/* ------------------------------------------------------------------ *
 * Daily-completion streak
 *
 * `history` records, per day, the ids of the sets completed that day. A day
 * "counts" toward the streak when at least one set was completed.
 * ------------------------------------------------------------------ */

/** The completion history: day key → ids of the sets completed that day. */
export type AdhkarHistory = Record<string, string[]>;

/** Whether `key` is the calendar day immediately after `prevKey`. */
export function isConsecutiveDay(prevKey: string, key: string): boolean {
  const a = new Date(`${prevKey}T00:00:00`);
  const b = new Date(`${key}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000) === 1;
}

/** Whether at least one set was completed on a given day. */
function kept(history: AdhkarHistory, key: string): boolean {
  return (history[key]?.length ?? 0) > 0;
}

/**
 * The current streak: consecutive days with at least one completed set, ending
 * today — or yesterday, so a day that simply hasn't been done yet doesn't break
 * the run.
 */
export function currentStreak(history: AdhkarHistory, today: Date = new Date()): number {
  let streak = 0;
  const cursor = new Date(today);

  if (!kept(history, dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  for (let i = 0; i < 3660; i += 1) {
    if (kept(history, dayKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/** Record a completed set for a day, keeping the list unique. */
export function recordCompletion(
  history: AdhkarHistory,
  categoryId: string,
  today: Date = new Date(),
): AdhkarHistory {
  const key = dayKey(today);
  const existing = history[key] ?? [];
  if (existing.includes(categoryId)) return history;
  return { ...history, [key]: [...existing, categoryId] };
}
