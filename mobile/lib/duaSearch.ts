/**
 * duaSearch — the pure search and lookup layer over the Duʿāʾ Library.
 *
 * The content lives in content/duas-library; this module adds a small,
 * diacritic-insensitive search so a user can type “rain”, “debt”, “istikhara”
 * or “dua yunus” and find the right supplication — optionally narrowed to a
 * single category. Matching is forgiving of the transliteration's marks
 * (ʿ, ʾ, ā, ī, ū, ḥ …) and case, and results are ranked so that a title or tag
 * match surfaces above a passing mention in the translation.
 *
 * Everything here is pure and synchronous, so it is fully covered by tests.
 */
import {
  ALL_DUAS,
  DUA_CATEGORIES,
  DEFAULT_CATEGORY_ID,
  categoryById,
  duasInCategory,
  duaById,
  type Dua,
  type DuaCategory,
  type DuaCategoryId,
} from '../content/duas-library';

export {
  ALL_DUAS,
  DUA_CATEGORIES,
  DEFAULT_CATEGORY_ID,
  categoryById,
  duasInCategory,
  duaById,
};
export type { Dua, DuaCategory, DuaCategoryId };

/**
 * Fold a string down to a plain, lower-case, ASCII-ish form for matching:
 * strips combining diacritics (ā → a), removes the hamza/ʿayn modifier letters
 * and quotes, and reduces any remaining punctuation to single spaces.
 */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // combining diacritical marks
    .replace(/[ʾʿʼʻˈ’‘`]/g, '') // hamza / ʿayn modifier letters & smart quotes
    .replace(/[^a-z0-9\s]/g, ' ') // any other punctuation/script → space
    .replace(/\s+/g, ' ')
    .trim();
}

/** Split a query into normalized, non-empty search tokens. */
export function queryTokens(query: string): string[] {
  const normalized = normalizeText(query);
  return normalized ? normalized.split(' ').filter(Boolean) : [];
}

/**
 * Score one supplication against the search tokens. Every token must match
 * somewhere (logical AND); otherwise the score is 0 and the duʿā is excluded.
 * Title matches weigh most, then tags, then transliteration, then the rest.
 */
function scoreDua(dua: Dua, tokens: string[]): number {
  const title = normalizeText(dua.title);
  const tags = normalizeText(dua.tags.join(' '));
  const translit = normalizeText(dua.transliteration);
  const rest = normalizeText(`${dua.when} ${dua.translation} ${dua.category}`);

  let score = 0;
  for (const token of tokens) {
    let tokenScore = 0;
    if (title.includes(token)) tokenScore += 3;
    if (tags.includes(token)) tokenScore += 2;
    if (translit.includes(token)) tokenScore += 1;
    if (rest.includes(token)) tokenScore += 1;
    if (tokenScore === 0) return 0; // this token matched nothing → not a hit
    score += tokenScore;
  }
  return score;
}

/** Does this supplication match the query at all? */
export function matchesQuery(dua: Dua, query: string): boolean {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return true;
  return scoreDua(dua, tokens) > 0;
}

/** Rank a supplied pool by relevance, preserving catalogue order among ties. */
export function searchIn(pool: readonly Dua[], query: string): Dua[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [...pool];

  return pool
    .map((dua, index) => ({ dua, index, score: scoreDua(dua, tokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.dua);
}

/**
 * Search the library. An empty query returns the whole pool (in catalogue
 * order). A category id narrows the pool first. Results are ranked by relevance,
 * with catalogue order preserved among equal scores.
 */
export function searchDuas(query: string, categoryId?: DuaCategoryId): Dua[] {
  return searchIn(categoryId ? duasInCategory(categoryId) : ALL_DUAS, query);
}

/** How many supplications a category holds. */
export function categoryCount(id: DuaCategoryId): number {
  return duasInCategory(id).length;
}

/** Resolve a list of favourite ids to supplications, in catalogue order. */
export function duasByIds(ids: string[]): Dua[] {
  const wanted = new Set(ids);
  return ALL_DUAS.filter((dua) => wanted.has(dua.id));
}
