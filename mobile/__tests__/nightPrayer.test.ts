import {
  computeNightWindow,
  formatDuration,
  nightCountdown,
  nightPhase,
  reminderTimeFor,
  type NightWindow,
} from '../lib/nightPrayer';

// A clean 8-hour night: Maghrib 20:00 → Fajr 04:00 next day.
const MAGHRIB = new Date('2026-06-13T20:00:00');
const FAJR = new Date('2026-06-14T04:00:00');

function buildWindow(): NightWindow {
  return computeNightWindow(MAGHRIB, FAJR);
}

describe('nightPrayer · computeNightWindow', () => {
  test('splits the night into three equal thirds', () => {
    const w = buildWindow();
    expect(w.durationMs).toBe(8 * 3600_000);
    // 8h / 3 = 2h40m. second third at 22:40, last third at 01:20.
    expect(w.secondThirdStart.toISOString()).toBe(
      new Date('2026-06-13T22:40:00').toISOString(),
    );
    expect(w.lastThirdStart.toISOString()).toBe(
      new Date('2026-06-14T01:20:00').toISOString(),
    );
  });

  test('the Islamic midnight is the midpoint between Maghrib and Fajr', () => {
    const w = buildWindow();
    expect(w.islamicMidnight.toISOString()).toBe(
      new Date('2026-06-14T00:00:00').toISOString(),
    );
  });

  test('the three thirds tile the night contiguously', () => {
    const w = buildWindow();
    expect(w.thirds).toHaveLength(3);
    expect(w.thirds[0].start.getTime()).toBe(w.maghrib.getTime());
    expect(w.thirds[0].end.getTime()).toBe(w.thirds[1].start.getTime());
    expect(w.thirds[1].end.getTime()).toBe(w.thirds[2].start.getTime());
    expect(w.thirds[2].end.getTime()).toBe(w.fajr.getTime());
    expect(w.thirds.map((t) => t.key)).toEqual(['first', 'middle', 'last']);
  });
});

describe('nightPrayer · nightPhase', () => {
  const w = buildWindow();

  test('before Maghrib is the evening', () => {
    expect(nightPhase(new Date('2026-06-13T19:00:00'), w)).toBe('evening');
  });
  test('the first third', () => {
    expect(nightPhase(new Date('2026-06-13T21:00:00'), w)).toBe('firstThird');
  });
  test('the middle third', () => {
    expect(nightPhase(new Date('2026-06-13T23:30:00'), w)).toBe('middleThird');
  });
  test('the last third', () => {
    expect(nightPhase(new Date('2026-06-14T02:00:00'), w)).toBe('lastThird');
  });
  test('at or after Fajr it is day', () => {
    expect(nightPhase(new Date('2026-06-14T04:00:00'), w)).toBe('day');
    expect(nightPhase(new Date('2026-06-14T05:00:00'), w)).toBe('day');
  });
  test('the Maghrib instant opens the first third', () => {
    expect(nightPhase(MAGHRIB, w)).toBe('firstThird');
  });
  test('the last-third instant is the last third', () => {
    expect(nightPhase(w.lastThirdStart, w)).toBe('lastThird');
  });
});

describe('nightPrayer · nightCountdown', () => {
  const w = buildWindow();

  test('in the middle third it counts down to the last third', () => {
    const c = nightCountdown(new Date('2026-06-13T23:20:00'), w);
    expect(c.phase).toBe('middleThird');
    expect(c.toLastThird).toBe(120 * 60000); // 2h to 01:20
    expect(c.label).toBe('Last third in 2h');
  });

  test('in the last third it counts down to Fajr', () => {
    const c = nightCountdown(new Date('2026-06-14T03:19:00'), w);
    expect(c.phase).toBe('lastThird');
    expect(c.toFajr).toBe(41 * 60000);
    expect(c.label).toBe('Fajr in 41m');
  });

  test('after Fajr the night has ended', () => {
    const c = nightCountdown(new Date('2026-06-14T05:00:00'), w);
    expect(c.phase).toBe('day');
    expect(c.label).toBe('The night has ended');
  });

  test('before Maghrib it counts down to the night', () => {
    const c = nightCountdown(new Date('2026-06-13T19:30:00'), w);
    expect(c.phase).toBe('evening');
    expect(c.toMaghrib).toBe(30 * 60000);
    expect(c.label).toBe('Night begins in 30m');
  });
});

describe('nightPrayer · formatDuration', () => {
  test('formats hours and minutes', () => {
    expect(formatDuration(2 * 3600_000 + 14 * 60000)).toBe('2h 14m');
    expect(formatDuration(41 * 60000)).toBe('41m');
    expect(formatDuration(3 * 3600_000)).toBe('3h');
    expect(formatDuration(30_000)).toBe('<1m');
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(-5)).toBe('0m');
  });
});

describe('nightPrayer · reminderTimeFor', () => {
  const w = buildWindow();

  test('last-third start', () => {
    expect(reminderTimeFor(w, 'lastThirdStart').toISOString()).toBe(
      w.lastThirdStart.toISOString(),
    );
  });
  test('Islamic midnight', () => {
    expect(reminderTimeFor(w, 'islamicMidnight').toISOString()).toBe(
      w.islamicMidnight.toISOString(),
    );
  });
  test('a chosen number of minutes before Fajr', () => {
    expect(reminderTimeFor(w, 'beforeFajr', 30).toISOString()).toBe(
      new Date('2026-06-14T03:30:00').toISOString(),
    );
  });
  test('before-Fajr clamps a negative offset to Fajr itself', () => {
    expect(reminderTimeFor(w, 'beforeFajr', -10).toISOString()).toBe(
      w.fajr.toISOString(),
    );
  });
});
