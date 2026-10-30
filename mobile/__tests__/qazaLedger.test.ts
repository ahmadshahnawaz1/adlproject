import {
  EMPTY_LEDGER,
  addEntry,
  balanceSeries,
  history,
  outstandingByPrayer,
  rawByPrayer,
  removeEntry,
  repaidFraction,
  totalAdded,
  totalOutstanding,
  totalRepaid,
  zeroByPrayer,
  type QazaLedger,
} from '../lib/qazaLedger';

/** Build a ledger directly with explicit timestamps (stable ordering). */
function ledgerOf(
  rows: Array<{ id: string; ts: string; prayer: any; delta: number }>,
): QazaLedger {
  return { entries: rows };
}

describe('qazaLedger · entries', () => {
  test('zeroByPrayer is a fresh all-zero tally', () => {
    expect(zeroByPrayer()).toEqual({ fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 });
  });

  test('addEntry appends immutably', () => {
    const a = addEntry(EMPTY_LEDGER, 'fajr', 1);
    expect(a.entries).toHaveLength(1);
    expect(EMPTY_LEDGER.entries).toHaveLength(0);
    expect(a.entries[0]).toMatchObject({ prayer: 'fajr', delta: 1 });
    expect(typeof a.entries[0].id).toBe('string');
  });

  test('addEntry ignores zero and non-finite deltas', () => {
    expect(addEntry(EMPTY_LEDGER, 'fajr', 0)).toBe(EMPTY_LEDGER);
    expect(addEntry(EMPTY_LEDGER, 'fajr', NaN)).toBe(EMPTY_LEDGER);
    expect(addEntry(EMPTY_LEDGER, 'fajr', Infinity)).toBe(EMPTY_LEDGER);
  });

  test('addEntry rounds and keeps an optional note', () => {
    const a = addEntry(EMPTY_LEDGER, 'isha', 2.6, 'travel backlog');
    expect(a.entries[0].delta).toBe(3);
    expect(a.entries[0].note).toBe('travel backlog');
  });

  test('removeEntry drops by id', () => {
    const led = ledgerOf([
      { id: 'x', ts: '2026-01-01T00:00:00.000Z', prayer: 'fajr', delta: 1 },
      { id: 'y', ts: '2026-01-02T00:00:00.000Z', prayer: 'asr', delta: 1 },
    ]);
    expect(removeEntry(led, 'x').entries.map((e) => e.id)).toEqual(['y']);
  });
});

describe('qazaLedger · balances', () => {
  const led = ledgerOf([
    { id: '1', ts: '2026-01-01T00:00:00.000Z', prayer: 'fajr', delta: 3 },
    { id: '2', ts: '2026-01-02T00:00:00.000Z', prayer: 'fajr', delta: -1 },
    { id: '3', ts: '2026-01-03T00:00:00.000Z', prayer: 'asr', delta: 2 },
    { id: '4', ts: '2026-01-04T00:00:00.000Z', prayer: 'asr', delta: -5 }, // over-repaid
  ]);

  test('rawByPrayer keeps signed totals', () => {
    expect(rawByPrayer(led).fajr).toBe(2);
    expect(rawByPrayer(led).asr).toBe(-3);
  });

  test('outstandingByPrayer clamps each prayer at zero', () => {
    const out = outstandingByPrayer(led);
    expect(out.fajr).toBe(2);
    expect(out.asr).toBe(0);
  });

  test('totalOutstanding sums the clamped balances', () => {
    expect(totalOutstanding(led)).toBe(2);
  });

  test('totalAdded / totalRepaid track lifetime flows', () => {
    expect(totalAdded(led)).toBe(5);
    expect(totalRepaid(led)).toBe(6);
  });

  test('repaidFraction is capped at 1 and 1 when nothing was owed', () => {
    expect(repaidFraction(led)).toBe(1);
    expect(repaidFraction(EMPTY_LEDGER)).toBe(1);
    const partial = ledgerOf([
      { id: 'a', ts: '2026-01-01T00:00:00.000Z', prayer: 'fajr', delta: 4 },
      { id: 'b', ts: '2026-01-02T00:00:00.000Z', prayer: 'fajr', delta: -1 },
    ]);
    expect(repaidFraction(partial)).toBeCloseTo(0.25, 5);
  });
});

describe('qazaLedger · history & series', () => {
  const led = ledgerOf([
    { id: '1', ts: '2026-01-01T00:00:00.000Z', prayer: 'fajr', delta: 2 },
    { id: '2', ts: '2026-01-02T00:00:00.000Z', prayer: 'asr', delta: 1 },
    { id: '3', ts: '2026-01-03T00:00:00.000Z', prayer: 'fajr', delta: -1 },
  ]);

  test('history is newest-first with a clamped running balance', () => {
    const rows = history(led);
    expect(rows.map((r) => r.id)).toEqual(['3', '2', '1']);
    expect(rows.map((r) => r.balance)).toEqual([2, 3, 2]);
  });

  test('balanceSeries starts at 0 and tracks cumulative balance', () => {
    expect(balanceSeries(led)).toEqual([0, 2, 3, 2]);
    expect(balanceSeries(EMPTY_LEDGER)).toEqual([0]);
  });
});
