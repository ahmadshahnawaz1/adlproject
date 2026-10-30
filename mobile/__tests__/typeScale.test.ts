import { clampTextScale, scaleFont, scaleTextMetrics, textScaleLabel } from '../theme/typeScale';

describe('interface typography', () => {
  it('keeps the default metrics unchanged', () => {
    expect(scaleTextMetrics({ fontSize: 16, lineHeight: 24 }, 1)).toEqual({
      fontSize: 16,
      lineHeight: 24,
    });
  });

  it('scales text and leading together at the largest setting', () => {
    expect(scaleTextMetrics({ fontSize: 16, lineHeight: 24 }, 1.4)).toEqual({
      fontSize: 22.5,
      lineHeight: 33.5,
    });
  });

  it('scales text and leading together at the smallest setting', () => {
    expect(scaleTextMetrics({ fontSize: 16, lineHeight: 24 }, 0.85)).toEqual({
      fontSize: 13.5,
      lineHeight: 20.5,
    });
  });

  it('leaves inherited text metrics unset', () => {
    expect(scaleTextMetrics({}, 1.4)).toEqual({});
  });

  it('does not constrain a line below its text size', () => {
    expect(scaleTextMetrics({ fontSize: 20, lineHeight: 16 }, 1)).toEqual({
      fontSize: 20,
      lineHeight: 20,
    });
  });

  it('ignores invalid metrics', () => {
    expect(scaleTextMetrics({ fontSize: NaN, lineHeight: -1 }, 1)).toEqual({});
    expect(scaleTextMetrics({ fontSize: Infinity, lineHeight: 0 }, 1)).toEqual({});
  });

  it('clamps preferences and rounds to half points', () => {
    expect(clampTextScale(NaN)).toBe(1);
    expect(scaleFont(15, 2)).toBe(21);
    expect(scaleFont(15, 0)).toBe(13);
    expect(textScaleLabel(1.15)).toBe('115%');
  });
});