/**
 * fasting.ts — the pure timing and calendar logic of the fast.
 *
 * Given a day's prayer times (from the offline engine) it derives the Imsāk,
 * Suhūr-end and Iftār moments, the current phase of the fasting day, the fast's
 * length and a live progress fraction, and the single most relevant countdown
 * target. Given a Hijri date it reports Ramadan position (day, ʿashra, last
 * ten, odd night) and counts forward to Hijri anniversaries (Ramadan, Eid).
 *
 * No I/O, no clocks of its own — every function takes its inputs, so the whole
 * module is deterministic and unit-tested.
 */
import type { DayPrayerTimes } from './prayerTimes';
import { toHijri, type HijriDate } from './hijriCalendar';
import { ODD_NIGHTS, RAMADAN_MONTH, SHAWWAL_MONTH } from '../content/fasting/fasting';
import {
  FORBIDDEN_FASTS,
  VOLUNTARY_FASTS,
  type FastWhen,
  type ForbiddenFast,
  type VoluntaryFast,
} from '../content/fasting/voluntaryFasts';

/* ------------------------------------------------------------------ *
 * The fasting day's moments
 * ------------------------------------------------------------------ */

export type FastTimes = {
  /** The cautious moment to stop eating: Fajr minus the Imsāk buffer. */
  imsak: Date;
  /** Eating is permitted until dawn — Suhūr ends at Fajr. */
  suhoorEnd: Date;
  fajr: Date;
  /** The fast is broken at sunset — Iftār is Maghrib. */
  iftar: Date;
  maghrib: Date;
};

/** Derive the fasting moments from a day's prayer times and an Imsāk buffer. */
export function fastTimes(day: DayPrayerTimes, imsakMinutes: number): FastTimes {
  const buffer = Math.max(0, imsakMinutes) * 60_000;
  return {
    imsak: new Date(day.fajr.getTime() - buffer),
    suhoorEnd: day.fajr,
    fajr: day.fajr,
    iftar: day.maghrib,
    maghrib: day.maghrib,
  };
}

/** The length of the fast (Fajr → Maghrib) in milliseconds. */
export function fastDurationMs(t: FastTimes): number {
  return Math.max(0, t.maghrib.getTime() - t.fajr.getTime());
}

export type FastPhase = 'preDawn' | 'fasting' | 'night';

/**
 * Which part of the fasting day `now` falls in:
 *   • preDawn — before Fajr (suhūr time, eating permitted)
 *   • fasting — between Fajr and Maghrib
 *   • night   — at or after Maghrib (the fast is over for today)
 */
export function fastPhase(now: Date, t: FastTimes): FastPhase {
  const ms = now.getTime();
  if (ms < t.fajr.getTime()) return 'preDawn';
  if (ms < t.maghrib.getTime()) return 'fasting';
  return 'night';
}

/** Progress through the fast as 0..1 — 0 before Fajr, 1 from Maghrib on. */
export function fastProgress(now: Date, t: FastTimes): number {
  const ms = now.getTime();
  if (ms <= t.fajr.getTime()) return 0;
  if (ms >= t.maghrib.getTime()) return 1;
  const span = t.maghrib.getTime() - t.fajr.getTime();
  return span > 0 ? (ms - t.fajr.getTime()) / span : 0;
}

export type CountdownTarget = {
  kind: 'suhoor' | 'iftar';
  label: string;
  at: Date;
};

/**
 * The single most relevant countdown for `now`. During the day it counts to
 * Iftār; before dawn it counts to the end of Suhūr; at night it counts to the
 * next Suhūr — which needs tomorrow's times, so pass them when known.
 */
export function countdownTarget(
  now: Date,
  today: FastTimes,
  tomorrow?: FastTimes,
): CountdownTarget {
  const phase = fastPhase(now, today);
  if (phase === 'fasting') {
    return { kind: 'iftar', label: 'Iftār in', at: today.iftar };
  }
  if (phase === 'preDawn') {
    return { kind: 'suhoor', label: 'Suhūr ends in', at: today.suhoorEnd };
  }
  // Night: count to tomorrow's suhūr end if we have it, else today's iftar past.
  if (tomorrow) {
    return { kind: 'suhoor', label: 'Suhūr ends in', at: tomorrow.suhoorEnd };
  }
  return { kind: 'iftar', label: 'Iftār was', at: today.iftar };
}

/* ------------------------------------------------------------------ *
 * Ramadan position
 * ------------------------------------------------------------------ */

export type RamadanInfo = {
  isRamadan: boolean;
  /** Day of Ramadan, 1..30 (0 when not Ramadan). */
  day: number;
  /** 0 = Mercy, 1 = Forgiveness, 2 = Refuge; -1 when not Ramadan. */
  ashraIndex: 0 | 1 | 2 | -1;
  isLastTen: boolean;
  /**
   * True when the Hijri day is an emphasised odd night within the last ten.
   * Note: the civil Hijri date rolls at midnight, so the blessed *night*
   * begins at the preceding sunset — the UI clarifies this.
   */
  isOddNight: boolean;
  /** Approximate days remaining in Ramadan (assumes 30; subject to sighting). */
  daysLeft: number;
};

/** Where a Hijri date sits within Ramadan. */
export function ramadanInfo(hijri: HijriDate): RamadanInfo {
  if (hijri.month !== RAMADAN_MONTH) {
    return { isRamadan: false, day: 0, ashraIndex: -1, isLastTen: false, isOddNight: false, daysLeft: 0 };
  }
  const day = hijri.day;
  const ashraIndex = day <= 10 ? 0 : day <= 20 ? 1 : 2;
  const isLastTen = day >= 21;
  const isOddNight = isLastTen && (ODD_NIGHTS as readonly number[]).includes(day);
  return {
    isRamadan: true,
    day,
    ashraIndex,
    isLastTen,
    isOddNight,
    daysLeft: Math.max(0, 30 - day),
  };
}

/**
 * Days from `from` until the next occurrence of a Hijri month + day, scanning
 * the offline Umm al-Qura calendar forward. Returns 0 when today matches, or
 * null if not found within `maxDays`. Estimates only — the real start of a
 * month follows the moon sighting.
 */
export function daysUntilHijri(
  target: { month: number; day: number },
  from: Date = new Date(),
  maxDays = 400,
): number | null {
  for (let i = 0; i <= maxDays; i += 1) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const h = toHijri(d);
    if (h.month === target.month && h.day === target.day) return i;
  }
  return null;
}

/** Approximate days until the 1st of Ramadan (0 if already in Ramadan). */
export function daysUntilRamadan(from: Date = new Date()): number | null {
  if (toHijri(from).month === RAMADAN_MONTH) return 0;
  return daysUntilHijri({ month: RAMADAN_MONTH, day: 1 }, from);
}

/** Approximate days until Eid al-Fiṭr (1 Shawwāl). */
export function daysUntilEidFitr(from: Date = new Date()): number | null {
  return daysUntilHijri({ month: SHAWWAL_MONTH, day: 1 }, from);
}

/* ------------------------------------------------------------------ *
 * Voluntary fasts — when the next one falls, and forbidden days
 * ------------------------------------------------------------------ */

/** Whether a given date satisfies a recommended-fast timing rule. */
export function matchesWhen(when: FastWhen, date: Date): boolean {
  switch (when.kind) {
    case 'weekday':
      return when.weekdays.includes(date.getDay());
    case 'monthlyDays':
      return when.days.includes(toHijri(date).day);
    case 'hijriDate': {
      const h = toHijri(date);
      return h.month === when.month && when.days.includes(h.day);
    }
    case 'hijriRange': {
      const h = toHijri(date);
      return h.month === when.month && h.day >= when.from && h.day <= when.to;
    }
    default:
      return false;
  }
}

/** The next date (from `from`, inclusive) matching a rule, or null. */
export function nextFastDate(when: FastWhen, from: Date = new Date(), maxDays = 400): Date | null {
  for (let i = 0; i <= maxDays; i += 1) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    if (matchesWhen(when, d)) return d;
  }
  return null;
}

export type VoluntarySuggestion = {
  fast: VoluntaryFast;
  date: Date;
  daysAway: number;
};

/**
 * The recommended fasts sorted by how soon they next occur, each annotated
 * with its next date and days away — the soonest first.
 */
export function upcomingVoluntaryFasts(from: Date = new Date()): VoluntarySuggestion[] {
  const base = new Date(from);
  base.setHours(0, 0, 0, 0);
  const out: VoluntarySuggestion[] = [];
  for (const fast of VOLUNTARY_FASTS) {
    const date = nextFastDate(fast.when, base);
    if (!date) continue;
    const daysAway = Math.round((date.getTime() - base.getTime()) / 86_400_000);
    out.push({ fast, date, daysAway });
  }
  return out.sort((a, b) => a.daysAway - b.daysAway);
}

/** The forbidden-fast day matching `date`, if any (Eids, Tashrīq). */
export function forbiddenFastOn(date: Date = new Date()): ForbiddenFast | null {
  return FORBIDDEN_FASTS.find((f) => matchesWhen(f.when, date)) ?? null;
}

/**
 * The Gregorian dates of the Ramadan that `from` falls in — or, if `from` is
 * outside Ramadan, the next upcoming Ramadan. Used to render the month grid
 * and to tally the month. Returns up to 30 dates (Ramadan 1 onward), capped at
 * the days the offline calendar marks as Ramadan.
 */
export function ramadanGridDates(from: Date = new Date()): Date[] {
  // Find Ramadan day 1.
  let start: Date | null = null;
  const here = toHijri(from);
  if (here.month === RAMADAN_MONTH) {
    start = new Date(from);
    start.setDate(start.getDate() - (here.day - 1));
  } else {
    const away = daysUntilHijri({ month: RAMADAN_MONTH, day: 1 }, from);
    if (away != null) {
      start = new Date(from);
      start.setDate(start.getDate() + away);
    }
  }
  if (!start) return [];
  start.setHours(0, 0, 0, 0);

  const dates: Date[] = [];
  for (let i = 0; i < 30; i += 1) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (toHijri(d).month !== RAMADAN_MONTH) break;
    dates.push(d);
  }
  return dates;
}
