/**
 * Tests for the Beautiful Names corpus and its pure logic (F21).
 */
import {
  DIVINE_NAMES,
  NAME_THEMES,
  TOTAL_NAMES,
  buildQuestion,
  groupedByTheme,
  memorisedFraction,
  nameById,
  nameByNumber,
  nameOfDay,
  namesByTheme,
  searchNames,
  themeMeta,
} from '../lib/names';
import { NAMES_DISCLAIMER, NAMES_SOURCE_NOTE, NAMES_VIRTUE } from '../content/names';

describe('corpus integrity', () => {
  it('has exactly ninety-nine names', () => {
    expect(TOTAL_NAMES).toBe(99);
    expect(DIVINE_NAMES).toHaveLength(99);
  });

  it('is numbered 1–99 with no gaps or duplicates', () => {
    const numbers = DIVINE_NAMES.map((n) => n.number);
    expect(numbers).toEqual(Array.from({ length: 99 }, (_, i) => i + 1));
  });

  it('uses unique ids', () => {
    const ids = DIVINE_NAMES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every name Arabic, a transliteration, a meaning and an explanation', () => {
    for (const n of DIVINE_NAMES) {
      expect(n.arabic.trim().length).toBeGreaterThan(0);
      expect(n.transliteration.trim().length).toBeGreaterThan(0);
      expect(n.meaning.trim().length).toBeGreaterThan(0);
      expect(n.explanation.trim().length).toBeGreaterThan(20);
    }
  });

  it('writes every name in Arabic script', () => {
    for (const n of DIVINE_NAMES) {
      expect(n.arabic).toMatch(/[\u0600-\u06FF]/);
    }
  });

  it('assigns every name a known theme', () => {
    const known = new Set(NAME_THEMES.map((t) => t.id));
    for (const n of DIVINE_NAMES) {
      expect(known.has(n.theme)).toBe(true);
    }
  });

  it('keeps every Qurʾān reference in range', () => {
    for (const n of DIVINE_NAMES) {
      if (!n.quranRef) continue;
      expect(n.quranRef.surah).toBeGreaterThanOrEqual(1);
      expect(n.quranRef.surah).toBeLessThanOrEqual(114);
      expect(n.quranRef.ayah).toBeGreaterThanOrEqual(1);
    }
  });

  it('opens with Ar-Raḥmān and closes with Aṣ-Ṣabūr', () => {
    expect(DIVINE_NAMES[0].transliteration).toBe('Ar-Raḥmān');
    expect(DIVINE_NAMES[98].transliteration).toBe('Aṣ-Ṣabūr');
  });

  it('states the source honestly and carries a review disclaimer', () => {
    expect(NAMES_SOURCE_NOTE).toMatch(/Tirmidh/);
    expect(NAMES_SOURCE_NOTE).toMatch(/Bukh/);
    expect(NAMES_DISCLAIMER).toMatch(/review/i);
    expect(NAMES_VIRTUE.reference).toMatch(/Bukh/);
  });
});

describe('resolvers and grouping', () => {
  it('resolves by id and by number', () => {
    expect(nameById('al-adl')?.meaning).toBe('The Utterly Just');
    expect(nameByNumber(1)?.transliteration).toBe('Ar-Raḥmān');
    expect(nameById('nope')).toBeUndefined();
    expect(nameByNumber(100)).toBeUndefined();
  });

  it('resolves theme metadata', () => {
    expect(themeMeta('mercy')?.title).toBe('Mercy');
    expect(themeMeta('nope')).toBeUndefined();
  });

  it('lists names within a theme', () => {
    const mercy = namesByTheme('mercy');
    expect(mercy.length).toBeGreaterThan(0);
    expect(mercy.every((n) => n.theme === 'mercy')).toBe(true);
  });

  it('groups every name exactly once across themes', () => {
    const groups = groupedByTheme();
    const total = groups.reduce((sum, g) => sum + g.names.length, 0);
    expect(total).toBe(TOTAL_NAMES);
    expect(groups.every((g) => g.names.length > 0)).toBe(true);
  });
});

describe('search', () => {
  it('finds a name by transliteration', () => {
    expect(searchNames('rahman')[0]?.id).toBe('ar-rahman');
  });

  it('is diacritic-insensitive', () => {
    expect(searchNames('Raḥīm').length).toBeGreaterThan(0);
    expect(searchNames('rahim').length).toBeGreaterThan(0);
  });

  it('finds a name by its meaning', () => {
    expect(searchNames('provider').some((n) => n.id === 'ar-razzaq')).toBe(true);
  });

  it('finds a name by its number', () => {
    expect(searchNames('99').some((n) => n.number === 99)).toBe(true);
  });

  it('requires every token to match', () => {
    expect(searchNames('rahman zzzznotaword')).toEqual([]);
  });

  it('returns nothing for an empty query', () => {
    expect(searchNames('')).toEqual([]);
    expect(searchNames('   ')).toEqual([]);
  });
});

describe('name of the day', () => {
  it('is stable within a day and drawn from the corpus', () => {
    const a = nameOfDay(new Date('2026-03-05T06:00:00'));
    const b = nameOfDay(new Date('2026-03-05T21:30:00'));
    expect(a.id).toBe(b.id);
    expect(DIVINE_NAMES.some((n) => n.id === a.id)).toBe(true);
  });

  it('changes from one day to the next', () => {
    const a = nameOfDay(new Date('2026-03-05T12:00:00'));
    const b = nameOfDay(new Date('2026-03-06T12:00:00'));
    expect(a.id).not.toBe(b.id);
  });
});

describe('memorisation quiz', () => {
  const pick = (max: number) => max - 1; // deterministic

  it('always includes the correct meaning', () => {
    const q = buildQuestion(DIVINE_NAMES[0], pick);
    expect(q.answer).toBe(DIVINE_NAMES[0].meaning);
    expect(q.options).toContain(q.answer);
  });

  it('offers four distinct options', () => {
    const q = buildQuestion(DIVINE_NAMES[10], pick);
    expect(q.options).toHaveLength(4);
    expect(new Set(q.options).size).toBe(4);
  });

  it('never repeats the answer as a distractor', () => {
    for (const name of DIVINE_NAMES.slice(0, 12)) {
      const q = buildQuestion(name, pick);
      expect(q.options.filter((o) => o === q.answer)).toHaveLength(1);
    }
  });

  it('terminates even when pick always returns the same index', () => {
    const q = buildQuestion(DIVINE_NAMES[5], () => 0);
    expect(q.options).toHaveLength(4);
    expect(q.options).toContain(q.answer);
  });
});

describe('progress', () => {
  it('reports a clamped fraction', () => {
    expect(memorisedFraction(0)).toBe(0);
    expect(memorisedFraction(99)).toBe(1);
    expect(memorisedFraction(1000)).toBe(1);
    expect(memorisedFraction(-5)).toBe(0);
    expect(memorisedFraction(33)).toBeCloseTo(1 / 3, 5);
  });
});
