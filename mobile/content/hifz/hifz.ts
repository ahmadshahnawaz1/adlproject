/**
 * content/hifz — the discipline of memorising the Qurʾān.
 *
 * The text itself lives in content/quran; this module carries only the method:
 * how the memoriser works, the etiquette of carrying the Book, and the evidence
 * behind both. Authored in-house, pending scholarly review.
 */

/** A proof-text. Shape-compatible with DaleelBlock. */
export type Daleel = {
  source: 'quran' | 'hadith';
  reference: string;
  narrator?: string;
  grade?: string;
  text: string;
};

/** One step of the memorisation method. */
export type HifzStep = {
  id: string;
  title: string;
  detail: string;
};

export const HIFZ_NAME = 'حِفْظُ الْقُرْآن';

export const HIFZ_INTRO =
  'Memorising the Qurʾān is a slow craft, not a sprint. A little held firmly is worth far more than a great deal held loosely — and what is memorised is kept only by returning to it again and again.';

/** The classical method, in the order a memoriser works. */
export const HIFZ_METHOD: HifzStep[] = [
  {
    id: 'listen',
    title: 'Listen first',
    detail:
      'Hear the āyah recited correctly several times before you attempt it. The ear teaches the tongue, and it protects you from memorising a mistake.',
  },
  {
    id: 'read',
    title: 'Read it aloud',
    detail:
      'Recite the āyah from the muṣḥaf slowly, ten or more times, until the tongue moves without effort. Do not close the page too early.',
  },
  {
    id: 'recall',
    title: 'Recall without looking',
    detail:
      'Close the muṣḥaf and recite from memory. If you stumble, open it, correct, and begin the āyah again from its start.',
  },
  {
    id: 'connect',
    title: 'Join it to what came before',
    detail:
      'Recite the new āyah together with the previous ones. Memorising in isolation makes āyahs that will not connect later.',
  },
  {
    id: 'review',
    title: 'Return to it',
    detail:
      'Review is the whole craft. Revisit today what you learned yesterday, this week what you learned last week, and keep the old ground firm before taking new ground.',
  },
];

export const DALEEL_EASE: Daleel = {
  source: 'quran',
  reference: 'al-Qamar 54:17',
  text: 'And We have certainly made the Qurʾān easy for remembrance, so is there any who will remember?',
};

export const DALEEL_BEST: Daleel = {
  source: 'hadith',
  reference: 'Ṣaḥīḥ al-Bukhārī 5027',
  narrator: 'ʿUthmān ibn ʿAffān',
  grade: 'Ṣaḥīḥ',
  text: 'The best of you are those who learn the Qurʾān and teach it.',
};

export const DALEEL_SLIPS_AWAY: Daleel = {
  source: 'hadith',
  reference: 'Ṣaḥīḥ al-Bukhārī 5033; Ṣaḥīḥ Muslim 791',
  narrator: 'Abū Mūsā al-Ashʿarī',
  grade: 'Ṣaḥīḥ (Muttafaq ʿalayh)',
  text:
    'Keep refreshing your knowledge of the Qurʾān, for by Him in whose hand is my soul, it slips away faster than a camel breaks free from its tether.',
};

export const DALEEL_COMPANION: Daleel = {
  source: 'hadith',
  reference: 'Sunan Abī Dāwūd 1464; Sunan al-Tirmidhī 2914',
  narrator: 'ʿAbdullāh ibn ʿAmr',
  grade: 'Ḥasan ṣaḥīḥ',
  text:
    'It will be said to the companion of the Qurʾān: recite and ascend, and recite as you used to recite in the world, for your station is at the last āyah you recite.',
};

/** Practical etiquette, plainly worded. */
export const HIFZ_ADAB: string[] = [
  'Begin with sincerity — this is for Allah, not for a title.',
  'Fix one recitation (a single muṣḥaf and one qirāʾah) and stay with it; changing pages resets the visual memory.',
  'Recite to a teacher who can correct you. The Qurʾān was received by hearing, not by reading alone.',
  'Prefer the small daily portion you never miss over the large one you abandon.',
  'Guard what you have memorised before reaching for more.',
];

export const HIFZ_REVIEW_NOTE =
  'This tracker schedules your review for you: each āyah returns on the day it is most likely to be forgotten, so the time you have is spent where it is needed. Grading yourself honestly is what makes it work.';

export const HIFZ_DISCLAIMER =
  'This is a study aid, not a teacher. Memorisation should be recited to a qualified teacher who can correct pronunciation and tajwīd; no app can do that for you.';
