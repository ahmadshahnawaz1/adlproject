/**
 * Prayer-time engine tests.
 *
 * This is the calculation the whole app rests on: a wrong time means a prayer
 * offered outside its window, and a wrong bearing means facing the wrong way.
 *
 * Fixed timetable references complement regression bearings and invariants.
 */
import {
  DEFAULT_SETTINGS,
  elevationShiftMinutes,
  getCurrentPrayer,
  getNextPrayer,
  getPrayerTimes,
  getQiblaDirection,
  getRawPrayerTimes,
  getSunnahTimes,
  type LatLng,
  type PrayerName,
  type PrayerSettings,
} from '../lib/prayerTimes';

const MAKKAH: LatLng = { latitude: 21.4225, longitude: 39.8262 };
const LONDON: LatLng = { latitude: 51.5074, longitude: -0.1278 };
const CAIRO: LatLng = { latitude: 30.0444, longitude: 31.2357 };
const JAKARTA: LatLng = { latitude: -6.2088, longitude: 106.8456 };
const TROMSO: LatLng = { latitude: 69.6492, longitude: 18.9553 };
const QUITO: LatLng = { latitude: -0.1807, longitude: -78.4678 };

const ORDER: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

const day = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
const minutes = (a: Date, b: Date) => (b.getTime() - a.getTime()) / 60000;

/** Smallest angle between two bearings — 359.9° and 0.1° are 0.2° apart. */
const bearingDelta = (a: number, b: number) => {
  const raw = Math.abs(a - b) % 360;
  return Math.min(raw, 360 - raw);
};

describe('qibla direction', () => {
  // Regression bearings in degrees from true north.
  it.each([
    ['London', LONDON, 118.99],
    ['Cairo', CAIRO, 136.14],
    ['Jakarta', JAKARTA, 295.15],
    ['New York', { latitude: 40.7128, longitude: -74.006 }, 58.48],
    ['Sydney', { latitude: -33.8688, longitude: 151.2093 }, 277.5],
    ['Istanbul', { latitude: 41.0082, longitude: 28.9784 }, 151.62],
  ] as [string, LatLng, number][])('points from %s to the Kaʿbah', (_name, at, expected) => {
    expect(getQiblaDirection(at)).toBeCloseTo(expected, 1);
  });

  it('points due south from directly north of the Kaʿbah', () => {
    const bearing = getQiblaDirection({ latitude: 45, longitude: MAKKAH.longitude });
    expect(bearingDelta(bearing, 180)).toBeLessThan(0.5);
  });

  it('points due north from directly south of the Kaʿbah', () => {
    // Due north can read as either 0° or 359.99…°, so compare around the wrap.
    const bearing = getQiblaDirection({ latitude: -10, longitude: MAKKAH.longitude });
    expect(bearingDelta(bearing, 0)).toBeLessThan(0.5);
  });

  it('turns west from due east and east from due west, along the same latitude', () => {
    const east = getQiblaDirection({ latitude: MAKKAH.latitude, longitude: MAKKAH.longitude + 40 });
    const west = getQiblaDirection({ latitude: MAKKAH.latitude, longitude: MAKKAH.longitude - 40 });
    expect(east).toBeGreaterThan(180);
    expect(east).toBeLessThan(360);
    expect(west).toBeGreaterThan(0);
    expect(west).toBeLessThan(180);
  });

  it('always returns a bearing on the compass', () => {
    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lon = -180; lon < 180; lon += 30) {
        const bearing = getQiblaDirection({ latitude: lat, longitude: lon });
        expect(Number.isFinite(bearing)).toBe(true);
        expect(bearing).toBeGreaterThanOrEqual(0);
        expect(bearing).toBeLessThan(360);
      }
    }
  });
});

describe('the order of the day', () => {
  const places: [string, LatLng][] = [
    ['Makkah', MAKKAH],
    ['London', LONDON],
    ['Cairo', CAIRO],
    ['Jakarta', JAKARTA],
    ['Quito', QUITO],
  ];
  // Solstices and equinoxes, where the extremes of the year live.
  const dates = [day(2026, 3, 20), day(2026, 6, 21), day(2026, 9, 22), day(2026, 12, 21)];

  it.each(places)('%s keeps the prayers in order all year', (_name, at) => {
    for (const date of dates) {
      const t = getPrayerTimes(at, date);
      for (let i = 1; i < ORDER.length; i += 1) {
        const prev = t[ORDER[i - 1]];
        const next = t[ORDER[i]];
        expect(Number.isFinite(prev.getTime())).toBe(true);
        expect(next.getTime()).toBeGreaterThan(prev.getTime());
      }
    }
  });

  it('puts every prayer on a real clock, never NaN', () => {
    for (const [, at] of places) {
      for (const date of dates) {
        for (const name of ORDER) {
          expect(Number.isNaN(getPrayerTimes(at, date)[name].getTime())).toBe(false);
        }
      }
    }
  });

  it('separates dawn from sunrise by a sensible margin', () => {
    const t = getPrayerTimes(CAIRO, day(2026, 3, 20));
    const gap = minutes(t.fajr, t.sunrise);
    expect(gap).toBeGreaterThan(45);
    expect(gap).toBeLessThan(150);
  });
});

describe('the school of Asr', () => {
  it('places the Ḥanafī ʿAṣr later than the standard one', () => {
    for (const at of [MAKKAH, LONDON, JAKARTA]) {
      const standard = getPrayerTimes(at, day(2026, 5, 10), {
        ...DEFAULT_SETTINGS,
        madhab: 'Standard',
      });
      const hanafi = getPrayerTimes(at, day(2026, 5, 10), {
        ...DEFAULT_SETTINGS,
        madhab: 'Hanafi',
      });
      expect(hanafi.asr.getTime()).toBeGreaterThan(standard.asr.getTime());
    }
  });

  it('leaves the other prayers where they were', () => {
    const standard = getPrayerTimes(CAIRO, day(2026, 5, 10), {
      ...DEFAULT_SETTINGS,
      madhab: 'Standard',
    });
    const hanafi = getPrayerTimes(CAIRO, day(2026, 5, 10), {
      ...DEFAULT_SETTINGS,
      madhab: 'Hanafi',
    });
    for (const name of ['fajr', 'sunrise', 'dhuhr', 'maghrib', 'isha'] as PrayerName[]) {
      expect(hanafi[name].getTime()).toBe(standard[name].getTime());
    }
  });
});

describe('calculation methods', () => {
  it('gives a shallower twilight angle a later dawn', () => {
    // Muslim World League uses 18° for Fajr; the Egyptian authority uses 19.5°.
    const mwl = getPrayerTimes(CAIRO, day(2026, 5, 10), {
      ...DEFAULT_SETTINGS,
      method: 'MuslimWorldLeague',
    });
    const egypt = getPrayerTimes(CAIRO, day(2026, 5, 10), {
      ...DEFAULT_SETTINGS,
      method: 'Egyptian',
    });
    expect(egypt.fajr.getTime()).toBeLessThan(mwl.fajr.getTime());
  });

  it('agrees on midday whichever authority is chosen', () => {
    const methods = ['MuslimWorldLeague', 'Egyptian', 'Karachi', 'NorthAmerica'] as const;
    const noons = methods.map((method) =>
      getPrayerTimes(CAIRO, day(2026, 5, 10), { ...DEFAULT_SETTINGS, method }).dhuhr.getTime(),
    );
    for (const noon of noons) expect(noon).toBe(noons[0]);
  });

  it('honours an overridden twilight angle', () => {
    const base = getPrayerTimes(CAIRO, day(2026, 5, 10), DEFAULT_SETTINGS);
    const deeper = getPrayerTimes(CAIRO, day(2026, 5, 10), { ...DEFAULT_SETTINGS, fajrAngle: 20 });
    expect(deeper.fajr.getTime()).toBeLessThan(base.fajr.getTime());
  });

  it('honours a fixed interval for ʿIshāʾ', () => {
    const t = getPrayerTimes(MAKKAH, day(2026, 5, 10), { ...DEFAULT_SETTINGS, ishaInterval: 90 });
    expect(minutes(t.maghrib, t.isha)).toBeCloseTo(90, 0);
  });

  it('produces a usable day for every method it offers', () => {
    const methods = [
      'MuslimWorldLeague',
      'UmmAlQura',
      'Egyptian',
      'Karachi',
      'NorthAmerica',
      'Dubai',
      'Kuwait',
      'Qatar',
      'Singapore',
      'Tehran',
      'Turkey',
      'Other',
    ] as const;
    for (const method of methods) {
      const t = getPrayerTimes(CAIRO, day(2026, 5, 10), { ...DEFAULT_SETTINGS, method });
      for (const name of ORDER) expect(Number.isNaN(t[name].getTime())).toBe(false);
    }
  });
});

describe('minute adjustments', () => {
  it('shifts a prayer by exactly the minutes given', () => {
    const base = getPrayerTimes(CAIRO, day(2026, 5, 10), DEFAULT_SETTINGS);
    const nudged = getPrayerTimes(CAIRO, day(2026, 5, 10), {
      ...DEFAULT_SETTINGS,
      adjustments: { fajr: 5, isha: -7 },
    });
    expect(minutes(base.fajr, nudged.fajr)).toBeCloseTo(5, 0);
    expect(minutes(base.isha, nudged.isha)).toBeCloseTo(-7, 0);
    expect(nudged.dhuhr.getTime()).toBe(base.dhuhr.getTime());
  });

  it('adds a committee offset on top of a user nudge', () => {
    const base = getPrayerTimes(CAIRO, day(2026, 5, 10), DEFAULT_SETTINGS);
    const both = getPrayerTimes(CAIRO, day(2026, 5, 10), {
      ...DEFAULT_SETTINGS,
      methodAdjustments: { asr: 2 },
      adjustments: { asr: 3 },
    });
    expect(minutes(base.asr, both.asr)).toBeCloseTo(5, 0);
  });
});

describe('elevation', () => {
  it('ignores sea level and anything below it', () => {
    expect(elevationShiftMinutes(0, 21)).toBe(0);
    expect(elevationShiftMinutes(-100, 21)).toBe(0);
  });

  it('grows with height and never runs away', () => {
    const shifts = [100, 500, 1000, 3000, 5000, 9000].map((h) => elevationShiftMinutes(h, 21));
    for (let i = 1; i < shifts.length; i += 1)
      expect(shifts[i]).toBeGreaterThanOrEqual(shifts[i - 1]);
    expect(Math.max(...shifts)).toBeLessThanOrEqual(8);
  });

  it('matters more the further you are from the equator', () => {
    expect(elevationShiftMinutes(1000, 60)).toBeGreaterThan(elevationShiftMinutes(1000, 0));
  });

  it('brings sunrise forward and holds Maghrib back', () => {
    const at = { latitude: 21.4225, longitude: 39.8262 };
    const base = getPrayerTimes(at, day(2026, 5, 10), DEFAULT_SETTINGS);
    const high = getPrayerTimes(at, day(2026, 5, 10), { ...DEFAULT_SETTINGS, elevation: 2000 });
    expect(high.sunrise.getTime()).toBeLessThan(base.sunrise.getTime());
    expect(high.maghrib.getTime()).toBeGreaterThan(base.maghrib.getTime());
  });

  it('leaves the twilight prayers alone, which are set by sun angle', () => {
    const at = { latitude: 21.4225, longitude: 39.8262 };
    const base = getPrayerTimes(at, day(2026, 5, 10), DEFAULT_SETTINGS);
    const high = getPrayerTimes(at, day(2026, 5, 10), { ...DEFAULT_SETTINGS, elevation: 2000 });
    expect(high.fajr.getTime()).toBe(base.fajr.getTime());
    expect(high.isha.getTime()).toBe(base.isha.getTime());
  });
});

describe('the far north, where the sun barely sets', () => {
  const midsummer = day(2026, 6, 21);
  const midwinter = day(2026, 12, 21);

  it('still produces real times through the midnight sun', () => {
    for (const date of [midsummer, midwinter]) {
      const t = getPrayerTimes(TROMSO, date, DEFAULT_SETTINGS);
      for (const name of ORDER) expect(Number.isNaN(t[name].getTime())).toBe(false);
    }
  });

  it('keeps them in order under every high-latitude rule', () => {
    const rules = ['MiddleOfTheNight', 'SeventhOfTheNight', 'TwilightAngle'] as const;
    for (const highLatitudeRule of rules) {
      const t = getPrayerTimes(TROMSO, midsummer, { ...DEFAULT_SETTINGS, highLatitudeRule });
      for (let i = 1; i < ORDER.length; i += 1) {
        expect(t[ORDER[i]].getTime()).toBeGreaterThan(t[ORDER[i - 1]].getTime());
      }
    }
  });
});

describe('which prayer is now', () => {
  const at = CAIRO;
  const date = day(2026, 5, 10);
  const times = getPrayerTimes(at, date);
  const at5MinBefore = (d: Date) => new Date(d.getTime() - 5 * 60000);
  const at5MinAfter = (d: Date) => new Date(d.getTime() + 5 * 60000);

  it('names nothing before dawn', () => {
    expect(getCurrentPrayer(at, at5MinBefore(times.fajr))).toBeNull();
  });

  it('names the prayer whose time has come', () => {
    expect(getCurrentPrayer(at, at5MinAfter(times.fajr))).toBe('fajr');
    expect(getCurrentPrayer(at, at5MinAfter(times.dhuhr))).toBe('dhuhr');
    expect(getCurrentPrayer(at, at5MinAfter(times.isha))).toBe('isha');
  });

  it('looks ahead to the next one', () => {
    expect(getNextPrayer(at, at5MinBefore(times.fajr))?.name).toBe('fajr');
    expect(getNextPrayer(at, at5MinAfter(times.dhuhr))?.name).toBe('asr');
  });

  it('gives the next prayer the time it actually falls at', () => {
    const next = getNextPrayer(at, at5MinAfter(times.dhuhr));
    expect(next!.time.getTime()).toBe(times.asr.getTime());
  });

  it('reports nothing further once ʿIshāʾ has passed', () => {
    expect(getNextPrayer(at, at5MinAfter(times.isha))).toBeNull();
  });
});

describe('the night', () => {
  it('sets the last third after the middle, and both after Maghrib', () => {
    const t = getPrayerTimes(CAIRO, day(2026, 5, 10));
    const sunnah = getSunnahTimes(CAIRO, day(2026, 5, 10));
    expect(sunnah.middleOfTheNight.getTime()).toBeGreaterThan(t.maghrib.getTime());
    expect(sunnah.lastThirdOfTheNight.getTime()).toBeGreaterThan(sunnah.middleOfTheNight.getTime());
  });
});

describe('dependability', () => {
  it('gives the same answer every time it is asked', () => {
    const a = getPrayerTimes(LONDON, day(2026, 7, 4));
    const b = getPrayerTimes(LONDON, day(2026, 7, 4));
    for (const name of ORDER) expect(a[name].getTime()).toBe(b[name].getTime());
  });

  it('does not carry settings over between calls', () => {
    const hanafi: PrayerSettings = { ...DEFAULT_SETTINGS, madhab: 'Hanafi' };
    getPrayerTimes(CAIRO, day(2026, 5, 10), hanafi);
    const after = getPrayerTimes(CAIRO, day(2026, 5, 10), DEFAULT_SETTINGS);
    const fresh = getPrayerTimes(CAIRO, day(2026, 5, 10), { ...DEFAULT_SETTINGS });
    expect(after.asr.getTime()).toBe(fresh.asr.getTime());
  });

  it('defaults to a mainstream, safe configuration', () => {
    expect(DEFAULT_SETTINGS.method).toBe('MuslimWorldLeague');
    expect(DEFAULT_SETTINGS.madhab).toBe('Standard');
    expect(DEFAULT_SETTINGS.highLatitudeRule).toBe('MiddleOfTheNight');
  });

  it('exposes the underlying engine for callers that need it', () => {
    const raw = getRawPrayerTimes(CAIRO, day(2026, 5, 10));
    expect(raw.fajr).toBeInstanceOf(Date);
    expect(raw.timeForPrayer('asr')).toBeInstanceOf(Date);
  });

  it('moves the day on when the date does', () => {
    const first = getPrayerTimes(CAIRO, day(2026, 5, 10));
    const second = getPrayerTimes(CAIRO, day(2026, 5, 11));
    expect(second.fajr.getTime()).toBeGreaterThan(first.fajr.getTime());
  });
});

describe('published timetable fixtures', () => {
  const references = [
    {
      city: 'Makkah',
      location: { latitude: 21.427009, longitude: 39.828685 },
      method: 'UmmAlQura',
      timeZone: 'Asia/Riyadh',
      source:
        'https://github.com/batoulapps/adhan-js/blob/develop/Shared/Times/Makkah-UmmAlQura.json',
      samples: [
        { date: [2016, 1, 5], expected: ['05:38', '07:00', '12:26', '15:31', '17:52', '19:22'] },
        { date: [2016, 12, 4], expected: ['05:23', '06:44', '12:11', '15:17', '17:38', '19:08'] },
      ],
    },
    {
      city: 'Dubai',
      location: { latitude: 25.263056, longitude: 55.297222 },
      method: 'Dubai',
      timeZone: 'Asia/Dubai',
      source: 'https://github.com/batoulapps/adhan-js/blob/develop/Shared/Times/Dubai-Gulf.json',
      samples: [
        { date: [2018, 1, 1], expected: ['05:42', '07:01', '12:25', '15:24', '17:44', '19:03'] },
        { date: [2018, 12, 1], expected: ['05:25', '06:43', '12:11', '15:11', '17:32', '18:50'] },
      ],
    },
  ] as const;

  it.each(references)('$city matches its published fixtures within one minute', (reference) => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: reference.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    for (const sample of reference.samples) {
      const [year, month, date] = sample.date;
      const times = getPrayerTimes(reference.location, new Date(year, month - 1, date, 12), {
        ...DEFAULT_SETTINGS,
        method: reference.method,
      });
      for (const [index, prayer] of ORDER.entries()) {
        const [actualHour, actualMinute] = formatter.format(times[prayer]).split(':').map(Number);
        const [expectedHour, expectedMinute] = sample.expected[index].split(':').map(Number);
        const difference = Math.abs(
          actualHour * 60 + actualMinute - expectedHour * 60 - expectedMinute,
        );
        expect({
          city: reference.city,
          date: sample.date,
          prayer,
          withinOneMinute: difference <= 1,
        }).toEqual({ city: reference.city, date: sample.date, prayer, withinOneMinute: true });
      }
    }
  });
});
