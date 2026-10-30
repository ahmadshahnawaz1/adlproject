/**
 * Tests for the shared clock helpers.
 */
import {
  dayKey,
  toArabicDigits,
  formatTimeMode,
  formatCountdown,
  formatDuration,
} from '../lib/clock';

describe('toArabicDigits', () => {
  it('converts Western digits to Arabic-Indic', () => {
    expect(toArabicDigits('6:15')).toBe('٦:١٥');
    expect(toArabicDigits('2026-01-05')).toBe('٢٠٢٦-٠١-٠٥');
  });

  it('leaves non-digits untouched', () => {
    expect(toArabicDigits('no digits here')).toBe('no digits here');
  });
});

describe('formatTimeMode', () => {
  const d = new Date('2026-06-13T18:05:00Z');

  it('formats 12-hour with a meridiem', () => {
    expect(formatTimeMode(d, 'UTC', '12h')).toMatch(/6:05\s?PM/i);
  });

  it('formats 24-hour without a meridiem', () => {
    expect(formatTimeMode(d, 'UTC', '24h')).toBe('18:05');
  });

  it('applies Arabic numerals', () => {
    expect(formatTimeMode(d, 'UTC', '24h', true)).toBe('١٨:٠٥');
  });
});

describe('dayKey', () => {
  it('is a stable YYYY-MM-DD key', () => {
    expect(dayKey(new Date('2026-01-05T12:00:00'))).toBe('2026-01-05');
  });
});

describe('formatCountdown / formatDuration', () => {
  it('countdown drops the hour when under an hour', () => {
    expect(formatCountdown(0)).toBe('0:00');
    expect(formatCountdown(3661000)).toBe('1:01:01');
    expect(formatCountdown(125000)).toBe('2:05');
  });

  it('duration reads in hours and minutes', () => {
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(45 * 60000)).toBe('45m');
    expect(formatDuration(80 * 60000)).toBe('1h 20m');
  });
});
