import {
  computeStreak,
  dayKey,
  isConsecutiveDay,
  lastNDayKeys,
  longestStreak,
} from '../lib/streak';

/** A fixed reference date so tests never depend on "now". */
const TODAY = new Date('2026-06-13T09:00:00');

/** Build a day key `offset` days from TODAY (negative = past). */
function keyFromToday(offset: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offset);
  return dayKey(d);
}

describe('streak · dayKey', () => {
  test('formats as ISO YYYY-MM-DD', () => {
    expect(dayKey(new Date('2026-01-05T12:00:00'))).toBe('2026-01-05');
  });

  test('is stable for the same calendar day regardless of time', () => {
    expect(dayKey(new Date('2026-06-13T00:01:00'))).toBe(
      dayKey(new Date('2026-06-13T23:59:00')),
    );
  });
});

describe('streak · isConsecutiveDay', () => {
  test('true for adjacent days', () => {
    expect(isConsecutiveDay('2026-06-12', '2026-06-13')).toBe(true);
  });

  test('false for the same day', () => {
    expect(isConsecutiveDay('2026-06-13', '2026-06-13')).toBe(false);
  });

  test('false for a two-day gap', () => {
    expect(isConsecutiveDay('2026-06-11', '2026-06-13')).toBe(false);
  });

  test('handles month boundaries', () => {
    expect(isConsecutiveDay('2026-01-31', '2026-02-01')).toBe(true);
  });

  test('false when reversed', () => {
    expect(isConsecutiveDay('2026-06-13', '2026-06-12')).toBe(false);
  });
});

describe('streak · computeStreak', () => {
  test('zero when nothing is complete', () => {
    expect(computeStreak(() => false, TODAY)).toBe(0);
  });

  test('counts a run ending today', () => {
    const done = new Set([keyFromToday(0), keyFromToday(-1), keyFromToday(-2)]);
    expect(computeStreak((k) => done.has(k), TODAY)).toBe(3);
  });

  test("today pending doesn't break the run (counts from yesterday)", () => {
    const done = new Set([keyFromToday(-1), keyFromToday(-2)]);
    expect(computeStreak((k) => done.has(k), TODAY)).toBe(2);
  });

  test('today pending counts as a clean 0-length run only when yesterday is also missing', () => {
    const done = new Set([keyFromToday(-3)]);
    expect(computeStreak((k) => done.has(k), TODAY)).toBe(0);
  });

  test('a gap stops the count', () => {
    const done = new Set([keyFromToday(0), keyFromToday(-1), keyFromToday(-3)]);
    expect(computeStreak((k) => done.has(k), TODAY)).toBe(2);
  });

  test('allowTodayPending=false breaks the run when today is incomplete', () => {
    const done = new Set([keyFromToday(-1), keyFromToday(-2)]);
    expect(
      computeStreak((k) => done.has(k), TODAY, { allowTodayPending: false }),
    ).toBe(0);
  });

  test('respects maxLookback', () => {
    expect(computeStreak(() => true, TODAY, { maxLookback: 5 })).toBe(5);
  });
});

describe('streak · longestStreak', () => {
  test('zero for an empty set', () => {
    expect(longestStreak([])).toBe(0);
  });

  test('finds the longest run regardless of order or duplicates', () => {
    const keys = [
      '2026-06-01',
      '2026-06-02',
      '2026-06-02', // duplicate
      '2026-06-03',
      '2026-06-10', // isolated
      '2026-06-12',
      '2026-06-13',
    ];
    expect(longestStreak(keys)).toBe(3);
  });

  test('single day is a run of one', () => {
    expect(longestStreak(['2026-06-13'])).toBe(1);
  });
});

describe('streak · lastNDayKeys', () => {
  test('returns n keys oldest → newest ending today', () => {
    expect(lastNDayKeys(3, TODAY)).toEqual([
      keyFromToday(-2),
      keyFromToday(-1),
      keyFromToday(0),
    ]);
  });

  test('the last entry is always today', () => {
    const keys = lastNDayKeys(14, TODAY);
    expect(keys).toHaveLength(14);
    expect(keys[keys.length - 1]).toBe(dayKey(TODAY));
  });
});
