/**
 * lib/ramadan — the pure logic behind Ramaḍān Mode (F22).
 *
 * The daytime fast lives in lib/fasting; this covers the night: the Tarāwīḥ
 * tally, the odd nights of the last ten resolved to real calendar dates, the
 * nightly checklist, and how far through the month you are. Pure & tested.
 *
 * A note on nights: the civil Hijri date rolls at midnight, but the Islamic
 * night begins at sunset. "The night of the 27th" is therefore the night that
 * *begins* on the evening of the 26th civil Hijri day. The helpers below expose
 * both so the UI can say it plainly.
 */
import { toHijri } from './hijriCalendar';
import { ODD_NIGHTS, RAMADAN_MONTH, LAST_TEN_START } from '../content/fasting/fasting';
import { NIGHT_HABITS, TARAWEEH_OPINIONS } from '../content/ramadan';
import { dayKey } from './clock';

export { NIGHT_HABITS, TARAWEEH_OPINIONS, ODD_NIGHTS, LAST_TEN_START };

/** Rakʿahs prayed, keyed by the civil day the night began on. */
export type TaraweehLog = Record<string, number>;

/** Habit ids ticked, keyed by day. */
export type HabitLog = Record<string, string[]>;

export const RAMADAN_DAYS = 30;

/** Total rakʿahs recorded across the month. */
export function taraweehTotal(log: TaraweehLog): number {
  return Object.values(log).reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0);
}

/** How many nights had any Tarāwīḥ recorded. */
export function nightsStood(log: TaraweehLog): number {
  return Object.values(log).filter((n) => n > 0).length;
}

/** The rakʿahs recorded for one night (0 when untouched). */
export function taraweehOn(log: TaraweehLog, key: string): number {
  const n = log[key];
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Average rakʿahs across the nights actually prayed (0 when none). */
export function averageRakahs(log: TaraweehLog): number {
  const nights = nightsStood(log);
  if (nights === 0) return 0;
  return Math.round((taraweehTotal(log) / nights) * 10) / 10;
}

/** A night in the last ten, resolved to the evening it begins. */
export type QadrNight = {
  /** The Hijri day of Ramaḍān, e.g. 27. */
  hijriDay: number;
  /** The civil date on whose evening this night begins. */
  startsEvening: Date;
  /** The civil date the Hijri day falls on. */
  hijriDate: Date;
  /** Emphasised odd night. */
  odd: boolean;
};

/**
 * The last ten nights of the current (or next) Ramaḍān, as real dates.
 * Scans the offline Umm al-Qura calendar forward from `from`; returns [] when
 * Ramaḍān is not found within a year.
 */
export function lastTenNights(from: Date = new Date(), scanDays = 400): QadrNight[] {
  const cursor = new Date(from);
  cursor.setHours(12, 0, 0, 0);

  // Walk forward to the first day of the last ten (Ramaḍān 21).
  let start: Date | null = null;
  for (let i = 0; i < scanDays; i++) {
    const h = toHijri(cursor);
    if (h.month === RAMADAN_MONTH && h.day === LAST_TEN_START) {
      start = new Date(cursor);
      break;
    }
    // Already inside the last ten: step back to day 21.
    if (h.month === RAMADAN_MONTH && h.day > LAST_TEN_START && i === 0) {
      const back = new Date(cursor);
      back.setDate(back.getDate() - (h.day - LAST_TEN_START));
      start = back;
      break;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  if (!start) return [];

  const nights: QadrNight[] = [];
  for (let i = 0; i < 10; i++) {
    const hijriDate = new Date(start);
    hijriDate.setDate(hijriDate.getDate() + i);
    const hijriDay = LAST_TEN_START + i;
    const startsEvening = new Date(hijriDate);
    startsEvening.setDate(startsEvening.getDate() - 1);
    nights.push({
      hijriDay,
      hijriDate,
      startsEvening,
      odd: (ODD_NIGHTS as readonly number[]).includes(hijriDay),
    });
  }
  return nights;
}

/** Just the emphasised odd nights of the last ten. */
export function oddNights(from: Date = new Date()): QadrNight[] {
  return lastTenNights(from).filter((n) => n.odd);
}

/** Which habits are ticked for a day. */
export function habitsOn(log: HabitLog, key: string): string[] {
  return log[key] ?? [];
}

/** Whether one habit is ticked for a day. */
export function isHabitDone(log: HabitLog, key: string, habitId: string): boolean {
  return habitsOn(log, key).includes(habitId);
}

/** Fraction (0–1) of the nightly checklist completed for a day. */
export function habitProgress(log: HabitLog, key: string): number {
  if (NIGHT_HABITS.length === 0) return 0;
  const done = habitsOn(log, key).filter((id) => NIGHT_HABITS.some((h) => h.id === id)).length;
  return Math.max(0, Math.min(1, done / NIGHT_HABITS.length));
}

/** Progress through the month as a 0–1 fraction. */
export function monthProgress(day: number): number {
  if (day <= 0) return 0;
  return Math.max(0, Math.min(1, day / RAMADAN_DAYS));
}

/** The day key for the night beginning on a given evening. */
export function nightKey(date: Date = new Date()): string {
  return dayKey(date);
}
