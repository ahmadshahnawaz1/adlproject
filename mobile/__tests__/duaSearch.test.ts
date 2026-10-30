import {
  ALL_DUAS,
  DUA_CATEGORIES,
  DEFAULT_CATEGORY_ID,
  categoryById,
  categoryCount,
  duaById,
  duasByIds,
  duasInCategory,
  matchesQuery,
  normalizeText,
  queryTokens,
  searchDuas,
  type Dua,
  type DuaCategoryId,
} from '../lib/duaSearch';

const CATEGORY_IDS: DuaCategoryId[] = DUA_CATEGORIES.map((c) => c.id);

describe('duaSearch · catalogue', () => {
  it('holds a non-empty library', () => {
    expect(ALL_DUAS.length).toBeGreaterThan(0);
  });

  it('has unique supplication ids', () => {
    const ids = ALL_DUAS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('tags every supplication with a known category', () => {
    for (const dua of ALL_DUAS) {
      expect(CATEGORY_IDS).toContain(dua.category);
    }
  });

  it('fills every required field of every supplication', () => {
    for (const dua of ALL_DUAS) {
      expect(dua.id).toBeTruthy();
      expect(dua.title.trim()).not.toBe('');
      expect(dua.when.trim()).not.toBe('');
      expect(dua.arabic.trim()).not.toBe('');
      expect(dua.transliteration.trim()).not.toBe('');
      expect(dua.translation.trim()).not.toBe('');
      expect(Array.isArray(dua.tags)).toBe(true);
      expect(dua.tags.length).toBeGreaterThan(0);
    }
  });

  it('keeps repeat counts positive when present', () => {
    for (const dua of ALL_DUAS) {
      if (dua.repeat !== undefined) {
        expect(dua.repeat).toBeGreaterThan(1);
      }
    }
  });

  it('cites evidence from the Qurʾān or the Sunnah only', () => {
    for (const dua of ALL_DUAS) {
      if (dua.daleel) {
        expect(['quran', 'hadith']).toContain(dua.daleel.source);
        expect(dua.daleel.reference.trim()).not.toBe('');
        expect(dua.daleel.text.trim()).not.toBe('');
      }
    }
  });
});

describe('duaSearch · categories', () => {
  it('describes twelve sections', () => {
    expect(DUA_CATEGORIES.length).toBe(12);
  });

  it('has unique category ids', () => {
    expect(new Set(CATEGORY_IDS).size).toBe(CATEGORY_IDS.length);
  });

  it('gives each category a title, arabic, subtitle and icon', () => {
    for (const cat of DUA_CATEGORIES) {
      expect(cat.title.trim()).not.toBe('');
      expect(cat.arabic.trim()).not.toBe('');
      expect(cat.subtitle.trim()).not.toBe('');
      expect(cat.icon.trim()).not.toBe('');
    }
  });

  it('exposes a valid default category', () => {
    expect(CATEGORY_IDS).toContain(DEFAULT_CATEGORY_ID);
  });

  it('places at least one supplication in every category', () => {
    for (const id of CATEGORY_IDS) {
      expect(duasInCategory(id).length).toBeGreaterThan(0);
    }
  });

  it('partitions the library exactly across the categories', () => {
    const total = CATEGORY_IDS.reduce((sum, id) => sum + categoryCount(id), 0);
    expect(total).toBe(ALL_DUAS.length);
  });

  it('returns only matching duʿās from duasInCategory', () => {
    for (const id of CATEGORY_IDS) {
      for (const dua of duasInCategory(id)) {
        expect(dua.category).toBe(id);
      }
    }
  });

  it('looks a category up by id, and is undefined for an unknown id', () => {
    expect(categoryById('mosque')?.title).toBe('The mosque');
    expect(categoryById('does-not-exist' as DuaCategoryId)).toBeUndefined();
  });
});

describe('duaSearch · lookups', () => {
  it('finds a supplication by id', () => {
    expect(duaById('istikhara')?.category).toBe('guidance');
    expect(duaById('nope')).toBeUndefined();
  });

  it('resolves a list of ids in catalogue order, ignoring unknowns', () => {
    const order = ALL_DUAS.map((d) => d.id);
    const a = order[10];
    const b = order[2];
    const resolved = duasByIds([a, b, 'ghost']).map((d) => d.id);
    // catalogue order is preserved regardless of the input order
    expect(resolved).toEqual([b, a].sort((x, y) => order.indexOf(x) - order.indexOf(y)));
    expect(resolved).not.toContain('ghost');
  });
});

describe('duaSearch · normalize', () => {
  it('lower-cases and strips transliteration marks', () => {
    expect(normalizeText('Duʿāʾ')).toBe('dua');
    expect(normalizeText('Allāhumma')).toBe('allahumma');
    expect(normalizeText('istikhārah')).toBe('istikharah');
  });

  it('reduces punctuation to spaces and trims', () => {
    expect(normalizeText('  rain, wind & thunder!  ')).toBe('rain wind thunder');
  });

  it('splits a query into tokens', () => {
    expect(queryTokens('  Dua  Yūnus ')).toEqual(['dua', 'yunus']);
    expect(queryTokens('   ')).toEqual([]);
  });
});

describe('duaSearch · search', () => {
  it('returns the whole pool for an empty query', () => {
    expect(searchDuas('').length).toBe(ALL_DUAS.length);
    expect(searchDuas('   ').length).toBe(ALL_DUAS.length);
  });

  it('returns a fresh array, not the shared catalogue', () => {
    const result = searchDuas('');
    expect(result).not.toBe(ALL_DUAS);
    expect(result).toEqual(ALL_DUAS);
  });

  it('finds duʿās by tag', () => {
    const ids = searchDuas('rain').map((d) => d.id);
    expect(ids).toContain('when-raining');
    expect(ids).toContain('after-rain');
  });

  it('is case-insensitive', () => {
    expect(searchDuas('RAIN').map((d) => d.id)).toEqual(searchDuas('rain').map((d) => d.id));
  });

  it('is forgiving of diacritics', () => {
    const ids = searchDuas('yunus').map((d) => d.id);
    expect(ids).toContain('dua-yunus');
  });

  it('matches the debt supplication on "debt"', () => {
    expect(searchDuas('debt').map((d) => d.id)).toContain('debt-relief');
  });

  it('ranks a title match above a tag-only match', () => {
    const results = searchDuas('knowledge');
    expect(results[0].id).toBe('zidni-ilma'); // titled “Increase me in knowledge”
    expect(results.map((d) => d.id)).toContain('rizq-tayyib'); // tag only
  });

  it('treats multiple tokens as AND', () => {
    const ids = searchDuas('beneficial knowledge').map((d) => d.id);
    expect(ids).toContain('rizq-tayyib');
    expect(ids).not.toContain('zidni-ilma'); // lacks “beneficial”
  });

  it('returns nothing for a query that matches no supplication', () => {
    expect(searchDuas('xyzzy-no-match')).toEqual([]);
  });

  it('narrows the search to a single category', () => {
    const withinNature = searchDuas('', 'nature');
    expect(withinNature.length).toBe(categoryCount('nature'));
    for (const dua of withinNature) expect(dua.category).toBe('nature');

    const rainInForgiveness = searchDuas('rain', 'forgiveness');
    expect(rainInForgiveness).toEqual([]);
  });

  it('agrees with matchesQuery', () => {
    const query = 'protection';
    const viaSearch = new Set(searchDuas(query).map((d) => d.id));
    for (const dua of ALL_DUAS) {
      expect(matchesQuery(dua, query)).toBe(viaSearch.has(dua.id));
    }
  });

  it('matches every supplication on an empty query', () => {
    for (const dua of ALL_DUAS) {
      expect(matchesQuery(dua, '')).toBe(true);
    }
  });
});

// A tiny structural guard: the screen passes each Dua straight to <DuaCard>,
// which needs these fields present.
describe('duaSearch · DuaCard compatibility', () => {
  it('exposes the fields DuaCard renders', () => {
    const sample: Dua = ALL_DUAS[0];
    const keys = Object.keys(sample);
    for (const k of ['title', 'when', 'arabic', 'transliteration', 'translation']) {
      expect(keys).toContain(k);
    }
  });
});
