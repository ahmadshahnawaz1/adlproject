import {
  DEFAULT_KEPT,
  STRICT_KEPT,
  bestStreak,
  computeStats,
  currentStreak,
  dayKey,
  dayOf,
  isComplete,
  isPrayed,
  lastNDays,
  nextStatus,
  prayedCount,
  type PrayerLog,
} from '../lib/prayerLog';

/** Build a 'YYYY-MM-DD' key for `today` shifted by `offset` days. */
function keyOffset(today: Date, offset: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return dayKey(d);
}

const FULL = { fajr: 'ontime', dhuhr: 'ontime', asr: 'ontime', maghrib: 'ontime', isha: 'ontime' } as const;

describe('prayerLog · status helpers', () => {
  test('isPrayed treats fulfilled states as prayed', () => {
    expect(isPrayed('jamaah')).toBe(true);
    expect(isPrayed('ontime')).toBe(true);
    expect(isPrayed('late')).toBe(true);
    expect(isPrayed('qaza')).toBe(true);
    expect(isPrayed('missed')).toBe(false);
    expect(isPrayed('none')).toBe(false);
    expect(isPrayed(undefined)).toBe(false);
  });

  test('nextStatus cycles through the full loop', () => {
    expect(nextStatus('none')).toBe('jamaah');
    expect(nextStatus('jamaah')).toBe('ontime');
    expect(nextStatus('ontime')).toBe('late');
    expect(nextStatus('late')).toBe('qaza');
    expect(nextStatus('qaza')).toBe('missed');
    expect(nextStatus('missed')).toBe('none');
  });

  test('dayOf normalises missing entries to none', () => {
    const log: PrayerLog = { '2026-01-01': { fajr: 'ontime' } };
    expect(dayOf(log, '2026-01-01')).toEqual({
      fajr: 'ontime',
      dhuhr: 'none',
      asr: 'none',
      maghrib: 'none',
      isha: 'none',
    });
    expect(dayOf(log, '2026-12-31').fajr).toBe('none');
  });
});

describe('prayerLog · counting and completion', () => {
  test('prayedCount counts fulfilled prayers (lenient default)', () => {
    const day = { fajr: 'jamaah', dhuhr: 'late', asr: 'qaza', maghrib: 'missed', isha: 'none' } as const;
    expect(prayedCount(day)).toBe(3);
  });

  test('strict kept excludes late and qaza', () => {
    const day = { fajr: 'jamaah', dhuhr: 'late', asr: 'qaza', maghrib: 'ontime', isha: 'none' } as const;
    expect(prayedCount(day, { kept: DEFAULT_KEPT })).toBe(4);
    expect(prayedCount(day, { kept: STRICT_KEPT })).toBe(2);
  });

  test('isComplete requires all five under the active rule', () => {
    expect(isComplete(FULL)).toBe(true);
    const lateDay = { ...FULL, isha: 'late' } as const;
    expect(isComplete(lateDay)).toBe(true);
    expect(isComplete(lateDay, { kept: STRICT_KEPT })).toBe(false);
  });
});

describe('prayerLog · streaks', () => {
  const today = new Date('2026-06-02T10:00:00');

  test('currentStreak counts consecutive complete days back from today', () => {
    const log: PrayerLog = {
      [keyOffset(today, 0)]: { ...FULL },
      [keyOffset(today, -1)]: { ...FULL },
      [keyOffset(today, -2)]: { ...FULL },
      [keyOffset(today, -4)]: { ...FULL },
    };
    expect(currentStreak(log, today)).toBe(3);
  });

  test('an unfinished today does not break the streak', () => {
    const log: PrayerLog = {
      [keyOffset(today, 0)]: { fajr: 'ontime' }, // partial today
      [keyOffset(today, -1)]: { ...FULL },
      [keyOffset(today, -2)]: { ...FULL },
    };
    expect(currentStreak(log, today)).toBe(2);
  });

  test('strict streak breaks on a late day', () => {
    const log: PrayerLog = {
      [keyOffset(today, 0)]: { ...FULL },
      [keyOffset(today, -1)]: { ...FULL, isha: 'late' },
      [keyOffset(today, -2)]: { ...FULL },
    };
    expect(currentStreak(log, today)).toBe(3);
    expect(currentStreak(log, today, { kept: STRICT_KEPT })).toBe(1);
  });

  test('bestStreak finds the longest run anywhere', () => {
    const log: PrayerLog = {
      [keyOffset(today, -10)]: { ...FULL },
      [keyOffset(today, -9)]: { ...FULL },
      [keyOffset(today, -8)]: { ...FULL },
      [keyOffset(today, -8 + 1)]: {}, // gap
      [keyOffset(today, -1)]: { ...FULL },
      [keyOffset(today, 0)]: { ...FULL },
    };
    expect(bestStreak(log)).toBe(3);
  });
});

describe('prayerLog · aggregate stats', () => {
  const today = new Date('2026-06-02T10:00:00');

  test('lastNDays returns oldest → newest with correct length', () => {
    const range = lastNDays({}, 7, today);
    expect(range).toHaveLength(7);
    expect(range[0].date.getTime()).toBeLessThan(range[6].date.getTime());
  });

  test('computeStats tallies qaza debt across all time', () => {
    const log: PrayerLog = {
      [keyOffset(today, 0)]: { ...FULL },
      [keyOffset(today, -1)]: { fajr: 'missed', dhuhr: 'missed', asr: 'ontime', maghrib: 'ontime', isha: 'ontime' },
      '2020-01-01': { fajr: 'missed' },
    };
    const stats = computeStats(log, 30, today);
    expect(stats.qazaDebt).toBe(3);
    expect(stats.streak).toBe(1);
    expect(stats.best).toBe(1);
    expect(stats.jamaah).toBe(0);
  });

  test('consistency is complete days over the window', () => {
    const log: PrayerLog = {
      [keyOffset(today, 0)]: { ...FULL },
      [keyOffset(today, -1)]: { ...FULL },
    };
    const stats = computeStats(log, 10, today);
    expect(stats.consistency).toBeCloseTo(2 / 10, 5);
    expect(stats.possible).toBe(50);
  });
});
