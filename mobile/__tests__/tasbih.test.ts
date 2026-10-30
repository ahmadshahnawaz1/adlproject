import {
  DEFAULT_PRESET_ID,
  TASBIH_PRESETS,
  TASBIH_TARGETS,
  activePhrase,
  hasTarget,
  phraseBoundaries,
  phraseTargets,
  presetById,
  resetCounter,
  roundFraction,
  tapCounter,
  undoCounter,
  type TasbihCounter,
  type TasbihPreset,
} from '../lib/tasbih';

const zero: TasbihCounter = { count: 0, rounds: 0, lifetime: 0 };

const afterSalah = presetById('after-salah');
const single = presetById('subhanallah'); // target 33, no phrases
const free = presetById('free'); // target 0

/** Tap a preset `n` times from a starting counter, returning the final state. */
function tapN(start: TasbihCounter, preset: TasbihPreset, n: number): TasbihCounter {
  let c = start;
  for (let i = 0; i < n; i++) c = tapCounter(c, preset).next;
  return c;
}

/* ------------------------------------------------------------------ *
 * presets
 * ------------------------------------------------------------------ */
describe('tasbih · presets', () => {
  test('the default preset exists and is the after-ṣalāh tasbīḥ', () => {
    expect(presetById(DEFAULT_PRESET_ID).id).toBe('after-salah');
    expect(TASBIH_PRESETS[0].id).toBe(DEFAULT_PRESET_ID);
  });

  test('presetById falls back to the first preset for unknown ids', () => {
    expect(presetById('does-not-exist').id).toBe(TASBIH_PRESETS[0].id);
  });

  test('every preset has a unique id', () => {
    const ids = TASBIH_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('the after-ṣalāh phrases sum to its round target of 100', () => {
    expect(afterSalah.target).toBe(100);
    const sum = (afterSalah.phrases ?? []).reduce((n, p) => n + p.target, 0);
    expect(sum).toBe(100);
  });

  test('hasTarget distinguishes counted dhikr from the free count', () => {
    expect(hasTarget(single)).toBe(true);
    expect(hasTarget(free)).toBe(false);
  });

  test('the classic targets are offered', () => {
    expect(TASBIH_TARGETS).toEqual([33, 99, 100]);
  });
});

/* ------------------------------------------------------------------ *
 * phrase maths
 * ------------------------------------------------------------------ */
describe('tasbih · phrase boundaries', () => {
  const phrases = afterSalah.phrases!;

  test('phraseTargets and phraseBoundaries are correct', () => {
    expect(phraseTargets(phrases)).toEqual([33, 33, 33, 1]);
    expect(phraseBoundaries(phrases)).toEqual([33, 66, 99, 100]);
  });

  test('activePhrase resolves the first phrase at the start of a round', () => {
    const a = activePhrase(0, phrases);
    expect(a.index).toBe(0);
    expect(a.done).toBe(0);
    expect(a.target).toBe(33);
  });

  test('activePhrase reads a just-finished phrase as full at its boundary', () => {
    const a = activePhrase(33, phrases);
    expect(a.index).toBe(0);
    expect(a.done).toBe(33);
  });

  test('activePhrase moves to the next phrase one past a boundary', () => {
    const a = activePhrase(34, phrases);
    expect(a.index).toBe(1);
    expect(a.done).toBe(1);
  });

  test('activePhrase resolves the closing tahlīl at the hundred', () => {
    const a = activePhrase(100, phrases);
    expect(a.index).toBe(3);
    expect(a.done).toBe(1);
    expect(a.phrase.id).toBe('tahlil');
  });

  test('activePhrase clamps out-of-range progress', () => {
    expect(activePhrase(-5, phrases).index).toBe(0);
    expect(activePhrase(500, phrases).index).toBe(3);
  });
});

/* ------------------------------------------------------------------ *
 * roundFraction
 * ------------------------------------------------------------------ */
describe('tasbih · roundFraction', () => {
  test('is the ratio of count to target, clamped', () => {
    expect(roundFraction(0, 33)).toBe(0);
    expect(roundFraction(33, 33)).toBe(1);
    expect(roundFraction(99, 33)).toBe(1);
    expect(roundFraction(16, 32)).toBeCloseTo(0.5, 5);
  });

  test('is 0 for a free count (no target)', () => {
    expect(roundFraction(40, 0)).toBe(0);
  });
});

/* ------------------------------------------------------------------ *
 * tapCounter
 * ------------------------------------------------------------------ */
describe('tasbih · tapCounter', () => {
  test('a single tap advances count and lifetime', () => {
    const r = tapCounter(zero, single);
    expect(r.next).toEqual({ count: 1, rounds: 0, lifetime: 1 });
    expect(r.roundCompleted).toBe(false);
    expect(r.phraseCompleted).toBe(false);
  });

  test('completing a round marks it full, increments rounds, and flags completion', () => {
    const before: TasbihCounter = { count: 32, rounds: 0, lifetime: 32 };
    const r = tapCounter(before, single);
    expect(r.next).toEqual({ count: 33, rounds: 1, lifetime: 33 });
    expect(r.roundCompleted).toBe(true);
  });

  test('the tap after a full round restarts the round at one', () => {
    const full: TasbihCounter = { count: 33, rounds: 1, lifetime: 33 };
    const r = tapCounter(full, single);
    expect(r.next).toEqual({ count: 1, rounds: 1, lifetime: 34 });
    expect(r.roundCompleted).toBe(false);
  });

  test('33 taps of a single dhikr complete exactly one round', () => {
    const c = tapN(zero, single, 33);
    expect(c).toEqual({ count: 33, rounds: 1, lifetime: 33 });
  });

  test('a free count never completes a round and climbs unbounded', () => {
    const c = tapN(zero, free, 250);
    expect(c).toEqual({ count: 250, rounds: 0, lifetime: 250 });
  });

  test('guided taps flag phrase boundaries but not the final round boundary', () => {
    // Tap 33 times → first phrase boundary.
    const at33 = tapN(zero, afterSalah, 32);
    const r33 = tapCounter(at33, afterSalah);
    expect(r33.next.count).toBe(33);
    expect(r33.phraseCompleted).toBe(true);
    expect(r33.roundCompleted).toBe(false);
  });

  test('the hundredth guided tap completes the round, not merely a phrase', () => {
    const at99 = tapN(zero, afterSalah, 99);
    expect(at99).toEqual({ count: 99, rounds: 0, lifetime: 99 });
    const r100 = tapCounter(at99, afterSalah);
    expect(r100.next).toEqual({ count: 100, rounds: 1, lifetime: 100 });
    expect(r100.roundCompleted).toBe(true);
    expect(r100.phraseCompleted).toBe(false);
  });

  test('two full guided rounds yield two rounds and a lifetime of 200', () => {
    const c = tapN(zero, afterSalah, 200);
    expect(c.rounds).toBe(2);
    expect(c.lifetime).toBe(200);
    expect(c.count).toBe(100);
  });
});

/* ------------------------------------------------------------------ *
 * undo & reset
 * ------------------------------------------------------------------ */
describe('tasbih · undoCounter and resetCounter', () => {
  test('undo steps a single count back and decrements lifetime', () => {
    const c: TasbihCounter = { count: 5, rounds: 0, lifetime: 5 };
    expect(undoCounter(c)).toEqual({ count: 4, rounds: 0, lifetime: 4 });
  });

  test('undo does nothing at the start of a round', () => {
    const c: TasbihCounter = { count: 0, rounds: 2, lifetime: 66 };
    expect(undoCounter(c)).toEqual(c);
  });

  test('reset clears the sitting but preserves the lifetime total', () => {
    const c: TasbihCounter = { count: 40, rounds: 3, lifetime: 340 };
    expect(resetCounter(c)).toEqual({ count: 0, rounds: 0, lifetime: 340 });
  });
});
