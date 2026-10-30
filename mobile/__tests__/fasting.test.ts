import {
  countdownTarget,
  fastDurationMs,
  fastPhase,
  fastProgress,
  fastTimes,
  forbiddenFastOn,
  matchesWhen,
  nextFastDate,
  ramadanGridDates,
  ramadanInfo,
  upcomingVoluntaryFasts,
} from '../lib/fasting';
import type { DayPrayerTimes } from '../lib/prayerTimes';
import type { HijriDate } from '../lib/hijriCalendar';
import { toHijri } from '../lib/hijriCalendar';
import { RAMADAN_MONTH } from '../content/fasting/fasting';

/** Build a day's prayer times with explicit Fajr/Maghrib (local clock). */
function day(fajrH: number, maghribH: number): DayPrayerTimes {
  const at = (h: number, m = 0) => new Date(2026, 2, 20, h, m, 0, 0);
  return {
    fajr: at(fajrH),
    sunrise: at(fajrH + 1, 30),
    dhuhr: at(12),
    asr: at(15),
    maghrib: at(maghribH),
    isha: at(maghribH + 1, 30),
  };
}

/** A minimal Hijri date for the position helpers. */
function hijri(d: number, month = RAMADAN_MONTH): HijriDate {
  return { day: d, month, monthName: 'Ramaḍān', year: 1447 } as HijriDate;
}

describe('fasting · day moments', () => {
  const d = day(5, 18); // Fajr 05:00, Maghrib 18:00

  test('fastTimes derives Imsāk as Fajr minus the buffer', () => {
    const t = fastTimes(d, 10);
    expect(t.suhoorEnd).toEqual(d.fajr);
    expect(t.iftar).toEqual(d.maghrib);
    expect(d.fajr.getTime() - t.imsak.getTime()).toBe(10 * 60_000);
  });

  test('fastTimes clamps a negative buffer to zero', () => {
    const t = fastTimes(d, -5);
    expect(t.imsak).toEqual(d.fajr);
  });

  test('fastDurationMs is Fajr → Maghrib', () => {
    const t = fastTimes(d, 10);
    expect(fastDurationMs(t)).toBe(13 * 3_600_000);
  });
});

describe('fasting · phase & progress', () => {
  const t = fastTimes(day(5, 18), 10);

  test('phase splits pre-dawn / fasting / night', () => {
    expect(fastPhase(new Date(2026, 2, 20, 4), t)).toBe('preDawn');
    expect(fastPhase(new Date(2026, 2, 20, 12), t)).toBe('fasting');
    expect(fastPhase(new Date(2026, 2, 20, 19), t)).toBe('night');
  });

  test('progress runs 0 → 1 across the fast', () => {
    expect(fastProgress(new Date(2026, 2, 20, 4), t)).toBe(0);
    expect(fastProgress(new Date(2026, 2, 20, 5), t)).toBe(0);
    expect(fastProgress(new Date(2026, 2, 20, 11, 30), t)).toBeCloseTo(0.5, 5);
    expect(fastProgress(new Date(2026, 2, 20, 18), t)).toBe(1);
    expect(fastProgress(new Date(2026, 2, 20, 22), t)).toBe(1);
  });
});

describe('fasting · countdown target', () => {
  const today = fastTimes(day(5, 18), 10);
  const tomorrow = fastTimes(day(5, 18), 10);

  test('counts to Iftār during the fast', () => {
    const c = countdownTarget(new Date(2026, 2, 20, 12), today, tomorrow);
    expect(c.kind).toBe('iftar');
    expect(c.at).toEqual(today.iftar);
  });

  test('counts to Suhūr-end before dawn', () => {
    const c = countdownTarget(new Date(2026, 2, 20, 4), today, tomorrow);
    expect(c.kind).toBe('suhoor');
    expect(c.at).toEqual(today.suhoorEnd);
  });

  test('at night counts to tomorrow’s Suhūr when known', () => {
    const c = countdownTarget(new Date(2026, 2, 20, 20), today, tomorrow);
    expect(c.kind).toBe('suhoor');
    expect(c.at).toEqual(tomorrow.suhoorEnd);
  });

  test('at night without tomorrow reports Iftār passed', () => {
    const c = countdownTarget(new Date(2026, 2, 20, 20), today);
    expect(c.kind).toBe('iftar');
    expect(c.label).toContain('was');
  });
});

describe('fasting · Ramadan position', () => {
  test('outside Ramadan reports not-Ramadan', () => {
    const info = ramadanInfo(hijri(5, 8));
    expect(info).toMatchObject({ isRamadan: false, day: 0, ashraIndex: -1, isLastTen: false });
  });

  test('the three ʿashras map by day', () => {
    expect(ramadanInfo(hijri(1)).ashraIndex).toBe(0);
    expect(ramadanInfo(hijri(15)).ashraIndex).toBe(1);
    expect(ramadanInfo(hijri(27)).ashraIndex).toBe(2);
  });

  test('last ten and odd nights are flagged', () => {
    expect(ramadanInfo(hijri(20)).isLastTen).toBe(false);
    expect(ramadanInfo(hijri(21)).isLastTen).toBe(true);
    expect(ramadanInfo(hijri(27)).isOddNight).toBe(true);
    expect(ramadanInfo(hijri(26)).isOddNight).toBe(false);
  });

  test('daysLeft assumes a 30-day month', () => {
    expect(ramadanInfo(hijri(1)).daysLeft).toBe(29);
    expect(ramadanInfo(hijri(30)).daysLeft).toBe(0);
  });
});

describe('fasting · voluntary & forbidden', () => {
  test('matchesWhen handles weekday rules', () => {
    // 2026-03-23 is a Monday.
    const monday = new Date(2026, 2, 23);
    expect(matchesWhen({ kind: 'weekday', weekdays: [1, 4] }, monday)).toBe(true);
    expect(matchesWhen({ kind: 'weekday', weekdays: [0] }, monday)).toBe(false);
  });

  test('nextFastDate returns a date that itself matches the rule', () => {
    const rule = { kind: 'weekday' as const, weekdays: [4] }; // Thursday
    const next = nextFastDate(rule, new Date(2026, 2, 20));
    expect(next).not.toBeNull();
    expect(matchesWhen(rule, next as Date)).toBe(true);
  });

  test('upcomingVoluntaryFasts is sorted soonest-first and non-negative', () => {
    const list = upcomingVoluntaryFasts(new Date(2026, 2, 20));
    expect(list.length).toBeGreaterThan(0);
    for (const s of list) {
      expect(s.daysAway).toBeGreaterThanOrEqual(0);
      expect(matchesWhen(s.fast.when, s.date)).toBe(true);
    }
    const sorted = [...list].sort((a, b) => a.daysAway - b.daysAway);
    expect(list.map((s) => s.daysAway)).toEqual(sorted.map((s) => s.daysAway));
  });

  test('forbiddenFastOn flags a found day consistently', () => {
    const hit = forbiddenFastOn(new Date(2026, 2, 20));
    if (hit) expect(matchesWhen(hit.when, new Date(2026, 2, 20))).toBe(true);
    else expect(hit).toBeNull();
  });
});

describe('fasting · Ramadan grid dates', () => {
  test('returns consecutive Ramadan days, at most 30', () => {
    const dates = ramadanGridDates(new Date(2026, 2, 20));
    expect(dates.length).toBeGreaterThan(0);
    expect(dates.length).toBeLessThanOrEqual(30);
    for (const d of dates) expect(toHijri(d).month).toBe(RAMADAN_MONTH);
    for (let i = 1; i < dates.length; i += 1) {
      const gap = Math.round((dates[i].getTime() - dates[i - 1].getTime()) / 86_400_000);
      expect(gap).toBe(1);
    }
    // First date is Ramadan day 1.
    expect(toHijri(dates[0]).day).toBe(1);
  });
});
