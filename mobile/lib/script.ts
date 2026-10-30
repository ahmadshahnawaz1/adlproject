/**
 * Script-specific typography.
 *
 * Urdu is written in Nastaʿlīq, a cursive style whose words cascade downward
 * from right to left. Rendered in Naskh it is readable but wrong to a native
 * eye, and rendered at Latin line-height its descenders collide with the line
 * beneath. Both are handled here rather than at each call site.
 */
export const URDU_FONT = 'NotoNastaliqUrdu';

/**
 * Nastaʿlīq needs roughly twice the leading of a Latin face. Below about 1.9
 * the descenders of one line strike the ascenders of the next.
 */
export const NASTALIQ_LINE_MULTIPLIER = 2.1;

/** Locales whose script needs a bundled font rather than the system face. */
const SCRIPT_FONTS: Record<string, string> = {
  ur: URDU_FONT,
};

/** The font a locale's body text should use, or null to keep the system face. */
export function scriptFontFor(code: string): string | null {
  return SCRIPT_FONTS[code] ?? null;
}

/**
 * The line height a locale needs at a given size, or null when the default is
 * fine. Returns null for a size that is missing or nonsensical.
 */
export function scriptLineHeight(code: string, fontSize?: number): number | null {
  if (code !== 'ur') return null;
  if (!fontSize || !Number.isFinite(fontSize) || fontSize <= 0) return null;
  return Math.round(fontSize * NASTALIQ_LINE_MULTIPLIER);
}

export function needsScriptFont(code: string): boolean {
  return scriptFontFor(code) !== null;
}
