/**
 * useFormattedTime — a wall-clock time formatter bound to the user's region
 * settings (12/24-hour and Latin/Arabic numerals). Its signature matches the
 * pure clock.formatTime so screens can adopt it with no call-site changes.
 */
import { useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { formatTimeMode } from '../lib/clock';

export default function useFormattedTime(): (date: Date, timeZone: string) => string {
  const { settings } = useSettings();
  const mode = settings.region.timeFormat;
  const arabic = settings.region.numerals === 'arabic';
  return useCallback(
    (date: Date, timeZone: string) => formatTimeMode(date, timeZone, mode, arabic),
    [mode, arabic],
  );
}
