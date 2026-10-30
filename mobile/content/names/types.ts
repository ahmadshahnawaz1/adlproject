/**
 * content/names/types.ts — the shape of the Beautiful Names of Allah
 * (al-Asmāʾ al-Ḥusnā).
 *
 * Each name carries its Arabic (fully voweled), a transliteration, a concise
 * meaning, a short explanation of what it asks of the believer, and — where a
 * name appears plainly in the muṣḥaf — a deep-link into the Qurʾān reader.
 * Names are grouped by theme so they can be learned in meaningful clusters
 * rather than as a flat list of ninety-nine. No React, no I/O — typed data.
 */

/** A deep-link into the muṣḥaf (F7). */
export type AyahRef = { surah: number; ayah: number };

/** The clusters a name is learned within. */
export type NameTheme =
  | 'mercy'
  | 'majesty'
  | 'knowledge'
  | 'provision'
  | 'justice'
  | 'creation'
  | 'forgiveness'
  | 'closeness'
  | 'eternity';

/** One of the Beautiful Names. */
export type DivineName = {
  id: string;
  /** Position in the well-known enumeration (1–99). */
  number: number;
  /** Fully voweled Arabic, e.g. "الرَّحْمَٰن". */
  arabic: string;
  /** Scholarly transliteration, e.g. "Ar-Raḥmān". */
  transliteration: string;
  /** A concise English rendering, e.g. "The Most Merciful". */
  meaning: string;
  /** What the name means and what it asks of the believer. */
  explanation: string;
  theme: NameTheme;
  /** Where the name appears plainly in the Qurʾān, when it does. */
  quranRef?: AyahRef;
};

/** Metadata for a theme cluster. */
export type NameThemeMeta = {
  id: NameTheme;
  title: string;
  arabic: string;
  blurb: string;
};
