/**
 * devotionalTimes — derived voluntary (Sunnah) windows and the three times in
 * which prayer is discouraged (makruh / forbidden), computed entirely offline
 * from the engine's sun-based prayer times. No network, no API.
 *
 * The three forbidden windows (jumhur):
 *   1. From sunrise until the sun has fully risen (~the sun's disc clears the
 *      horizon — a short window after sunrise).
 *   2. When the sun is at its zenith (zawal / istiwa) just before Dhuhr.
 *   3. From when the sun yellows until it sets (a short window before Maghrib).
 *
 * Two further discouraged (makruh) spans on which the jumhur agree — these are
 * the long windows in which voluntary prayer without a cause is disliked:
 *   4. After praying Fajr until the sun has risen.
 *   5. After praying Asr until the sun sets.
 *
 * The voluntary windows:
 *   • Duha (Ishraq → Chasht): forenoon prayer, after sunrise clears until zawal.
 *   • Tahajjud: the last third of the night, the most beloved time to stand.
 */
import { getPrayerTimes, getSunnahTimes, type LatLng, type PrayerSettings } from './prayerTimes';

/** Minutes after sunrise before voluntary prayer becomes allowed again. */
const SUNRISE_CLEAR_MIN = 15;
/** Minutes before Dhuhr the sun is considered at its zenith. */
const ZAWAL_MIN = 6;
/** Minutes before Maghrib the sun begins to yellow/set. */
const SUNSET_YELLOW_MIN = 15;
/** Buffer after sunrise clears before Duha is recommended. */
const DUHA_START_MIN = 20;

export type WindowKind = 'forbidden' | 'sunnah';

/**
 * `strict` windows are the three short times in which all prayer (even with a
 * cause) is forbidden; `disliked` are the two long makruh spans after Fajr and
 * Asr in which only voluntary prayer without a cause is discouraged.
 */
export type ForbiddenSeverity = 'strict' | 'disliked';

export type DevotionalWindow = {
  id: string;
  kind: WindowKind;
  severity?: ForbiddenSeverity;
  label: string;
  arabic: string;
  note: string;
  start: Date;
  end: Date;
};

function addMinutes(d: Date, m: number): Date {
  return new Date(d.getTime() + m * 60000);
}

/**
 * All voluntary + forbidden windows for the given location and day, in
 * chronological order.
 */
export function getDevotionalWindows(
  location: LatLng,
  date: Date = new Date(),
  settings?: PrayerSettings,
): DevotionalWindow[] {
  const t = getPrayerTimes(location, date, settings);
  const s = getSunnahTimes(location, date, settings);

  const sunriseClear = addMinutes(t.sunrise, SUNRISE_CLEAR_MIN);
  const zawalStart = addMinutes(t.dhuhr, -ZAWAL_MIN);
  const sunsetStart = addMinutes(t.maghrib, -SUNSET_YELLOW_MIN);
  const duhaStart = addMinutes(t.sunrise, DUHA_START_MIN);

  const windows: DevotionalWindow[] = [
    {
      id: 'forbidden-after-fajr',
      kind: 'forbidden',
      severity: 'disliked',
      label: 'After Fajr',
      arabic: 'بعد الفجر',
      note: 'Voluntary prayer without a cause is disliked until sunrise.',
      start: t.fajr,
      end: t.sunrise,
    },
    {
      id: 'forbidden-sunrise',
      kind: 'forbidden',
      severity: 'strict',
      label: 'After sunrise',
      arabic: 'وقت الشروق',
      note: 'Until the sun has fully risen.',
      start: t.sunrise,
      end: sunriseClear,
    },
    {
      id: 'sunnah-duha',
      kind: 'sunnah',
      label: 'Duha (Ishraq)',
      arabic: 'صلاة الضحى',
      note: 'The forenoon prayer — beloved and rewarding.',
      start: duhaStart,
      end: zawalStart,
    },
    {
      id: 'forbidden-zawal',
      kind: 'forbidden',
      severity: 'strict',
      label: 'Zenith (Zawal)',
      arabic: 'وقت الاستواء',
      note: 'When the sun stands at its highest, before Dhuhr.',
      start: zawalStart,
      end: t.dhuhr,
    },
    {
      id: 'forbidden-after-asr',
      kind: 'forbidden',
      severity: 'disliked',
      label: 'After Asr',
      arabic: 'بعد العصر',
      note: 'Voluntary prayer without a cause is disliked until sunset.',
      start: t.asr,
      end: sunsetStart,
    },
    {
      id: 'forbidden-sunset',
      kind: 'forbidden',
      severity: 'strict',
      label: 'Before sunset',
      arabic: 'وقت الغروب',
      note: 'From when the sun yellows until it sets.',
      start: sunsetStart,
      end: t.maghrib,
    },
    {
      id: 'sunnah-tahajjud',
      kind: 'sunnah',
      label: 'Tahajjud',
      arabic: 'قيام الليل',
      note: 'The last third of the night — the most beloved standing.',
      start: s.lastThirdOfTheNight,
      end: t.fajr,
    },
  ];

  return windows.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** The forbidden window active at `now`, if any (for a live warning). */
export function activeForbiddenWindow(
  windows: DevotionalWindow[],
  now: Date = new Date(),
): DevotionalWindow | null {
  const ms = now.getTime();
  return (
    windows.find(
      (w) => w.kind === 'forbidden' && ms >= w.start.getTime() && ms < w.end.getTime(),
    ) ?? null
  );
}
