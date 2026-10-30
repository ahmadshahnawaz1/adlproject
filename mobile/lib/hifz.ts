/**
 * lib/hifz — the spaced-repetition engine behind memorisation (F23).
 *
 * Each memorised āyah carries a review state; grading a recall updates that
 * state and schedules the next review for the day the āyah is most likely to be
 * slipping. The scheduler is an adaptation of SM-2: an ease factor tracks how
 * well an item is known, and the interval grows by that factor each time it is
 * recalled cleanly. A failed recall resets the interval but only dents the ease,
 * so one bad day does not undo weeks of work.
 *
 * Pure and synchronous — no storage, no React, fully tested.
 */
import { dayKey } from './clock';
import { SURAHS } from '../content/quran';
import { ayahKey } from './quran';

/** How well the memoriser recalled an āyah. */
export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy';

/** The scheduling state of one memorised āyah. */
export type ReviewState = {
  /** 'surah:ayah'. */
  id: string;
  /** Consecutive successful recalls (reset to 0 on a lapse). */
  reps: number;
  /** How easily this āyah is recalled; higher = longer gaps. */
  ease: number;
  /** Days until the next review. */
  intervalDays: number;
  /** The day this āyah is next due, as 'YYYY-MM-DD'. */
  dueKey: string;
  /** How many times it has been forgotten. */
  lapses: number;
};

export type ReviewMap = Record<string, ReviewState>;

export const MIN_EASE = 1.3;
export const START_EASE = 2.5;
/** Interval, in days, granted by the first two clean recalls. */
export const FIRST_INTERVAL = 1;
export const SECOND_INTERVAL = 3;
/** Beyond this, further growth adds little and risks losing the āyah. */
export const MAX_INTERVAL = 180;

const EASE_DELTA: Record<ReviewGrade, number> = {
  again: -0.2,
  hard: -0.15,
  good: 0,
  easy: 0.15,
};

function clampEase(ease: number): number {
  return Math.max(MIN_EASE, Math.round(ease * 100) / 100);
}

/** Shift a day key by whole days. */
export function addDays(key: string, days: number): string {
  const d = new Date(`${key}T12:00:00`);
  d.setDate(d.getDate() + days);
  return dayKey(d);
}

/** A freshly memorised āyah, due for its first review today. */
export function newReview(id: string, today: Date = new Date()): ReviewState {
  return {
    id,
    reps: 0,
    ease: START_EASE,
    intervalDays: 0,
    dueKey: dayKey(today),
    lapses: 0,
  };
}

/**
 * Apply a recall grade and schedule the next review.
 * `again` restarts the ladder (and counts a lapse); the others advance it.
 */
export function gradeReview(
  state: ReviewState,
  grade: ReviewGrade,
  today: Date = new Date(),
): ReviewState {
  const ease = clampEase(state.ease + EASE_DELTA[grade]);
  const todayKey = dayKey(today);

  if (grade === 'again') {
    return {
      ...state,
      ease,
      reps: 0,
      lapses: state.lapses + 1,
      intervalDays: FIRST_INTERVAL,
      dueKey: addDays(todayKey, FIRST_INTERVAL),
    };
  }

  const reps = state.reps + 1;
  let intervalDays: number;
  if (reps === 1) intervalDays = FIRST_INTERVAL;
  else if (reps === 2) intervalDays = SECOND_INTERVAL;
  else {
    const factor = grade === 'hard' ? 1.2 : ease;
    intervalDays = Math.round(Math.max(1, state.intervalDays) * factor);
  }
  intervalDays = Math.min(MAX_INTERVAL, Math.max(1, intervalDays));

  return { ...state, ease, reps, intervalDays, dueKey: addDays(todayKey, intervalDays) };
}

/** Whether an āyah is due for review on (or before) a given day. */
export function isDue(state: ReviewState, today: Date = new Date()): boolean {
  return state.dueKey <= dayKey(today);
}

/** Everything due today, oldest due date first. */
export function dueReviews(map: ReviewMap, today: Date = new Date()): ReviewState[] {
  return Object.values(map)
    .filter((s) => isDue(s, today))
    .sort((a, b) => (a.dueKey < b.dueKey ? -1 : a.dueKey > b.dueKey ? 1 : a.id.localeCompare(b.id)));
}

/** How many āyahs are waiting today. */
export function dueCount(map: ReviewMap, today: Date = new Date()): number {
  return dueReviews(map, today).length;
}

/**
 * How firmly an āyah is held, 0–1, from its interval. Used for the UI's
 * strength bar — an āyah on a long interval is well established.
 */
export function strength(state: ReviewState): number {
  if (state.reps === 0) return 0;
  return Math.max(0, Math.min(1, state.intervalDays / 60));
}

/** A memorised surah's coverage. */
export type SurahProgress = {
  surah: number;
  memorised: number;
  total: number;
  /** 0–1. */
  fraction: number;
  due: number;
};

/** Progress within one surah, given the review map. */
export function surahProgress(
  map: ReviewMap,
  surah: number,
  today: Date = new Date(),
): SurahProgress {
  const meta = SURAHS.find((s) => s.number === surah);
  const total = meta?.ayahCount ?? 0;
  let memorised = 0;
  let due = 0;
  for (let a = 1; a <= total; a++) {
    const state = map[ayahKey(surah, a)];
    if (!state) continue;
    memorised += 1;
    if (isDue(state, today)) due += 1;
  }
  return {
    surah,
    memorised,
    total,
    fraction: total === 0 ? 0 : memorised / total,
    due,
  };
}

/** Every surah the memoriser has begun, most complete first. */
export function startedSurahs(map: ReviewMap, today: Date = new Date()): SurahProgress[] {
  const touched = new Set<number>();
  for (const id of Object.keys(map)) {
    const surah = Number(id.split(':')[0]);
    if (Number.isFinite(surah)) touched.add(surah);
  }
  return [...touched]
    .map((s) => surahProgress(map, s, today))
    .sort((a, b) => b.fraction - a.fraction || a.surah - b.surah);
}

/** Total āyahs memorised across the whole muṣḥaf. */
export function totalMemorised(map: ReviewMap): number {
  return Object.keys(map).length;
}

/** A short, human label for when an āyah returns. */
export function dueLabel(state: ReviewState, today: Date = new Date()): string {
  const todayKey = dayKey(today);
  if (state.dueKey <= todayKey) return 'Due now';
  const days = Math.round(
    (new Date(`${state.dueKey}T12:00:00`).getTime() - new Date(`${todayKey}T12:00:00`).getTime()) /
      86400000,
  );
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `In ${days} days`;
  if (days < 30) return `In ${Math.round(days / 7)} weeks`;
  return `In ${Math.round(days / 30)} months`;
}
