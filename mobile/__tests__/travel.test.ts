/**
 * Tests for the traveller's-concession logic (F24).
 */
import {
  DEFAULT_THRESHOLD_KM,
  FULL_RAKAHS,
  JOIN_PAIRS,
  MAX_THRESHOLD_KM,
  MIN_THRESHOLD_KM,
  TRAVEL_PRAYERS,
  canJoin,
  clampThreshold,
  distanceKm,
  isShortenable,
  joinPartner,
  rakahsFor,
  statusLabel,
  toObligatory,
  travelPrayers,
  travelStatus,
} from '../lib/travel';
import {
  DISTANCE_POSITIONS,
  DURATION_POSITIONS,
  JOIN_KINDS,
  QASR_RULE,
  TRAVEL_DISCLAIMER,
  TRAVEL_NOTES,
} from '../content/travel';

const MAKKAH = { latitude: 21.4225, longitude: 39.8262 };
const MADINAH = { latitude: 24.4672, longitude: 39.6112 };
const JEDDAH = { latitude: 21.4858, longitude: 39.1925 };

describe('content integrity', () => {
  it('presents several positions on distance and duration without choosing one', () => {
    expect(DISTANCE_POSITIONS.length).toBeGreaterThanOrEqual(3);
    expect(DURATION_POSITIONS.length).toBeGreaterThanOrEqual(3);
    for (const p of [...DISTANCE_POSITIONS, ...DURATION_POSITIONS]) {
      expect(p.held.length).toBeGreaterThan(0);
      expect(p.detail.length).toBeGreaterThan(20);
    }
    expect(TRAVEL_DISCLAIMER).toMatch(/does not choose a school/i);
  });

  it('states the qaṣr rule and offers both ways of joining', () => {
    expect(QASR_RULE).toMatch(/Fajr/);
    expect(QASR_RULE).toMatch(/Maghrib/);
    expect(JOIN_KINDS.map((k) => k.kind).sort()).toEqual(['takhir', 'taqdim']);
    expect(TRAVEL_NOTES.length).toBeGreaterThan(0);
  });
});

describe('rakʿah counts', () => {
  it('knows the resident counts', () => {
    expect(FULL_RAKAHS).toEqual({ fajr: 2, dhuhr: 4, asr: 4, maghrib: 3, isha: 4 });
    expect(TRAVEL_PRAYERS).toHaveLength(5);
  });

  it('shortens only the four-rakʿah prayers', () => {
    expect(isShortenable('dhuhr')).toBe(true);
    expect(isShortenable('asr')).toBe(true);
    expect(isShortenable('isha')).toBe(true);
    expect(isShortenable('fajr')).toBe(false);
    expect(isShortenable('maghrib')).toBe(false);
  });

  it('never shortens Fajr or Maghrib, even while travelling', () => {
    expect(rakahsFor('fajr', true)).toBe(2);
    expect(rakahsFor('maghrib', true)).toBe(3);
  });

  it('halves the four-rakʿah prayers while travelling', () => {
    expect(rakahsFor('dhuhr', true)).toBe(2);
    expect(rakahsFor('asr', true)).toBe(2);
    expect(rakahsFor('isha', true)).toBe(2);
  });

  it('leaves everything full when resident', () => {
    for (const p of TRAVEL_PRAYERS) {
      expect(rakahsFor(p, false)).toBe(FULL_RAKAHS[p]);
    }
  });
});

describe('joining', () => {
  it('pairs Ẓuhr with ʿAṣr and Maghrib with ʿIshāʾ', () => {
    expect(JOIN_PAIRS).toHaveLength(2);
    expect(joinPartner('dhuhr')).toBe('asr');
    expect(joinPartner('asr')).toBe('dhuhr');
    expect(joinPartner('maghrib')).toBe('isha');
    expect(joinPartner('isha')).toBe('maghrib');
  });

  it('never joins Fajr to anything', () => {
    expect(joinPartner('fajr')).toBeNull();
    expect(canJoin('fajr')).toBe(false);
  });
});

describe('travelPrayers', () => {
  it('describes the day while travelling', () => {
    const list = travelPrayers(true);
    expect(list).toHaveLength(5);
    const dhuhr = list.find((p) => p.prayer === 'dhuhr')!;
    expect(dhuhr).toMatchObject({ fullRakahs: 4, rakahs: 2, shortened: true, joinsWith: 'asr' });
    const fajr = list.find((p) => p.prayer === 'fajr')!;
    expect(fajr).toMatchObject({ fullRakahs: 2, rakahs: 2, shortened: false, joinsWith: null });
  });

  it('marks nothing shortened when resident', () => {
    expect(travelPrayers(false).every((p) => p.shortened === false)).toBe(true);
  });
});

describe('distance', () => {
  it('measures a known route to within a few percent', () => {
    // Makkah → Madīnah is roughly 340 km great-circle.
    const km = distanceKm(MAKKAH, MADINAH);
    expect(km).toBeGreaterThan(330);
    expect(km).toBeLessThan(360);
  });

  it('measures a short hop as short', () => {
    // Makkah → Jeddah is roughly 70 km.
    const km = distanceKm(MAKKAH, JEDDAH);
    expect(km).toBeGreaterThan(60);
    expect(km).toBeLessThan(80);
  });

  it('is zero for the same point', () => {
    expect(distanceKm(MAKKAH, MAKKAH)).toBeCloseTo(0, 5);
  });
});

describe('clampThreshold', () => {
  it('keeps the threshold sane', () => {
    expect(clampThreshold(80)).toBe(80);
    expect(clampThreshold(5)).toBe(MIN_THRESHOLD_KM);
    expect(clampThreshold(9999)).toBe(MAX_THRESHOLD_KM);
    expect(clampThreshold(NaN)).toBe(DEFAULT_THRESHOLD_KM);
  });
});

describe('travelStatus', () => {
  it('reports a traveller beyond the threshold', () => {
    const s = travelStatus({ home: MAKKAH, current: MADINAH });
    expect(s.qualifies).toBe(true);
    expect(s.travelling).toBe(true);
    expect(s.reason).toBe('distance');
    expect(statusLabel(s)).toMatch(/traveller/);
  });

  it('reports a resident inside the threshold', () => {
    const s = travelStatus({ home: MAKKAH, current: JEDDAH });
    expect(s.qualifies).toBe(false);
    expect(s.travelling).toBe(false);
    expect(statusLabel(s)).toMatch(/resident/);
  });

  it('respects a lowered threshold for those who follow custom', () => {
    const s = travelStatus({ home: MAKKAH, current: JEDDAH, thresholdKm: 40 });
    expect(s.travelling).toBe(true);
  });

  it('lets a manual override win in both directions', () => {
    const on = travelStatus({ home: MAKKAH, current: JEDDAH, override: 'on' });
    expect(on.travelling).toBe(true);
    expect(on.qualifies).toBe(false);
    expect(on.reason).toBe('manual-on');

    const off = travelStatus({ home: MAKKAH, current: MADINAH, override: 'off' });
    expect(off.travelling).toBe(false);
    expect(off.qualifies).toBe(true);
    expect(off.reason).toBe('manual-off');
  });

  it('asks for a home point when there is none', () => {
    const s = travelStatus({ home: null, current: MADINAH });
    expect(s.distanceKm).toBeNull();
    expect(s.travelling).toBe(false);
    expect(s.reason).toBe('no-home');
    expect(statusLabel(s)).toMatch(/Set your home/);
  });

  it('still honours a manual override with no home set', () => {
    const s = travelStatus({ home: null, current: null, override: 'on' });
    expect(s.travelling).toBe(true);
  });
});

describe('toObligatory', () => {
  it('maps prayer names, excluding sunrise', () => {
    expect(toObligatory('dhuhr')).toBe('dhuhr');
    expect(toObligatory('sunrise')).toBeNull();
  });
});
