/**
 * Script typography tests. The Nastaʿlīq leading rule is the one that matters:
 * too little and consecutive lines of Urdu overlap.
 */
import {
  NASTALIQ_LINE_MULTIPLIER,
  URDU_FONT,
  needsScriptFont,
  scriptFontFor,
  scriptLineHeight,
} from '../lib/script';

describe('script fonts', () => {
  it('gives Urdu a Nastaʿlīq face', () => {
    expect(scriptFontFor('ur')).toBe(URDU_FONT);
    expect(needsScriptFont('ur')).toBe(true);
  });

  it('leaves every other language on the system face', () => {
    for (const code of ['en', 'ar', 'fr', 'id', 'tr', 'zz']) {
      expect(scriptFontFor(code)).toBeNull();
      expect(needsScriptFont(code)).toBe(false);
    }
  });

  it('does not give Arabic the Urdu face', () => {
    expect(scriptFontFor('ar')).toBeNull();
  });
});

describe('Nastaʿlīq leading', () => {
  it('scales the line height well clear of collision', () => {
    expect(NASTALIQ_LINE_MULTIPLIER).toBeGreaterThanOrEqual(1.9);
    expect(scriptLineHeight('ur', 14)).toBe(Math.round(14 * NASTALIQ_LINE_MULTIPLIER));
    expect(scriptLineHeight('ur', 20)).toBe(Math.round(20 * NASTALIQ_LINE_MULTIPLIER));
  });

  it('always exceeds the font size it is given', () => {
    for (const size of [10, 12, 14, 16, 18, 22, 28]) {
      expect(scriptLineHeight('ur', size)!).toBeGreaterThan(size);
    }
  });

  it('leaves other languages to their defaults', () => {
    for (const code of ['en', 'ar', 'fr']) {
      expect(scriptLineHeight(code, 14)).toBeNull();
    }
  });

  it('declines a missing or nonsensical size', () => {
    expect(scriptLineHeight('ur', undefined)).toBeNull();
    expect(scriptLineHeight('ur', 0)).toBeNull();
    expect(scriptLineHeight('ur', -5)).toBeNull();
    expect(scriptLineHeight('ur', NaN)).toBeNull();
  });
});
