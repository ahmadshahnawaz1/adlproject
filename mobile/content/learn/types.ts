/**
 * content/learn/types.ts — the shape of the Learning Hub.
 *
 * The hub gathers four kinds of teaching content, all built from the same small
 * vocabulary of "blocks" so one renderer can present them:
 *   • Sīrah   — the life of the Prophet ﷺ as an ordered timeline of events.
 *   • ʿAqīdah — the foundations of belief (tawḥīd, the six pillars of īmān…).
 *   • Fiqh    — the fiqh of worship (ṭahārah, ṣalāh, ṣawm, zakāh, ḥajj…).
 *   • A guided "New Muslim" path — a short, ordered track from the shahādah
 *     to one's first prayer.
 *
 * No React, no I/O — just typed, evidence-cited data the screens render.
 */

/** A single proof-text (Qurʾān or Sunnah). Shape-compatible with DaleelBlock. */
export type Daleel = {
  source: 'quran' | 'hadith';
  reference: string;
  narrator?: string;
  grade?: string;
  text: string;
};

/**
 * A lesson is composed of an ordered list of blocks. Each block is a small,
 * self-describing unit the `LessonView` knows how to render. This keeps the
 * content rich (paragraphs, lists, āyāt, ḥadīth, callouts, duʿās) without the
 * renderer ever needing to special-case a particular lesson.
 */
export type LessonBlock =
  /** A flowing paragraph of prose. */
  | { kind: 'para'; text: string }
  /** A small heading that opens a sub-section within a lesson. */
  | { kind: 'heading'; text: string }
  /** A bulleted list of short points. */
  | { kind: 'point'; items: string[] }
  /** A numbered list of ordered steps. */
  | { kind: 'steps'; items: string[] }
  /** A Qurʾānic āyah, shown with its Arabic and translation. */
  | { kind: 'ayah'; reference: string; arabic: string; translation: string }
  /** A cited ḥadīth or proof-text, rendered through the shared DaleelBlock. */
  | { kind: 'hadith'; daleel: Daleel }
  /** A gently highlighted aside. `tone` colours the accent. */
  | { kind: 'callout'; tone: CalloutTone; text: string; title?: string }
  /** A short supplication tied to the lesson. */
  | {
      kind: 'dua';
      arabic: string;
      transliteration?: string;
      translation: string;
      reference?: string;
    };

/** The accent a callout carries. */
export type CalloutTone = 'note' | 'tip' | 'wisdom' | 'caution';

/** The four sections of the hub. */
export type LearnTopicId = 'sirah' | 'aqidah' | 'fiqh' | 'new-muslim';

/** How a topic is browsed once opened. */
export type LearnTopicKind = 'lessons' | 'sirah' | 'track';

/** A browsable section of the hub (a tile on the grid). */
export type LearnTopic = {
  id: LearnTopicId;
  /** English title, e.g. "Foundations of Belief". */
  title: string;
  /** Arabic title, e.g. "العقيدة". */
  arabic: string;
  /** One short line under the title. */
  subtitle: string;
  /** A sentence describing what the section holds. */
  blurb: string;
  /** A lucide icon name, resolved to a component in the UI layer. */
  icon: string;
  /** How the section is presented when opened. */
  kind: LearnTopicKind;
};

/** A standalone teaching unit within ʿAqīdah or Fiqh. */
export type Lesson = {
  id: string;
  topicId: LearnTopicId;
  /** A short grouping label shown as a section header, e.g. "Tawḥīd". */
  group: string;
  /** English title. */
  title: string;
  /** Optional Arabic title. */
  arabic?: string;
  /** A one- or two-line summary shown on the card. */
  summary: string;
  /** A rough reading time in minutes. */
  minutes: number;
  /** The ordered content of the lesson. */
  body: LessonBlock[];
  /** Search keywords. */
  tags?: string[];
};

/** Optional jump from a track step into a feature of the app. */
export type TrackAction = {
  label: string;
  /** A navigation key understood by the Dashboard (e.g. 'wudu', 'salah'). */
  target: string;
};

/** One step of a guided path. */
export type TrackStep = {
  id: string;
  /** English title. */
  title: string;
  /** Optional Arabic title. */
  arabic?: string;
  /** A one-line summary shown on the step rail. */
  summary: string;
  /** The teaching content of the step. */
  body: LessonBlock[];
  /** An optional call-to-action into another feature. */
  action?: TrackAction;
};

/** A guided, ordered path (the "New Muslim" journey). */
export type Track = {
  id: string;
  title: string;
  arabic: string;
  subtitle: string;
  steps: TrackStep[];
};
