/**
 * Content localization tests.
 *
 * The protected-field and fallback rules are the safety boundary: a table must
 * never overwrite the Arabic or a citation, and a half-translated module must
 * degrade to English per field rather than showing gaps.
 */
import {
  PROTECTED_FIELDS,
  coverage,
  hasMachineDraft,
  hasTranslation,
  loadTable,
  localize,
  localizeEntry,
  orphanIds,
  protectedFieldsIn,
  provenanceOf,
  type LocaleTable,
} from '../lib/contentI18n';

type Dua = {
  id: string;
  title: string;
  when: string;
  arabic: string;
  transliteration: string;
  translation: string;
  tags: string[];
};

const DUAS: Dua[] = [
  {
    id: 'eating',
    title: 'Before eating',
    when: 'Before a meal',
    arabic: 'بِسْمِ ٱللَّٰهِ',
    transliteration: 'Bismillāh',
    translation: 'In the name of Allah.',
    tags: ['food', 'meal'],
  },
  {
    id: 'travel',
    title: 'When travelling',
    when: 'On setting out',
    arabic: 'سُبْحَانَ ٱلَّذِى سَخَّرَ لَنَا هَٰذَا',
    transliteration: 'Subḥāna alladhī sakhkhara lanā hādhā',
    translation: 'Glory to Him who has subjected this to us.',
    tags: ['journey'],
  },
];

const FIELDS = ['title', 'when', 'translation', 'tags'] as const;

const table: LocaleTable = {
  meta: { locale: 'ar', provenance: 'machine' },
  human: ['eating'],
  entries: {
    eating: {
      title: 'قبل الطعام',
      when: 'قبل الوجبة',
      translation: 'بسم الله.',
      tags: ['طعام', 'وجبة'],
    },
    travel: { title: 'عند السفر' },
  },
};

describe('localizing an entry', () => {
  it('replaces the requested fields', () => {
    const out = localizeEntry(DUAS[0], table, FIELDS);
    expect(out.title).toBe('قبل الطعام');
    expect(out.translation).toBe('بسم الله.');
  });

  it('keeps English for a field the table has not translated', () => {
    const out = localizeEntry(DUAS[1], table, FIELDS);
    expect(out.title).toBe('عند السفر');
    expect(out.when).toBe('On setting out');
    expect(out.translation).toBe('Glory to Him who has subjected this to us.');
  });

  it('never touches the Arabic or the transliteration', () => {
    const out = localizeEntry(DUAS[0], table, FIELDS);
    expect(out.arabic).toBe(DUAS[0].arabic);
    expect(out.transliteration).toBe(DUAS[0].transliteration);
  });

  it('refuses a protected field even when a table wrongly contains one', () => {
    const bad: LocaleTable = {
      meta: { locale: 'ar', provenance: 'machine' },
      entries: { eating: { arabic: 'NOT THE ORIGINAL', title: 'قبل الطعام' } },
    };
    const out = localizeEntry(DUAS[0], bad, ['arabic', 'title'] as never);
    expect(out.arabic).toBe(DUAS[0].arabic);
    expect(out.title).toBe('قبل الطعام');
  });

  it('translates array fields as arrays', () => {
    const out = localizeEntry(DUAS[0], table, FIELDS);
    expect(out.tags).toEqual(['طعام', 'وجبة']);
  });

  it('ignores a translation whose shape does not match', () => {
    const mismatched: LocaleTable = {
      meta: { locale: 'ar', provenance: 'machine' },
      entries: { eating: { tags: 'طعام', title: ['nope'] } },
    };
    const out = localizeEntry(DUAS[0], mismatched, FIELDS);
    expect(out.tags).toEqual(['food', 'meal']);
    expect(out.title).toBe('Before eating');
  });

  it('ignores blank and whitespace-only translations', () => {
    const blank: LocaleTable = {
      meta: { locale: 'ar', provenance: 'machine' },
      entries: { eating: { title: '   ', tags: [] } },
    };
    const out = localizeEntry(DUAS[0], blank, FIELDS);
    expect(out.title).toBe('Before eating');
    expect(out.tags).toEqual(['food', 'meal']);
  });

  it('returns the original object when nothing changed', () => {
    const empty: LocaleTable = { meta: { locale: 'ar', provenance: 'machine' }, entries: {} };
    expect(localizeEntry(DUAS[0], empty, FIELDS)).toBe(DUAS[0]);
  });

  it('does not mutate the source entry', () => {
    const before = JSON.stringify(DUAS[0]);
    localizeEntry(DUAS[0], table, FIELDS);
    expect(JSON.stringify(DUAS[0])).toBe(before);
  });
});

describe('localizing a list', () => {
  it('returns English untouched with no table', () => {
    expect(localize(DUAS, null, FIELDS)).toBe(DUAS);
    expect(localize(DUAS, undefined, FIELDS)[0].title).toBe('Before eating');
  });

  it('translates what it can and leaves the rest', () => {
    const out = localize(DUAS, table, FIELDS);
    expect(out[0].title).toBe('قبل الطعام');
    expect(out[1].when).toBe('On setting out');
  });

  it('handles an empty list', () => {
    expect(localize([], table, FIELDS)).toEqual([]);
  });
});

describe('provenance', () => {
  it('reports a reviewed entry as human', () => {
    expect(provenanceOf(table, 'eating')).toBe('human');
  });

  it('reports an unreviewed entry as a machine draft', () => {
    expect(provenanceOf(table, 'travel')).toBe('machine');
  });

  it('reports nothing for an entry with no translation', () => {
    expect(provenanceOf(table, 'unknown')).toBeNull();
    expect(provenanceOf(null, 'eating')).toBeNull();
  });

  it('flags a screen that shows any unreviewed draft', () => {
    expect(hasMachineDraft(table, ['eating', 'travel'])).toBe(true);
    expect(hasMachineDraft(table, ['eating'])).toBe(false);
    expect(hasMachineDraft(null, ['eating'])).toBe(false);
  });

  it('never flags a fully human table', () => {
    const human: LocaleTable = { ...table, meta: { locale: 'ar', provenance: 'human' } };
    expect(hasMachineDraft(human, ['eating', 'travel'])).toBe(false);
  });
});

describe('coverage and integrity', () => {
  it('measures the share of fields actually translated', () => {
    // eating has 4 of 4, travel has 1 of 4 → 5 of 8.
    expect(coverage(DUAS, table, FIELDS)).toBeCloseTo(5 / 8);
  });

  it('is zero with no table and one for an empty list', () => {
    expect(coverage(DUAS, null, FIELDS)).toBe(0);
    expect(coverage([], table, FIELDS)).toBe(1);
  });

  it('detects a table that wrongly carries a protected field', () => {
    const bad: LocaleTable = {
      meta: { locale: 'ar', provenance: 'machine' },
      entries: { eating: { arabic: 'x', grade: 'y', title: 'ok' } },
    };
    expect(protectedFieldsIn(bad)).toEqual(['arabic', 'grade']);
    expect(protectedFieldsIn(table)).toEqual([]);
  });

  it('lists protected fields that must never be translated', () => {
    for (const f of ['arabic', 'transliteration', 'source', 'narrator', 'grade']) {
      expect(PROTECTED_FIELDS).toContain(f);
    }
  });

  it('finds entries left behind after content changes', () => {
    const stale: LocaleTable = {
      meta: { locale: 'ar', provenance: 'machine' },
      entries: { eating: { title: 'x' }, removed: { title: 'y' } },
    };
    expect(orphanIds(DUAS, stale)).toEqual(['removed']);
    expect(orphanIds(DUAS, table)).toEqual([]);
  });

  it('reports a field as translated only when it is usable', () => {
    expect(hasTranslation(table, 'eating', 'title')).toBe(true);
    expect(hasTranslation(table, 'travel', 'when')).toBe(false);
    expect(hasTranslation(null, 'eating', 'title')).toBe(false);
  });
});

describe('lazy table loading', () => {
  const loaders = {
    ar: () => table,
    ur: () => {
      throw new Error('malformed');
    },
  };

  it('loads a registered locale', () => {
    expect(loadTable(loaders, 'ar')).toBe(table);
  });

  it('returns null for a locale with no table', () => {
    expect(loadTable(loaders, 'fr')).toBeNull();
  });

  it('falls back to English rather than throwing on a broken table', () => {
    expect(loadTable(loaders, 'ur')).toBeNull();
  });
});
