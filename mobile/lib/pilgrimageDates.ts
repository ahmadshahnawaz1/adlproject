/**
 * pilgrimageDates.ts — the date-aware layer of the hub, built on the offline
 * Umm al-Qura calendar (lib/hijriCalendar). It answers: are we in Dhū
 * al-Ḥijjah? which Ḥajj day is it (Tarwiyah / ʿArafah / Naḥr / Tashrīq)? how
 * many days until Ḥajj? — so the hub can raise a "Today is the Day of ʿArafah"
 * banner, surface the right stage, and count down on the home tile.
 *
 * These are estimates: the true start of a Hijri month follows the moon
 * sighting; the calendar here is the widely-used Umm al-Qura reckoning.
 */

import { toHijri } from './hijriCalendar';
import type { HijriDate } from './hijriCalendar';

/** The 1-based Hijri month index of Dhū al-Ḥijjah. */
export const DHUL_HIJJAH_MONTH = 12;

/** The anchor days of the Ḥajj within Dhū al-Ḥijjah. */
export const DAY_TARWIYAH = 8;
export const DAY_ARAFAH = 9;
export const DAY_NAHR = 10;
export const TASHRIQ_DAYS = [11, 12, 13] as const;

/** The phase of the Ḥajj season a given date falls in. */
export type HajjPhase =
  | 'none' // outside Dhū al-Ḥijjah
  | 'first-ten' // 1–7 (the blessed ten, before the rites)
  | 'tarwiyah' // 8
  | 'arafah' // 9
  | 'nahr' // 10 (ʿĪd al-Aḍḥā)
  | 'tashriq'; // 11–13

export type DhulHijjahInfo = {
  /** True when the date is in Dhū al-Ḥijjah. */
  inDhulHijjah: boolean;
  hijri: HijriDate;
  /** The Hijri day (1–30); meaningful only when `inDhulHijjah`. */
  day: number;
  phase: HajjPhase;
  /** Days 1–10 of Dhū al-Ḥijjah — the most virtuous days of the year. */
  isFirstTen: boolean;
  /** Days 8–13 — the days of the Ḥajj rites. */
  isHajjDays: boolean;
  /** A human label for the day, or '' outside the season. */
  label: string;
};

function phaseFor(day: number, inDhulHijjah: boolean): HajjPhase {
  if (!inDhulHijjah) return 'none';
  if (day === DAY_ARAFAH) return 'arafah';
  if (day === DAY_TARWIYAH) return 'tarwiyah';
  if (day === DAY_NAHR) return 'nahr';
  if (day >= 11 && day <= 13) return 'tashriq';
  if (day >= 1 && day <= 7) return 'first-ten';
  return 'none';
}

function labelFor(phase: HajjPhase, day: number): string {
  switch (phase) {
    case 'tarwiyah':
      return 'Day of Tarwiyah · 8 Dhū al-Ḥijjah';
    case 'arafah':
      return 'The Day of ʿArafah';
    case 'nahr':
      return 'ʿĪd al-Aḍḥā · the Day of Sacrifice';
    case 'tashriq':
      return `Days of Tashrīq · ${day} Dhū al-Ḥijjah`;
    case 'first-ten':
      return `${day} Dhū al-Ḥijjah · the blessed ten`;
    default:
      return '';
  }
}

/** A full read of where a date sits in the Ḥajj season. */
export function dhulHijjahInfo(from: Date = new Date()): DhulHijjahInfo {
  const hijri = toHijri(from);
  const inDhulHijjah = hijri.month === DHUL_HIJJAH_MONTH;
  const day = hijri.day;
  const phase = phaseFor(day, inDhulHijjah);
  return {
    inDhulHijjah,
    hijri,
    day,
    phase,
    isFirstTen: inDhulHijjah && day >= 1 && day <= 10,
    isHajjDays: inDhulHijjah && day >= DAY_TARWIYAH && day <= 13,
    label: labelFor(phase, day),
  };
}

/** True when the date is the Day of ʿArafah (9 Dhū al-Ḥijjah). */
export function isDayOfArafah(from: Date = new Date()): boolean {
  const h = toHijri(from);
  return h.month === DHUL_HIJJAH_MONTH && h.day === DAY_ARAFAH;
}

/** True when the date is one of the days of the Ḥajj rites (8–13). */
export function isHajjSeason(from: Date = new Date()): boolean {
  const h = toHijri(from);
  return h.month === DHUL_HIJJAH_MONTH && h.day >= DAY_TARWIYAH && h.day <= 13;
}

/**
 * Days from `from` until the start of the Ḥajj (8 Dhū al-Ḥijjah), scanning the
 * offline calendar forward. Returns 0 when already within the rite days
 * (8–13), or null if not found within `maxDays`.
 */
export function daysUntilHajj(from: Date = new Date(), maxDays = 400): number | null {
  const today = toHijri(from);
  if (today.month === DHUL_HIJJAH_MONTH && today.day >= DAY_TARWIYAH && today.day <= 13) {
    return 0;
  }
  for (let i = 1; i <= maxDays; i += 1) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const h = toHijri(d);
    if (h.month === DHUL_HIJJAH_MONTH && h.day === DAY_TARWIYAH) return i;
  }
  return null;
}

/** Days until the Day of ʿArafah (0 if today is ʿArafah), or null if not found. */
export function daysUntilArafah(from: Date = new Date(), maxDays = 400): number | null {
  if (isDayOfArafah(from)) return 0;
  for (let i = 1; i <= maxDays; i += 1) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    if (isDayOfArafah(d)) return i;
  }
  return null;
}
