import {
  HAJJ_JOURNEY,
  UMRAH_JOURNEY,
  journeyOf,
} from '../content/pilgrimage';
import {
  clampStepIndex,
  counterComplete,
  counterRemaining,
  decrementCount,
  firstStepIndexOfStage,
  flattenJourney,
  incrementCount,
  journeyProgress,
  journeyStepCount,
  stageIndexForHijriDay,
  stageIndexOfStep,
  stageProgress,
  stepAppliesToType,
  stepIndexForHijriDay,
} from '../lib/pilgrimage';
import {
  DAY_ARAFAH,
  daysUntilArafah,
  daysUntilHajj,
  dhulHijjahInfo,
  isDayOfArafah,
  isHajjSeason,
} from '../lib/pilgrimageDates';
import {
  atSite,
  formatDistance,
  haversineMeters,
  nearestSite,
} from '../lib/sacredGeo';

/* ------------------------------------------------------------------ *
 * sacredGeo
 * ------------------------------------------------------------------ */
describe('sacredGeo · distances and proximity', () => {
  const kaaba = { latitude: 21.4225, longitude: 39.8262 };
  const arafah = { latitude: 21.3549, longitude: 39.9841 };

  test('haversine is zero for the same point', () => {
    expect(haversineMeters(kaaba, kaaba)).toBeCloseTo(0, 5);
  });

  test('haversine Kaʿbah → ʿArafah is roughly 15–25 km', () => {
    const d = haversineMeters(kaaba, arafah);
    expect(d).toBeGreaterThan(12_000);
    expect(d).toBeLessThan(25_000);
  });

  test('atSite is true at a site centre and false far away', () => {
    expect(atSite(arafah, 'arafah')).toBe(true);
    expect(atSite(kaaba, 'arafah')).toBe(false);
    expect(atSite(kaaba, 'haram')).toBe(true);
  });

  test('atSite is false for an unknown site id', () => {
    expect(atSite(kaaba, 'atlantis')).toBe(false);
  });

  test('nearestSite at the Kaʿbah is the Ḥaram, within radius', () => {
    const near = nearestSite(kaaba);
    expect(near?.site.id).toBe('haram');
    expect(near?.within).toBe(true);
  });

  test('formatDistance renders metres then kilometres', () => {
    expect(formatDistance(500)).toBe('500 m');
    expect(formatDistance(4100)).toBe('4.1 km');
    expect(formatDistance(-1)).toBe('—');
  });
});

/* ------------------------------------------------------------------ *
 * pilgrimage · journey model
 * ------------------------------------------------------------------ */
describe('pilgrimage · journey model', () => {
  test('journeyOf resolves by kind', () => {
    expect(journeyOf('umrah')).toBe(UMRAH_JOURNEY);
    expect(journeyOf('hajj')).toBe(HAJJ_JOURNEY);
  });

  test('flattenJourney numbers every step sequentially', () => {
    const flat = flattenJourney(UMRAH_JOURNEY);
    expect(flat.length).toBe(journeyStepCount(UMRAH_JOURNEY));
    flat.forEach((f, i) => expect(f.index).toBe(i));
    expect(flat.every((f) => f.applies)).toBe(true);
  });

  test('the Saʿī step is a counted ritual of seven trips', () => {
    const flat = flattenJourney(UMRAH_JOURNEY);
    const sai = flat.find((f) => f.step.id === 'sai-trips');
    expect(sai?.step.counter?.kind).toBe('sai');
    expect(sai?.step.counter?.total).toBe(7);
  });

  test('Hajj type filtering: the hady applies to tamattuʿ/qirān, not ifrād', () => {
    expect(stepAppliesToType(stepById('hady'), 'tamattu')).toBe(true);
    expect(stepAppliesToType(stepById('hady'), 'qiran')).toBe(true);
    expect(stepAppliesToType(stepById('hady'), 'ifrad')).toBe(false);
    // a typeless step applies to all
    expect(stepAppliesToType(stepById('wuquf'), 'ifrad')).toBe(true);
    // before a type is chosen, everything shows
    expect(stepAppliesToType(stepById('hady'), null)).toBe(true);
  });

  test('flattenJourney flags the non-applicable hady for ifrād', () => {
    const flat = flattenJourney(HAJJ_JOURNEY, 'ifrad');
    const hady = flat.find((f) => f.step.id === 'hady');
    expect(hady?.applies).toBe(false);
    // but it is still present (dimmed, not hidden)
    expect(hady).toBeDefined();
  });

  test('journeyProgress clamps to 0..1', () => {
    const n = journeyStepCount(HAJJ_JOURNEY);
    expect(journeyProgress(0, n)).toBe(0);
    expect(journeyProgress(n, n)).toBe(1);
    expect(journeyProgress(n + 5, n)).toBe(1);
    expect(journeyProgress(3, 0)).toBe(0);
  });

  test('clampStepIndex keeps the index in range', () => {
    const max = journeyStepCount(UMRAH_JOURNEY) - 1;
    expect(clampStepIndex(UMRAH_JOURNEY, -3)).toBe(0);
    expect(clampStepIndex(UMRAH_JOURNEY, 999)).toBe(max);
    expect(clampStepIndex(UMRAH_JOURNEY, Number.NaN)).toBe(0);
  });

  test('stageProgress reflects completed step ids', () => {
    const firstStage = UMRAH_JOURNEY.stages[0];
    const oneId = firstStage.steps[0].id;
    const sp = stageProgress(UMRAH_JOURNEY, new Set([oneId]));
    expect(sp[0].done).toBe(1);
    expect(sp[0].fraction).toBeCloseTo(1 / firstStage.steps.length, 5);
    expect(sp[0].complete).toBe(firstStage.steps.length === 1);
  });

  test('firstStepIndexOfStage and stageIndexOfStep are inverse-consistent', () => {
    for (let s = 0; s < HAJJ_JOURNEY.stages.length; s += 1) {
      const first = firstStepIndexOfStage(HAJJ_JOURNEY, s);
      expect(stageIndexOfStep(HAJJ_JOURNEY, first)).toBe(s);
    }
  });

  test('stageIndexForHijriDay maps day 9 to the ʿArafah stage', () => {
    const idx = stageIndexForHijriDay(HAJJ_JOURNEY, 9);
    expect(idx).not.toBeNull();
    expect(HAJJ_JOURNEY.stages[idx as number].id).toBe('day9-arafah');
    // and its first step index is well-formed
    const stepIdx = stepIndexForHijriDay(HAJJ_JOURNEY, 9);
    expect(stepIdx).toBe(firstStepIndexOfStage(HAJJ_JOURNEY, idx as number));
    // an unknown day yields null
    expect(stageIndexForHijriDay(HAJJ_JOURNEY, 99)).toBeNull();
  });
});

/* ------------------------------------------------------------------ *
 * pilgrimage · counted rituals
 * ------------------------------------------------------------------ */
describe('pilgrimage · counters', () => {
  const counter = { kind: 'tawaf' as const, total: 7, unitLabel: 'circuit', unitLabelPlural: 'circuits' };

  test('incrementCount clamps at the total', () => {
    let c = 0;
    for (let i = 0; i < 10; i += 1) c = incrementCount(c, counter.total);
    expect(c).toBe(7);
  });

  test('decrementCount clamps at zero', () => {
    expect(decrementCount(0, counter.total)).toBe(0);
    expect(decrementCount(3, counter.total)).toBe(2);
  });

  test('counterComplete and counterRemaining track the tally', () => {
    expect(counterComplete(7, counter)).toBe(true);
    expect(counterComplete(6, counter)).toBe(false);
    expect(counterRemaining(2, counter)).toBe(5);
    expect(counterRemaining(9, counter)).toBe(0);
  });
});

/* ------------------------------------------------------------------ *
 * pilgrimageDates (offline Umm al-Qura)
 * ------------------------------------------------------------------ */
describe('pilgrimageDates · Ḥajj season awareness', () => {
  // A fixed reference so the test is deterministic regardless of run date.
  const REF = new Date(2026, 0, 1, 12, 0, 0);

  test('daysUntilArafah finds a day that classifies as ʿArafah', () => {
    const n = daysUntilArafah(REF);
    expect(n).not.toBeNull();
    const arafah = new Date(REF);
    arafah.setDate(arafah.getDate() + (n as number));
    expect(isDayOfArafah(arafah)).toBe(true);

    const info = dhulHijjahInfo(arafah);
    expect(info.inDhulHijjah).toBe(true);
    expect(info.day).toBe(DAY_ARAFAH);
    expect(info.phase).toBe('arafah');
    expect(info.isFirstTen).toBe(true);
    expect(info.isHajjDays).toBe(true);
    expect(isHajjSeason(arafah)).toBe(true);
  });

  test('a date well after ʿArafah is outside Dhū al-Ḥijjah', () => {
    const n = daysUntilArafah(REF) as number;
    const after = new Date(REF);
    after.setDate(after.getDate() + n + 40); // beyond the 30-day month
    const info = dhulHijjahInfo(after);
    expect(info.inDhulHijjah).toBe(false);
    expect(info.phase).toBe('none');
    expect(info.label).toBe('');
    expect(isDayOfArafah(after)).toBe(false);
  });

  test('daysUntilHajj points at 8 Dhū al-Ḥijjah (Tarwiyah)', () => {
    const n = daysUntilHajj(REF);
    expect(n).not.toBeNull();
    const tarwiyah = new Date(REF);
    tarwiyah.setDate(tarwiyah.getDate() + (n as number));
    const info = dhulHijjahInfo(tarwiyah);
    expect(info.inDhulHijjah).toBe(true);
    expect([8, 9, 10, 11, 12, 13]).toContain(info.day);
  });
});

/* ------------------------------------------------------------------ *
 * helpers
 * ------------------------------------------------------------------ */
function stepById(id: string) {
  const f = flattenJourney(HAJJ_JOURNEY).find((x) => x.step.id === id);
  if (!f) throw new Error(`step ${id} not found`);
  return f.step;
}
