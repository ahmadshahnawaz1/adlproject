/**
 * prayerLog — the offline prayer-tracking engine.
 *
 * Records how each of the five daily obligations was performed, per calendar
 * day, and derives everything the dashboard shows: streaks, completion trends,
 * and the outstanding qaza (missed-prayer) debt. Pure logic + AsyncStorage —
 * no UI, no network. Days are keyed 'YYYY-MM-DD' in the user's local zone so
 * the record lines up with what they actually saw on the schedule.
 */
import AsyncStorage from './scopedStorage';
import { dayKey } from './clock';
import type { PrayerName } from './prayerTimes';

export const LOG_KEY = 'adl.prayerLog.v1';

/** The five obligatory prayers, in order (sunrise is not an obligation). */
export const OBLIGATORY: Exclude<PrayerName, 'sunrise'>[] = [
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

export type ObligatoryName = (typeof OBLIGATORY)[number];

/**
 * How a prayer was performed.
 *   • jamaah  — prayed in congregation (the highest reward)
 *   • ontime  — prayed alone within its window
 *   • late    — prayed within the window but towards its end
 *   • qaza    — its window passed, then made up (counts as prayed, flagged)
 *   • missed  — its window passed unprayed (an outstanding qaza debt)
 *   • none    — not yet logged
 */
export type PrayerStatus = 'jamaah' | 'ontime' | 'late' | 'qaza' | 'missed' | 'none';

/** The five statuses for a single day. */
export type DayLog = Record<ObligatoryName, PrayerStatus>;

/** The whole record: day key → that day's statuses. */
export type PrayerLog = Record<string, Partial<DayLog>>;

/** A status counts as "prayed" (fulfilled) for streak/completion purposes. */
export function isPrayed(s: PrayerStatus | undefined): boolean {
  return s === 'jamaah' || s === 'ontime' || s === 'late' || s === 'qaza';
}

/**
 * Which statuses "count" toward completion and streaks. The default is lenient
 * (any fulfilled prayer keeps the day); a strict set can require on-time or
 * congregation only. Callers pass this through so the user's tracker preference
 * shapes every derived figure consistently.
 */
export type KeptOptions = { kept?: PrayerStatus[] };

export const DEFAULT_KEPT: PrayerStatus[] = ['jamaah', 'ontime', 'late', 'qaza'];
export const STRICT_KEPT: PrayerStatus[] = ['jamaah', 'ontime'];

function counts(status: PrayerStatus, opts?: KeptOptions): boolean {
  return (opts?.kept ?? DEFAULT_KEPT).includes(status);
}

/** The forward order the tap cycle moves through. */
const CYCLE: PrayerStatus[] = ['none', 'jamaah', 'ontime', 'late', 'qaza', 'missed'];

/** Advance a status one step around the logging cycle. */
export function nextStatus(s: PrayerStatus | undefined): PrayerStatus {
  const i = CYCLE.indexOf(s ?? 'none');
  return CYCLE[(i + 1) % CYCLE.length];
}

// dayKey is centralized in lib/clock; re-exported for existing importers.
export { dayKey };

/** Read the full log from storage (empty object on first run / error). */
export async function loadLog(): Promise<PrayerLog> {
  try {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as PrayerLog) : {};
  } catch {
    return {};
  }
}

/** Persist the full log. */
export async function saveLog(log: PrayerLog): Promise<void> {
  try {
    await AsyncStorage.setItem(LOG_KEY, JSON.stringify(log));
  } catch {
    // Non-fatal; the in-memory copy remains the source of truth this session.
  }
}

/** A normalised full day (missing entries become 'none'). */
export function dayOf(log: PrayerLog, key: string): DayLog {
  const d = log[key] ?? {};
  return {
    fajr: d.fajr ?? 'none',
    dhuhr: d.dhuhr ?? 'none',
    asr: d.asr ?? 'none',
    maghrib: d.maghrib ?? 'none',
    isha: d.isha ?? 'none',
  };
}

/** How many of the five were prayed on a given day. */
export function prayedCount(day: DayLog, opts?: KeptOptions): number {
  return OBLIGATORY.reduce((n, p) => n + (counts(day[p], opts) ? 1 : 0), 0);
}

/** True when all five obligations were fulfilled that day. */
export function isComplete(day: DayLog, opts?: KeptOptions): boolean {
  return prayedCount(day, opts) === 5;
}

/**
 * The current streak: consecutive complete days ending today (or yesterday, so
 * a day that simply hasn't finished yet doesn't break a run). Looks back up to
 * a generous horizon.
 */
export function currentStreak(
  log: PrayerLog,
  today: Date = new Date(),
  opts?: KeptOptions,
): number {
  let streak = 0;
  const cursor = new Date(today);

  // If today isn't complete yet, the streak can still stand on prior days.
  const todayComplete = isComplete(dayOf(log, dayKey(cursor)), opts);
  if (!todayComplete) cursor.setDate(cursor.getDate() - 1);

  for (let i = 0; i < 3660; i += 1) {
    if (isComplete(dayOf(log, dayKey(cursor)), opts)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/** The longest complete-day streak anywhere in the record. */
export function bestStreak(log: PrayerLog, opts?: KeptOptions): number {
  const keys = Object.keys(log).sort();
  if (keys.length === 0) return 0;
  let best = 0;
  let run = 0;
  let prev: string | null = null;

  for (const k of keys) {
    if (!isComplete(dayOf(log, k), opts)) {
      run = 0;
      prev = k;
      continue;
    }
    if (prev && isConsecutive(prev, k)) run += 1;
    else run = 1;
    best = Math.max(best, run);
    prev = k;
  }
  return best;
}

function isConsecutive(prevKey: string, key: string): boolean {
  const a = new Date(`${prevKey}T00:00:00`);
  const b = new Date(`${key}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000) === 1;
}

export type RangeStat = { key: string; prayed: number; complete: boolean; date: Date };

/** Per-day stats for the last `days` days (oldest → newest), for charts. */
export function lastNDays(
  log: PrayerLog,
  days: number,
  today: Date = new Date(),
  opts?: KeptOptions,
): RangeStat[] {
  const out: RangeStat[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    const day = dayOf(log, k);
    out.push({ key: k, date: d, prayed: prayedCount(day, opts), complete: isComplete(day, opts) });
  }
  return out;
}

export type LogStats = {
  streak: number;
  best: number;
  /** Complete days ÷ tracked days over the window, 0..1. */
  consistency: number;
  /** Total prayers fulfilled over the window. */
  prayed: number;
  /** Of the maximum possible over the window. */
  possible: number;
  /** Outstanding qaza debt: 'missed' entries not yet made up. */
  qazaDebt: number;
  /** Prayers prayed in congregation over the window. */
  jamaah: number;
};

/** Aggregate stats across a trailing window plus the all-time qaza debt. */
export function computeStats(
  log: PrayerLog,
  windowDays = 30,
  today: Date = new Date(),
  opts?: KeptOptions,
): LogStats {
  const range = lastNDays(log, windowDays, today, opts);
  const prayed = range.reduce((n, r) => n + r.prayed, 0);
  const complete = range.filter((r) => r.complete).length;

  let jamaah = 0;
  for (const r of range) {
    const day = dayOf(log, r.key);
    for (const p of OBLIGATORY) if (day[p] === 'jamaah') jamaah += 1;
  }

  let qazaDebt = 0;
  for (const k of Object.keys(log)) {
    const day = dayOf(log, k);
    for (const p of OBLIGATORY) if (day[p] === 'missed') qazaDebt += 1;
  }

  return {
    streak: currentStreak(log, today, opts),
    best: bestStreak(log, opts),
    consistency: windowDays ? complete / windowDays : 0,
    prayed,
    possible: windowDays * 5,
    qazaDebt,
    jamaah,
  };
}
