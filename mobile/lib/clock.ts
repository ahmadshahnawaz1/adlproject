/**
 * clock.ts — small, shared time helpers used across the app's time-aware
 * features. These mirror the inline helpers the prayer screens already use, so
 * formatting and day-boundary logic stay identical everywhere they appear.
 */

/** A wall-clock time like "6:15 AM" in the given IANA time zone. */
export function formatTime(date: Date, timeZone: string): string {
  return date.toLocaleTimeString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * A compact countdown: "2:34:18" when an hour or more remains, otherwise
 * "34:18". Negative inputs clamp to zero.
 */
export function formatCountdown(ms: number): string {
  if (ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/**
 * A longer, friendlier duration like "13h 20m" or "45m", used where seconds
 * would be noise (e.g. a fast's length, or "in 13h 20m").
 */
export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const total = Math.floor(ms / 60000);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/** The local calendar day as an ISO "YYYY-MM-DD" key in the given time zone. */
export function dayKeyInZone(date: Date, timeZone: string): string {
  // en-CA renders ISO-style YYYY-MM-DD, which sorts and compares cleanly.
  return date.toLocaleDateString('en-CA', { timeZone });
}

/** Milliseconds from `date` until the next local midnight in `timeZone`. */
export function msUntilNextMidnight(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  // Intl renders midnight as "24" in some engines; normalise to 0.
  const h = get('hour') % 24;
  const elapsed = (h * 3600 + get('minute') * 60 + get('second')) * 1000;
  // One day minus the time already elapsed today, +1s of slack to land past 00:00.
  return 86_400_000 - elapsed + 1000;
}
