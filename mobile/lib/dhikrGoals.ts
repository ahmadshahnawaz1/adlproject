/**
 * lib/dhikrGoals.ts — the pure engine behind the Dhikr Goals hub (F10).
 *
 * It unites two existing daily acts of worship — the tasbīḥ count (F4) and the
 * morning/evening adhkār (F2) — into a small set of configurable daily goals,
 * and from the day-by-day record draws a unified streak and a trend. A day is
 * "complete" when every *active* goal is met: the tasbīḥ target reached (when
 * set) and the chosen adhkār sets done. No React, no storage, no native
 * modules — inputs in, numbers out, so it is trivially testable.
 */
import { computeStreak, lastNDayKeys, longestStreak } from './streak';

/* ------------------------------------------------------------------ *
 * configuration
 * ------------------------------------------------------------------ */

/** The user's chosen daily goals. */
export type DhikrGoalConfig = {
  /** Count the morning adhkār toward the day. */
  morningAdhkar: boolean;
  /** Count the evening adhkār toward the day. */
  eveningAdhkar: boolean;
  /** Daily tasbīḥ target (0 turns the tasbīḥ goal off). */
  tasbihTarget: number;
};

export const DEFAULT_GOAL_CONFIG: DhikrGoalConfig = {
  morningAdhkar: true,
  eveningAdhkar: true,
  tasbihTarget: 100,
};

/** Bounds + step for the tasbīḥ-target stepper. */
export const MIN_TASBIH_TARGET = 0;
export const MAX_TASBIH_TARGET = 1000;
export const TASBIH_TARGET_STEP = 33;

/** The adhkār set ids this feature reads from the adhkār history. */
export const MORNING_SET_ID = 'morning';
export const EVENING_SET_ID = 'evening';

/** Snap a proposed tasbīḥ target into the allowed range. */
export function clampTasbihTarget(n: number): number {
  return Math.max(MIN_TASBIH_TARGET, Math.min(MAX_TASBIH_TARGET, Math.round(n)));
}

/** How many goals are currently switched on. */
export function activeGoalCount(config: DhikrGoalConfig): number {
  return (
    (config.morningAdhkar ? 1 : 0) +
    (config.eveningAdhkar ? 1 : 0) +
    (config.tasbihTarget > 0 ? 1 : 0)
  );
}

/* ------------------------------------------------------------------ *
 * the day record + ledger
 * ------------------------------------------------------------------ */

/** What the hub itself records per day (the adhkār are read from F2). */
export type DhikrDayRecord = {
  /** Remembrances counted on the beads that day. */
  tasbih: number;
};

/** day key ('YYYY-MM-DD') → that day's tasbīḥ record. */
export type DhikrLedger = Record<string, DhikrDayRecord>;

/** The full picture of one day, assembled from the ledger + adhkār history. */
export type DhikrDayInputs = {
  tasbih: number;
  morningDone: boolean;
  eveningDone: boolean;
};

/** The record for one day (zeroed when untouched). */
export function dayRecord(ledger: DhikrLedger, key: string): DhikrDayRecord {
  return ledger[key] ?? { tasbih: 0 };
}

/** Add (or subtract) tasbīḥ for a day, never below zero. Returns a fresh ledger. */
export function recordTasbih(
  ledger: DhikrLedger,
  key: string,
  delta: number,
): DhikrLedger {
  const prev = dayRecord(ledger, key).tasbih;
  const next = Math.max(0, prev + delta);
  if (next === prev) return ledger;
  return { ...ledger, [key]: { tasbih: next } };
}

/**
 * The adhkār completion history (day → completed set ids) is owned by F2; we
 * only read it. This keeps a thin alias so call-sites read clearly.
 */
export type AdhkarCompletion = Record<string, string[]>;

/** Assemble a day's inputs from the tasbīḥ ledger + the adhkār history. */
export function dayInputs(
  ledger: DhikrLedger,
  adhkar: AdhkarCompletion,
  key: string,
): DhikrDayInputs {
  const completed = adhkar[key] ?? [];
  return {
    tasbih: dayRecord(ledger, key).tasbih,
    morningDone: completed.includes(MORNING_SET_ID),
    eveningDone: completed.includes(EVENING_SET_ID),
  };
}

/* ------------------------------------------------------------------ *
 * progress
 * ------------------------------------------------------------------ */

/** A full breakdown of how one day measures against the goals. */
export type GoalProgress = {
  tasbihCount: number;
  tasbihTarget: number;
  /** 0..1 fraction toward the tasbīḥ target (0 when the goal is off). */
  tasbihPct: number;
  tasbihActive: boolean;
  tasbihMet: boolean;
  morningActive: boolean;
  morningDone: boolean;
  eveningActive: boolean;
  eveningDone: boolean;
  /** Goals met today / goals switched on. */
  metGoals: number;
  totalGoals: number;
  /** Every active goal met (false when no goals are active). */
  allComplete: boolean;
};

/** Measure a single day's inputs against the goal config. */
export function goalProgress(
  inputs: DhikrDayInputs,
  config: DhikrGoalConfig,
): GoalProgress {
  const tasbihTarget = Math.max(0, Math.round(config.tasbihTarget));
  const tasbihActive = tasbihTarget > 0;
  const tasbihCount = Math.max(0, inputs.tasbih);
  const tasbihPct = tasbihActive
    ? Math.max(0, Math.min(1, tasbihCount / tasbihTarget))
    : 0;
  const tasbihMet = tasbihActive && tasbihCount >= tasbihTarget;

  const morningActive = config.morningAdhkar;
  const morningDone = morningActive && inputs.morningDone;
  const eveningActive = config.eveningAdhkar;
  const eveningDone = eveningActive && inputs.eveningDone;

  const totalGoals =
    (tasbihActive ? 1 : 0) + (morningActive ? 1 : 0) + (eveningActive ? 1 : 0);
  const metGoals =
    (tasbihMet ? 1 : 0) + (morningDone ? 1 : 0) + (eveningDone ? 1 : 0);
  const allComplete = totalGoals > 0 && metGoals === totalGoals;

  return {
    tasbihCount,
    tasbihTarget,
    tasbihPct,
    tasbihActive,
    tasbihMet,
    morningActive,
    morningDone,
    eveningActive,
    eveningDone,
    metGoals,
    totalGoals,
    allComplete,
  };
}

/** Whether a day meets every active goal. */
export function isDayComplete(
  inputs: DhikrDayInputs,
  config: DhikrGoalConfig,
): boolean {
  return goalProgress(inputs, config).allComplete;
}

/* ------------------------------------------------------------------ *
 * streak + trend
 * ------------------------------------------------------------------ */

/**
 * The current dhikr streak: consecutive days (ending today, forgiving a today
 * not yet done) on which every active goal was met.
 */
export function dhikrStreak(
  ledger: DhikrLedger,
  adhkar: AdhkarCompletion,
  config: DhikrGoalConfig,
  today: Date = new Date(),
): number {
  if (activeGoalCount(config) === 0) return 0;
  return computeStreak(
    (key) => isDayComplete(dayInputs(ledger, adhkar, key), config),
    today,
  );
}

/** The longest run of complete days ever recorded. */
export function dhikrBestStreak(
  ledger: DhikrLedger,
  adhkar: AdhkarCompletion,
  config: DhikrGoalConfig,
): number {
  if (activeGoalCount(config) === 0) return 0;
  const keys = new Set<string>([
    ...Object.keys(ledger),
    ...Object.keys(adhkar),
  ]);
  const complete: string[] = [];
  for (const key of keys) {
    if (isDayComplete(dayInputs(ledger, adhkar, key), config)) complete.push(key);
  }
  return longestStreak(complete);
}

/** One day's standing for the trend chart. */
export type DayTrend = {
  key: string;
  metGoals: number;
  totalGoals: number;
  complete: boolean;
  date: Date;
};

/** The last `days` days, oldest → newest, scored against the goals. */
export function dhikrTrend(
  ledger: DhikrLedger,
  adhkar: AdhkarCompletion,
  config: DhikrGoalConfig,
  days: number,
  today: Date = new Date(),
): DayTrend[] {
  return lastNDayKeys(days, today).map((key) => {
    const p = goalProgress(dayInputs(ledger, adhkar, key), config);
    return {
      key,
      metGoals: p.metGoals,
      totalGoals: p.totalGoals,
      complete: p.allComplete,
      date: new Date(`${key}T00:00:00`),
    };
  });
}
