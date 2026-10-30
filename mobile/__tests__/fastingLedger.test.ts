import {
  EMPTY_FAST_LEDGER,
  KAFFARAH,
  addEntry,
  balanceSeries,
  fidyahTotal,
  history,
  kaffarahFeedTotal,
  rawBalance,
  removeEntry,
  repaidFraction,
  totalAdded,
  totalOutstanding,
  totalRepaid,
  type FastLedger,
} from '../lib/fastingLedger';

/** Build a ledger directly with explicit timestamps (stable ordering). */
function ledgerOf(rows: Array<{ id: string; ts: string; delta: number }>): FastLedger {
  return { entries: rows };
}

describe('fastingLedger · entries', () => {
  test('addEntry appends immutably', () => {
    const a = addEntry(EMPTY_FAST_LEDGER, 1);
    expect(a.entries).toHaveLength(1);
    expect(EMPTY_FAST_LEDGER.entries).toHaveLength(0);
    expect(a.entries[0]).toMatchObject({ delta: 1 });
    expect(typeof a.entries[0].id).toBe('string');
  });

  test('addEntry ignores zero and non-finite deltas', () => {
    expect(addEntry(EMPTY_FAST_LEDGER, 0)).toBe(EMPTY_FAST_LEDGER);
    expect(addEntry(EMPTY_FAST_LEDGER, NaN)).toBe(EMPTY_FAST_LEDGER);
    expect(addEntry(EMPTY_FAST_LEDGER, Infinity)).toBe(EMPTY_FAST_LEDGER);
  });

  test('addEntry rounds and keeps an optional note', () => {
    const a = addEntry(EMPTY_FAST_LEDGER, 2.6, 'Ramaḍān 1446 — travel');
    expect(a.entries[0].delta).toBe(3);
    expect(a.entries[0].note).toBe('Ramaḍān 1446 — travel');
  });

  test('removeEntry drops by id', () => {
    const led = ledgerOf([
      { id: 'x', ts: '2026-01-01T00:00:00.000Z', delta: 1 },
      { id: 'y', ts: '2026-01-02T00:00:00.000Z', delta: 1 },
    ]);
    expect(removeEntry(led, 'x').entries.map((e) => e.id)).toEqual(['y']);
  });
});

describe('fastingLedger · balances', () => {
  const led = ledgerOf([
    { id: '1', ts: '2026-01-01T00:00:00.000Z', delta: 6 },
    { id: '2', ts: '2026-01-02T00:00:00.000Z', delta: -1 },
    { id: '3', ts: '2026-01-03T00:00:00.000Z', delta: -2 },
  ]);

  test('rawBalance keeps the signed total', () => {
    expect(rawBalance(led)).toBe(3);
  });

  test('totalOutstanding clamps at zero', () => {
    expect(totalOutstanding(led)).toBe(3);
    const over = ledgerOf([
      { id: 'a', ts: '2026-01-01T00:00:00.000Z', delta: 2 },
      { id: 'b', ts: '2026-01-02T00:00:00.000Z', delta: -5 },
    ]);
    expect(totalOutstanding(over)).toBe(0);
  });

  test('totalAdded / totalRepaid track lifetime flows', () => {
    expect(totalAdded(led)).toBe(6);
    expect(totalRepaid(led)).toBe(3);
  });

  test('repaidFraction is capped and 1 when nothing was owed', () => {
    expect(repaidFraction(EMPTY_FAST_LEDGER)).toBe(1);
    expect(repaidFraction(led)).toBeCloseTo(0.5, 5);
    const over = ledgerOf([
      { id: 'a', ts: '2026-01-01T00:00:00.000Z', delta: 2 },
      { id: 'b', ts: '2026-01-02T00:00:00.000Z', delta: -5 },
    ]);
    expect(repaidFraction(over)).toBe(1);
  });
});

describe('fastingLedger · history & series', () => {
  const led = ledgerOf([
    { id: '1', ts: '2026-01-01T00:00:00.000Z', delta: 2 },
    { id: '2', ts: '2026-01-02T00:00:00.000Z', delta: 3 },
    { id: '3', ts: '2026-01-03T00:00:00.000Z', delta: -1 },
  ]);

  test('history is newest-first with a clamped running balance', () => {
    const rows = history(led);
    expect(rows.map((r) => r.id)).toEqual(['3', '2', '1']);
    expect(rows.map((r) => r.balance)).toEqual([4, 5, 2]);
  });

  test('balanceSeries starts at 0 and tracks cumulative balance', () => {
    expect(balanceSeries(led)).toEqual([0, 2, 5, 4]);
    expect(balanceSeries(EMPTY_FAST_LEDGER)).toEqual([0]);
  });
});

describe('fastingLedger · fidyah & kaffārah', () => {
  test('fidyahTotal multiplies days by per-day cost', () => {
    expect(fidyahTotal(30, 5)).toBe(150);
    expect(fidyahTotal(0, 5)).toBe(0);
    expect(fidyahTotal(-3, 5)).toBe(0);
    expect(fidyahTotal(2.9, 5)).toBe(10); // floors days
  });

  test('kaffārah constants and feeding total', () => {
    expect(KAFFARAH.consecutiveFasts).toBe(60);
    expect(KAFFARAH.feedPeople).toBe(60);
    expect(kaffarahFeedTotal(4)).toBe(240);
    expect(kaffarahFeedTotal(-1)).toBe(0);
  });
});
