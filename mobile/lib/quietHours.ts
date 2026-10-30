/**
 * lib/quietHours — the pure "quiet hours" window for notifications. During the
 * window, prayer alerts are delivered silently rather than sounding. Supports
 * overnight ranges (e.g. 22:00 → 06:00). Pure & tested.
 */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':');
  return (Number(h) || 0) * 60 + (Number(m) || 0);
}

/** The 24-hour "HH:mm" wall time of an instant in a given IANA zone. */
export function hhmmInZone(date: Date, timeZone: string): string {
  const s = date.toLocaleTimeString('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return s === '24:00' ? '00:00' : s;
}

/** Whether "HH:mm" falls inside [start, end); supports overnight windows. */
export function isWithinQuietWindow(hhmm: string, start: string, end: string): boolean {
  const t = toMinutes(hhmm);
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (s === e) return false;
  return s < e ? t >= s && t < e : t >= s || t < e;
}

/** Whether a concrete instant is within the quiet-hours window in `timeZone`. */
export function isDuringQuietHours(
  date: Date,
  timeZone: string,
  start: string,
  end: string,
): boolean {
  return isWithinQuietWindow(hhmmInZone(date, timeZone), start, end);
}
