/**
 * Palette accessibility — holds every theme to WCAG AA for text contrast, so a
 * future colour tweak can never quietly make the app unreadable.
 */
import { contrastRatio, meetsAA, relativeLuminance } from '../lib/contrast';
import {
  darkPalette,
  lightPalette,
  highContrastDarkPalette,
  highContrastLightPalette,
  resolvePalette,
  type ThemeColors,
} from '../theme/palettes';

describe('contrast maths', () => {
  it('computes known luminances', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('computes the canonical black-on-white ratio', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#123456', '#ABCDEF')).toBeCloseTo(
      contrastRatio('#ABCDEF', '#123456'),
      10,
    );
  });

  it('applies the AA thresholds', () => {
    expect(meetsAA('#FFFFFF', '#000000')).toBe(true);
    expect(meetsAA('#777777', '#808080')).toBe(false);
    expect(meetsAA('#949494', '#FFFFFF', true)).toBe(true);
  });
});

const palettes: [string, ThemeColors][] = [
  ['dark', darkPalette],
  ['light', lightPalette],
  ['high-contrast dark', highContrastDarkPalette],
  ['high-contrast light', highContrastLightPalette],
];

describe.each(palettes)('%s palette', (_name, p) => {
  const surfaces: [string, string][] = [
    ['background', p.background],
    ['card', p.card],
    ['cardElevated', p.cardElevated],
  ];

  it.each(surfaces)('foreground text is readable on %s', (_s, surface) => {
    expect(contrastRatio(p.foreground, surface)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(surfaces)('mutedForeground text is readable on %s', (_s, surface) => {
    expect(contrastRatio(p.mutedForeground, surface)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(surfaces)('subtleForeground text is readable on %s', (_s, surface) => {
    expect(contrastRatio(p.subtleForeground, surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the visual hierarchy foreground > muted > subtle', () => {
    const f = contrastRatio(p.foreground, p.card);
    const m = contrastRatio(p.mutedForeground, p.card);
    const s = contrastRatio(p.subtleForeground, p.card);
    expect(f).toBeGreaterThan(m);
    expect(m).toBeGreaterThan(s);
  });

  it('renders a legible label on the accent colour', () => {
    expect(contrastRatio(p.primaryForeground, p.primary)).toBeGreaterThanOrEqual(4.5);
  });

  it('shows destructive text legibly on a card', () => {
    expect(contrastRatio(p.destructive, p.card)).toBeGreaterThanOrEqual(3);
  });
});

describe('resolvePalette', () => {
  it('maps scheme and contrast preference to the right palette', () => {
    expect(resolvePalette('dark', false)).toBe(darkPalette);
    expect(resolvePalette('dark', true)).toBe(highContrastDarkPalette);
    expect(resolvePalette('light', false)).toBe(lightPalette);
    expect(resolvePalette('light', true)).toBe(highContrastLightPalette);
  });
});
