import {
  EDITION_CATALOG,
  TOTAL_DOWNLOADABLE_EDITIONS,
  TOTAL_EDITION_LANGUAGES,
} from '../content/quran';
import {
  EDITION_LANGUAGES,
  editionUrl,
  filterEditionsByKind,
  findEdition,
  formatBytes,
  groupEditionsByLanguage,
  parseEditionPayload,
  searchEditions,
  verseKey,
} from '../lib/quranEditions';

describe('edition catalog integrity', () => {
  test('catalog is non-empty and matches the published totals', () => {
    expect(EDITION_CATALOG.length).toBeGreaterThan(400);
    expect(EDITION_CATALOG.length).toBe(TOTAL_DOWNLOADABLE_EDITIONS);
  });

  test('every edition has id, name, language, and a valid kind', () => {
    for (const ed of EDITION_CATALOG) {
      expect(ed.id).toMatch(/\S/);
      expect(ed.name).toMatch(/\S/);
      expect(ed.language).toMatch(/\S/);
      expect(['translation', 'transliteration']).toContain(ed.kind);
    }
  });

  test('edition ids are unique', () => {
    const ids = new Set(EDITION_CATALOG.map((e) => e.id));
    expect(ids.size).toBe(EDITION_CATALOG.length);
  });

  test('distinct language count matches the exported total', () => {
    expect(EDITION_LANGUAGES.length).toBe(TOTAL_EDITION_LANGUAGES);
    expect(EDITION_LANGUAGES.length).toBeGreaterThan(50);
  });

  test('languages are sorted alphabetically', () => {
    const sorted = [...EDITION_LANGUAGES].sort((a, b) => a.localeCompare(b));
    expect(EDITION_LANGUAGES).toEqual(sorted);
  });
});

describe('editionUrl', () => {
  test('builds a jsDelivr CDN url ending in .min.json', () => {
    expect(editionUrl('eng-mustafakhattaba')).toBe(
      'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/eng-mustafakhattaba.min.json',
    );
  });
});

describe('findEdition', () => {
  test('finds a known english edition', () => {
    const ed = findEdition('eng-mustafakhattaba');
    expect(ed?.language).toBe('English');
  });

  test('returns undefined for an unknown id', () => {
    expect(findEdition('not-a-real-edition')).toBeUndefined();
  });
});

describe('filterEditionsByKind', () => {
  test('"all" returns a copy of the input', () => {
    const all = filterEditionsByKind(EDITION_CATALOG, 'all');
    expect(all).toHaveLength(EDITION_CATALOG.length);
    expect(all).not.toBe(EDITION_CATALOG);
  });

  test('translation filter excludes transliterations', () => {
    const tr = filterEditionsByKind(EDITION_CATALOG, 'translation');
    expect(tr.length).toBeGreaterThan(0);
    expect(tr.every((e) => e.kind === 'translation')).toBe(true);
  });

  test('transliteration filter excludes translations', () => {
    const tl = filterEditionsByKind(EDITION_CATALOG, 'transliteration');
    expect(tl.length).toBeGreaterThan(0);
    expect(tl.every((e) => e.kind === 'transliteration')).toBe(true);
  });
});

describe('searchEditions', () => {
  test('empty query returns everything', () => {
    expect(searchEditions(EDITION_CATALOG, '   ')).toHaveLength(
      EDITION_CATALOG.length,
    );
  });

  test('matches by language name', () => {
    const urdu = searchEditions(EDITION_CATALOG, 'urdu');
    expect(urdu.length).toBeGreaterThan(0);
    expect(urdu.every((e) => e.language.toLowerCase().includes('urdu'))).toBe(
      true,
    );
  });

  test('is diacritic and case insensitive', () => {
    const a = searchEditions(EDITION_CATALOG, 'KHATTAB');
    const b = searchEditions(EDITION_CATALOG, 'khattab');
    expect(a.length).toBeGreaterThan(0);
    expect(a).toEqual(b);
  });
});

describe('groupEditionsByLanguage', () => {
  test('groups partition the input with languages sorted', () => {
    const groups = groupEditionsByLanguage(EDITION_CATALOG);
    const total = groups.reduce((acc, g) => acc + g.editions.length, 0);
    expect(total).toBe(EDITION_CATALOG.length);
    const langs = groups.map((g) => g.language);
    expect(langs).toEqual([...langs].sort((a, b) => a.localeCompare(b)));
  });

  test('editions within a group are sorted by name', () => {
    const groups = groupEditionsByLanguage(EDITION_CATALOG);
    for (const g of groups) {
      const names = g.editions.map((e) => e.name);
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    }
  });
});

describe('verseKey', () => {
  test('formats as surah:ayah', () => {
    expect(verseKey(2, 255)).toBe('2:255');
  });
});

describe('parseEditionPayload', () => {
  const fullPayload = (text = 'x') => ({
    quran: Array.from({ length: 6236 }, (_, i) => ({
      chapter: 1,
      verse: i + 1,
      text: `${text}${i}`,
    })),
  });

  test('indexes verses by surah:ayah', () => {
    const idx = parseEditionPayload({
      quran: [
        { chapter: 1, verse: 1, text: 'In the name' },
        { chapter: 2, verse: 255, text: 'Ayat al-Kursi' },
        ...Array.from({ length: 6234 }, (_, i) => ({
          chapter: 3,
          verse: i + 1,
          text: `v${i}`,
        })),
      ],
    });
    expect(idx['1:1']).toBe('In the name');
    expect(idx['2:255']).toBe('Ayat al-Kursi');
  });

  test('accepts a complete 6236-verse payload', () => {
    const idx = parseEditionPayload(fullPayload());
    expect(Object.keys(idx)).toHaveLength(6236);
  });

  test('throws when the quran array is missing', () => {
    expect(() => parseEditionPayload({})).toThrow(/quran/);
    expect(() => parseEditionPayload(null)).toThrow();
  });

  test('throws when the payload is truncated', () => {
    expect(() =>
      parseEditionPayload({ quran: [{ chapter: 1, verse: 1, text: 'a' }] }),
    ).toThrow(/incomplete/);
  });
});

describe('formatBytes', () => {
  test('renders MB above a megabyte', () => {
    expect(formatBytes(1_100_000)).toBe('1.0 MB');
  });

  test('renders KB below a megabyte', () => {
    expect(formatBytes(2048)).toBe('2 KB');
  });

  test('clamps non-positive values', () => {
    expect(formatBytes(0)).toBe('0 KB');
    expect(formatBytes(-5)).toBe('0 KB');
  });
});
