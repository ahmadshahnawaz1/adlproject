/**
 * lib/hadith — the pure logic over the Sunnah library.
 *
 * Grading helpers (label, rank, authenticity, a semantic tone key the UI maps
 * to a colour), a forgiving search over the translated fields, topic and
 * collection browsing, and a deterministic Hadith of the Day. Everything here
 * is pure and synchronous, so it is fully covered by tests. Arabic full-text
 * search is handled separately by the SQLite layer over downloaded collections.
 */
import {
  BUNDLED_HADITH,
  HADITH_COLLECTIONS,
  HADITH_TOPICS,
  NAWAWI_40,
  bundledHadithOf,
  collectionById,
  topicById,
  type Grade,
  type GradeRuling,
  type Hadith,
  type HadithCollection,
  type HadithTopic,
} from '../content/hadith';
import { normalizeText, queryTokens } from './duaSearch';

export {
  BUNDLED_HADITH,
  HADITH_COLLECTIONS,
  HADITH_TOPICS,
  NAWAWI_40,
  bundledHadithOf,
  collectionById,
  topicById,
  normalizeText,
  queryTokens,
};
export type { Grade, GradeRuling, Hadith, HadithCollection, HadithTopic };

/** A semantic tone key the UI maps to a palette colour. */
export type GradeTone = 'authentic' | 'good' | 'weak' | 'fabricated';

type GradeMeta = { label: string; short: string; tone: GradeTone; rank: number };

const GRADE_META: Record<GradeRuling, GradeMeta> = {
  sahih: { label: 'Ṣaḥīḥ (authentic)', short: 'Ṣaḥīḥ', tone: 'authentic', rank: 4 },
  'hasan-sahih': { label: 'Ḥasan Ṣaḥīḥ', short: 'Ḥasan Ṣaḥīḥ', tone: 'authentic', rank: 3 },
  hasan: { label: 'Ḥasan (sound)', short: 'Ḥasan', tone: 'good', rank: 2 },
  daif: { label: 'Ḍaʿīf (weak)', short: 'Ḍaʿīf', tone: 'weak', rank: 1 },
  mawdu: { label: 'Mawḍūʿ (fabricated)', short: 'Mawḍūʿ', tone: 'fabricated', rank: 0 },
};

/** The display metadata for a ruling. */
export function gradeMeta(ruling: GradeRuling): GradeMeta {
  return GRADE_META[ruling] ?? GRADE_META.daif;
}

/** A short label for a ruling, e.g. "Ṣaḥīḥ". */
export function gradeLabel(ruling: GradeRuling): string {
  return gradeMeta(ruling).short;
}

/** Whether a grade counts as acceptable evidence (ṣaḥīḥ or ḥasan). */
export function isAuthentic(grade: Grade): boolean {
  return gradeMeta(grade.ruling).rank >= GRADE_META.hasan.rank;
}

/** Keep only authentic narrations when `authenticOnly` is on. */
export function filterByGrade(list: Hadith[], authenticOnly: boolean): Hadith[] {
  return authenticOnly ? list.filter((h) => isAuthentic(h.grade)) : list;
}

/** Every narration filed under a topic, across all bundled collections. */
export function hadithInTopic(topicId: string, list: Hadith[] = BUNDLED_HADITH): Hadith[] {
  return list.filter((h) => (h.topics ?? []).includes(topicId));
}

/** How many bundled narrations a topic gathers. */
export function topicCount(topicId: string, list: Hadith[] = BUNDLED_HADITH): number {
  return hadithInTopic(topicId, list).length;
}

function scoreHadith(h: Hadith, tokens: string[]): number {
  const high = normalizeText(
    `${h.chapter ?? ''} ${h.narrator ?? ''} ${(h.topics ?? []).join(' ')} ${(h.references ?? []).join(' ')}`,
  );
  const low = normalizeText(`${h.translation} ${h.grade.grader ?? ''}`);
  let score = 0;
  for (const token of tokens) {
    if (high.includes(token)) score += 3;
    else if (low.includes(token)) score += 1;
    else return 0; // every token must match somewhere (AND)
  }
  return score;
}

/**
 * Search the translated fields (chapter, narrator, topics, references, text)
 * with diacritic-insensitive AND matching. Empty query → []. Arabic search is
 * the SQLite layer's job over downloaded books.
 */
export function searchHadith(query: string, list: Hadith[] = BUNDLED_HADITH): Hadith[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];
  return list
    .map((h) => ({ h, score: scoreHadith(h, tokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.h);
}

/** Whole days since the Unix epoch for a date (local). */
function dayNumber(date: Date): number {
  return Math.floor(
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86400000,
  );
}

/**
 * A deterministic Hadith of the Day: the same narration for a given date,
 * chosen from the authentic bundled pool so it can always be trusted.
 */
export function hadithOfDay(date: Date = new Date(), list: Hadith[] = BUNDLED_HADITH): Hadith {
  const pool = filterByGrade(list, true);
  const source = pool.length > 0 ? pool : list;
  const index = ((dayNumber(date) % source.length) + source.length) % source.length;
  return source[index];
}

/** Resolve a bundled hadith by id. */
export function hadithById(id: string, list: Hadith[] = BUNDLED_HADITH): Hadith | undefined {
  return list.find((h) => h.id === id);
}
