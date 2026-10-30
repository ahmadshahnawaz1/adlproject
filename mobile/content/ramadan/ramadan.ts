/**
 * content/ramadan — the night worship of Ramaḍān: Tarāwīḥ, Laylat al-Qadr, and
 * iʿtikāf.
 *
 * The daytime fast, its rulings and its duʿās already live in content/fasting;
 * this module covers only what that one does not — standing in prayer at night,
 * seeking the Night of Decree, and the nightly checklist. Evidence-cited, and
 * where the scholars differ the difference is marked rather than settled.
 */

/** A proof-text. Shape-compatible with DaleelBlock. */
export type Daleel = {
  source: 'quran' | 'hadith';
  reference: string;
  narrator?: string;
  grade?: string;
  text: string;
};

/** A recognised opinion on the number of rakʿahs of Tarāwīḥ. */
export type TaraweehOpinion = {
  rakahs: number;
  label: string;
  held: string;
  note: string;
};

/** A nightly habit the user can tick off. */
export type NightHabit = {
  id: string;
  title: string;
  hint: string;
};

export const TARAWEEH_NAME = 'التَّرَاوِيح';

export const TARAWEEH_INTRO =
  'Tarāwīḥ is the voluntary night prayer of Ramaḍān, prayed after ʿIshāʾ. The Prophet ﷺ prayed it in congregation for several nights and then withheld, fearing it would be made obligatory — and ʿUmar later gathered the people behind one imām.';

export const TARAWEEH_OPINIONS: TaraweehOpinion[] = [
  {
    rakahs: 8,
    label: '8 rakʿahs + Witr',
    held: 'Reported from the practice of the Prophet ﷺ',
    note: 'ʿĀʾishah رضي الله عنها described his night prayer as not exceeding eleven rakʿahs in Ramaḍān or outside it.',
  },
  {
    rakahs: 20,
    label: '20 rakʿahs + Witr',
    held: 'The practice of the Companions under ʿUmar, and the majority of the four schools',
    note: 'Widely practised in the Ḥaramayn and across the Muslim world. Both are valid; the difference is in quantity, not legitimacy.',
  },
];

export const TARAWEEH_NOTE =
  'The number is a matter of breadth, not dispute over legitimacy: what matters most is the length and quality of the standing, and consistency through the month. Pray behind your imām and do not make this a cause of division.';

export const DALEEL_TARAWEEH: Daleel = {
  source: 'hadith',
  reference: 'Ṣaḥīḥ al-Bukhārī 37; Ṣaḥīḥ Muslim 759',
  narrator: 'Abū Hurayrah',
  grade: 'Ṣaḥīḥ (Muttafaq ʿalayh)',
  text: 'Whoever stands (in prayer) during Ramaḍān out of faith and seeking reward, his previous sins will be forgiven.',
};

export const DALEEL_TARAWEEH_ELEVEN: Daleel = {
  source: 'hadith',
  reference: 'Ṣaḥīḥ al-Bukhārī 1147',
  narrator: 'ʿĀʾishah',
  grade: 'Ṣaḥīḥ',
  text: 'He ﷺ would not pray more than eleven rakʿahs, in Ramaḍān or otherwise.',
};

/* ------------------------------------------------------------------ *
 * Laylat al-Qadr
 * ------------------------------------------------------------------ */

export const QADR_NAME = 'لَيْلَةُ الْقَدْر';

export const QADR_INTRO =
  'The Night of Decree is better than a thousand months. It is sought in the last ten nights of Ramaḍān, and most emphatically in the odd ones — though its exact night is deliberately hidden so that the whole ten are revived.';

export const DALEEL_QADR_VALUE: Daleel = {
  source: 'quran',
  reference: 'al-Qadr 97:3',
  text: 'The Night of Decree is better than a thousand months.',
};

export const DALEEL_QADR_SEEK_ODD: Daleel = {
  source: 'hadith',
  reference: 'Ṣaḥīḥ al-Bukhārī 2017',
  narrator: 'ʿĀʾishah',
  grade: 'Ṣaḥīḥ',
  text: 'Seek Laylat al-Qadr in the odd nights of the last ten of Ramaḍān.',
};

export const QADR_DUA = {
  arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
  transliteration: 'Allāhumma innaka ʿafuwwun tuḥibbu-l-ʿafwa faʿfu ʿannī',
  translation: 'O Allah, You are Most Pardoning and love to pardon, so pardon me.',
  source: 'Sunan al-Tirmidhī 3513 — ʿĀʾishah asked what to say if she found the night; this is what she was taught.',
};

/** A widely-cited note on how the night is recognised. */
export const QADR_SIGNS: string[] = [
  'A night of stillness — neither hot nor cold, calm and serene.',
  'The sun rises the next morning without piercing rays, mild and white.',
  'A sense of ease and softness in the heart while worshipping.',
];

export const QADR_SIGNS_NOTE =
  'These descriptions come from the narrations, but the night is not confirmed by signs before it passes. Revive all ten nights rather than gambling on one.';

/* ------------------------------------------------------------------ *
 * Iʿtikāf
 * ------------------------------------------------------------------ */

export const ITIKAF_INTRO =
  'Iʿtikāf is secluding oneself in the mosque for worship, and the Prophet ﷺ observed it in the last ten nights every year until he passed away. It may be for the whole ten nights or for a shorter period.';

export const DALEEL_ITIKAF: Daleel = {
  source: 'hadith',
  reference: 'Ṣaḥīḥ al-Bukhārī 2026; Ṣaḥīḥ Muslim 1172',
  narrator: 'ʿĀʾishah',
  grade: 'Ṣaḥīḥ (Muttafaq ʿalayh)',
  text: 'The Prophet ﷺ used to observe iʿtikāf in the last ten days of Ramaḍān until Allah took him.',
};

/* ------------------------------------------------------------------ *
 * The nightly checklist
 * ------------------------------------------------------------------ */

export const NIGHT_HABITS: NightHabit[] = [
  { id: 'taraweeh', title: 'Tarāwīḥ', hint: 'Stand in prayer after ʿIshāʾ.' },
  { id: 'quran', title: 'Qurʾān portion', hint: 'Keep pace toward completing the muṣḥaf.' },
  { id: 'dhikr', title: 'Dhikr & istighfār', hint: 'Fill the quiet moments with remembrance.' },
  { id: 'dua', title: 'Duʿāʾ', hint: 'The fasting person’s supplication is not refused.' },
  { id: 'sadaqah', title: 'Ṣadaqah', hint: 'He ﷺ was most generous in Ramaḍān.' },
];

export const RAMADAN_DISCLAIMER =
  'This guidance is gathered from the Qurʾān and the authentic Sunnah and is pending final scholarly review. Where the schools differ the difference is noted, not settled — follow your teachers and your local imām.';
