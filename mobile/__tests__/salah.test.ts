import {
  DEFAULT_PRAYER_ID,
  expandPrayer,
  getPrayerSteps,
  prayerById,
  rakahNumbers,
  rankLabel,
} from '../lib/salah';
import type { SalahStep } from '../content/salah';

/** The recitation ids present in a step, in order. */
function recIds(step: SalahStep): string[] {
  return step.recitations.map((r) => r.id);
}

/** The keys of a step list, in order. */
function keys(steps: SalahStep[]): string[] {
  return steps.map((s) => s.key);
}

/** Find the standing step of a given rakʿah. */
function qiyamOf(steps: SalahStep[], rakah: number): SalahStep | undefined {
  return steps.find((s) => s.key === `r${rakah}-qiyam`);
}

const fajr = prayerById('fajr')!;
const dhuhr = prayerById('dhuhr')!;
const asr = prayerById('asr')!;
const maghrib = prayerById('maghrib')!;
const isha = prayerById('isha')!;
const witr = prayerById('witr')!;
const janazah = prayerById('janazah')!;

/* ------------------------------------------------------------------ *
 * the catalogue
 * ------------------------------------------------------------------ */
describe('salah · the prayer catalogue', () => {
  test('the default prayer exists and is Fajr', () => {
    expect(DEFAULT_PRAYER_ID).toBe('fajr');
    expect(prayerById(DEFAULT_PRAYER_ID)?.id).toBe('fajr');
  });

  test('every prayer is resolvable and well-formed', () => {
    for (const id of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'witr', 'janazah'] as const) {
      const p = prayerById(id);
      expect(p).toBeDefined();
      expect(p?.name.length).toBeGreaterThan(0);
      expect(p?.arabic.length).toBeGreaterThan(0);
    }
  });

  test('prayerById returns undefined for an unknown id', () => {
    // @ts-expect-error — deliberately passing an invalid id
    expect(prayerById('tahajjud')).toBeUndefined();
  });

  test('the rakʿah counts and audible rakaʿāt are correct', () => {
    expect(fajr.rakahCount).toBe(2);
    expect(dhuhr.rakahCount).toBe(4);
    expect(maghrib.rakahCount).toBe(3);
    expect(isha.rakahCount).toBe(4);
    expect(fajr.audibleRakahs).toBe(2);
    expect(dhuhr.audibleRakahs).toBe(0);
    expect(maghrib.audibleRakahs).toBe(2);
    expect(isha.audibleRakahs).toBe(2);
  });
});

/* ------------------------------------------------------------------ *
 * structural shape of every expansion
 * ------------------------------------------------------------------ */
describe('salah · expansion structure', () => {
  test('every step carries a key, a posture and at least one recitation', () => {
    for (const p of [fajr, dhuhr, asr, maghrib, isha, witr, janazah]) {
      for (const step of expandPrayer(p)) {
        expect(step.key.length).toBeGreaterThan(0);
        expect(step.posture.length).toBeGreaterThan(0);
        expect(step.recitations.length).toBeGreaterThan(0);
      }
    }
  });

  test('keys are unique within a prayer', () => {
    for (const p of [fajr, dhuhr, asr, maghrib, isha, witr]) {
      const k = keys(expandPrayer(p));
      expect(new Set(k).size).toBe(k.length);
    }
  });

  test('a daily prayer opens with the takbīr and the opening supplication', () => {
    const steps = expandPrayer(dhuhr);
    expect(steps[0].key).toBe('r1-takbir');
    expect(recIds(steps[0])).toEqual(['takbir', 'istiftah']);
  });

  test('there is exactly one opening takbīr', () => {
    const openings = expandPrayer(isha).filter((s) => s.key === 'r1-takbir');
    expect(openings).toHaveLength(1);
  });

  test('a daily prayer ends with the salām', () => {
    const steps = expandPrayer(maghrib);
    const last = steps[steps.length - 1];
    expect(last.key).toBe('salam');
    expect(last.posture).toBe('salam');
    expect(recIds(last)).toEqual(['salam']);
  });

  test('rakahNumbers lists each rakʿah once, in order', () => {
    expect(rakahNumbers(expandPrayer(fajr))).toEqual([1, 2]);
    expect(rakahNumbers(expandPrayer(maghrib))).toEqual([1, 2, 3]);
    expect(rakahNumbers(expandPrayer(isha))).toEqual([1, 2, 3, 4]);
  });

  test('each rakʿah contains a bow, a rising and two prostrations', () => {
    const steps = expandPrayer(dhuhr);
    for (let r = 1; r <= 4; r++) {
      expect(steps.find((s) => s.key === `r${r}-ruku`)).toBeDefined();
      expect(steps.find((s) => s.key === `r${r}-itidal`)).toBeDefined();
      expect(steps.find((s) => s.key === `r${r}-sujud-1`)).toBeDefined();
      expect(steps.find((s) => s.key === `r${r}-sujud-2`)).toBeDefined();
      expect(steps.find((s) => s.key === `r${r}-julus`)).toBeDefined();
    }
  });

  test('the expanded step counts match the structure', () => {
    expect(expandPrayer(fajr)).toHaveLength(15);
    expect(expandPrayer(maghrib)).toHaveLength(22);
    expect(expandPrayer(dhuhr)).toHaveLength(28);
    expect(expandPrayer(isha)).toHaveLength(28);
    expect(expandPrayer(witr)).toHaveLength(22);
  });
});

/* ------------------------------------------------------------------ *
 * recitation placement
 * ------------------------------------------------------------------ */
describe('salah · recitation placement', () => {
  test('al-Fātiḥah is recited in every standing', () => {
    const steps = expandPrayer(dhuhr);
    for (let r = 1; r <= 4; r++) {
      expect(recIds(qiyamOf(steps, r)!)).toContain('fatihah');
    }
  });

  test('a sūrah follows al-Fātiḥah only in the first two rakaʿāt', () => {
    const steps = expandPrayer(dhuhr);
    expect(recIds(qiyamOf(steps, 1)!)).toContain('surah-ikhlas');
    expect(recIds(qiyamOf(steps, 2)!)).toContain('surah-ikhlas');
    expect(recIds(qiyamOf(steps, 3)!)).not.toContain('surah-ikhlas');
    expect(recIds(qiyamOf(steps, 4)!)).not.toContain('surah-ikhlas');
  });

  test('the seeking of refuge is said once, in the first standing', () => {
    const steps = expandPrayer(maghrib);
    expect(recIds(qiyamOf(steps, 1)!)).toContain('taawwudh');
    expect(recIds(qiyamOf(steps, 2)!)).not.toContain('taawwudh');
    expect(recIds(qiyamOf(steps, 3)!)).not.toContain('taawwudh');
  });

  test('the bow and prostration carry their tasbīḥ, repeated three times', () => {
    const steps = expandPrayer(fajr);
    const ruku = steps.find((s) => s.key === 'r1-ruku')!;
    const sujud = steps.find((s) => s.key === 'r1-sujud-1')!;
    expect(recIds(ruku)).toEqual(['tasbih-ruku']);
    expect(ruku.recitations[0].repeat).toBe(3);
    expect(recIds(sujud)).toEqual(['tasbih-sujud']);
    expect(sujud.recitations[0].repeat).toBe(3);
  });
});

/* ------------------------------------------------------------------ *
 * the sittings (tashahhud)
 * ------------------------------------------------------------------ */
describe('salah · the sittings', () => {
  test('a two-rakʿah prayer has only the final sitting', () => {
    const steps = expandPrayer(fajr);
    const sittings = steps.filter((s) => s.posture === 'tashahhud');
    expect(sittings).toHaveLength(1);
    expect(sittings[0].variant).toBe('final');
    expect(recIds(sittings[0])).toEqual(['tashahhud', 'salah-nabi', 'dua-before-salam']);
  });

  test('a three-rakʿah prayer sits first after the second rakʿah, then finally after the third', () => {
    const steps = expandPrayer(maghrib);
    const first = steps.find((s) => s.key === 'r2-tashahhud-first');
    const final = steps.find((s) => s.key === 'r3-tashahhud-final');
    expect(first?.variant).toBe('first');
    expect(recIds(first!)).toEqual(['tashahhud']);
    expect(final?.variant).toBe('final');
  });

  test('a four-rakʿah prayer sits first after the second and finally after the fourth', () => {
    const steps = expandPrayer(isha);
    expect(steps.find((s) => s.key === 'r2-tashahhud-first')?.variant).toBe('first');
    expect(steps.find((s) => s.key === 'r4-tashahhud-final')?.variant).toBe('final');
    // no sitting after the first or third rakʿah
    expect(steps.find((s) => s.key === 'r1-tashahhud-first')).toBeUndefined();
    expect(steps.find((s) => s.key === 'r3-tashahhud-first')).toBeUndefined();
  });

  test('only the final sitting adds the blessings and the supplication before salām', () => {
    const steps = expandPrayer(dhuhr);
    const first = steps.find((s) => s.key === 'r2-tashahhud-first')!;
    const final = steps.find((s) => s.key === 'r4-tashahhud-final')!;
    expect(recIds(first)).toEqual(['tashahhud']);
    expect(recIds(final)).toEqual(['tashahhud', 'salah-nabi', 'dua-before-salam']);
  });
});

/* ------------------------------------------------------------------ *
 * audible vs silent recitation (jahr / sirr)
 * ------------------------------------------------------------------ */
describe('salah · audible recitation', () => {
  test('Fajr is recited aloud in both rakaʿāt', () => {
    const steps = expandPrayer(fajr);
    expect(qiyamOf(steps, 1)!.audible).toBe(true);
    expect(qiyamOf(steps, 2)!.audible).toBe(true);
  });

  test('Ẓuhr and ʿAṣr are recited silently throughout', () => {
    for (const p of [dhuhr, asr]) {
      const steps = expandPrayer(p);
      for (let r = 1; r <= 4; r++) {
        expect(qiyamOf(steps, r)!.audible).toBe(false);
      }
    }
  });

  test('Maghrib and ʿIshāʾ are aloud in the first two rakaʿāt only', () => {
    const m = expandPrayer(maghrib);
    expect(qiyamOf(m, 1)!.audible).toBe(true);
    expect(qiyamOf(m, 2)!.audible).toBe(true);
    expect(qiyamOf(m, 3)!.audible).toBe(false);

    const i = expandPrayer(isha);
    expect(qiyamOf(i, 1)!.audible).toBe(true);
    expect(qiyamOf(i, 2)!.audible).toBe(true);
    expect(qiyamOf(i, 3)!.audible).toBe(false);
    expect(qiyamOf(i, 4)!.audible).toBe(false);
  });
});

/* ------------------------------------------------------------------ *
 * Witr & the qunūt
 * ------------------------------------------------------------------ */
describe('salah · Witr and the qunūt', () => {
  test('the qunūt is recited in the rising of the final rakʿah only', () => {
    const steps = expandPrayer(witr);
    expect(recIds(steps.find((s) => s.key === 'r3-itidal')!)).toContain('qunut');
    expect(recIds(steps.find((s) => s.key === 'r1-itidal')!)).not.toContain('qunut');
    expect(recIds(steps.find((s) => s.key === 'r2-itidal')!)).not.toContain('qunut');
  });

  test('prayers without qunūt never recite it', () => {
    for (const p of [fajr, dhuhr, asr, maghrib, isha]) {
      const hasQunut = expandPrayer(p).some((s) => recIds(s).includes('qunut'));
      expect(hasQunut).toBe(false);
    }
  });
});

/* ------------------------------------------------------------------ *
 * the funeral prayer
 * ------------------------------------------------------------------ */
describe('salah · the funeral prayer', () => {
  test('Janāzah is four standing takbīrs with no bowing or prostration', () => {
    const steps = expandPrayer(janazah);
    expect(steps).toHaveLength(4);
    expect(steps.some((s) => s.posture === 'ruku')).toBe(false);
    expect(steps.some((s) => s.posture === 'sujud')).toBe(false);
  });

  test('its takbīrs carry al-Fātiḥah, the blessings, the supplication and the salām', () => {
    const steps = expandPrayer(janazah);
    expect(recIds(steps[0])).toContain('fatihah');
    expect(recIds(steps[1])).toContain('salah-nabi');
    expect(recIds(steps[2])).toContain('dua-mayyit');
    expect(recIds(steps[3])).toContain('salam');
  });
});

/* ------------------------------------------------------------------ *
 * helpers
 * ------------------------------------------------------------------ */
describe('salah · helpers', () => {
  test('getPrayerSteps resolves by id and expands', () => {
    expect(getPrayerSteps('fajr')).toHaveLength(15);
    expect(keys(getPrayerSteps('maghrib'))[0]).toBe('r1-takbir');
  });

  test('rankLabel names each legal rank', () => {
    expect(rankLabel('rukn')).toContain('Rukn');
    expect(rankLabel('wajib')).toContain('Wājib');
    expect(rankLabel('sunnah')).toBe('Sunnah');
  });
});
