/**
 * Tests for the pure quiet-hours window logic.
 */
import { isWithinQuietWindow, hhmmInZone, isDuringQuietHours } from '../lib/quietHours';

describe('isWithinQuietWindow', () => {
  it('daytime window: inclusive start, exclusive end', () => {
    expect(isWithinQuietWindow('12:00', '09:00', '17:00')).toBe(true);
    expect(isWithinQuietWindow('09:00', '09:00', '17:00')).toBe(true);
    expect(isWithinQuietWindow('17:00', '09:00', '17:00')).toBe(false);
    expect(isWithinQuietWindow('08:59', '09:00', '17:00')).toBe(false);
  });

  it('overnight window wraps midnight', () => {
    expect(isWithinQuietWindow('23:00', '22:00', '06:00')).toBe(true);
    expect(isWithinQuietWindow('05:59', '22:00', '06:00')).toBe(true);
    expect(isWithinQuietWindow('22:00', '22:00', '06:00')).toBe(true);
    expect(isWithinQuietWindow('06:00', '22:00', '06:00')).toBe(false);
    expect(isWithinQuietWindow('12:00', '22:00', '06:00')).toBe(false);
  });

  it('a zero-length window matches nothing', () => {
    expect(isWithinQuietWindow('22:00', '22:00', '22:00')).toBe(false);
  });
});

describe('hhmmInZone / isDuringQuietHours', () => {
  it('formats a 24-hour wall time in a fixed zone', () => {
    expect(hhmmInZone(new Date('2026-06-13T23:30:00Z'), 'UTC')).toBe('23:30');
    expect(hhmmInZone(new Date('2026-06-13T00:05:00Z'), 'UTC')).toBe('00:05');
  });

  it('matches an instant against an overnight window', () => {
    expect(isDuringQuietHours(new Date('2026-06-13T23:30:00Z'), 'UTC', '22:00', '06:00')).toBe(true);
    expect(isDuringQuietHours(new Date('2026-06-13T12:00:00Z'), 'UTC', '22:00', '06:00')).toBe(false);
  });
});
