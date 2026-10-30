/**
 * qazaLedger — the offline make-up (qaza) prayer ledger.
 *
 * The daily prayer log already flags a prayer "missed" for the current run of
 * days, but a real worshipper often carries a *lifelong* backlog — months or
 * years of prayers owed from before they started tracking. That cannot live in
 * the day grid; it needs its own running account that can be reviewed over time.
 *
 * This is an event-sourced ledger: every owed prayer and every make-up is a
 * dated entry with a signed delta (+1 owed, −1 repaid). The outstanding balance
 * is the running sum, so the user can always look back and see exactly how the
 * debt grew and shrank. Pure logic + AsyncStorage — no UI, no network.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OBLIGATORY, type ObligatoryName } from './prayerLog';

export const QAZA_KEY = 'adl.qazaLedger.v1';

/** A single movement in the ledger. */
export type QazaEntry = {
  id: string;
  /** ISO timestamp of when it was recorded. */
  ts: string;
  prayer: ObligatoryName;
  /** Signed: positive adds owed prayers, negative repays them. */
  delta: number;
  /** Optional human note ("backlog from travelling", etc.). */
  note?: string;
};

export type QazaLedger = { entries: QazaEntry[] };

export const EMPTY_LEDGER: QazaLedger = { entries: [] };

/** A zeroed per-prayer tally. */
export function zeroByPrayer(): Record<ObligatoryName, number> {
  return { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
}

/** A small, collision-resistant id without external deps. */
export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Read the ledger from storage (empty on first run / error). */
export async function loadLedger(): Promise<QazaLedger> {
  try {
    const raw = await AsyncStorage.getItem(QAZA_KEY);
    if (!raw) return { entries: [] };
    const parsed = JSON.parse(raw) as Partial<QazaLedger>;
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
  } catch {
    return { entries: [] };
  }
}

/** Persist the ledger. */
export async function saveLedger(ledger: QazaLedger): Promise<void> {
  try {
    await AsyncStorage.setItem(QAZA_KEY, JSON.stringify(ledger));
  } catch {
    // Non-fatal; the in-memory copy stays the source of truth this session.
  }
}

/** Append a movement, returning a new ledger (immutable). */
export function addEntry(
  ledger: QazaLedger,
  prayer: ObligatoryName,
  delta: number,
  note?: string,
): QazaLedger {
  if (!Number.isFinite(delta) || delta === 0) return ledger;
  const entry: QazaEntry = {
    id: newId(),
    ts: new Date().toISOString(),
    prayer,
    delta: Math.round(delta),
    ...(note ? { note } : {}),
  };
  return { entries: [...ledger.entries, entry] };
}

/** Remove a single movement by id. */
export function removeEntry(ledger: QazaLedger, id: string): QazaLedger {
  return { entries: ledger.entries.filter((e) => e.id !== id) };
}

/** Raw signed running total per prayer (may be negative if over-repaid). */
export function rawByPrayer(ledger: QazaLedger): Record<ObligatoryName, number> {
  const acc = zeroByPrayer();
  for (const e of ledger.entries) acc[e.prayer] += e.delta;
  return acc;
}

/** Outstanding owed per prayer, never below zero. */
export function outstandingByPrayer(ledger: QazaLedger): Record<ObligatoryName, number> {
  const raw = rawByPrayer(ledger);
  const out = zeroByPrayer();
  for (const p of OBLIGATORY) out[p] = Math.max(0, raw[p]);
  return out;
}

/** Total prayers still owed across all five. */
export function totalOutstanding(ledger: QazaLedger): number {
  const by = outstandingByPrayer(ledger);
  return OBLIGATORY.reduce((n, p) => n + by[p], 0);
}

/** Lifetime owed (sum of all positive deltas). */
export function totalAdded(ledger: QazaLedger): number {
  return ledger.entries.reduce((n, e) => n + (e.delta > 0 ? e.delta : 0), 0);
}

/** Lifetime made up (sum of all repayments, as a positive number). */
export function totalRepaid(ledger: QazaLedger): number {
  return ledger.entries.reduce((n, e) => n + (e.delta < 0 ? -e.delta : 0), 0);
}

/** Repayment progress 0..1 (made up ÷ ever owed). 1 when nothing was ever owed. */
export function repaidFraction(ledger: QazaLedger): number {
  const added = totalAdded(ledger);
  if (added <= 0) return 1;
  return Math.min(1, totalRepaid(ledger) / added);
}

export type QazaHistoryRow = QazaEntry & { balance: number };

/**
 * Entries newest-first, each carrying the *total outstanding balance* of the
 * whole ledger immediately after that entry was applied — so the user can read
 * the debt's story over time at a glance.
 */
export function history(ledger: QazaLedger): QazaHistoryRow[] {
  const chrono = [...ledger.entries].sort((a, b) => a.ts.localeCompare(b.ts));
  let running = 0;
  const withBalance: QazaHistoryRow[] = chrono.map((e) => {
    running = Math.max(0, running + e.delta);
    return { ...e, balance: running };
  });
  return withBalance.reverse();
}

/**
 * A series of cumulative outstanding-balance points (oldest → newest) for a
 * sparkline. Always includes a leading 0 so a single entry still draws a slope.
 */
export function balanceSeries(ledger: QazaLedger): number[] {
  const chrono = [...ledger.entries].sort((a, b) => a.ts.localeCompare(b.ts));
  const points: number[] = [0];
  let running = 0;
  for (const e of chrono) {
    running = Math.max(0, running + e.delta);
    points.push(running);
  }
  return points;
}
