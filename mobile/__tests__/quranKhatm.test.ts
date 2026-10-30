import {
  PAGES_PER_JUZ,
  QURAN_TOTAL_JUZ,
  QURAN_TOTAL_PAGES,
  daysBetween,
  khatmPace,
  pageToJuz,
} from '../lib/quranKhatm';

const START = '2026-03-01T12:00:00.000Z';
const END = '2026-03-30T12:00:00.000Z'; // 30-day plan
const NOW = new Date('2026-03-10T12:00:00.000Z'); // day 10 of 30

describe('quranKhatm · constants & helpers', () => {
  test('muṣḥaf totals', () => {
    expect(QURAN_TOTAL_PAGES).toBe(604);
    expect(QURAN_TOTAL_JUZ).toBe(30);
    expect(PAGES_PER_JUZ).toBeCloseTo(20.133, 2);
  });

  test('daysBetween counts whole calendar days', () => {
    expect(daysBetween(new Date(2026, 2, 1), new Date(2026, 2, 10))).toBe(9);
    expect(daysBetween(new Date(2026, 2, 10), new Date(2026, 2, 1))).toBe(-9);
    expect(daysBetween(new Date(2026, 2, 5), new Date(2026, 2, 5))).toBe(0);
  });

  test('pageToJuz maps pages to their part', () => {
    expect(pageToJuz(1)).toBe(1);
    expect(pageToJuz(604)).toBe(30);
    expect(pageToJuz(302)).toBe(15);
    expect(pageToJuz(0)).toBe(1);
  });
});

describe('quranKhatm · pace', () => {
  test('plan spans the inclusive day count', () => {
    const p = khatmPace({ current: 0, startISO: START, endISO: END, now: NOW });
    expect(p.totalDays).toBe(30);
    expect(p.dayIndex).toBe(10);
    expect(p.daysRemaining).toBe(20);
    expect(p.targetPerDay).toBeCloseTo(604 / 30, 5);
  });

  test('on pace when read ≈ expected by now', () => {
    const p = khatmPace({ current: 201, startISO: START, endISO: END, now: NOW });
    expect(p.status).toBe('onPace');
  });

  test('ahead when comfortably past the expected line', () => {
    const p = khatmPace({ current: 320, startISO: START, endISO: END, now: NOW });
    expect(p.status).toBe('ahead');
    expect(p.aheadBy).toBeGreaterThan(0);
  });

  test('behind when well short', () => {
    const p = khatmPace({ current: 50, startISO: START, endISO: END, now: NOW });
    expect(p.status).toBe('behind');
    expect(p.aheadBy).toBeLessThan(0);
    expect(p.neededPerDay).toBeGreaterThan(p.targetPerDay);
  });

  test('done at or beyond the total', () => {
    const p = khatmPace({ current: 604, startISO: START, endISO: END, now: NOW });
    expect(p.status).toBe('done');
    expect(p.pagesRemaining).toBe(0);
    expect(p.pctDone).toBe(1);
    expect(p.projectedFinishISO).not.toBeNull();
  });

  test('not started before the plan begins', () => {
    const p = khatmPace({
      current: 0,
      startISO: START,
      endISO: END,
      now: new Date('2026-02-24T12:00:00.000Z'),
    });
    expect(p.status).toBe('notStarted');
    expect(p.dayIndex).toBe(0);
  });

  test('projects a finish date from the current rate', () => {
    const p = khatmPace({ current: 300, startISO: START, endISO: END, now: NOW });
    expect(p.projectedFinishISO).not.toBeNull();
    expect(new Date(p.projectedFinishISO as string).getTime()).toBeGreaterThan(
      NOW.getTime(),
    );
  });

  test('current is clamped to the total', () => {
    const p = khatmPace({ current: 999, total: 604, startISO: START, endISO: END, now: NOW });
    expect(p.pagesRead).toBe(604);
    expect(p.status).toBe('done');
  });
});
