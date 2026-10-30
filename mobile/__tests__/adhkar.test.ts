import {
  ADHKAR_CATEGORIES,
  DEFAULT_CATEGORY_ID,
  categoryById,
  categoryDoneReps,
  categoryProgress,
  categoryReps,
  completeDhikr,
  completedDhikrCount,
  currentStreak,
  dayKey,
  dhikrCount,
  isCategoryComplete,
  isConsecutiveDay,
  isDhikrComplete,
  nextIncompleteIndex,
  recordCompletion,
  remaining,
  tapDhikr,
  undoDhikr,
  type AdhkarHistory,
  type DhikrCounts,
} from '../lib/adhkar';
import type { AdhkarCategory, Dhikr } from '../content/adhkar';

const morning = categoryById('morning') as AdhkarCategory;
const afterSalah = categoryById('after-salah') as AdhkarCategory;

/** Counts that fully complete every dhikr of a set. */
function fullCounts(category: AdhkarCategory): DhikrCounts {
  const out: DhikrCounts = {};
  for (const d of category.dhikr) out[d.id] = d.repeat;
  return out;
}

/** Tap one dhikr `n` times from a starting counts object. */
function tapN(counts: DhikrCounts, dhikr: Dhikr, n: number): DhikrCounts {
  let c = counts;
  for (let i = 0; i < n; i++) c = tapDhikr(c, dhikr).counts;
  return c;
}

/* ------------------------------------------------------------------ *
 * catalogue
 * ------------------------------------------------------------------ */
describe('adhkar · catalogue', () => {
  test('the five daily sets are present in day order', () => {
    expect(ADHKAR_CATEGORIES.map((c) => c.id)).toEqual([
      'morning',
      'evening',
      'after-salah',
      'sleep',
      'waking',
    ]);
  });

  test('the default category is the morning set', () => {
    expect(DEFAULT_CATEGORY_ID).toBe('morning');
    expect(categoryById(DEFAULT_CATEGORY_ID)?.id).toBe('morning');
  });

  test('categoryById returns undefined for unknown ids', () => {
    expect(categoryById('does-not-exist')).toBeUndefined();
  });

  test('every category has a unique id', () => {
    const ids = ADHKAR_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

/* ------------------------------------------------------------------ *
 * content integrity
 * ------------------------------------------------------------------ */
describe('adhkar · content integrity', () => {
  test('every dhikr is fully formed with a positive repeat', () => {
    for (const category of ADHKAR_CATEGORIES) {
      expect(category.dhikr.length).toBeGreaterThan(0);
      for (const d of category.dhikr) {
        expect(d.id).toBeTruthy();
        expect(d.arabic).toBeTruthy();
        expect(d.transliteration).toBeTruthy();
        expect(d.translation).toBeTruthy();
        expect(d.repeat).toBeGreaterThan(0);
      }
    }
  });

  test('dhikr ids are unique within each set', () => {
    for (const category of ADHKAR_CATEGORIES) {
      const ids = category.dhikr.map((d) => d.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  test('every daleel names a valid source and a reference', () => {
    for (const category of ADHKAR_CATEGORIES) {
      for (const d of category.dhikr) {
        if (d.daleel) {
          expect(['quran', 'hadith']).toContain(d.daleel.source);
          expect(d.daleel.reference).toBeTruthy();
          expect(d.daleel.text).toBeTruthy();
        }
      }
    }
  });

  test('the after-ṣalāh tasbīḥ is 33 · 33 · 33 then the tahlīl', () => {
    const ids = afterSalah.dhikr.map((d) => d.id);
    expect(ids).toEqual(
      expect.arrayContaining(['subhanallah', 'alhamdulillah', 'allahu-akbar', 'tahlil-completion']),
    );
    expect(afterSalah.dhikr.find((d) => d.id === 'subhanallah')?.repeat).toBe(33);
    expect(afterSalah.dhikr.find((d) => d.id === 'alhamdulillah')?.repeat).toBe(33);
    expect(afterSalah.dhikr.find((d) => d.id === 'allahu-akbar')?.repeat).toBe(33);
  });
});

/* ------------------------------------------------------------------ *
 * counting one dhikr
 * ------------------------------------------------------------------ */
describe('adhkar · counting one dhikr', () => {
  const muawwidhat = morning.dhikr.find((d) => d.id === 'muawwidhat') as Dhikr; // repeat 3

  test('dhikrCount and remaining read an empty counts object', () => {
    expect(dhikrCount({}, muawwidhat.id)).toBe(0);
    expect(remaining({}, muawwidhat)).toBe(3);
  });

  test('a tap increments and reports completion only at the target', () => {
    const t1 = tapDhikr({}, muawwidhat);
    expect(t1.count).toBe(1);
    expect(t1.dhikrCompleted).toBe(false);

    const t3 = tapDhikr(tapN({}, muawwidhat, 2), muawwidhat);
    expect(t3.count).toBe(3);
    expect(t3.dhikrCompleted).toBe(true);
  });

  test('tapping never exceeds the target and does not mutate the input', () => {
    const at3 = tapN({}, muawwidhat, 3);
    const again = tapDhikr(at3, muawwidhat);
    expect(again.count).toBe(3);
    expect(again.dhikrCompleted).toBe(false);
    expect(again.counts).toBe(at3); // no-op returns same reference

    const base: DhikrCounts = {};
    tapDhikr(base, muawwidhat);
    expect(base).toEqual({}); // original untouched
  });

  test('isDhikrComplete flips at the target', () => {
    expect(isDhikrComplete(tapN({}, muawwidhat, 2), muawwidhat)).toBe(false);
    expect(isDhikrComplete(tapN({}, muawwidhat, 3), muawwidhat)).toBe(true);
  });

  test('undo steps back, never below zero', () => {
    const at2 = tapN({}, muawwidhat, 2);
    expect(dhikrCount(undoDhikr(at2, muawwidhat), muawwidhat.id)).toBe(1);
    expect(dhikrCount(undoDhikr({}, muawwidhat), muawwidhat.id)).toBe(0);
  });

  test('completeDhikr fills to the target in one step', () => {
    expect(isDhikrComplete(completeDhikr({}, muawwidhat), muawwidhat)).toBe(true);
    expect(dhikrCount(completeDhikr({}, muawwidhat), muawwidhat.id)).toBe(3);
  });
});

/* ------------------------------------------------------------------ *
 * set progress
 * ------------------------------------------------------------------ */
describe('adhkar · set progress', () => {
  test('categoryReps sums every repeat', () => {
    const expected = morning.dhikr.reduce((n, d) => n + d.repeat, 0);
    expect(categoryReps(morning)).toBe(expected);
  });

  test('an untouched set reads zero progress and is not complete', () => {
    expect(categoryDoneReps({}, morning)).toBe(0);
    expect(categoryProgress({}, morning)).toBe(0);
    expect(completedDhikrCount({}, morning)).toBe(0);
    expect(isCategoryComplete({}, morning)).toBe(false);
    expect(nextIncompleteIndex({}, morning)).toBe(0);
  });

  test('a fully-counted set reads complete with progress 1', () => {
    const full = fullCounts(morning);
    expect(categoryDoneReps(full, morning)).toBe(categoryReps(morning));
    expect(categoryProgress(full, morning)).toBe(1);
    expect(completedDhikrCount(full, morning)).toBe(morning.dhikr.length);
    expect(isCategoryComplete(full, morning)).toBe(true);
    expect(nextIncompleteIndex(full, morning)).toBe(-1);
  });

  test('progress stays within 0..1 even past targets', () => {
    const over: DhikrCounts = {};
    for (const d of morning.dhikr) over[d.id] = d.repeat + 50;
    expect(categoryProgress(over, morning)).toBe(1);
    expect(categoryDoneReps(over, morning)).toBe(categoryReps(morning));
  });

  test('nextIncompleteIndex points at the first unfinished dhikr', () => {
    const counts = completeDhikr({}, morning.dhikr[0]);
    expect(nextIncompleteIndex(counts, morning)).toBe(1);
  });
});

/* ------------------------------------------------------------------ *
 * streak
 * ------------------------------------------------------------------ */
describe('adhkar · streak', () => {
  const today = new Date('2026-06-12T12:00:00');
  const keyFor = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return dayKey(d);
  };

  test('dayKey is a YYYY-MM-DD string', () => {
    expect(dayKey(today)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('isConsecutiveDay recognises adjacent days only', () => {
    expect(isConsecutiveDay(keyFor(-1), keyFor(0))).toBe(true);
    expect(isConsecutiveDay(keyFor(-2), keyFor(0))).toBe(false);
    expect(isConsecutiveDay(keyFor(0), keyFor(0))).toBe(false);
  });

  test('an empty history has no streak', () => {
    expect(currentStreak({}, today)).toBe(0);
  });

  test('completing today and the prior days builds the streak', () => {
    const history: AdhkarHistory = {
      [keyFor(0)]: ['morning'],
      [keyFor(-1)]: ['morning', 'evening'],
      [keyFor(-2)]: ['evening'],
    };
    expect(currentStreak(history, today)).toBe(3);
  });

  test('a streak ending yesterday survives an unstarted today', () => {
    const history: AdhkarHistory = {
      [keyFor(-1)]: ['morning'],
      [keyFor(-2)]: ['morning'],
    };
    expect(currentStreak(history, today)).toBe(2);
  });

  test('a gap breaks the streak', () => {
    const history: AdhkarHistory = {
      [keyFor(0)]: ['morning'],
      [keyFor(-2)]: ['morning'],
    };
    expect(currentStreak(history, today)).toBe(1);
  });

  test('recordCompletion adds a set once per day', () => {
    let history: AdhkarHistory = {};
    history = recordCompletion(history, 'morning', today);
    history = recordCompletion(history, 'morning', today); // duplicate ignored
    history = recordCompletion(history, 'evening', today);
    expect(history[dayKey(today)]).toEqual(['morning', 'evening']);
  });
});
