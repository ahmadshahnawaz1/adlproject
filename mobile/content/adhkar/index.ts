/**
 * content/adhkar — the barrel for the daily remembrances (Ḥiṣn al-Muslim).
 *
 * It re-exports the types and gathers the five sets — morning, evening, after
 * ṣalāh, before sleep and on waking — into one ordered catalogue, with a small
 * resolver and the standing review disclaimer.
 */
export * from './types';

import type { AdhkarCategory, AdhkarCategoryId } from './types';
import { MORNING_ADHKAR } from './morning';
import { EVENING_ADHKAR } from './evening';
import { AFTER_SALAH_ADHKAR } from './afterSalah';
import { SLEEP_ADHKAR } from './sleep';
import { WAKING_ADHKAR } from './waking';

export { MORNING_ADHKAR, EVENING_ADHKAR, AFTER_SALAH_ADHKAR, SLEEP_ADHKAR, WAKING_ADHKAR };

/** Every remembrance set, in the order they fall across a day. */
export const ADHKAR_CATEGORIES: AdhkarCategory[] = [
  MORNING_ADHKAR,
  EVENING_ADHKAR,
  AFTER_SALAH_ADHKAR,
  SLEEP_ADHKAR,
  WAKING_ADHKAR,
];

/** The set opened first. */
export const DEFAULT_CATEGORY_ID: AdhkarCategoryId = 'morning';

/** Resolve a set by id, or `undefined` if none matches. */
export function categoryById(id: string): AdhkarCategory | undefined {
  return ADHKAR_CATEGORIES.find((c) => c.id === id);
}

/** A plain note that the content awaits scholarly review. */
export const ADHKAR_DISCLAIMER =
  'These remembrances and their references are gathered from the Qurʾān and the authentic Sunnah (chiefly Ḥiṣn al-Muslim) and are pending final scholarly review. Repetition counts follow the well-known narrations; where scholars differ, follow the guidance of a trusted teacher.';
