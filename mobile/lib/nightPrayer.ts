/**
 * lib/nightPrayer.ts — the pure mathematics of the night.
 *
 * Given Maghrib and the following Fajr, it splits the night into its three
 * equal thirds, marks the Islamic midnight (the midpoint between Maghrib and
 * Fajr), and answers where "now" falls, how long until the last third or Fajr,
 * and when a reminder should fire. No dates are fetched and no I/O is done —
 * Date in, Date/number out — so the engine is fully testable and never touches
 * a native module.
 */

/** Which third of the night a moment belongs to. */
export type NightThirdKey = 'first' | 'middle' | 'last';

/** One third of the night, with its bounds. */
export type NightThird = {
  key: NightThirdKey;
  label: string;
  start: Date;
  end: Date;
};

/** The fully-resolved geometry of a single night, Maghrib → Fajr. */
export type NightWindow = {
  maghrib: Date;
  fajr: Date;
  /** The midpoint between Maghrib and Fajr (the "Islamic midnight"). */
  islamicMidnight: Date;
  /** When the middle third begins (Maghrib + ⅓ of the night). */
  secondThirdStart: Date;
  /** When the last third begins (Maghrib + ⅔ of the night). */
  lastThirdStart: Date;
  /** The length of the night in milliseconds. */
  durationMs: number;
  /** The three equal thirds, in order. */
  thirds: NightThird[];
};

/** Where "now" sits relative to the night. */
export type NightPhase =
  | 'evening' // before Maghrib — the night has not yet begun
  | 'firstThird'
  | 'middleThird'
  | 'lastThird'
  | 'day'; // at or after Fajr — the night has ended

/** When a Tahajjud reminder should be scheduled. */
export type ReminderMode = 'lastThirdStart' | 'islamicMidnight' | 'beforeFajr';

/** A live snapshot of the night for a countdown. */
export type NightCountdown = {
  phase: NightPhase;
  /** ms until Maghrib (≤0 once the night has begun). */
  toMaghrib: number;
  /** ms until the last third begins (≤0 once it has begun). */
  toLastThird: number;
  /** ms until Fajr (≤0 once it has passed). */
  toFajr: number;
  /** A short headline for what comes next. */
  label: string;
};

const THIRD_LABELS: Record<NightThirdKey, string> = {
  first: 'First third',
  middle: 'Middle third',
  last: 'Last third',
};

/**
 * Resolve a night from its Maghrib and the following Fajr. Fajr is expected to
 * be after Maghrib (the caller pairs the correct calendar days).
 */
export function computeNightWindow(maghrib: Date, fajr: Date): NightWindow {
  const start = maghrib.getTime();
  const end = fajr.getTime();
  const durationMs = Math.max(0, end - start);
  const third = durationMs / 3;

  const secondThirdStart = new Date(start + third);
  const lastThirdStart = new Date(start + third * 2);
  const islamicMidnight = new Date(start + durationMs / 2);

  const thirds: NightThird[] = [
    { key: 'first', label: THIRD_LABELS.first, start: new Date(start), end: secondThirdStart },
    { key: 'middle', label: THIRD_LABELS.middle, start: secondThirdStart, end: lastThirdStart },
    { key: 'last', label: THIRD_LABELS.last, start: lastThirdStart, end: new Date(end) },
  ];

  return {
    maghrib,
    fajr,
    islamicMidnight,
    secondThirdStart,
    lastThirdStart,
    durationMs,
    thirds,
  };
}

/** Where `now` falls within (or around) the night. */
export function nightPhase(now: Date, window: NightWindow): NightPhase {
  const t = now.getTime();
  if (t < window.maghrib.getTime()) return 'evening';
  if (t >= window.fajr.getTime()) return 'day';
  if (t < window.secondThirdStart.getTime()) return 'firstThird';
  if (t < window.lastThirdStart.getTime()) return 'middleThird';
  return 'lastThird';
}

/** Format a positive duration compactly: "2h 14m", "41m", or "<1m". */
export function formatDuration(ms: number): string {
  if (ms <= 0) return '0m';
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 1) return '<1m';
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** A live countdown snapshot for the given moment. */
export function nightCountdown(now: Date, window: NightWindow): NightCountdown {
  const t = now.getTime();
  const phase = nightPhase(now, window);
  const toMaghrib = window.maghrib.getTime() - t;
  const toLastThird = window.lastThirdStart.getTime() - t;
  const toFajr = window.fajr.getTime() - t;

  let label: string;
  switch (phase) {
    case 'evening':
      label = `Night begins in ${formatDuration(toMaghrib)}`;
      break;
    case 'firstThird':
    case 'middleThird':
      label = `Last third in ${formatDuration(toLastThird)}`;
      break;
    case 'lastThird':
      label = `Fajr in ${formatDuration(toFajr)}`;
      break;
    default:
      label = 'The night has ended';
      break;
  }

  return { phase, toMaghrib, toLastThird, toFajr, label };
}

/** The moment a reminder should fire, for the chosen mode. */
export function reminderTimeFor(
  window: NightWindow,
  mode: ReminderMode,
  beforeFajrMinutes = 30,
): Date {
  switch (mode) {
    case 'islamicMidnight':
      return window.islamicMidnight;
    case 'beforeFajr':
      return new Date(window.fajr.getTime() - Math.max(0, beforeFajrMinutes) * 60000);
    case 'lastThirdStart':
    default:
      return window.lastThirdStart;
  }
}
