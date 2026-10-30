/**
 * Typed model for the offline Qurʾān reader (F7).
 *
 * The bundled core ships three editions — Uthmani Arabic (Ḥafṣ), a Latin
 * transliteration, and the Saheeh International English translation. Additional
 * translations and tafsīr are downloaded on demand in later phases and merged
 * into `Ayah.translations` at runtime, keyed by edition id.
 */

export type Revelation = 'meccan' | 'medinan';

/** Static metadata for one of the 114 surahs. */
export interface SurahMeta {
  /** Surah number, 1–114. */
  number: number;
  /** Arabic name, e.g. "الفاتحة". */
  arabicName: string;
  /** Latin transliteration of the name, e.g. "Al-Fatihah". */
  name: string;
  /** English meaning of the name, e.g. "The Opener". */
  meaning: string;
  /** Whether the surah was revealed in Mecca or Medina. */
  revelation: Revelation;
  /** Number of ayahs in the surah. */
  ayahCount: number;
  /**
   * Whether a Bismillah ornament should be drawn above the first ayah.
   * False for al-Fātiḥah (1, where it is ayah 1) and at-Tawbah (9, none).
   */
  hasBismillah: boolean;
  /** First page in the standard 604-page Madani muṣḥaf. */
  startPage: number;
}

/**
 * A single word within an ayah, for the word-by-word reading mode. Bundled
 * offline (source: quran.com). Arabic is the Uthmani word form.
 */
export interface QuranWord {
  /** Uthmani Arabic word. */
  arabic: string;
  /** Latin transliteration of the word. */
  transliteration: string;
  /** Concise English gloss, e.g. "In (the) name". */
  gloss: string;
}

/**
 * A single ayah, assembled at runtime from the bundled core plus any
 * downloaded editions.
 */
export interface Ayah {
  /** Surah number, 1–114. */
  surah: number;
  /** Ayah number within the surah, 1-based. */
  number: number;
  /** Uthmani Arabic with full diacritics. */
  arabic: string;
  /** Latin transliteration. */
  transliteration: string;
  /** Translations keyed by edition id (e.g. "eng-ummmuhammad"). */
  translations: Record<string, string>;
  /** Per-word breakdown, present only when word-by-word data is loaded. */
  words?: QuranWord[];
}

/** Start marker for one of the 30 ajzāʾ (juzʾ). */
export interface JuzMark {
  /** Juzʾ number, 1–30. */
  juz: number;
  /** Surah in which the juzʾ begins. */
  surah: number;
  /** Ayah at which the juzʾ begins. */
  ayah: number;
}

/** What kind of text an edition provides. */
export type EditionKind = 'translation' | 'transliteration' | 'tafsir';

/** Descriptor for a translation / transliteration / tafsīr edition. */
export interface EditionInfo {
  /** Stable edition id, e.g. "eng-ummmuhammad". */
  id: string;
  /** Display name, e.g. "Saheeh International". */
  name: string;
  /** Author or translator. */
  author: string;
  /** Short language code, e.g. "en", "ar". */
  language: string;
  /** What the edition provides. */
  kind: EditionKind;
  /** Whether the edition is bundled offline in the app binary. */
  bundled: boolean;
}

/** A reference to a single ayah, e.g. parsed from "2:255". */
export interface AyahRef {
  surah: number;
  ayah: number;
}

/** Kind of an on-demand downloadable text edition (no tafsīr here). */
export type DownloadableKind = 'translation' | 'transliteration';

/**
 * A translation / transliteration edition in the download library
 * (fawazahmed0/quran-api). Fetched on demand and cached on device.
 */
export interface DownloadableEdition {
  /** Stable edition id used in the download URL, e.g. "eng-mustafakhattaba". */
  id: string;
  /** Display name (translator / title), e.g. "Mustafa Khattab". */
  name: string;
  /** Human-readable language, e.g. "English", "Turkish". */
  language: string;
  /** Whether the edition is a translation or a Latin transliteration. */
  kind: DownloadableKind;
}

/**
 * A tafsīr edition (spa5k/tafsir_api). Verses are fetched per-ayah on demand
 * and cached on device; not bundled.
 */
export interface TafsirEdition {
  /** spa5k slug used in the verse URL, e.g. "en-tafisr-ibn-kathir". */
  id: string;
  /** Display name, e.g. "Tafsir Ibn Kathir". */
  name: string;
  /** Author / compiler, e.g. "Ibn Kathir". */
  author: string;
  /** Human-readable language, e.g. "English". */
  language: string;
}
