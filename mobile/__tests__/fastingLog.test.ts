import {
  bestFastStreak,
  computeFastStats,
  currentFastStreak,
  dayKey,
  entryOf,
  isFasted,
  nextFastStatus,
  ramadanTally,
  type FastingLog,
} from '../lib/fastingLog';

/** Key for a date offset (in days) from a base date. */
function keyAt(base: Date, deltaDays: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + deltaDays);
  return dayKey(d);
}

const TODAY = new Date(2026, 2, 20, 12, 0, 0);

describe('fastingLog · status helpers', () => {
  test('isFasted is true only for a kept fast', () => {
    expect(isFasted('fasted')).toBe(true);
    expect(isFasted('broke')).toBe(false);
    expect(isFasted('exempt')).toBe(false);
    expect(isFasted('none')).toBe(false);
    expect(isFasted(undefined)).toBe(false);
  });

  test('nextFastStatus cycles none → fasted → broke → exempt → none', () => {
    expect(nextFastStatus('none')).toBe('fasted');
    expect(nextFastStatus('fasted')).toBe('broke');
    expect(nextFastStatus('broke')).toBe('exempt');
    expect(nextFastStatus('exempt')).toBe('none');
    expect(nextFastStatus(undefined)).toBe('fasted');
  });

  test('entryOf defaults a missing day to none', () => {
    expect(entryOf({}, '2026-03-20')).toEqual({ status: 'none' });
    expect(entryOf({ '2026-03-20': { status: 'fasted' } }, '2026-03-20')).toEqual({
      status: 'fasted',
    });
  });
});

describe('fastingLog · streaks', () => {
  test('currentFastStreak counts consecutive fasted days ending today', () => {
    const log: FastingLog = {
      [keyAt(TODAY, 0)]: { status: 'fasted' },
      [keyAt(TODAY, -1)]: { status: 'fasted' },
      [keyAt(TODAY, -2)]: { status: 'fasted' },
      [keyAt(TODAY, -3)]: { status: 'broke' },
    };
    expect(currentFastStreak(log, TODAY)).toBe(3);
  });

  test('a not-yet-logged today does not break the run', () => {
    const log: FastingLog = {
      [keyAt(TODAY, -1)]: { status: 'fasted' },
      [keyAt(TODAY, -2)]: { status: 'fasted' },
    };
    expect(currentFastStreak(log, TODAY)).toBe(2);
  });

  test('a broken today resets the current streak', () => {
    const log: FastingLog = {
      [keyAt(TODAY, 0)]: { status: 'broke' },
      [keyAt(TODAY, -1)]: { status: 'fasted' },
    };
    // Today broke → cursor steps back; yesterday fasted counts.
    expect(currentFastStreak(log, TODAY)).toBe(1);
  });

  test('bestFastStreak finds the longest consecutive run', () => {
    const log: FastingLog = {
      [keyAt(TODAY, -10)]: { status: 'fasted' },
      [keyAt(TODAY, -9)]: { status: 'fasted' },
      [keyAt(TODAY, -8)]: { status: 'fasted' },
      [keyAt(TODAY, -7)]: { status: 'fasted' },
      [keyAt(TODAY, -6)]: { status: 'broke' },
      [keyAt(TODAY, -5)]: { status: 'fasted' },
      [keyAt(TODAY, -4)]: { status: 'fasted' },
    };
    expect(bestFastStreak(log)).toBe(4);
    expect(bestFastStreak({})).toBe(0);
  });
});

describe('fastingLog · stats & tally', () => {
  test('computeFastStats totals each status', () => {
    const log: FastingLog = {
      [keyAt(TODAY, 0)]: { status: 'fasted' },
      [keyAt(TODAY, -1)]: { status: 'fasted' },
      [keyAt(TODAY, -2)]: { status: 'exempt', reason: 'illness' },
      [keyAt(TODAY, -3)]: { status: 'broke' },
    };
    const s = computeFastStats(log, TODAY);
    expect(s.fastedTotal).toBe(2);
    expect(s.exemptTotal).toBe(1);
    expect(s.brokeTotal).toBe(1);
    expect(s.streak).toBe(2);
  });

  test('ramadanTally rolls up a list of dates', () => {
    const dates = [new Date(2026, 2, 1), new Date(2026, 2, 2), new Date(2026, 2, 3)];
    const log: FastingLog = {
      [dayKey(dates[0])]: { status: 'fasted' },
      [dayKey(dates[1])]: { status: 'fasted' },
      [dayKey(dates[2])]: { status: 'exempt', reason: 'travel' },
    };
    expect(ramadanTally(log, dates)).toEqual({
      fasted: 2,
      exempt: 1,
      broke: 0,
      logged: 3,
      total: 3,
    });
  });
});
