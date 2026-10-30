/**
 * theme/typeScale.ts — the dynamic-type helper (F17 accessibility).
 *
 * A single user-controlled `textScale` multiplier lets the whole interface grow
 * or shrink for legibility. `scaleFont` applies it with gentle rounding; the
 * bounds keep layouts intact at the extremes.
 */

export const TEXT_SCALE_MIN = 0.85;
export const TEXT_SCALE_MAX = 1.4;
export const TEXT_SCALE_STEP = 0.05;
export const DEFAULT_TEXT_SCALE = 1;

/** Clamp a text-scale multiplier to the supported range. */
export function clampTextScale(scale: number): number {
  if (Number.isNaN(scale)) return DEFAULT_TEXT_SCALE;
  return Math.min(TEXT_SCALE_MAX, Math.max(TEXT_SCALE_MIN, scale));
}

/** Apply the text scale to a font size, rounded to the nearest half-point. */
export function scaleFont(size: number, scale: number): number {
  return Math.round(size * clampTextScale(scale) * 2) / 2;
}

/** A human label for a text-scale value, e.g. "100%". */
export function textScaleLabel(scale: number): string {
  return `${Math.round(clampTextScale(scale) * 100)}%`;
}
