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

type TextMetrics = { fontSize?: number; lineHeight?: number };

export function scaleTextMetrics(metrics: TextMetrics, scale: number): TextMetrics {
  const result: TextMetrics = {};
  if (metrics.fontSize != null && Number.isFinite(metrics.fontSize) && metrics.fontSize > 0) {
    result.fontSize = scaleFont(metrics.fontSize, scale);
  }
  if (metrics.lineHeight != null && Number.isFinite(metrics.lineHeight) && metrics.lineHeight > 0) {
    result.lineHeight = Math.max(result.fontSize ?? 0, scaleFont(metrics.lineHeight, scale));
  }
  return result;
}

/** A human label for a text-scale value, e.g. "100%". */
export function textScaleLabel(scale: number): string {
  return `${Math.round(clampTextScale(scale) * 100)}%`;
}
