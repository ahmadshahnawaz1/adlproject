import {
  getSurah,
  getJuz,
  toArabicDigits,
  normalize,
  searchSurahs,
  parseReference,
  juzOf,
  ayahKey,
  formatRef,
  globalAyahNumber,
} from '../lib/quran';
import { SURAHS, JUZ, TOTAL_AYAHS, BUNDLED_TRANSLATIONS } from '../content/quran';

describe('quran data integrity', () => {
  test('there are exactly 114 surahs', () => {
    expect(SURAHS).toHaveLength(114);
  });

  test('surah numbers are 1..114 with no gaps', () => {
    const numbers = SURAHS.map((s) => s.number);
    expect(numbers).toEqual(Array.from({ length: 114 }, (_, i) => i + 1));
  });

  test('total ayah count is 6236', () => {
    const sum = SURAHS.reduce((acc, s) => acc + s.ayahCount, 0);
    expect(sum).toBe(6236);
    expect(sum).toBe(TOTAL_AYAHS);
  });

  test('only al-Fātiḥah (1) and at-Tawbah (9) omit the bismillah ornament', () => {
    const without = SURAHS.filter((s) => !s.hasBismillah).map((s) => s.number);
    expect(without).toEqual([1, 9]);
  });

  test('start pages are within 1..604 and non-decreasing', () => {
    let prev = 0;
    for (const s of SURAHS) {
      expect(s.startPage).toBeGreaterThanOrEqual(1);
      expect(s.startPage).toBeLessThanOrEqual(604);
      expect(s.startPage).toBeGreaterThanOrEqual(prev);
      prev = s.startPage;
    }
    expect(SURAHS[0].startPage).toBe(1);
  });

  test('revelation is meccan or medinan for every surah', () => {
    for (const s of SURAHS) {
      expect(['meccan', 'medinan']).toContain(s.revelation);
    }
  });

  test('there are exactly 30 juzʾ marks, ordered, starting at 1:1', () => {
    expect(JUZ).toHaveLength(30);
    expect(JUZ[0]).toEqual({ juz: 1, surah: 1, ayah: 1 });
    expect(JUZ[29].juz).toBe(30);
    expect(JUZ[29].surah).toBe(78);
    expect(JUZ[29].ayah).toBe(1);
    for (let i = 1; i < JUZ.length; i++) {
      expect(JUZ[i].juz).toBe(JUZ[i - 1].juz + 1);
    }
  });

  test('bundled translations include Saheeh International', () => {
    expect(BUNDLED_TRANSLATIONS.some((e) => e.id === 'eng-ummmuhammad')).toBe(
      true,
    );
  });
});

describe('getSurah / getJuz', () => {
  test('returns canonical metadata for al-Fātiḥah', () => {
    const s = getSurah(1);
    expect(s).toBeDefined();
    expect(s!.name).toBe('Al-Fatihah');
    expect(s!.arabicName).toBe('الفاتحة');
    expect(s!.meaning).toBe('The Opener');
    expect(s!.revelation).toBe('meccan');
    expect(s!.ayahCount).toBe(7);
  });

  test('at-Tawbah is medinan with 129 ayahs and no bismillah', () => {
    const s = getSurah(9);
    expect(s!.revelation).toBe('medinan');
    expect(s!.ayahCount).toBe(129);
    expect(s!.hasBismillah).toBe(false);
  });

  test('out-of-range surah numbers return undefined', () => {
    expect(getSurah(0)).toBeUndefined();
    expect(getSurah(115)).toBeUndefined();
  });

  test('getJuz returns marks in range only', () => {
    expect(getJuz(1)).toEqual({ juz: 1, surah: 1, ayah: 1 });
    expect(getJuz(30)).toBeDefined();
    expect(getJuz(0)).toBeUndefined();
    expect(getJuz(31)).toBeUndefined();
  });
});

describe('toArabicDigits', () => {
  test('maps Western digits to Arabic-Indic', () => {
    expect(toArabicDigits(0)).toBe('٠');
    expect(toArabicDigits(2025)).toBe('٢٠٢٥');
    expect(toArabicDigits('1:7')).toBe('١:٧');
  });
});

describe('normalize', () => {
  test('folds Latin diacritics, hamza/ʿayn and hyphens', () => {
    expect(normalize('Al-Fātiḥah')).toBe('alfatihah');
    expect(normalize('ʿImrān')).toBe('imran');
    expect(normalize("An-Naml")).toBe('annaml');
  });

  test('folds Arabic letter variants', () => {
    expect(normalize('البقرة')).toBe(normalize('البقره'));
  });
});

describe('searchSurahs', () => {
  test('empty query returns all 114', () => {
    expect(searchSurahs('')).toHaveLength(114);
    expect(searchSurahs('   ')).toHaveLength(114);
  });

  test('a bare in-range number returns that surah', () => {
    const r = searchSurahs('2');
    expect(r).toHaveLength(1);
    expect(r[0].number).toBe(2);
  });

  test('matches transliterated name case- and accent-insensitively', () => {
    expect(searchSurahs('fatiha').map((s) => s.number)).toContain(1);
    expect(searchSurahs('IKHLAS').map((s) => s.number)).toContain(112);
  });

  test('matches English meaning', () => {
    expect(searchSurahs('the cow').map((s) => s.number)).toContain(2);
  });

  test('matches the Arabic name', () => {
    expect(searchSurahs('الإخلاص').map((s) => s.number)).toContain(112);
  });

  test('nonsense query returns nothing', () => {
    expect(searchSurahs('zzzzqx')).toHaveLength(0);
  });
});

describe('parseReference', () => {
  test('parses colon, dot, and space separators', () => {
    expect(parseReference('2:255')).toEqual({ surah: 2, ayah: 255 });
    expect(parseReference('2.255')).toEqual({ surah: 2, ayah: 255 });
    expect(parseReference('2 255')).toEqual({ surah: 2, ayah: 255 });
  });

  test('rejects out-of-range ayahs and surahs', () => {
    expect(parseReference('1:8')).toBeNull();
    expect(parseReference('115:1')).toBeNull();
    expect(parseReference('2:0')).toBeNull();
  });

  test('rejects malformed input', () => {
    expect(parseReference('abc')).toBeNull();
    expect(parseReference('2')).toBeNull();
    expect(parseReference('')).toBeNull();
  });
});

describe('juzOf', () => {
  test('locates the juzʾ for a position', () => {
    expect(juzOf(1, 1)).toBe(1);
    expect(juzOf(2, 141)).toBe(1);
    expect(juzOf(2, 142)).toBe(2);
    expect(juzOf(2, 253)).toBe(3);
    expect(juzOf(78, 1)).toBe(30);
    expect(juzOf(114, 6)).toBe(30);
  });
});

describe('ayahKey / formatRef', () => {
  test('ayahKey builds a stable key', () => {
    expect(ayahKey(2, 255)).toBe('2:255');
  });

  test('formatRef renders with and without an ayah', () => {
    expect(formatRef(2, 255)).toBe('Al-Baqarah 2:255');
    expect(formatRef(1)).toBe('Al-Fatihah');
  });
});

describe('globalAyahNumber', () => {
  test('maps the boundary ayahs of the muṣḥaf', () => {
    expect(globalAyahNumber(1, 1)).toBe(1); // first ayah
    expect(globalAyahNumber(1, 7)).toBe(7); // last of al-Fātiḥah
    expect(globalAyahNumber(2, 1)).toBe(8); // first of al-Baqarah
    expect(globalAyahNumber(114, 6)).toBe(6236); // final ayah
  });

  test('is contiguous across a surah boundary', () => {
    const meta1 = getSurah(1)!;
    const lastOfFirst = globalAyahNumber(1, meta1.ayahCount);
    expect(globalAyahNumber(2, 1)).toBe(lastOfFirst + 1);
  });

  test('the last ayah of each surah equals the running total', () => {
    let running = 0;
    for (let n = 1; n <= 114; n += 1) {
      running += getSurah(n)!.ayahCount;
      expect(globalAyahNumber(n, getSurah(n)!.ayahCount)).toBe(running);
    }
    expect(running).toBe(6236);
  });

  test('rejects out-of-range references with 0', () => {
    expect(globalAyahNumber(1, 8)).toBe(0);
    expect(globalAyahNumber(115, 1)).toBe(0);
    expect(globalAyahNumber(2, 0)).toBe(0);
  });
});
