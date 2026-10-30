/**
 * Turning a label's ingredients string into individual ingredients.
 *
 * Real ingredient text is messy: nested brackets, percentages, allergen
 * emphasis, "may contain" tails and several languages in one field. Bracketed
 * contents are lifted out as ingredients of their own, because the additive is
 * usually inside the bracket — "emulsifier (E471)".
 */
export type IngredientToken = {
  /** As written on the label, trimmed. */
  text: string;
  /** Lowercased, unaccented, punctuation-stripped, for matching. */
  normalized: string;
};

const LEAD_IN = /^\s*(ingredients?|ingr[ée]dients?|zutaten|ingredienti|ingredientes|samenstelling|composition)\s*[:：]\s*/i;

const TRAILING_NOTE = /\b(may contain|peut contenir|kann .* enthalten|contains?|allerg(y|en)[^,]*)\b\s*[:：]?/gi;

export function normalizeIngredient(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Split an ingredients string into individual ingredients. */
export function parseIngredients(raw: string): IngredientToken[] {
  if (!raw || !raw.trim()) return [];

  const cleaned = raw
    .replace(LEAD_IN, '')
    .replace(TRAILING_NOTE, ',')
    // Brackets of every kind become separators so their contents stand alone.
    .replace(/[()[\]{}]/g, ',')
    .replace(/[;•·|\n\r]/g, ',')
    .replace(/\s+&\s+/g, ',')
    .replace(/\s+\band\b\s+/gi, ',');

  const seen = new Set<string>();
  const out: IngredientToken[] = [];

  for (const piece of cleaned.split(',')) {
    const text = piece
      .replace(/\d+([.,]\d+)?\s*%/g, '')
      .replace(/^[\s*†‡_.-]+|[\s*†‡_.-]+$/g, '')
      .trim();
    if (!text) continue;

    const normalized = normalizeIngredient(text);
    if (!normalized) continue;
    // A bare number is a stray percentage or weight, not an ingredient.
    if (/^[\d\s-]+$/.test(normalized)) continue;

    const key = normalized;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ text, normalized });
  }

  return out;
}

/** The whole list normalised into one string, for whole-text scanning. */
export function joinNormalized(tokens: IngredientToken[]): string {
  return tokens.map((t) => t.normalized).join(' , ');
}
