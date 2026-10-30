/**
 * Tests for the pure Ramaḍān night-worship logic (F22).
 */
import {
  NIGHT_HABITS,
  RAMADAN_DAYS,
  TARAWEEH_OPINIONS,
  averageRakahs,
  habitProgress,
  habitsOn,
  isHabitDone,
  lastTenNights,
  monthProgress,
  nightsStood,
  oddNights,
  taraweehOn,
  taraweehTotal,
} from '../lib/ramadan';
import { toHijri } from '../lib/hijriCalendar';
import { RAMADAN_MONTH } from '../content/fasting/fasting';
import { QADR_DUA, QADR_SIGNS, RAMADAN_DISCLAIMER, TARAWEEH_NOTE } from '../content/ramadan';

describe('content integrity', () => {
  it('offers both recognised Tarāwīḥ counts without declaring a winner', () => {
    const counts = TARAWEEH_OPINIONS.map((o) => o.rakahs).sort((a, b) => a - b);
    expect(counts).toEqual([8, 20]);
    for (const o of TARAWEEH_OPINIONS) {
      expect(o.held.length).toBeGreaterThan(0);
      expect(o.note.length).toBeGreaterThan(0);
    }
    expect(TARAWEEH_NOTE).toMatch(/division|breadth/i);
  });

  it('carries the Qadr duʿāʾ with its source and honest signs note', () => {
    expect(QADR_DUA.arabic).toMatch(/[\u0600-\u06FF]/);
    expect(QADR_DUA.source).toMatch(/Tirmidh/);
    expect(QADR_SIGNS.length).toBeGreaterThan(0);
    expect(RAMADAN_DISCLAIMER).toMatch(/review/i);
  });

  it('defines a nightly checklist with unique ids', () => {
    const ids = NIGHT_HABITS.map((h) => h.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('taraweeh tally', () => {
  const log = { '2026-03-01': 8, '2026-03-02': 20, '2026-03-03': 0 };

  it('totals the rakʿahs', () => {
    expect(taraweehTotal(log)).toBe(28);
    expect(taraweehTotal({})).toBe(0);
  });

  it('counts only nights actually prayed', () => {
    expect(nightsStood(log)).toBe(2);
  });

  it('reads one night, treating missing or zero as none', () => {
    expect(taraweehOn(log, '2026-03-02')).toBe(20);
    expect(taraweehOn(log, '2026-03-03')).toBe(0);
    expect(taraweehOn(log, 'nope')).toBe(0);
  });

  it('averages across the nights prayed', () => {
    expect(averageRakahs(log)).toBe(14);
    expect(averageRakahs({})).toBe(0);
  });

  it('ignores corrupt values', () => {
    expect(taraweehTotal({ a: NaN, b: 8 } as Record<string, number>)).toBe(8);
  });
});

describe('nightly habits', () => {
  const first = NIGHT_HABITS[0].id;
  const log = { '2026-03-01': [first] };

  it('reads the ticked habits for a day', () => {
    expect(habitsOn(log, '2026-03-01')).toEqual([first]);
    expect(habitsOn(log, 'nope')).toEqual([]);
  });

  it('answers whether one habit is done', () => {
    expect(isHabitDone(log, '2026-03-01', first)).toBe(true);
    expect(isHabitDone(log, '2026-03-01', 'zzz')).toBe(false);
  });

  it('reports progress as a fraction, ignoring unknown ids', () => {
    expect(habitProgress(log, '2026-03-01')).toBeCloseTo(1 / NIGHT_HABITS.length, 5);
    expect(habitProgress({ x: ['zzz'] }, 'x')).toBe(0);
    expect(habitProgress({ x: NIGHT_HABITS.map((h) => h.id) }, 'x')).toBe(1);
  });
});

describe('month progress', () => {
  it('runs from zero to one across the month', () => {
    expect(monthProgress(0)).toBe(0);
    expect(monthProgress(15)).toBeCloseTo(0.5, 5);
    expect(monthProgress(RAMADAN_DAYS)).toBe(1);
    expect(monthProgress(99)).toBe(1);
    expect(monthProgress(-3)).toBe(0);
  });
});

describe('the last ten nights', () => {
  const nights = lastTenNights(new Date('2026-01-01T12:00:00'));

  it('finds exactly ten nights', () => {
    expect(nights).toHaveLength(10);
  });

  it('runs from Ramaḍān 21 to 30 in order', () => {
    expect(nights.map((n) => n.hijriDay)).toEqual([21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
  });

  it('lands each night on a real Ramaḍān day in the offline calendar', () => {
    for (const n of nights) {
      const h = toHijri(n.hijriDate);
      expect(h.month).toBe(RAMADAN_MONTH);
      expect(h.day).toBe(n.hijriDay);
    }
  });

  it('begins each night on the preceding evening', () => {
    for (const n of nights) {
      const diff = n.hijriDate.getTime() - n.startsEvening.getTime();
      expect(Math.round(diff / 86400000)).toBe(1);
    }
  });

  it('marks the emphasised odd nights', () => {
    expect(nights.filter((n) => n.odd).map((n) => n.hijriDay)).toEqual([21, 23, 25, 27, 29]);
  });

  it('exposes the odd nights directly', () => {
    const odd = oddNights(new Date('2026-01-01T12:00:00'));
    expect(odd).toHaveLength(5);
    expect(odd.every((n) => n.odd)).toBe(true);
  });
});
