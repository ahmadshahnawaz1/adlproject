/**
 * types.ts — the data model for Adl's Pilgrimage hub (the Manāsik of ʿUmrah
 * and Ḥajj).
 *
 * Everything the hub renders is data described here: the journeys and their
 * stages, each rite (rukn / wājib / sunnah), the supplications, the evidence
 * (daleel), the differences between the madhāhib, the common mistakes, the
 * virtues, and the counted rituals (Ṭawāf ×7, Saʿī ×7, Ramī ×7). The pure
 * logic in lib/pilgrimage* and the UI in components/screens read from this one
 * reviewable place, so the wording and the rulings live together with their
 * proofs.
 *
 * Authenticity bar (matching the wudū, zakat and fasting features): every rule
 * is cited to Qurʾān and Sunnah; differences between the schools are noted, not
 * asserted; the pilgrim chooses. Nothing here is a fatwa — see the disclaimer
 * in etiquette.ts.
 *
 * Note on reuse: `Daleel` and `Dua` are declared here with the *exact* shape
 * used by the Fasting hub, so the existing <DaleelBlock> and <DuaCard>
 * components render pilgrimage content unchanged (TypeScript structural typing).
 */

/* ------------------------------------------------------------------ *
 * Evidence & supplications (shape-compatible with content/fasting)
 * ------------------------------------------------------------------ */

/** A single proof-text — Qurʾān or Sunnah. */
export type Daleel = {
  source: 'quran' | 'hadith';
  reference: string;
  narrator?: string;
  grade?: string;
  text: string;
};

/** A supplication: Arabic, transliteration, translation and (optional) proof. */
export type Dua = {
  id: string;
  title: string;
  when: string;
  arabic: string;
  transliteration: string;
  translation: string;
  daleel?: Daleel;
};

/* ------------------------------------------------------------------ *
 * Pilgrimage taxonomy
 * ------------------------------------------------------------------ */

/** Which pilgrimage the pilgrim is performing. */
export type PilgrimageKind = 'umrah' | 'hajj';

/**
 * The three ways to perform Ḥajj:
 *  - tamattuʿ : ʿUmrah then Ḥajj in the same season, with a hady (sacrifice);
 *               the pilgrim exits iḥrām between the two.
 *  - qirān    : ʿUmrah and Ḥajj together under one iḥrām, with a hady.
 *  - ifrād    : Ḥajj alone, no hady due for the rite itself.
 */
export type HajjType = 'tamattu' | 'qiran' | 'ifrad';

/** The four Sunni schools of law, for noting where they differ. */
export type Madhhab = 'hanafi' | 'maliki' | 'shafii' | 'hanbali';

/** The pilgrim's gender, where a ruling differs (e.g. raml, iḍṭibāʿ, ḥalq). */
export type Gender = 'male' | 'female';

/** The legal weight of a rite. */
export type RiteRank =
  | 'rukn' // pillar — Ḥajj/ʿUmrah is invalid without it
  | 'wajib' // obligatory — its omission requires a compensatory sacrifice (dam)
  | 'sunnah'; // recommended — rewarded, but no penalty for omission

/* ------------------------------------------------------------------ *
 * Scenes — which animated artwork a step shows
 * ------------------------------------------------------------------ */

/** The animated scene a step renders behind its content. */
export type SceneKey =
  | 'miqat'
  | 'kaaba'
  | 'tawaf'
  | 'maqam'
  | 'zamzam'
  | 'sai'
  | 'halq'
  | 'mina'
  | 'arafah'
  | 'muzdalifah'
  | 'jamarat'
  | 'farewell'
  | 'map';

/* ------------------------------------------------------------------ *
 * A rite (step) and its parts
 * ------------------------------------------------------------------ */

/** One actionable item in a step's checklist. */
export type RiteAction = {
  id: string;
  text: string;
  /** Optional clarifying detail shown beneath the action. */
  detail?: string;
};

/**
 * A note that may be scoped to particular schools and/or a gender — used for
 * "the Ḥanafīs hold…", "for women…", and similar clarifications. When neither
 * `madhhab` nor `gender` is set, the note applies to everyone.
 */
export type RiteNote = {
  id: string;
  text: string;
  madhhab?: Madhhab[];
  gender?: Gender;
  daleel?: Daleel;
};

/** A counted ritual: the kind, the total, the unit's name and haptic feedback. */
export type RiteCounter = {
  kind: 'tawaf' | 'sai' | 'rami';
  /** How many units complete the rite (7 for ṭawāf/saʿī; 7 pebbles per pillar). */
  total: number;
  /** Singular label for one unit, e.g. 'circuit', 'trip', 'pebble'. */
  unitLabel: string;
  /** Plural label, e.g. 'circuits', 'trips', 'pebbles'. */
  unitLabelPlural: string;
};

/**
 * A single rite within the journey. Most fields are optional so a step can be
 * as light as a title + summary, or as rich as a fully-evidenced pillar with
 * supplications, madhhab notes, mistakes and a counted ritual.
 */
export type RiteStep = {
  id: string;
  title: string;
  arabicTitle?: string;
  scene: SceneKey;
  rank: RiteRank;
  /** Where/when it happens — a short subtitle (e.g. 'At the Mīqāt'). */
  locationLabel?: string;
  /** Optional id into sites.ts for the date/location-aware "you are here". */
  siteId?: string;
  /** One or two sentences framing the rite. */
  summary: string;
  /** The ordered things to do. */
  actions: RiteAction[];
  /** Supplications tied to the rite. */
  duas?: Dua[];
  /** Evidence behind the rite. */
  daleel?: Daleel[];
  /** Differences between schools and gender-specific clarifications. */
  notes?: RiteNote[];
  /** Pitfalls to avoid. */
  mistakes?: string[];
  /** Virtues / encouragement. */
  virtues?: string[];
  /** A counted ritual, if this step is one (ṭawāf, saʿī, ramī). */
  counter?: RiteCounter;
  /**
   * Which Ḥajj types this step applies to. Omitted ⇒ applies to all. Used to
   * dim/flag steps that do not apply to the pilgrim's chosen type while still
   * keeping them visible (the user asked for all variations inline).
   */
  hajjTypes?: HajjType[];
};

/** A stage groups related steps — for ʿUmrah a pillar, for Ḥajj a day/place. */
export type RiteStage = {
  id: string;
  title: string;
  arabicTitle?: string;
  /** A terse label for the timeline rail (e.g. 'ʿArafah'). */
  shortLabel: string;
  /** One line describing the stage. */
  caption: string;
  /**
   * The Hijri day in Dhū al-Ḥijjah this stage is anchored to (8, 9, 10, 11,
   * 12, 13). Omitted for ʿUmrah and for non-dated Ḥajj stages (e.g. choosing a
   * type). Drives the date-aware "Today is the Day of ʿArafah" highlighting.
   */
  hijriDay?: number;
  steps: RiteStep[];
};

/** A complete journey — ʿUmrah or Ḥajj — as an ordered list of stages. */
export type Journey = {
  kind: PilgrimageKind;
  title: string;
  arabicTitle: string;
  /** A short evocative line for the chooser card. */
  tagline: string;
  /** Estimated span, e.g. 'A few hours' / '5–6 days'. */
  durationLabel: string;
  stages: RiteStage[];
};

/* ------------------------------------------------------------------ *
 * Iḥrām model (filled in ihram.ts)
 * ------------------------------------------------------------------ */

/** One of the fixed stations (mawāqīt) at which iḥrām is assumed. */
export type Miqat = {
  id: string;
  name: string;
  arabicName: string;
  /** Who enters iḥrām here (the direction of approach). */
  forText: string;
  coords: { latitude: number; longitude: number };
  /** Rough distance from Makkah, for context. */
  approxKmFromMakkah: number;
};

/** A prohibition of iḥrām (maḥdhūr), with its expiation where relevant. */
export type Mahdhur = {
  id: string;
  text: string;
  /** Some apply only to one gender (e.g. sewn clothes for men, niqāb for women). */
  gender?: Gender;
  /** The expiation (fidya) if violated, where applicable. */
  fidya?: string;
  daleel?: Daleel;
};

/* ------------------------------------------------------------------ *
 * Sites (filled in sites.ts)
 * ------------------------------------------------------------------ */

/** A sacred place, with coordinates for the location-aware "you are here". */
export type Site = {
  id: string;
  name: string;
  arabicName?: string;
  coords: { latitude: number; longitude: number };
  /** Metres within which the pilgrim is considered to be "at" the site. */
  radiusM: number;
  description: string;
};

/* ------------------------------------------------------------------ *
 * Etiquette (filled in etiquette.ts)
 * ------------------------------------------------------------------ */

/** A point of adab, a mistake, or a virtue — a short titled note with proof. */
export type GuidanceNote = {
  id: string;
  title: string;
  text: string;
  daleel?: Daleel;
};
