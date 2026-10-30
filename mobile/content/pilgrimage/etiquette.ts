/**
 * etiquette.ts — the manners (adab), the common mistakes, the virtues, and the
 * disclaimer of the pilgrimage. These feed the PilgrimageNotesCard and the
 * closing of each journey. The virtues encourage; the mistakes protect; the
 * adab beautify; the disclaimer keeps the app honest about its limits.
 */

import type { GuidanceNote } from './types';

/* ------------------------------------------------------------------ *
 * Virtues — the reward that draws the heart
 * ------------------------------------------------------------------ */
export const PILGRIMAGE_VIRTUES: GuidanceNote[] = [
  {
    id: 'mabrur',
    title: 'An accepted Ḥajj — nothing less than Paradise',
    text: 'The reward of an accepted Ḥajj (Ḥajj mabrūr) is nothing but Paradise. Strive for it with sincerity, lawful provision, and good character throughout.',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 1773, Muslim 1349',
      narrator: 'Abū Hurayrah',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ said: "An accepted Ḥajj has no reward but Paradise."',
    },
  },
  {
    id: 'returns-sinless',
    title: 'Return as on the day your mother bore you',
    text: 'Whoever performs Ḥajj for Allah without obscenity or wrongdoing returns free of sin, as on the day he was born.',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 1521, Muslim 1350',
      narrator: 'Abū Hurayrah',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ said: "Whoever performs Ḥajj and does not commit rafath nor wickedness returns as the day his mother bore him."',
    },
  },
  {
    id: 'umrah-to-umrah',
    title: 'ʿUmrah to ʿUmrah — an expiation',
    text: 'One ʿUmrah to the next is an expiation for what is between them.',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 1773, Muslim 1349',
      narrator: 'Abū Hurayrah',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ said: "ʿUmrah to ʿUmrah is an expiation for what is between them."',
    },
  },
  {
    id: 'arafah-freedom',
    title: 'No day with more freed from the Fire than ʿArafah',
    text: 'On no day does Allah free more servants from the Fire than the Day of ʿArafah; He draws near and boasts of the standing pilgrims to the angels.',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 1348',
      narrator: 'ʿĀʾishah',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ said: "There is no day on which Allah frees more servants from the Fire than the Day of ʿArafah."',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Adab — the manners that beautify the rite
 * ------------------------------------------------------------------ */
export const PILGRIMAGE_ADAB: GuidanceNote[] = [
  {
    id: 'sincerity',
    title: 'Sincerity and lawful provision',
    text: 'Begin with a sincere intention for Allah alone, and fund the journey from lawful (ḥalāl) earnings. The reward of the rite rests on both.',
    daleel: {
      source: 'quran',
      reference: 'Qurʾān 2:197',
      text: '"And take provision, but indeed the best provision is taqwā (God-consciousness)."',
    },
  },
  {
    id: 'gentleness',
    title: 'Gentleness over crowding',
    text: 'Do not harm fellow pilgrims to reach a stone or a spot. The Prophet ﷺ counselled calm — kissing the Black Stone is sunnah, but injuring a Muslim is forbidden.',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 1218 (the calm of his ﷺ Ṭawāf and pelting)',
      grade: 'Ṣaḥīḥ',
      text: 'He ﷺ told the people: "O people, be gentle," and pelted upon a calm she-camel, forbidding harm.',
    },
  },
  {
    id: 'dhikr',
    title: 'A tongue moist with remembrance',
    text: 'Fill the journey with the Talbiyah, dhikr, the Qurʾān and abundant duʿā — these days are made for nearness, not idle talk or disputes.',
    daleel: {
      source: 'hadith',
      reference: 'Sunan al-Tirmidhī 902',
      narrator: 'Ibn ʿUmar',
      grade: 'Ḥasan',
      text: 'Ṭawāf, Saʿī and the pelting of the Jamarāt were appointed only for the establishment of the remembrance of Allah.',
    },
  },
  {
    id: 'patience',
    title: 'Patience and good character',
    text: 'Heat, crowds and fatigue test the pilgrim. Meet them with patience and a cheerful face; the rite is also a school of character.',
  },
];

/* ------------------------------------------------------------------ *
 * Common mistakes — guarded against, not assumed
 * ------------------------------------------------------------------ */
export const PILGRIMAGE_MISTAKES: GuidanceNote[] = [
  {
    id: 'passing-miqat',
    title: 'Passing the Mīqāt without iḥrām',
    text: 'Crossing the mīqāt boundary (or its level in the air) intending the rite without having entered iḥrām. Prepare the intention and garments before you reach it.',
  },
  {
    id: 'touching-impossible',
    title: 'Fighting the crowd for the Black Stone',
    text: 'Risking harm to oneself or others to kiss or touch the Stone. If you cannot reach it safely, simply point to it with the right hand and say "Allāhu akbar" — that is the Sunnah when crowded.',
  },
  {
    id: 'wiping-walls',
    title: 'Wiping the walls and the Kaʿbah’s cloth for blessing',
    text: 'Rubbing the body or the Kaʿbah’s covering, the Maqām, or the mosque’s walls seeking barakah. Only the Black Stone and the Yamānī corner are touched, and only when possible.',
  },
  {
    id: 'leaving-arafah-early',
    title: 'Leaving ʿArafah before sunset',
    text: 'Departing the plain before the sun has set on the 9th. The standing extends to sunset; leaving early omits part of the greatest pillar without need.',
  },
  {
    id: 'washing-pebbles',
    title: 'Washing the pebbles or hurling large stones',
    text: 'There is no basis for washing the pebbles, and large stones are not thrown. Small pebbles (around chickpea size) suffice; the act is remembrance, not violence.',
  },
  {
    id: 'neglecting-prayer',
    title: 'Neglecting the five prayers amid the rites',
    text: 'Becoming so absorbed in Ṭawāf, shopping or photos that an obligatory prayer is delayed past its time. The farḍ prayers remain the foremost duty throughout.',
  },
];

/* ------------------------------------------------------------------ *
 * Disclaimer — the app’s honest limit
 * ------------------------------------------------------------------ */
export const PILGRIMAGE_DISCLAIMER =
  'This guide gathers the rites of ʿUmrah and Ḥajj with their evidence and notes where the schools differ — it is educational, not a fatwa. Rulings on your specific situation (illness, missed rites, penalties) should be taken from a qualified scholar. This content is pending review by a specialist in fiqh.';
