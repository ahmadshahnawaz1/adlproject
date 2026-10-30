/**
 * Jumuʿah and Eid timing.
 *
 * Pure date logic only: which Friday is next, when the window for Sūrat
 * al-Kahf opens, and when the two Eids fall. The Islamic day begins at sunset,
 * so anything that starts "the night before" exposes that evening separately
 * rather than pretending the day starts at midnight.
 */
import { daysUntilHijri } from './fasting';
import { toHijri, type HijriDate } from './hijriCalendar';

export const FRIDAY = 5;
export const THURSDAY = 4;

export const SHAWWAL = 10;
export const DHU_AL_HIJJAH = 12;

/** Approximate hour of Maghrib, used only to say whether an evening has begun. */
export const EVENING_HOUR = 18;

function midnight(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export function isJumuah(date: Date = new Date()): boolean {
  return date.getDay() === FRIDAY;
}

/** The coming Friday — today, when today is Friday. */
export function nextJumuah(from: Date = new Date()): Date {
  const d = midnight(from);
  return addDays(d, (FRIDAY - d.getDay() + 7) % 7);
}

export function daysUntilJumuah(from: Date = new Date()): number {
  return Math.round((nextJumuah(from).getTime() - midnight(from).getTime()) / 86_400_000);
}

export type KahfWindow = {
  /** Thursday — the reading window opens at Maghrib, when Friday night begins. */
  opensEvening: Date;
  /** The Friday itself; the window closes at its Maghrib. */
  closes: Date;
  open: boolean;
};

export function kahfWindow(from: Date = new Date()): KahfWindow {
  const friday = nextJumuah(from);
  return {
    opensEvening: addDays(friday, -1),
    closes: friday,
    open: isKahfWindow(from),
  };
}

/**
 * Whether Sūrat al-Kahf may be read now. The window runs from Maghrib on
 * Thursday to Maghrib on Friday; `eveningHour` stands in for Maghrib.
 */
export function isKahfWindow(date: Date = new Date(), eveningHour = EVENING_HOUR): boolean {
  const day = date.getDay();
  if (day === FRIDAY) return date.getHours() < eveningHour;
  return day === THURSDAY && date.getHours() >= eveningHour;
}

export type EidKind = 'fitr' | 'adha';

export type EidOccasion = {
  kind: EidKind;
  label: string;
  arabic: string;
  date: Date;
  hijri: HijriDate;
  /** Sunset on this evening opens the Eid night. */
  startsEvening: Date;
  daysAway: number;
  isToday: boolean;
};

const EID_META: Record<EidKind, { label: string; arabic: string; month: number; day: number }> = {
  fitr: { label: 'Eid al-Fiṭr', arabic: 'عِيد ٱلْفِطْر', month: SHAWWAL, day: 1 },
  adha: { label: 'Eid al-Aḍḥā', arabic: 'عِيد ٱلْأَضْحَىٰ', month: DHU_AL_HIJJAH, day: 10 },
};

function occasion(kind: EidKind, from: Date): EidOccasion | null {
  const meta = EID_META[kind];
  const away = daysUntilHijri({ month: meta.month, day: meta.day }, from);
  if (away === null) return null;
  const date = addDays(midnight(from), away);
  return {
    kind,
    label: meta.label,
    arabic: meta.arabic,
    date,
    hijri: toHijri(date),
    startsEvening: addDays(date, -1),
    daysAway: away,
    isToday: away === 0,
  };
}

/** Both Eids ahead, nearest first. */
export function upcomingEids(from: Date = new Date()): EidOccasion[] {
  return (['fitr', 'adha'] as EidKind[])
    .map((k) => occasion(k, from))
    .filter((e): e is EidOccasion => e !== null)
    .sort((a, b) => a.daysAway - b.daysAway);
}

export function nextEid(from: Date = new Date()): EidOccasion | null {
  return upcomingEids(from)[0] ?? null;
}

/**
 * Whether the takbīr of Eid is called for now.
 *
 * For al-Fiṭr it runs from sunset on the last night of Ramaḍān until the
 * prayer. For al-Aḍḥā the unrestricted takbīr runs through the first ten days
 * of Dhū al-Ḥijjah, and the restricted takbīr after each prayer from ʿArafah
 * to the last of the days of Tashrīq.
 */
export function takbirActive(date: Date = new Date()): EidKind | null {
  const h = toHijri(date);
  if (h.month === SHAWWAL && h.day === 1) return 'fitr';
  if (h.month === DHU_AL_HIJJAH && h.day >= 1 && h.day <= 13) return 'adha';
  return null;
}
