/**
 * lib/contrast — WCAG relative luminance and contrast ratios.
 *
 * Used to hold the palettes to an objective accessibility standard in tests
 * rather than by eye. Pure maths on hex colours.
 */

/** WCAG 2.x relative luminance of a #rrggbb colour. */
export function relativeLuminance(hex: string): number {
  const c = hex.replace('#', '');
  const channels = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two colours, from 1:1 to 21:1. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** WCAG AA: 4.5:1 for body text, 3:1 for large text. */
export function meetsAA(a: string, b: string, large = false): boolean {
  return contrastRatio(a, b) >= (large ? 3 : 4.5);
}
