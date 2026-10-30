/**
 * content/sirah/eras.ts — the eras of the Sīrah and the authenticity doctrine.
 *
 * The eras group the timeline and drive the era switcher. The doctrine records
 * the source hierarchy and grading rubric that every event is held to — the
 * heart of what makes this the *most authentic* telling rather than folklore.
 */
import type { SirahEraMeta } from './types';

/** The eight eras, in order. */
export const SIRAH_ERAS: SirahEraMeta[] = [
  { id: 'pre-prophethood', order: 1, title: 'Before Prophethood', arabic: 'قبل البعثة', subtitle: 'Birth, childhood & the trustworthy youth' },
  { id: 'revelation', order: 2, title: 'The First Revelation', arabic: 'بدء الوحي', subtitle: 'Ḥirāʾ and the opening of the message' },
  { id: 'makkan-trials', order: 3, title: 'The Makkan Trials', arabic: 'الابتلاء بمكة', subtitle: 'Persecution, patience & steadfastness' },
  { id: 'hijrah', order: 4, title: 'The Hijrah', arabic: 'الهجرة', subtitle: 'The migration to Madīnah' },
  { id: 'madinah', order: 5, title: 'The City of the Prophet ﷺ', arabic: 'المدينة النبوية', subtitle: 'Building the first community' },
  { id: 'battles', order: 6, title: 'The Great Trials & Battles', arabic: 'الغزوات', subtitle: 'Badr, Uḥud, the Trench & the treaties' },
  { id: 'conquest', order: 7, title: 'The Opening of Makkah', arabic: 'فتح مكة', subtitle: 'Victory, amnesty & the spread of Islam' },
  { id: 'farewell', order: 8, title: 'The Farewell', arabic: 'الوداع', subtitle: 'The final pilgrimage & his passing ﷺ' },
];

/** Resolve an era's metadata by id. */
export function eraMeta(id: string): SirahEraMeta | undefined {
  return SIRAH_ERAS.find((e) => e.id === id);
}

/**
 * The source hierarchy every event is graded against — highest authority first.
 * Shown to the reader so they understand what "graded" means here.
 */
export const SIRAH_SOURCES: { tier: string; detail: string }[] = [
  { tier: 'The Qurʾān', detail: 'The Sīrah as narrated by Allah — the highest authority.' },
  { tier: 'Ṣaḥīḥ al-Bukhārī & Muslim', detail: 'The authentic hadith of the Prophet’s ﷺ life.' },
  {
    tier: 'Authenticity-conscious works',
    detail: 'al-Raḥīq al-Makhtūm (al-Mubārakpūrī), al-Sīra al-Ṣaḥīḥa (al-ʿUmarī), and Mahdī Rizqullāh’s isnād-verified biography.',
  },
  { tier: 'The classical Sīrah', detail: 'Ibn Kathīr and Ibn Hishām — used with grading, not accepted uncritically.' },
];

/** The standing note on grading and review. */
export const SIRAH_DISCLAIMER =
  'This Sīrah is built as a graded corpus: its spine is anchored in the Qurʾān and Ṣaḥīḥ al-Bukhārī & Muslim, and every event is labelled with its authenticity and its sources. Well-known but weaker reports are shown for context and clearly flagged — never presented as established. The prose is authored in-house from these sources and is pending final scholarly review.';
