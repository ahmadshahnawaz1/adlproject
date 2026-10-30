/**
 * Tests for lib/hadith — grading, search, topics, and Hadith of the Day.
 */
import {
  BUNDLED_HADITH,
  NAWAWI_40,
  HADITH_COLLECTIONS,
  HADITH_TOPICS,
  gradeMeta,
  gradeLabel,
  isAuthentic,
  filterByGrade,
  hadithInTopic,
  topicCount,
  searchHadith,
  hadithOfDay,
  hadithById,
  bundledHadithOf,
  collectionById,
} from '../lib/hadith';

describe('bundled content integrity', () => {
  it('bundles al-Nawawī’s Forty (42) plus the qudsī set', () => {
    expect(NAWAWI_40).toHaveLength(42);
    expect(BUNDLED_HADITH.length).toBeGreaterThanOrEqual(50);
    expect(bundledHadithOf('nawawi40')).toHaveLength(42);
    expect(bundledHadithOf('qudsi').length).toBeGreaterThan(0);
  });

  it('gives every narration a grade and unique id', () => {
    const ids = BUNDLED_HADITH.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const h of BUNDLED_HADITH) {
      expect(h.grade?.ruling).toBeTruthy();
      expect(h.arabic.length).toBeGreaterThan(0);
      expect(h.translation.length).toBeGreaterThan(0);
    }
  });

  it('marks the two bundled collections as offline in the catalogue', () => {
    expect(collectionById('nawawi40')?.availability).toBe('bundled');
    expect(collectionById('qudsi')?.availability).toBe('bundled');
    expect(collectionById('bukhari')?.availability).toBe('download');
    expect(HADITH_COLLECTIONS.length).toBeGreaterThanOrEqual(8);
  });
});

describe('grading', () => {
  it('labels and ranks rulings', () => {
    expect(gradeLabel('sahih')).toBe('Ṣaḥīḥ');
    expect(gradeMeta('sahih').tone).toBe('authentic');
    expect(gradeMeta('daif').tone).toBe('weak');
    expect(gradeMeta('mawdu').tone).toBe('fabricated');
    expect(gradeMeta('sahih').rank).toBeGreaterThan(gradeMeta('hasan').rank);
    expect(gradeMeta('hasan').rank).toBeGreaterThan(gradeMeta('daif').rank);
  });

  it('treats ṣaḥīḥ and ḥasan as authentic, weak/fabricated as not', () => {
    expect(isAuthentic({ ruling: 'sahih' })).toBe(true);
    expect(isAuthentic({ ruling: 'hasan' })).toBe(true);
    expect(isAuthentic({ ruling: 'hasan-sahih' })).toBe(true);
    expect(isAuthentic({ ruling: 'daif' })).toBe(false);
    expect(isAuthentic({ ruling: 'mawdu' })).toBe(false);
  });

  it('filters to authentic only when asked', () => {
    const mixed = [
      { ...BUNDLED_HADITH[0], grade: { ruling: 'daif' as const } },
      { ...BUNDLED_HADITH[1], grade: { ruling: 'sahih' as const } },
    ];
    expect(filterByGrade(mixed, true)).toHaveLength(1);
    expect(filterByGrade(mixed, false)).toHaveLength(2);
  });
});

describe('topics', () => {
  it('gathers narrations across collections by theme', () => {
    const intention = hadithInTopic('intention');
    expect(intention.some((h) => h.id === 'nawawi-1')).toBe(true);
    expect(topicCount('intention')).toBe(intention.length);
  });

  it('exposes browsable topics', () => {
    expect(HADITH_TOPICS.length).toBeGreaterThanOrEqual(10);
    expect(HADITH_TOPICS.every((t) => t.icon && t.title)).toBe(true);
  });
});

describe('search', () => {
  it('finds by narrator, diacritic-insensitive', () => {
    expect(searchHadith('abu hurayrah').length).toBeGreaterThan(0);
    expect(searchHadith('Abū Hurayrah').length).toBeGreaterThan(0);
  });

  it('finds by topic keyword and chapter', () => {
    expect(searchHadith('intention').some((h) => h.id === 'nawawi-1')).toBe(true);
  });

  it('requires every token to match and returns [] for empty', () => {
    expect(searchHadith('intention zzzznope')).toEqual([]);
    expect(searchHadith('')).toEqual([]);
    expect(searchHadith('   ')).toEqual([]);
  });
});

describe('hadith of the day', () => {
  it('is deterministic per date and always authentic', () => {
    const d = new Date(2026, 6, 31);
    const a = hadithOfDay(d);
    const b = hadithOfDay(new Date(2026, 6, 31));
    expect(a.id).toBe(b.id);
    expect(isAuthentic(a.grade)).toBe(true);
  });

  it('changes across days', () => {
    const ids = new Set(
      Array.from({ length: 14 }, (_, i) => hadithOfDay(new Date(2026, 0, 1 + i)).id),
    );
    expect(ids.size).toBeGreaterThan(1);
  });

  it('resolves a bundled hadith by id', () => {
    expect(hadithById('nawawi-1')?.number).toBe(1);
    expect(hadithById('nope')).toBeUndefined();
  });
});
