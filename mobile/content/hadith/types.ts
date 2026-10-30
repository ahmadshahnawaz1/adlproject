/**
 * content/hadith/types.ts — the shape of the Sunnah library.
 *
 * A `Hadith` carries its Arabic, a translation, its narrator and (optionally)
 * its chain, and — always — an authenticity `Grade`. A `HadithCollection`
 * describes one book (name, author, size, and whether its full text is bundled
 * or downloaded on demand). No React, no I/O — typed, evidence-graded data the
 * screens render.
 */

/** The authenticity ruling on a narration. */
export type GradeRuling =
  | 'sahih' // authentic
  | 'hasan' // sound / good
  | 'hasan-sahih' // Tirmidhī's combined grade
  | 'daif' // weak
  | 'mawdu'; // fabricated

/** An authenticity grade, with the scholar or source that assigned it. */
export type Grade = {
  ruling: GradeRuling;
  /** The grader, e.g. "al-Bukhārī", "al-Albānī", "Muslim". */
  grader?: string;
  /** Where the grade is recorded, e.g. "Ṣaḥīḥ al-Jāmiʿ". */
  source?: string;
};

/** A single narration. */
export type Hadith = {
  id: string;
  /** The collection this narration belongs to (see HadithCollection.id). */
  collectionId: string;
  /** The number within its collection (as commonly cited). */
  number: number;
  /** The book/volume within the collection, if applicable. */
  book?: string;
  /** The chapter (bāb) title. */
  chapter?: string;
  /** The Arabic text (matn), with diacritics. */
  arabic: string;
  /** The translation shown by default. */
  translation: string;
  /** The Companion (or source) who narrated it. */
  narrator?: string;
  /** The chain of transmission, when carried. */
  isnad?: string;
  /** The authenticity grade — never omitted. */
  grade: Grade;
  /** Cross-references to the same narration elsewhere, e.g. "Muslim 8". */
  references?: string[];
  /** Topic ids this narration is filed under (see HadithTopic). */
  topics?: string[];
};

/** How a collection's full text reaches the reader. */
export type CollectionAvailability =
  /** Bundled in the app; works fully offline immediately. */
  | 'bundled'
  /** Streamed to disk on demand from the CDN, then offline. */
  | 'download';

/** One hadith book. */
export type HadithCollection = {
  id: string;
  /** English/transliterated name, e.g. "Ṣaḥīḥ al-Bukhārī". */
  name: string;
  /** Arabic name, e.g. "صحيح البخاري". */
  arabicName: string;
  /** The compiler, e.g. "Imām al-Bukhārī". */
  author: string;
  /** A one- or two-line description. */
  description: string;
  /** Approximate number of narrations (with repetition). */
  total: number;
  /** Bundled offline, or downloaded on demand. */
  availability: CollectionAvailability;
  /** The dominant authenticity of the book, for the catalogue badge. */
  authenticity: GradeRuling | 'mixed';
  /** The CDN edition slugs for the downloadable books (Arabic + English). */
  editionArabic?: string;
  editionEnglish?: string;
  /** The grader whose rulings the downloaded edition carries, if any. */
  grader?: string;
  /** A lucide icon name, resolved in the UI. */
  icon?: string;
};

/** A browsable theme across the whole library. */
export type HadithTopic = {
  id: string;
  /** English title, e.g. "Sincerity & Intention". */
  title: string;
  /** Arabic title. */
  arabic: string;
  /** One short line. */
  subtitle: string;
  /** A lucide icon name, resolved in the UI. */
  icon: string;
  /** Ids of bundled hadith filed under this theme (else computed in lib). */
  hadithIds?: string[];
};
