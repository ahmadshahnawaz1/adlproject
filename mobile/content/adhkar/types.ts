/**
 * content/adhkar/types.ts — the shape of the daily remembrances (Ḥiṣn
 * al-Muslim, "the Fortress of the Muslim").
 *
 * A `Dhikr` is one remembrance: its Arabic, a transliteration, a translation,
 * how many times it is repeated, an optional cited virtue, an optional
 * practical note, and the evidence behind it. An `AdhkarCategory` gathers the
 * remembrances of one moment of the day (morning, evening, after ṣalāh, before
 * sleep, on waking). No React, no I/O — just typed data the engine expands and
 * the screen renders.
 */

/** A single proof-text (Qurʾān or Sunnah). Shape-compatible with DaleelBlock. */
export type Daleel = {
  source: 'quran' | 'hadith';
  reference: string;
  narrator?: string;
  grade?: string;
  text: string;
};

/** One remembrance and how many times it is repeated in a sitting. */
export type Dhikr = {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  /** Repetitions of this remembrance in one sitting. */
  repeat: number;
  /** A short, cited virtue shown gently beneath the dhikr. */
  virtue?: string;
  /** A practical note (e.g. "blow into the palms and wipe over the body"). */
  note?: string;
  daleel?: Daleel;
};

/** The moments of the day for which a remembrance set is gathered. */
export type AdhkarCategoryId = 'morning' | 'evening' | 'after-salah' | 'sleep' | 'waking';

/** A gathered set of remembrances for one moment of the day. */
export type AdhkarCategory = {
  id: AdhkarCategoryId;
  /** English name, e.g. "Morning". */
  title: string;
  /** Arabic name, e.g. "أَذْكَار الصَّبَاح". */
  arabic: string;
  /** One English line naming the set. */
  subtitle: string;
  /** When the set is said, e.g. "From dawn until sunrise". */
  timeHint: string;
  /** The ordered remembrances. */
  dhikr: Dhikr[];
};
