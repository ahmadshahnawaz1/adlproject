/**
 * content/hadith — the barrel for the Sunnah library.
 *
 * Assembles the bundled offline corpus (al-Nawawī's Forty + the selected
 * Aḥādīth Qudsī), exposes the collections catalogue and the browsable topics,
 * and carries the standing review disclaimer. Downloaded books are merged in at
 * runtime by the native store; they are not part of the bundle.
 */
export * from './types';

import type { Hadith, HadithCollection, HadithTopic } from './types';
import { NAWAWI_40_PART1 } from './nawawi40_1';
import { NAWAWI_40_PART2 } from './nawawi40_2';
import { QUDSI } from './qudsi';
import { HADITH_COLLECTIONS } from './collections';
import { HADITH_TOPICS } from './topics';

export { HADITH_COLLECTIONS, HADITH_TOPICS };

/** al-Nawawī's Forty, in order. */
export const NAWAWI_40: Hadith[] = [...NAWAWI_40_PART1, ...NAWAWI_40_PART2];

/** Every bundled narration (works fully offline). */
export const BUNDLED_HADITH: Hadith[] = [...NAWAWI_40, ...QUDSI];

/** The collection opened first on the hub. */
export const DEFAULT_COLLECTION_ID = 'nawawi40';

/** Resolve a collection by id. */
export function collectionById(id: string): HadithCollection | undefined {
  return HADITH_COLLECTIONS.find((c) => c.id === id);
}

/** Resolve a browsable topic by id. */
export function topicById(id: string): HadithTopic | undefined {
  return HADITH_TOPICS.find((t) => t.id === id);
}

/** The bundled narrations of one collection. */
export function bundledHadithOf(collectionId: string): Hadith[] {
  return BUNDLED_HADITH.filter((h) => h.collectionId === collectionId);
}

/** A plain note that the content awaits scholarly review. */
export const HADITH_DISCLAIMER =
  'These narrations, translations, and gradings are gathered from the well-known collections and are pending final scholarly review. Authenticity gradings follow the cited scholars; where they differ, defer to a trusted teacher. Downloaded collections may include weak or fabricated narrations — always heed the grade shown.';
