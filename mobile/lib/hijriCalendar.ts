/**
 * hijriCalendar — a completely free, offline Hijri ↔ Gregorian calendar built on
 * the platform's Intl engine (Umm al-Qura where available). No API, no network.
 *
 * Produces a month grid of Gregorian days, each annotated with its Hijri day,
 * plus the Hijri month boundaries that fall within the viewed Gregorian month.
 */

/** Prefer the Saudi Umm al-Qura calendar; fall back to the generic civil one. */
const HIJRI_LOCALE = 'en-US-u-ca-islamic-umalqura';
const HIJRI_FALLBACK = 'en-US-u-ca-islamic';

const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi\u02bb al-Awwal',
  'Rabi\u02bb al-Thani',
  'Jumada al-Ula',
  'Jumada al-Akhirah',
  'Rajab',
  'Sha\u02bbban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qa\u02bbdah',
  'Dhu al-Hijjah',
];

export type HijriDate = {
  day: number;
  /** 1-based Hijri month index. */
  month: number;
  monthName: string;
  year: number;
};

function partsFor(date: Date): Intl.DateTimeFormatPart[] {
  const opts: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };
  try {
    return new Intl.DateTimeFormat(HIJRI_LOCALE, opts).formatToParts(date);
  } catch {
    return new Intl.DateTimeFormat(HIJRI_FALLBACK, opts).formatToParts(date);
  }
}

/** The Hijri date for a given Gregorian instant. */
export function toHijri(date: Date): HijriDate {
  const parts = partsFor(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const month = get('month');
  return {
    day: get('day'),
    month,
    monthName: HIJRI_MONTHS[(month - 1 + 12) % 12] ?? '',
    year: get('year'),
  };
}

/** A long human label, e.g. "12 Ramadan 1447 AH". */
export function formatHijriLong(h: HijriDate): string {
  return `${h.day} ${h.monthName} ${h.year} AH`;
}

export type CalendarCell = {
  date: Date;
  gregDay: number;
  /** True when this cell belongs to the viewed Gregorian month. */
  inMonth: boolean;
  hijri: HijriDate;
  /** True on the first Hijri day of a month (used to draw the month seam). */
  hijriMonthStart: boolean;
};

export const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * Build a 6-week (42-cell) grid for the given Gregorian year/month, weeks
 * starting on Sunday. Leading/trailing cells spill into the adjacent months so
 * the grid is always rectangular.
 */
export function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay(); // 0 = Sunday
  const gridStart = new Date(year, month, 1 - startOffset);

  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + i,
    );
    const hijri = toHijri(date);
    cells.push({
      date,
      gregDay: date.getDate(),
      inMonth: date.getMonth() === month,
      hijri,
      hijriMonthStart: hijri.day === 1,
    });
  }
  return cells;
}

/** Distinct Hijri months spanning the viewed grid (for the subtitle). */
export function hijriSpan(cells: CalendarCell[]): string {
  const inMonth = cells.filter((c) => c.inMonth);
  if (inMonth.length === 0) return '';
  const seen: string[] = [];
  for (const c of inMonth) {
    const key = `${c.hijri.monthName} ${c.hijri.year}`;
    if (!seen.includes(key)) seen.push(key);
  }
  return seen.join('  \u2013  ');
}

const GREG_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function gregMonthLabel(month: number): string {
  return GREG_MONTHS[((month % 12) + 12) % 12];
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
