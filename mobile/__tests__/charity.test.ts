import {
  CHARITY_CATEGORIES,
  addEntry,
  byCategory,
  categoryLabel,
  categoryMeta,
  countGifts,
  editEntry,
  EMPTY_CHARITY_LOG,
  formatMoney,
  givingSeries,
  history,
  monthlyTotals,
  removeEntry,
  totalGiven,
  totalInRange,
  totalSince,
  totalThisHawl,
  type CharityInput,
  type CharityLog,
} from '../lib/charity';

const NOW = new Date('2026-06-13T09:00:00.000Z');

/** Build a log from a list of partial inputs with explicit timestamps. */
function makeLog(inputs: CharityInput[]): CharityLog {
  return inputs.reduce<CharityLog>((log, input) => addEntry(log, input), EMPTY_CHARITY_LOG);
}

describe('charity · categories', () => {
  test('exposes five canonical categories in order', () => {
    expect(CHARITY_CATEGORIES.map((c) => c.id)).toEqual([
      'zakat',
      'sadaqah',
      'sadaqah-jariyah',
      'fitrana',
      'fidya-kaffara',
    ]);
  });

  test('every category carries a label, arabic and icon', () => {
    for (const c of CHARITY_CATEGORIES) {
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.arabic.length).toBeGreaterThan(0);
      expect(c.icon.length).toBeGreaterThan(0);
    }
  });

  test('categoryMeta / categoryLabel resolve a known id', () => {
    expect(categoryMeta('zakat')?.label).toBe('Zakāt');
    expect(categoryLabel('sadaqah')).toBe('Ṣadaqah');
  });
});

describe('charity · addEntry', () => {
  test('appends a positive gift with a generated id', () => {
    const log = addEntry(EMPTY_CHARITY_LOG, {
      amount: 50,
      currency: 'USD',
      category: 'sadaqah',
      ts: NOW.toISOString(),
    });
    expect(log.entries).toHaveLength(1);
    expect(log.entries[0].id).toMatch(/.+/);
    expect(log.entries[0].amount).toBe(50);
  });

  test('ignores non-positive and non-finite amounts', () => {
    let log = addEntry(EMPTY_CHARITY_LOG, { amount: 0, currency: 'USD', category: 'sadaqah' });
    log = addEntry(log, { amount: -10, currency: 'USD', category: 'sadaqah' });
    log = addEntry(log, { amount: NaN, currency: 'USD', category: 'sadaqah' });
    expect(log.entries).toHaveLength(0);
  });

  test('rounds the amount to two decimals', () => {
    const log = addEntry(EMPTY_CHARITY_LOG, {
      amount: 12.345,
      currency: 'GBP',
      category: 'zakat',
    });
    expect(log.entries[0].amount).toBe(12.35);
  });

  test('defaults the timestamp to now and is immutable', () => {
    const before = EMPTY_CHARITY_LOG;
    const log = addEntry(before, { amount: 5, currency: 'USD', category: 'sadaqah' });
    expect(before.entries).toHaveLength(0);
    expect(Number.isNaN(new Date(log.entries[0].ts).getTime())).toBe(false);
  });

  test('trims a note and omits empty note / recipient', () => {
    const withNote = addEntry(EMPTY_CHARITY_LOG, {
      amount: 5,
      currency: 'USD',
      category: 'sadaqah',
      note: '  masjid  ',
      recipientId: '',
    });
    expect(withNote.entries[0].note).toBe('masjid');
    expect(withNote.entries[0].recipientId).toBeUndefined();
  });
});

describe('charity · removeEntry / editEntry', () => {
  test('removeEntry drops the matching id only', () => {
    const log = makeLog([
      { amount: 10, currency: 'USD', category: 'sadaqah', ts: NOW.toISOString() },
      { amount: 20, currency: 'USD', category: 'zakat', ts: NOW.toISOString() },
    ]);
    const id = log.entries[0].id;
    const next = removeEntry(log, id);
    expect(next.entries).toHaveLength(1);
    expect(next.entries.find((e) => e.id === id)).toBeUndefined();
  });

  test('editEntry updates amount and category', () => {
    const log = makeLog([{ amount: 10, currency: 'USD', category: 'sadaqah' }]);
    const id = log.entries[0].id;
    const next = editEntry(log, id, { amount: 99, category: 'zakat' });
    expect(next.entries[0].amount).toBe(99);
    expect(next.entries[0].category).toBe('zakat');
  });

  test('editEntry clears a note with an empty string and ignores a bad amount', () => {
    const log = makeLog([
      { amount: 10, currency: 'USD', category: 'sadaqah', note: 'keep' },
    ]);
    const id = log.entries[0].id;
    const next = editEntry(log, id, { note: '', amount: -5 });
    expect(next.entries[0].note).toBeUndefined();
    expect(next.entries[0].amount).toBe(10);
  });
});

describe('charity · totals', () => {
  const log = makeLog([
    { amount: 100, currency: 'USD', category: 'zakat', ts: '2026-06-01T00:00:00.000Z' },
    { amount: 25, currency: 'USD', category: 'sadaqah', ts: '2026-06-10T00:00:00.000Z' },
    { amount: 25, currency: 'USD', category: 'sadaqah', ts: '2026-06-12T00:00:00.000Z' },
  ]);

  test('totalGiven sums every entry', () => {
    expect(totalGiven(log)).toBe(150);
  });

  test('countGifts counts the entries', () => {
    expect(countGifts(log)).toBe(3);
  });

  test('totalInRange respects inclusive bounds', () => {
    expect(
      totalInRange(log, '2026-06-05T00:00:00.000Z', '2026-06-12T00:00:00.000Z'),
    ).toBe(50);
  });

  test('totalSince counts entries from a start date up to now', () => {
    expect(totalSince(log, '2026-06-10T00:00:00.000Z', NOW)).toBe(50);
  });

  test('totalThisHawl is zero when no ḥawl has started', () => {
    expect(totalThisHawl(log, null, NOW)).toBe(0);
  });

  test('totalThisHawl counts gifts since the ḥawl start', () => {
    expect(totalThisHawl(log, '2026-06-02T00:00:00.000Z', NOW)).toBe(50);
  });
});

describe('charity · byCategory / history', () => {
  const log = makeLog([
    { amount: 100, currency: 'USD', category: 'zakat', ts: '2026-06-01T00:00:00.000Z' },
    { amount: 25, currency: 'USD', category: 'sadaqah', ts: '2026-06-10T00:00:00.000Z' },
    { amount: 75, currency: 'USD', category: 'sadaqah', ts: '2026-06-12T00:00:00.000Z' },
  ]);

  test('byCategory groups in canonical order, omitting empty categories', () => {
    const split = byCategory(log);
    expect(split.map((s) => s.category)).toEqual(['zakat', 'sadaqah']);
    expect(split[1]).toEqual({ category: 'sadaqah', total: 100, count: 2 });
  });

  test('history returns entries newest-first', () => {
    const rows = history(log);
    expect(rows[0].ts).toBe('2026-06-12T00:00:00.000Z');
    expect(rows[rows.length - 1].ts).toBe('2026-06-01T00:00:00.000Z');
  });
});

describe('charity · series', () => {
  test('givingSeries is a cumulative curve starting at zero', () => {
    const log = makeLog([
      { amount: 10, currency: 'USD', category: 'sadaqah', ts: '2026-06-01T00:00:00.000Z' },
      { amount: 5, currency: 'USD', category: 'sadaqah', ts: '2026-06-02T00:00:00.000Z' },
    ]);
    expect(givingSeries(log)).toEqual([0, 10, 15]);
  });

  test('monthlyTotals returns one bucket per requested month, newest last', () => {
    const log = makeLog([
      { amount: 40, currency: 'USD', category: 'sadaqah', ts: '2026-06-05T00:00:00.000Z' },
      { amount: 60, currency: 'USD', category: 'sadaqah', ts: '2026-05-05T00:00:00.000Z' },
    ]);
    const buckets = monthlyTotals(log, 3, NOW);
    expect(buckets).toHaveLength(3);
    expect(buckets[buckets.length - 1].total).toBe(40);
    expect(buckets[buckets.length - 2].total).toBe(60);
  });
});

describe('charity · formatMoney re-export', () => {
  test('formats a currency amount', () => {
    expect(formatMoney(150, 'USD')).toBe('$150');
  });
});
