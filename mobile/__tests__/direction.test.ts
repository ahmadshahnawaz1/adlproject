/**
 * Direction tests. The pure `directionFor` carries the logic so it can be
 * checked without mounting a provider.
 */
import { directionFor } from '../lib/direction';

describe('left-to-right', () => {
  const dir = directionFor(false);

  it('lays rows out normally', () => {
    expect(dir.row).toBe('row');
    expect(dir.rowFixed).toBe('row');
  });

  it('aligns text to the left', () => {
    expect(dir.textAlign).toBe('left');
    expect(dir.textAlignEnd).toBe('right');
    expect(dir.writingDirection).toBe('ltr');
  });

  it('maps the leading edge to the left', () => {
    expect(dir.start).toBe('left');
    expect(dir.end).toBe('right');
  });

  it('leaves arrows pointing forward', () => {
    expect(dir.flip).toBe(1);
  });
});

describe('right-to-left', () => {
  const dir = directionFor(true);

  it('reverses rows that follow the reading direction', () => {
    expect(dir.row).toBe('row-reverse');
  });

  it('keeps a fixed row unreversed', () => {
    expect(dir.rowFixed).toBe('row');
  });

  it('aligns text to the right', () => {
    expect(dir.textAlign).toBe('right');
    expect(dir.textAlignEnd).toBe('left');
    expect(dir.writingDirection).toBe('rtl');
  });

  it('swaps the leading and trailing edges', () => {
    expect(dir.start).toBe('right');
    expect(dir.end).toBe('left');
  });

  it('mirrors arrows', () => {
    expect(dir.flip).toBe(-1);
  });
});

describe('both directions', () => {
  it('always expose every field', () => {
    for (const isRTL of [true, false]) {
      const dir = directionFor(isRTL);
      expect(dir.isRTL).toBe(isRTL);
      for (const key of ['row', 'rowFixed', 'textAlign', 'writingDirection', 'start', 'end']) {
        expect(dir[key as keyof typeof dir]).toBeTruthy();
      }
    }
  });

  it('never point start and end at the same edge', () => {
    for (const isRTL of [true, false]) {
      const dir = directionFor(isRTL);
      expect(dir.start).not.toBe(dir.end);
      expect(dir.textAlign).not.toBe(dir.textAlignEnd);
    }
  });
});
