/**
 * quranKhatm — the offline Qurʾān completion (khatm) pace planner.
 *
 * Given a target (the whole muṣḥaf by default), a start and finish date, and
 * how many pages have been read, it works out the daily target, whether the
 * reader is ahead or behind today, and a projected finish date at the current
 * rate. Pure math — the hook owns the stored numbers.
 */

/** Pages in the standard Madīnah muṣḥaf. */
export const QURAN_TOTAL_PAGES = 604;
/** Parts (ajzāʾ) of the Qurʾān. */
export const QURAN_TOTAL_JUZ = 30;
/** Pages per juzʾ (≈ 20.13). */
export const PAGES_PER_JUZ = QURAN_TOTAL_PAGES / QURAN_TOTAL_JUZ;

function atMidnight(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/** Whole days from `a` to `b` (can be negative), counting calendar days. */
export function daysBetween(a: Date, b: Date): number {
  return Math.round((atMidnight(b) - atMidnight(a)) / 86_400_000);
}

export type KhatmStatus = 'notStarted' | 'behind' | 'onPace' | 'ahead' | 'done';

export type KhatmPace = {
  /** Fraction complete, 0..1. */
  pctDone: number;
  pagesRead: number;
  pagesRemaining: number;
  /** Total days in the plan (start → end, inclusive). */
  totalDays: number;
  /** 1-based day number within the plan (clamped to the plan span). */
  dayIndex: number;
  /** Days from today to the finish date (0 if past). */
  daysRemaining: number;
  /** Even pace from the start to finish on time. */
  targetPerDay: number;
  /** Pace needed from today to still finish on time. */
  neededPerDay: number;
  /** Pages a reader on perfect pace would have read by now. */
  expectedByNow: number;
  /** pagesRead − expectedByNow (negative = behind). */
  aheadBy: number;
  status: KhatmStatus;
  /** Projected finish at the current rate, or null if no progress yet. */
  projectedFinishISO: string | null;
};

/**
 * Compute the full pace picture. `current` is pages read; the plan runs from
 * `startISO` to `endISO`; `now` defaults to the present.
 */
export function khatmPace(opts: {
  total?: number;
  current: number;
  startISO: string;
  endISO: string;
  now?: Date;
}): KhatmPace {
  const total = Math.max(1, Math.floor(opts.total ?? QURAN_TOTAL_PAGES));
  const current = Math.min(total, Math.max(0, Math.floor(opts.current)));
  const start = new Date(opts.startISO);
  const end = new Date(opts.endISO);
  const now = opts.now ?? new Date();

  const totalDays = Math.max(1, daysBetween(start, end) + 1);
  const elapsed = Math.min(totalDays, Math.max(0, daysBetween(start, now) + 1));
  const daysRemaining = Math.max(0, daysBetween(now, end));

  const pagesRemaining = Math.max(0, total - current);
  const targetPerDay = total / totalDays;
  const neededPerDay = daysRemaining > 0 ? pagesRemaining / daysRemaining : pagesRemaining;
  const expectedByNow = Math.min(total, targetPerDay * elapsed);
  const aheadBy = current - expectedByNow;
  const pctDone = current / total;

  // Projected finish from the current daily rate.
  let projectedFinishISO: string | null = null;
  if (current >= total) {
    projectedFinishISO = now.toISOString();
  } else if (current > 0 && elapsed > 0) {
    const rate = current / elapsed; // pages/day so far
    if (rate > 0) {
      const daysToFinish = Math.ceil(pagesRemaining / rate);
      const finish = new Date(now);
      finish.setDate(finish.getDate() + daysToFinish);
      projectedFinishISO = finish.toISOString();
    }
  }

  let status: KhatmStatus;
  if (current >= total) status = 'done';
  else if (current === 0 && elapsed <= 0) status = 'notStarted';
  else if (aheadBy >= targetPerDay) status = 'ahead';
  else if (aheadBy <= -targetPerDay) status = 'behind';
  else status = 'onPace';

  return {
    pctDone,
    pagesRead: current,
    pagesRemaining,
    totalDays,
    dayIndex: elapsed,
    daysRemaining,
    targetPerDay,
    neededPerDay,
    expectedByNow,
    aheadBy,
    status,
    projectedFinishISO,
  };
}

/** Pages → "juzʾ X · page Y" friendly position. */
export function pageToJuz(page: number): number {
  return Math.min(QURAN_TOTAL_JUZ, Math.max(1, Math.ceil(page / PAGES_PER_JUZ)));
}
