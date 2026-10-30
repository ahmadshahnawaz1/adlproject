/**
 * content/sirah/types.ts — the shape of the authenticity-graded Sīrah (F20).
 *
 * Every event in the Prophet's ﷺ life carries not just its account but its
 * **grade** and its **sources**, plus deep-links into the Qurʾān (F7) and the
 * hadith library (F18). The body reuses the shared `LessonBlock` vocabulary so
 * the existing `LessonView` renders it. No React, no I/O — typed, cited data.
 */
import type { LessonBlock } from '../learn';

export type { LessonBlock };

/** The eras the life is grouped into, in order. */
export type SirahEra =
  | 'pre-prophethood'
  | 'revelation'
  | 'makkan-trials'
  | 'hijrah'
  | 'madinah'
  | 'battles'
  | 'conquest'
  | 'farewell';

/**
 * The authenticity of an event's core report.
 * - `established`     — the Qurʾān or Ṣaḥīḥ al-Bukhārī/Muslim; beyond doubt.
 * - `well-supported`  — a ṣaḥīḥ/ḥasan report outside the two Ṣaḥīḥs.
 * - `reported`        — carried by the classical Sīrah with an acceptable basis.
 * - `weak`            — a ḍaʿīf report; shown for context, not relied upon.
 * - `disputed`        — scholars differ on its details or authenticity.
 */
export type SirahGrade = 'established' | 'well-supported' | 'reported' | 'weak' | 'disputed';

/** A cited source for an event. */
export type SourceRef = {
  /** The work, e.g. "Ṣaḥīḥ al-Bukhārī", "al-Raḥīq al-Makhtūm", "Ibn Hishām". */
  work: string;
  /** A locator within it, e.g. "3" (ḥadīth no.) or "p. 132". */
  location?: string;
};

/** A deep-link into the muṣḥaf (F7). */
export type AyahRef = { surah: number; ayah: number; label?: string };

/** A deep-link into the hadith library (F18). */
export type HadithRef = { collectionId: string; number: number; label?: string };

/** One event in the Sīrah, fully graded and cited. */
export type SirahEvent = {
  id: string;
  /** Chronological order across the whole life (1 = earliest). */
  order: number;
  era: SirahEra;
  /** A display label for the period, e.g. "622 CE / 1 AH". */
  yearLabel: string;
  /** Optional Hijrī year label, e.g. "1 AH". */
  hijri?: string;
  title: string;
  arabic?: string;
  place: string;
  /** Approximate coordinates, for the map view. */
  geo?: { lat: number; lng: number };
  /** A one- or two-line summary shown on the timeline node. */
  summary: string;
  /** The fuller account, rendered by LessonView. */
  body: LessonBlock[];
  /** The authenticity of the core report. */
  grade: SirahGrade;
  /** An optional note on the grading (what is / isn't confirmed). */
  gradeNote?: string;
  /** The works this account draws on. */
  sources: SourceRef[];
  /** Qurʾān verses that mention or bear on the event. */
  quranRefs?: AyahRef[];
  /** Hadith that establish or detail the event. */
  hadithRefs?: HadithRef[];
  /** Ids of people (companions/family) central to the event. */
  people?: string[];
  /** The ʿibrah — a few lessons drawn from the event. */
  lessons?: string[];
  /** Search keywords. */
  tags?: string[];
};

/** A companion or family member, linked from events. */
export type SirahPerson = {
  id: string;
  name: string;
  arabic?: string;
  /** An honorific/epithet, e.g. "al-Ṣiddīq". */
  epithet?: string;
  /** Their relation/role, e.g. "The Prophet's ﷺ closest friend". */
  relation: string;
  /** A short, cited biography. */
  bio: string;
};

/** Metadata for an era (the timeline's section headers / the era switcher). */
export type SirahEraMeta = {
  id: SirahEra;
  order: number;
  title: string;
  arabic: string;
  subtitle: string;
};
