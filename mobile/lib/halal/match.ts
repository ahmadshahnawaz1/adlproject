/**
 * Matching parsed ingredients against the additive reference.
 *
 * Two passes: E-numbers by pattern, then names by alias. Both are guarded,
 * because the naive versions are wrong in ways that matter — "vitamin E 400"
 * is not additive E400, and "alcohol-free" is not alcohol.
 */
import { ADDITIVES, type Additive } from '../../content/halal';
import { normalizeIngredient, type IngredientToken } from './parse';

export type Match = {
  additive: Additive;
  /** The text on the label that triggered this match. */
  matched: string;
};

/** e471 / e 471 / e-471 / ins471 — but never "vitamin e", "e.g." or "ester". */
const E_NUMBER = /\b(?:e|ins)\s?-?\s?(\d{3,4}[a-z]?)\b/g;

/** Words that turn a mention into a denial: "alcohol free", "no gelatin". */
const NEGATORS = ['free', 'freie', 'frei', 'sans', 'libre'];
const PRE_NEGATORS = ['non', 'no', 'without', 'sans', 'zero', 'free from', 'free of'];

let aliasIndex: { alias: string; additive: Additive }[] | null = null;

function buildIndex() {
  if (aliasIndex) return aliasIndex;
  const rows: { alias: string; additive: Additive }[] = [];
  for (const additive of ADDITIVES) {
    const keys = new Set<string>([additive.code, additive.name, ...(additive.aliases ?? [])]);
    for (const key of keys) {
      const normalized = normalizeIngredient(key);
      if (normalized.length < 3) continue;
      rows.push({ alias: normalized, additive });
    }
  }
  // Longest alias first so "pork gelatin" wins over "gelatin".
  rows.sort((a, b) => b.alias.length - a.alias.length);
  aliasIndex = rows;
  return rows;
}

/** Exposed for tests — clears the memoised alias index. */
export function resetIndex() {
  aliasIndex = null;
}

function wordAt(haystack: string, needle: string, from = 0): number {
  let i = from;
  while (i <= haystack.length - needle.length) {
    const at = haystack.indexOf(needle, i);
    if (at === -1) return -1;
    const before = at === 0 ? ' ' : haystack[at - 1];
    const afterAt = at + needle.length;
    const after = afterAt >= haystack.length ? ' ' : haystack[afterAt];
    const boundedBefore = before === ' ' || before === '-';
    const boundedAfter = after === ' ' || after === '-';
    if (boundedBefore && boundedAfter) return at;
    i = at + 1;
  }
  return -1;
}

/** True when the mention is a denial rather than a declaration. */
function isNegated(haystack: string, start: number, end: number): boolean {
  const after = haystack.slice(end, end + 16).replace(/^[-\s]+/, '').trim();
  for (const neg of NEGATORS) {
    if (after === neg || after.startsWith(`${neg} `) || after.startsWith(`${neg},`)) return true;
  }
  const before = haystack.slice(Math.max(0, start - 14), start).replace(/[-\s]+$/, '').trim();
  for (const neg of PRE_NEGATORS) {
    if (before === neg || before.endsWith(` ${neg}`)) return true;
  }
  return false;
}

function findENumbers(text: string): string[] {
  const found: string[] = [];
  E_NUMBER.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = E_NUMBER.exec(text)) !== null) {
    const before = text.slice(Math.max(0, m.index - 9), m.index).trim();
    // "vitamin e 400" is a dose of vitamin E, not additive E400.
    if (before.endsWith('vitamin')) continue;
    if (isNegated(text, m.index, m.index + m[0].length)) continue;
    found.push(`e${m[1]}`);
  }
  return found;
}

/** All additives mentioned anywhere in the parsed ingredients. */
export function matchAdditives(tokens: IngredientToken[]): Match[] {
  const index = buildIndex();
  const byCode = new Map<string, Match>();

  for (const token of tokens) {
    const hay = token.normalized;

    for (const code of findENumbers(hay)) {
      const hit = index.find((row) => row.alias === code);
      if (hit && !byCode.has(hit.additive.code)) {
        byCode.set(hit.additive.code, { additive: hit.additive, matched: token.text });
      }
    }

    // Aliases are longest-first, so a specific entry claims the text before a
    // general one and blocks the general match on the same span.
    const claimed: [number, number][] = [];
    for (const row of index) {
      if (/^e\d/.test(row.alias)) continue;
      const at = wordAt(hay, row.alias);
      if (at === -1) continue;
      const end = at + row.alias.length;
      if (claimed.some(([s, e]) => at < e && s < end)) continue;
      if (isNegated(hay, at, end)) continue;
      claimed.push([at, end]);
      if (!byCode.has(row.additive.code)) {
        byCode.set(row.additive.code, { additive: row.additive, matched: token.text });
      }
    }
  }

  return [...byCode.values()];
}
