/**
 * lib/ai/retrieval — grounds ADL AI in the app's own evidence-cited corpus.
 *
 * Given a user question, it retrieves the most relevant items from the bundled
 * hadith, the duʿāʾ library, and the learning lessons/Sīrah, so the model can
 * answer *from* cited sources rather than from memory alone. It reuses the same
 * pure, diacritic-insensitive search each feature already ships. Pure & tested.
 */
import { searchHadith } from '../hadith';
import { searchDuas } from '../duaSearch';
import { searchLessons } from '../learn';
import { searchSirah, gradeLabel } from '../sirah';

/** A retrieved snippet of grounding, tagged by where it came from. */
export type RetrievedDoc = {
  kind: 'hadith' | 'dua' | 'lesson' | 'sirah';
  title: string;
  text: string;
  /** A citation the app can turn into a tappable chip, e.g. "hadith:nawawi40:1". */
  citation?: string;
  /** A human-readable source label. */
  source: string;
};

function take<T>(list: T[], n: number): T[] {
  return list.slice(0, Math.max(0, n));
}

/**
 * Retrieve grounding for a query. Pulls a few items from each corpus and caps
 * the total so the prompt stays within budget. Empty query → [].
 */
export function retrieve(
  query: string,
  opts: { perKind?: number; total?: number } = {},
): RetrievedDoc[] {
  if (!query.trim()) return [];
  const perKind = opts.perKind ?? 3;
  const total = opts.total ?? 8;

  const docs: RetrievedDoc[] = [];

  for (const h of take(searchHadith(query), perKind)) {
    docs.push({
      kind: 'hadith',
      title: `${h.collectionId} #${h.number}`,
      text: h.translation,
      citation: `hadith:${h.collectionId}:${h.number}`,
      source: h.grade.grader ? `Hadith (${h.grade.grader})` : 'Hadith',
    });
  }

  for (const d of take(searchDuas(query), perKind)) {
    docs.push({
      kind: 'dua',
      title: d.title,
      text: d.translation,
      source: 'Duʿāʾ library',
    });
  }

  for (const l of take(searchLessons(query), perKind)) {
    docs.push({
      kind: 'lesson',
      title: l.title,
      text: l.summary,
      source: `Learn · ${l.group}`,
    });
  }

  for (const s of take(searchSirah(query), Math.min(perKind, 2))) {
    docs.push({
      kind: 'sirah',
      title: s.title,
      text: s.summary,
      citation: `sirah:${s.id}`,
      source: `Sīrah · ${s.yearLabel} · ${gradeLabel(s.grade)}`,
    });
  }

  return take(docs, total);
}
