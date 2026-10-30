/**
 * fastingLedger — the offline make-up (qaḍāʾ) fasting ledger.
 *
 * A worshipper often carries a backlog of fasts owed — days broken for travel,
 * illness, menses or other excuses, to be made up before the next Ramadan.
 * This is an event-sourced ledger: every owed fast and every make-up is a dated
 * entry with a signed delta (+1 owed, −1 repaid), so the outstanding balance is
 * the running sum and the whole history can be reviewed. It also carries the
 * pure fidyah and kaffārah calculators. Pure logic + AsyncStorage — no UI.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FASTING_LEDGER_KEY = 'adl.fastingLedger.v1';

/** A single movement in the make-up ledger. */
export type FastLedgerEntry = {
  id: string;
  /** ISO timestamp of when it was recorded. */
  ts: string;
  /** Signed: positive adds owed fasts, negative repays them. */
  delta: number;
  /** Optional human note ("missed in Ramadan 1446 — travel", etc.). */
  note?: string;
};

export type FastLedger = { entries: FastLedgerEntry[] };

export const EMPTY_FAST_LEDGER: FastLedger = { entries: [] };

/** A small, collision-resistant id without external deps. */
export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Read the ledger from storage (empty on first run / error). */
export async function loadFastLedger(): Promise<FastLedger> {
  try {
    const raw = await AsyncStorage.getItem(FASTING_LEDGER_KEY);
    if (!raw) return { entries: [] };
    const parsed = JSON.parse(raw) as Partial<FastLedger>;
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
  } catch {
    return { entries: [] };
  }
}

/** Persist the ledger. */
export async function saveFastLedger(ledger: FastLedger): Promise<void> {
  try {
    await AsyncStorage.setItem(FASTING_LEDGER_KEY, JSON.stringify(ledger));
  } catch {
    // Non-fatal; the in-memory copy stays the source of truth this session.
  }
}

/** Append a movement, returning a new ledger (immutable). */
export function addEntry(ledger: FastLedger, delta: number, note?: string): FastLedger {
  if (!Number.isFinite(delta) || delta === 0) return ledger;
  const entry: FastLedgerEntry = {
    id: newId(),
    ts: new Date().toISOString(),
    delta: Math.round(delta),
    ...(note ? { note } : {}),
  };
  return { entries: [...ledger.entries, entry] };
}

/** Remove a single movement by id. */
export function removeEntry(ledger: FastLedger, id: string): FastLedger {
  return { entries: ledger.entries.filter((e) => e.id !== id) };
}

/** Raw signed running total (may be negative if over-repaid). */
export function rawBalance(ledger: FastLedger): number {
  return ledger.entries.reduce((n, e) => n + e.delta, 0);
}

/** Outstanding fasts still owed, never below zero. */
export function totalOutstanding(ledger: FastLedger): number {
  return Math.max(0, rawBalance(ledger));
}

/** Lifetime owed (sum of all positive deltas). */
export function totalAdded(ledger: FastLedger): number {
  return ledger.entries.reduce((n, e) => n + (e.delta > 0 ? e.delta : 0), 0);
}

/** Lifetime made up (sum of all repayments, as a positive number). */
export function totalRepaid(ledger: FastLedger): number {
  return ledger.entries.reduce((n, e) => n + (e.delta < 0 ? -e.delta : 0), 0);
}

/** Repayment progress 0..1 (made up ÷ ever owed). 1 when nothing was ever owed. */
export function repaidFraction(ledger: FastLedger): number {
  const added = totalAdded(ledger);
  if (added <= 0) return 1;
  return Math.min(1, totalRepaid(ledger) / added);
}

export type FastHistoryRow = FastLedgerEntry & { balance: number };

/**
 * Entries newest-first, each carrying the outstanding balance immediately after
 * it was applied — so the debt's story reads at a glance.
 */
export function history(ledger: FastLedger): FastHistoryRow[] {
  const chrono = [...ledger.entries].sort((a, b) => a.ts.localeCompare(b.ts));
  let running = 0;
  const withBalance: FastHistoryRow[] = chrono.map((e) => {
    running = Math.max(0, running + e.delta);
    return { ...e, balance: running };
  });
  return withBalance.reverse();
}

/** Cumulative outstanding-balance points (oldest → newest) for a sparkline. */
export function balanceSeries(ledger: FastLedger): number[] {
  const chrono = [...ledger.entries].sort((a, b) => a.ts.localeCompare(b.ts));
  const points: number[] = [0];
  let running = 0;
  for (const e of chrono) {
    running = Math.max(0, running + e.delta);
    points.push(running);
  }
  return points;
}

/* ------------------------------------------------------------------ *
 * Fidyah & Kaffārah — pure calculators
 * ------------------------------------------------------------------ */

/**
 * Fidyah: feeding one needy person for each fast one is permanently unable to
 * keep (e.g. the elderly or chronically ill). Total = days × per-day cost.
 */
export function fidyahTotal(days: number, perDay: number): number {
  const d = Math.max(0, Math.floor(days));
  const p = Math.max(0, perDay);
  return Math.round(d * p * 100) / 100;
}

/** The expiation for deliberately breaking a Ramadan fast without excuse. */
export const KAFFARAH = {
  /** Fast two consecutive lunar months. */
  consecutiveFasts: 60,
  /** Or feed sixty needy people. */
  feedPeople: 60,
} as const;

/** Total cost of the feeding option of kaffārah at a per-person rate. */
export function kaffarahFeedTotal(perPerson: number): number {
  return Math.round(Math.max(0, perPerson) * KAFFARAH.feedPeople * 100) / 100;
}
