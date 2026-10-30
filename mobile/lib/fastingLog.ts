/**
 * fastingLog — the offline fasting-tracking engine.
 *
 * Records how each day was observed (fasted, broke, or exempt with a reason),
 * keyed 'YYYY-MM-DD' in the user's local zone, and derives streaks and tallies.
 * Pure logic + AsyncStorage — no UI, no network. Mirrors prayerLog so the two
 * trackers behave identically.
 */
import AsyncStorage from './scopedStorage';
import { dayKey } from './clock';
import type { ExemptReason, FastingStatus } from '../content/fasting/fasting';

export const FASTING_LOG_KEY = 'adl.fastingLog.v1';

/** A single day's record. */
export type FastEntry = {
  status: FastingStatus;
  /** Present when status is 'exempt' — why the fast was not kept. */
  reason?: ExemptReason;
};

/** The whole record: day key → that day's entry. */
export type FastingLog = Record<string, FastEntry>;

/** A status that counts as a fast actually kept. */
export function isFasted(s: FastingStatus | undefined): boolean {
  return s === 'fasted';
}

/** The forward order the tap cycle moves through. */
const CYCLE: FastingStatus[] = ['none', 'fasted', 'broke', 'exempt'];

/** Advance a status one step around the logging cycle. */
export function nextFastStatus(s: FastingStatus | undefined): FastingStatus {
  const i = CYCLE.indexOf(s ?? 'none');
  return CYCLE[(i + 1) % CYCLE.length];
}

// dayKey is centralized in lib/clock; re-exported for existing importers.
export { dayKey };

/** Read the full log from storage (empty object on first run / error). */
export async function loadFastingLog(): Promise<FastingLog> {
  try {
    const raw = await AsyncStorage.getItem(FASTING_LOG_KEY);
    return raw ? (JSON.parse(raw) as FastingLog) : {};
  } catch {
    return {};
  }
}

/** Persist the full log. */
export async function saveFastingLog(log: FastingLog): Promise<void> {
  try {
    await AsyncStorage.setItem(FASTING_LOG_KEY, JSON.stringify(log));
  } catch {
    // Non-fatal; the in-memory copy remains the source of truth this session.
  }
}

/** The entry for a day (missing becomes status 'none'). */
export function entryOf(log: FastingLog, key: string): FastEntry {
  return log[key] ?? { status: 'none' };
}

function isConsecutive(prevKey: string, key: string): boolean {
  const a = new Date(`${prevKey}T00:00:00`);
  const b = new Date(`${key}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000) === 1;
}

/**
 * The current fasting streak: consecutive fasted days ending today (or
 * yesterday, so a day not yet logged doesn't break a run).
 */
export function currentFastStreak(log: FastingLog, today: Date = new Date()): number {
  let streak = 0;
  const cursor = new Date(today);

  if (!isFasted(entryOf(log, dayKey(cursor)).status)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  for (let i = 0; i < 3660; i += 1) {
    if (isFasted(entryOf(log, dayKey(cursor)).status)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/** The longest run of consecutive fasted days anywhere in the record. */
export function bestFastStreak(log: FastingLog): number {
  const keys = Object.keys(log).sort();
  if (keys.length === 0) return 0;
  let best = 0;
  let run = 0;
  let prev: string | null = null;

  for (const k of keys) {
    if (!isFasted(entryOf(log, k).status)) {
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

export type FastStats = {
  /** Current consecutive fasted days. */
  streak: number;
  /** Best run ever. */
  best: number;
  /** All-time days fasted. */
  fastedTotal: number;
  /** All-time days exempted (candidates for make-up / fidyah). */
  exemptTotal: number;
  /** All-time days broken without a recorded excuse. */
  brokeTotal: number;
};

/** Aggregate fasting stats across the whole record. */
export function computeFastStats(log: FastingLog, today: Date = new Date()): FastStats {
  let fastedTotal = 0;
  let exemptTotal = 0;
  let brokeTotal = 0;
  for (const k of Object.keys(log)) {
    const s = entryOf(log, k).status;
    if (s === 'fasted') fastedTotal += 1;
    else if (s === 'exempt') exemptTotal += 1;
    else if (s === 'broke') brokeTotal += 1;
  }
  return {
    streak: currentFastStreak(log, today),
    best: bestFastStreak(log),
    fastedTotal,
    exemptTotal,
    brokeTotal,
  };
}

export type RamadanTally = {
  fasted: number;
  exempt: number;
  broke: number;
  logged: number;
  total: number;
};

/** Roll up a list of Ramadan dates (Gregorian) against the log. */
export function ramadanTally(log: FastingLog, dates: Date[]): RamadanTally {
  let fasted = 0;
  let exempt = 0;
  let broke = 0;
  for (const d of dates) {
    const s = entryOf(log, dayKey(d)).status;
    if (s === 'fasted') fasted += 1;
    else if (s === 'exempt') exempt += 1;
    else if (s === 'broke') broke += 1;
  }
  return { fasted, exempt, broke, logged: fasted + exempt + broke, total: dates.length };
}
