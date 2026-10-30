/**
 * charity — the offline ṣadaqah & zakat giving ledger.
 *
 * Where the Zakat calculator tells a worshipper *what* is due, this records
 * what they have actually *given*: every gift is a dated, categorised entry
 * with an amount and (optionally) one of the eight Qurʾānic recipient classes.
 * The running total, the amount given within the current ḥawl, the per-category
 * split and a giving sparkline all fall out of that event log.
 *
 * Pure logic + AsyncStorage — no UI, no native modules. This is what the unit
 * tests exercise and what the cards render from.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { formatMoney } from './zakat';

export const CHARITY_LOG_KEY = 'adl.charityLog.v1';

/** The kinds of giving the ledger tracks. */
export type CharityCategory =
  | 'zakat'
  | 'sadaqah'
  | 'sadaqah-jariyah'
  | 'fitrana'
  | 'fidya-kaffara';

export type CharityCategoryMeta = {
  id: CharityCategory;
  label: string;
  arabic: string;
  /** A one-line description shown in the picker. */
  note: string;
  /** Lucide icon name, resolved by the UI layer. */
  icon: string;
};

/** Display metadata for each category, in canonical display order. */
export const CHARITY_CATEGORIES: CharityCategoryMeta[] = [
  {
    id: 'zakat',
    label: 'Zakāt',
    arabic: 'زكاة',
    note: 'The obligatory annual due on qualifying wealth.',
    icon: 'Scale',
  },
  {
    id: 'sadaqah',
    label: 'Ṣadaqah',
    arabic: 'صدقة',
    note: 'Voluntary charity given to seek Allah\u2019s pleasure.',
    icon: 'HandCoins',
  },
  {
    id: 'sadaqah-jariyah',
    label: 'Ṣadaqah jāriyah',
    arabic: 'صدقة جارية',
    note: 'Ongoing charity whose reward keeps flowing — a well, a tree, knowledge.',
    icon: 'Sprout',
  },
  {
    id: 'fitrana',
    label: 'Zakāt al-Fiṭr',
    arabic: 'زكاة الفطر',
    note: 'The fast-breaking charity due before the ʿĪd prayer.',
    icon: 'Wheat',
  },
  {
    id: 'fidya-kaffara',
    label: 'Fidya & Kaffāra',
    arabic: 'فدية وكفّارة',
    note: 'Expiation for missed fasts or broken oaths.',
    icon: 'Utensils',
  },
];

export const DEFAULT_CHARITY_CATEGORY: CharityCategory = 'sadaqah';

/** Look up the metadata for a category id. */
export function categoryMeta(id: CharityCategory): CharityCategoryMeta | undefined {
  return CHARITY_CATEGORIES.find((c) => c.id === id);
}

/** Human label for a category id (falls back to the raw id). */
export function categoryLabel(id: CharityCategory): string {
  return categoryMeta(id)?.label ?? id;
}

/** A single recorded gift. */
export type CharityEntry = {
  id: string;
  /** ISO timestamp of when the gift was given. */
  ts: string;
  /** A positive amount in `currency`. */
  amount: number;
  currency: string;
  category: CharityCategory;
  /** Optional aṣnāf recipient id (see content/zakat/recipients.ts). */
  recipientId?: string;
  /** Optional free-form note ("Local masjid build", "Orphan sponsorship"). */
  note?: string;
};

export type CharityLog = { entries: CharityEntry[] };

export const EMPTY_CHARITY_LOG: CharityLog = { entries: [] };

/** The fields needed to record (or amend) a gift. */
export type CharityInput = {
  amount: number;
  currency: string;
  category: CharityCategory;
  recipientId?: string;
  note?: string;
  /** ISO timestamp; defaults to now when omitted. */
  ts?: string;
};

/** A small, collision-resistant id without external deps. */
export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function round2(n: number): number {
  return Math.round((isFinite(n) ? n : 0) * 100) / 100;
}

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/* ------------------------------------------------------------------ *
 * Persistence
 * ------------------------------------------------------------------ */

/** Read the ledger from storage (empty on first run / error). */
export async function loadCharityLog(): Promise<CharityLog> {
  try {
    const raw = await AsyncStorage.getItem(CHARITY_LOG_KEY);
    if (!raw) return { entries: [] };
    const parsed = JSON.parse(raw) as Partial<CharityLog>;
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
  } catch {
    return { entries: [] };
  }
}

/** Persist the ledger. */
export async function saveCharityLog(log: CharityLog): Promise<void> {
  try {
    await AsyncStorage.setItem(CHARITY_LOG_KEY, JSON.stringify(log));
  } catch {
    // Non-fatal; the in-memory copy stays the source of truth this session.
  }
}

/* ------------------------------------------------------------------ *
 * Mutations (immutable)
 * ------------------------------------------------------------------ */

/** Record a gift, returning a new ledger. Ignores non-positive amounts. */
export function addEntry(log: CharityLog, input: CharityInput): CharityLog {
  if (!Number.isFinite(input.amount) || input.amount <= 0) return log;
  const entry: CharityEntry = {
    id: newId(),
    ts: input.ts ?? new Date().toISOString(),
    amount: round2(input.amount),
    currency: input.currency || 'USD',
    category: input.category,
    ...(input.recipientId ? { recipientId: input.recipientId } : {}),
    ...(input.note && input.note.trim() ? { note: input.note.trim() } : {}),
  };
  return { entries: [...log.entries, entry] };
}

/** Remove a single gift by id. */
export function removeEntry(log: CharityLog, id: string): CharityLog {
  return { entries: log.entries.filter((e) => e.id !== id) };
}

/**
 * Amend an existing gift. Only the fields present in `patch` change; passing an
 * empty string for `recipientId`/`note` clears that field. A non-positive
 * amount in the patch is ignored (the old amount stays).
 */
export function editEntry(log: CharityLog, id: string, patch: Partial<CharityInput>): CharityLog {
  return {
    entries: log.entries.map((e) => {
      if (e.id !== id) return e;
      const next: CharityEntry = {
        ...e,
        amount:
          patch.amount !== undefined && Number.isFinite(patch.amount) && patch.amount > 0
            ? round2(patch.amount)
            : e.amount,
        currency: patch.currency ?? e.currency,
        category: patch.category ?? e.category,
        ts: patch.ts ?? e.ts,
      };
      if (patch.recipientId !== undefined) {
        if (patch.recipientId) next.recipientId = patch.recipientId;
        else delete next.recipientId;
      }
      if (patch.note !== undefined) {
        const trimmed = patch.note.trim();
        if (trimmed) next.note = trimmed;
        else delete next.note;
      }
      return next;
    }),
  };
}

/* ------------------------------------------------------------------ *
 * Derivations
 * ------------------------------------------------------------------ */

/** Lifetime total given across every entry. */
export function totalGiven(log: CharityLog): number {
  return round2(log.entries.reduce((n, e) => n + e.amount, 0));
}

/** Number of recorded gifts. */
export function countGifts(log: CharityLog): number {
  return log.entries.length;
}

/** Total given within an inclusive [fromISO, toISO] window. */
export function totalInRange(log: CharityLog, fromISO: string, toISO: string): number {
  const from = new Date(fromISO).getTime();
  const to = new Date(toISO).getTime();
  if (!isFinite(from) || !isFinite(to)) return 0;
  return round2(
    log.entries.reduce((n, e) => {
      const t = new Date(e.ts).getTime();
      return t >= from && t <= to ? n + e.amount : n;
    }, 0),
  );
}

/** Total given from `sinceISO` up to `now` (inclusive). */
export function totalSince(log: CharityLog, sinceISO: string, now: Date = new Date()): number {
  const since = new Date(sinceISO).getTime();
  if (!isFinite(since)) return 0;
  return round2(
    log.entries.reduce((n, e) => {
      const t = new Date(e.ts).getTime();
      return t >= since && t <= now.getTime() ? n + e.amount : n;
    }, 0),
  );
}

/**
 * Total given within the current ḥawl (the lunar-year holding period that began
 * at `hawlStartISO`). Zero when no ḥawl has started.
 */
export function totalThisHawl(
  log: CharityLog,
  hawlStartISO: string | null,
  now: Date = new Date(),
): number {
  if (!hawlStartISO) return 0;
  return totalSince(log, hawlStartISO, now);
}

export type CategoryTotal = { category: CharityCategory; total: number; count: number };

/** Per-category totals, in canonical category order, omitting empty categories. */
export function byCategory(log: CharityLog): CategoryTotal[] {
  const map = new Map<CharityCategory, { total: number; count: number }>();
  for (const e of log.entries) {
    const cur = map.get(e.category) ?? { total: 0, count: 0 };
    cur.total += e.amount;
    cur.count += 1;
    map.set(e.category, cur);
  }
  return CHARITY_CATEGORIES.filter((c) => map.has(c.id)).map((c) => {
    const v = map.get(c.id)!;
    return { category: c.id, total: round2(v.total), count: v.count };
  });
}

/** Entries newest-first, for the history list. */
export function history(log: CharityLog): CharityEntry[] {
  return [...log.entries].sort((a, b) => b.ts.localeCompare(a.ts));
}

/** Cumulative giving points (oldest → newest) for a sparkline. */
export function givingSeries(log: CharityLog): number[] {
  const chrono = [...log.entries].sort((a, b) => a.ts.localeCompare(b.ts));
  const points: number[] = [0];
  let running = 0;
  for (const e of chrono) {
    running += e.amount;
    points.push(round2(running));
  }
  return points;
}

export type MonthBucket = { key: string; label: string; total: number };

/** Totals bucketed into the last `months` calendar months (oldest → newest). */
export function monthlyTotals(
  log: CharityLog,
  months: number,
  now: Date = new Date(),
): MonthBucket[] {
  const span = Math.max(1, Math.floor(months));
  const out: MonthBucket[] = [];
  for (let i = span - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: MONTH_LABELS[d.getMonth()],
      total: 0,
    });
  }
  const idx = new Map(out.map((b, i) => [b.key, i] as const));
  for (const e of log.entries) {
    const d = new Date(e.ts);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const i = idx.get(key);
    if (i !== undefined) out[i].total = round2(out[i].total + e.amount);
  }
  return out;
}

/** Re-exported from the zakat engine so cards can format amounts from one import. */
export { formatMoney };
