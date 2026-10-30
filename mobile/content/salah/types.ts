/**
 * types.ts — the data model for Adl's Ṣalāh guide ("How to Pray").
 *
 * This is the sequel to the wudū guide: the prayer itself, posture by posture,
 * in the order the Prophet ﷺ performed it. Everything the guide renders is
 * data described here — the postures, the recitations (Arabic + transliteration
 * + translation), the evidence (daleel), the differences between the madhāhib,
 * the common mistakes and the rulings of forgetfulness (sajdah sahw) — so a
 * qualified scholar can review the wording and rulings independently of the UI.
 *
 * Authenticity bar (matching wudū, zakat, fasting and pilgrimage): every act is
 * cited to Qurʾān and Sunnah; where the schools differ the note records it
 * rather than asserting one ruling as universal; nothing here is a fatwa — see
 * the disclaimer in guidance.ts.
 *
 * Note on reuse: `Daleel` and `Dua` are declared here with the *exact* shape
 * used by the Fasting and Pilgrimage hubs, so the existing <DaleelBlock> and
 * <DuaCard> components render this content unchanged (structural typing).
 */

/* ------------------------------------------------------------------ *
 * Evidence (shape-compatible with content/fasting & content/pilgrimage)
 * ------------------------------------------------------------------ */

/** A single proof-text — Qurʾān or Sunnah. */
export type Daleel = {
  source: 'quran' | 'hadith';
  reference: string;
  narrator?: string;
  grade?: string;
  text: string;
};

/* ------------------------------------------------------------------ *
 * Prayer taxonomy
 * ------------------------------------------------------------------ */

/**
 * The eight bodily states of the prayer, in the order they first appear:
 *  - takbir    : the opening takbīr (takbīrat al-iḥrām), hands raised;
 *  - qiyam     : standing, where the Qurʾān is recited;
 *  - ruku      : bowing;
 *  - itidal    : rising to stand erect after the bow;
 *  - sujud     : prostration;
 *  - julus     : the brief sitting between the two prostrations;
 *  - tashahhud : the sitting for the testimony;
 *  - salam     : the closing salutation that ends the prayer.
 */
export type Posture =
  | 'takbir'
  | 'qiyam'
  | 'ruku'
  | 'itidal'
  | 'sujud'
  | 'julus'
  | 'tashahhud'
  | 'salam';

/** Which silhouette the PostureScene should illustrate. */
export type PostureArt =
  | 'takbir'
  | 'standing'
  | 'bowing'
  | 'rising'
  | 'prostration'
  | 'sitting'
  | 'salam';

/**
 * The legal weight of an act of prayer:
 *  - rukn   : a pillar — the prayer is invalid if it is left out;
 *  - wajib  : obligatory — its omission is made up by the prostration of
 *             forgetfulness (sajdah sahw), not by repeating the prayer;
 *  - sunnah : recommended — rewarded, but its omission harms nothing.
 *
 * The schools differ over which acts are arkān versus wājibāt; where the
 * difference matters it is recorded in a note rather than asserted here.
 */
export type SalahRank = 'rukn' | 'wajib' | 'sunnah';

/** The four Sunni schools of law, for noting where they differ. */
export type Madhhab = 'hanafi' | 'maliki' | 'shafii' | 'hanbali';

/** The worshipper's gender, where a ruling differs (e.g. how a woman sits). */
export type Gender = 'male' | 'female';

/* ------------------------------------------------------------------ *
 * Recitations & notes
 * ------------------------------------------------------------------ */

/**
 * Something said in the prayer — a takbīr, a sūrah, a tasbīḥ, the tashahhud.
 * Arabic carries full diacritics; the transliteration and translation make it
 * accessible; the optional evidence backs it.
 */
export type Recitation = {
  id: string;
  /** A short label for when/where it is said (e.g. 'In the bow', 'Obligatory'). */
  label?: string;
  arabic: string;
  transliteration: string;
  translation: string;
  /** How many times it is repeated, when countable (e.g. 3 in rukūʿ). */
  repeat?: number;
  /** Whether this recitation is a pillar, obligatory, or recommended. */
  rank?: SalahRank;
  daleel?: Daleel;
};

/**
 * A note scoped to particular schools and/or a gender — used for "the Ḥanafīs
 * hold…", "for women…", and similar clarifications. When neither `madhhab` nor
 * `gender` is set, the note applies to everyone.
 */
export type SalahNote = {
  id: string;
  text: string;
  madhhab?: Madhhab[];
  gender?: Gender;
  daleel?: Daleel;
};

/* ------------------------------------------------------------------ *
 * The posture template (content) and the emitted step (runtime)
 * ------------------------------------------------------------------ */

/**
 * The reviewable prose for one posture — its names, its rank, the physical
 * instruction, a clarifying tip, school/gender notes and evidence. The engine
 * in lib/salah.ts clones these templates per rakʿah and attaches the right
 * recitations for the context.
 */
export type PostureTemplate = {
  posture: Posture;
  /** English name. */
  name: string;
  /** Arabic name. */
  arabic: string;
  /** Romanised transliteration. */
  transliteration: string;
  rank: SalahRank;
  /** Which silhouette the artwork shows. */
  art: PostureArt;
  /** Plain, unambiguous instruction for the body. */
  instruction: string;
  /** A short clarifying tip — boundaries, common mistakes, etc. */
  tip?: string;
  notes?: SalahNote[];
  daleel?: Daleel[];
};

/**
 * A single ordered step of a specific prayer, produced by the engine. It is a
 * posture template enriched with the context the runner needs: a stable key,
 * which rakʿah it belongs to, what is recited in it, whether that recitation is
 * aloud, and (for the sitting) whether it is the first or final tashahhud.
 */
export type SalahStep = PostureTemplate & {
  /** Stable, unique key for animation + list state (e.g. 'r1-qiyam'). */
  key: string;
  /** Which rakʿah this step belongs to (1-based). 0 = not tied to a rakʿah. */
  rakah: number;
  /** Total rakaʿāt in the chosen prayer. */
  totalRakahs: number;
  /** What is said in this posture, in order. */
  recitations: Recitation[];
  /** Whether the standing recitation is said aloud (jahr) in this rakʿah. */
  audible?: boolean;
  /** For the sitting: the first tashahhud or the final one. */
  variant?: 'first' | 'final';
};

/* ------------------------------------------------------------------ *
 * Prayers
 * ------------------------------------------------------------------ */

/** The prayers the guide can teach. */
export type PrayerId =
  | 'fajr'
  | 'dhuhr'
  | 'asr'
  | 'maghrib'
  | 'isha'
  | 'witr'
  | 'janazah';

/** How a prayer is structured for the expansion engine. */
export type PrayerKind = 'daily' | 'witr' | 'janazah';

/**
 * A prayer definition. The engine reads these numbers to build the full,
 * ordered step list — inserting the sitting after every two rakaʿāt, reciting
 * the additional sūrah only in the first two, and reading aloud only in the
 * audible rakaʿāt.
 */
export type Prayer = {
  id: PrayerId;
  kind: PrayerKind;
  /** English name. */
  name: string;
  /** Arabic name. */
  arabic: string;
  /** Romanised transliteration. */
  transliteration: string;
  /** Number of obligatory rakaʿāt (2, 3 or 4; Janāzah is handled specially). */
  rakahCount: number;
  /** How many of the opening rakaʿāt are recited aloud (jahr). */
  audibleRakahs: number;
  /** A short evocative line for the chooser card. */
  tagline: string;
  /** Whether qunūt is recited (Witr). */
  hasQunut?: boolean;
  /** The attached emphasised Sunnah rakaʿāt (rawātib), for context. */
  sunnahRawatib?: string;
  /** A short note unique to this prayer, surfaced on its chooser card. */
  special?: string;
};
