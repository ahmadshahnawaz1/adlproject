/**
 * Public surface for the bundled offline Qurʾān core (F7).
 *
 * The Arabic Uthmani text (Ḥafṣ ʿan ʿĀṣim), a Latin transliteration, and the
 * Saheeh International translation ship inside the app binary. Further
 * translations and tafsīr are downloaded on demand and merged at runtime.
 */
export * from './types';
export { SURAHS } from './surahs';
export { JUZ } from './juz';
export {
  BUNDLED_TRANSLATION,
  SURAH_FILES,
  type RawAyah,
  type RawSurah,
} from './data/manifest';
export {
  WBW_FILES,
  type RawWord,
  type RawWbwAyah,
  type RawWbwSurah,
} from './data/wbw-manifest';
export { EDITION_CATALOG } from './editions-catalog';
export { TAFSIRS, DEFAULT_TAFSIR_ID, getTafsir } from './tafsirs';

import type { EditionInfo } from './types';
import { BUNDLED_TRANSLATION } from './data/manifest';
import { EDITION_CATALOG } from './editions-catalog';

/** Total ayahs in the muṣḥaf. */
export const TOTAL_AYAHS = 6236;
/** Total surahs. */
export const TOTAL_SURAHS = 114;
/** Total ajzāʾ. */
export const TOTAL_JUZ = 30;
/** Pages in the standard Madani muṣḥaf. */
export const TOTAL_PAGES = 604;

/** Edition id of the translation shown by default. */
export const DEFAULT_TRANSLATION_ID = BUNDLED_TRANSLATION;

/** Translation editions available offline at first launch. */
export const BUNDLED_TRANSLATIONS: readonly EditionInfo[] = [
  {
    id: 'eng-ummmuhammad',
    name: 'Saheeh International',
    author: 'Umm Muhammad (Aminah Assami)',
    language: 'en',
    kind: 'translation',
    bundled: true,
  },
];

/** The Bismillah in Uthmani orthography, matching the bundled muṣḥaf text. */
export const BISMILLAH = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ';

/** A gentle note shown in the reader's about sheet. */
export const QURAN_DISCLAIMER =
  'The Arabic is the Uthmani muṣḥaf (Ḥafṣ ʿan ʿĀṣim). Translations convey meaning only and can never replace the Qurʾān itself — recite with reverence.';

/** Number of translation / transliteration editions available to download. */
export const TOTAL_DOWNLOADABLE_EDITIONS = EDITION_CATALOG.length;

/** Number of distinct languages covered by the download library. */
export const TOTAL_EDITION_LANGUAGES = new Set(
  EDITION_CATALOG.map((e) => e.language),
).size;
