/**
 * duas.ts — the supplications of the pilgrimage, each with transliteration,
 * translation and evidence. Read by the <DuaCard> (reused from the Fasting
 * hub) wherever a rite carries a duʿā: the Talbiyah, the entry to the Sacred
 * Mosque, the first sight of the Kaʿbah, the corners of the Ṭawāf, Ṣafā and
 * Marwah, the standing at ʿArafah, and the drinking of Zamzam.
 *
 * Each duʿā is keyed by `id` so steps in umrah.ts / hajj.ts can pull exactly
 * the ones they need without duplicating the Arabic.
 */

import type { Dua } from './types';

/* ------------------------------------------------------------------ *
 * Iḥrām & the Talbiyah
 * ------------------------------------------------------------------ */

/** The Talbiyah — proclaimed from iḥrām until the Ṭawāf (ʿUmrah) or the first
 *  pelting at ʿAqabah (Ḥajj). Pulsed gently in the TalbiyahCard. */
export const TALBIYAH: Dua = {
  id: 'talbiyah',
  title: 'The Talbiyah',
  when: 'From iḥrām, raised aloud and often',
  arabic:
    'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
  transliteration:
    'Labbayk Allāhumma labbayk, labbayka lā sharīka laka labbayk, inna-l-ḥamda wa-n-niʿmata laka wa-l-mulk, lā sharīka lak',
  translation:
    'Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Truly all praise, grace and sovereignty are Yours; You have no partner.',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ al-Bukhārī 1549, Muslim 1184',
    narrator: 'Ibn ʿUmar',
    grade: 'Ṣaḥīḥ',
    text: 'This was the Talbiyah of the Messenger of Allah ﷺ.',
  },
};

export const DUA_NIYYAH_UMRAH: Dua = {
  id: 'niyyah-umrah',
  title: 'Intention for ʿUmrah',
  when: 'At the Mīqāt, on entering iḥrām',
  arabic: 'لَبَّيْكَ اللَّهُمَّ عُمْرَةً',
  transliteration: 'Labbayka-llāhumma ʿumrah',
  translation: 'Here I am, O Allah, for ʿUmrah.',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ Muslim 1218',
    narrator: 'Jābir',
    grade: 'Ṣaḥīḥ',
    text: 'The pilgrims pronounced the rite they intended as they began the Talbiyah.',
  },
};

export const DUA_NIYYAH_HAJJ: Dua = {
  id: 'niyyah-hajj',
  title: 'Intention for Ḥajj',
  when: 'On entering iḥrām for Ḥajj',
  arabic: 'لَبَّيْكَ اللَّهُمَّ حَجًّا',
  transliteration: 'Labbayka-llāhumma ḥajjā',
  translation: 'Here I am, O Allah, for Ḥajj.',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ Muslim 1218',
    narrator: 'Jābir',
    grade: 'Ṣaḥīḥ',
    text: 'In the Farewell Pilgrimage the Companions raised the Talbiyah, naming the rite they intended.',
  },
};

/** A safeguarding condition (ishtirāṭ) for one who fears being prevented. */
export const DUA_ISHTIRAT: Dua = {
  id: 'ishtirat',
  title: 'Condition for the fearful (ishtirāṭ)',
  when: 'At iḥrām, if illness or hindrance is feared',
  arabic: 'اللَّهُمَّ مَحِلِّي حَيْثُ حَبَسْتَنِي',
  transliteration: 'Allāhumma maḥillī ḥaythu ḥabastanī',
  translation: 'O Allah, my release is wherever You hold me back.',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ al-Bukhārī 5089, Muslim 1207',
    narrator: 'ʿĀʾishah (about Ḍubāʿah bint al-Zubayr)',
    grade: 'Ṣaḥīḥ',
    text: 'The Prophet ﷺ told her to enter iḥrām and make this condition, so that if hindered she would be released without penalty.',
  },
};

/* ------------------------------------------------------------------ *
 * Approaching the Ḥaram & the Kaʿbah
 * ------------------------------------------------------------------ */

export const DUA_ENTER_MASJID: Dua = {
  id: 'enter-masjid',
  title: 'Entering the Sacred Mosque',
  when: 'Stepping in with the right foot',
  arabic: 'بِسْمِ اللَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
  transliteration: 'Bismi-llāh, wa-ṣ-ṣalātu wa-s-salāmu ʿalā rasūli-llāh. Allāhumma-ftaḥ lī abwāba raḥmatik',
  translation:
    'In the name of Allah; blessings and peace upon the Messenger of Allah. O Allah, open for me the gates of Your mercy.',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ Muslim 713',
    narrator: 'Abū Ḥumayd / Abū Usayd',
    grade: 'Ṣaḥīḥ',
    text: 'When one of you enters the mosque, let him say: "O Allah, open for me the gates of Your mercy."',
  },
};

export const DUA_FIRST_SIGHT_KAABA: Dua = {
  id: 'first-sight-kaaba',
  title: 'At the first sight of the Kaʿbah',
  when: 'When the eyes fall upon the House',
  arabic:
    'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، فَحَيِّنَا رَبَّنَا بِالسَّلَامِ',
  transliteration: 'Allāhumma anta-s-salāmu wa minka-s-salām, fa-ḥayyinā rabbanā bi-s-salām',
  translation:
    'O Allah, You are Peace and from You is peace; so greet us, our Lord, with peace.',
  daleel: {
    source: 'hadith',
    reference: 'Reported of ʿUmar ibn al-Khaṭṭāb; al-Bayhaqī, Sunan al-Kubrā',
    narrator: 'ʿUmar (mawqūf)',
    grade: 'A supplication of the Companions; duʿā here is open',
    text: 'This place — the first sight of the House — is among the places duʿā is hoped to be answered; any sincere supplication is good.',
  },
};

/* ------------------------------------------------------------------ *
 * The Ṭawāf
 * ------------------------------------------------------------------ */

export const DUA_BLACK_STONE: Dua = {
  id: 'black-stone',
  title: 'At the Black Stone (each circuit)',
  when: 'Facing the Black Stone to begin a circuit',
  arabic: 'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ',
  transliteration: 'Bismi-llāh, wa-llāhu akbar',
  translation: 'In the name of Allah, and Allah is the Greatest.',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ al-Bukhārī 1605',
    narrator: 'Ibn ʿUmar / Ibn ʿAbbās',
    grade: 'Ṣaḥīḥ',
    text: 'The Prophet ﷺ faced the Stone, touched it and said the takbīr; ʿUmar kissed it and said: I know you are a stone that neither harms nor benefits.',
  },
};

export const DUA_BETWEEN_CORNERS: Dua = {
  id: 'between-corners',
  title: 'Between the Yamānī corner and the Black Stone',
  when: 'On each circuit, along the final stretch',
  arabic:
    'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
  transliteration: 'Rabbanā ātinā fi-d-dunyā ḥasanah wa fi-l-ākhirati ḥasanah wa qinā ʿadhāba-n-nār',
  translation:
    'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
  daleel: {
    source: 'hadith',
    reference: 'Sunan Abī Dāwūd 1892',
    narrator: 'Ibn ʿAbbās',
    grade: 'Ḥasan',
    text: 'The Prophet ﷺ used to say between the Yamānī corner and the Black Stone: "Our Lord, give us good…" (Qurʾān 2:201).',
  },
};

export const DUA_MAQAM_VERSE: Dua = {
  id: 'maqam-verse',
  title: 'Approaching the Station of Ibrāhīm',
  when: 'After the Ṭawāf, before the two rakʿahs',
  arabic: 'وَاتَّخِذُوا مِنْ مَقَامِ إِبْرَاهِيمَ مُصَلًّى',
  transliteration: 'Wa-ttakhidhū min maqāmi Ibrāhīma muṣallā',
  translation: 'And take the Station of Ibrāhīm as a place of prayer.',
  daleel: {
    source: 'quran',
    reference: 'Qurʾān 2:125 (recited by the Prophet ﷺ here — Muslim 1218)',
    text: 'He ﷺ recited this verse as he approached the Maqām, then prayed two rakʿahs behind it.',
  },
};

export const DUA_ZAMZAM: Dua = {
  id: 'zamzam',
  title: 'On drinking Zamzam',
  when: 'After the prayer at the Maqām',
  arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا وَاسِعًا، وَشِفَاءً مِنْ كُلِّ دَاءٍ',
  transliteration: 'Allāhumma innī asʾaluka ʿilman nāfiʿan, wa rizqan wāsiʿan, wa shifāʾan min kulli dāʾ',
  translation:
    'O Allah, I ask You for beneficial knowledge, abundant provision, and healing from every illness.',
  daleel: {
    source: 'hadith',
    reference: 'Sunan Ibn Mājah 3062; al-Dāraquṭnī',
    narrator: 'Jābir / Ibn ʿAbbās',
    grade: 'Ḥasan',
    text: 'The Prophet ﷺ said: "The water of Zamzam is for whatever it is drunk for." Imām Ibn al-Qayyim and others supplicated with this.',
  },
};

/* ------------------------------------------------------------------ *
 * The Saʿī
 * ------------------------------------------------------------------ */

export const DUA_SAFA_VERSE: Dua = {
  id: 'safa-verse',
  title: 'At the foot of Ṣafā',
  when: 'Beginning the Saʿī, reciting once',
  arabic:
    'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ ۖ أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ',
  transliteration: 'Inna-ṣ-Ṣafā wa-l-Marwata min shaʿāʾiri-llāh — abdaʾu bimā badaʾa-llāhu bih',
  translation:
    'Indeed Ṣafā and Marwah are among the symbols of Allah — I begin with that which Allah began with.',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ Muslim 1218 (verse: Qurʾān 2:158)',
    narrator: 'Jābir',
    grade: 'Ṣaḥīḥ',
    text: 'As he ﷺ neared Ṣafā he recited the verse and said: "I begin with what Allah began with," and began with Ṣafā.',
  },
};

export const DUA_ON_SAFA_MARWAH: Dua = {
  id: 'on-safa-marwah',
  title: 'Upon Ṣafā and Marwah (facing the Qiblah)',
  when: 'On each mount, raising the hands, said three times',
  arabic:
    'اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ',
  transliteration:
    'Allāhu akbar… Lā ilāha illā-llāhu waḥdahu lā sharīka lah, lahu-l-mulku wa lahu-l-ḥamd, wa huwa ʿalā kulli shayʾin qadīr. Lā ilāha illā-llāhu waḥdah, anjaza waʿdah, wa naṣara ʿabdah, wa hazama-l-aḥzāba waḥdah',
  translation:
    'Allah is the Greatest… There is no god but Allah alone, without partner; His is the dominion and His the praise, and He is over all things capable. There is no god but Allah alone; He fulfilled His promise, gave victory to His servant, and defeated the confederates alone.',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ Muslim 1218',
    narrator: 'Jābir',
    grade: 'Ṣaḥīḥ',
    text: 'He ﷺ stood on Ṣafā facing the Qiblah, declared Allah’s oneness and greatness in these words, said them three times and supplicated between them — and did the like on Marwah.',
  },
};

/* ------------------------------------------------------------------ *
 * ʿArafah & the Mashʿar
 * ------------------------------------------------------------------ */

export const DUA_ARAFAH: Dua = {
  id: 'arafah',
  title: 'The supplication of the Day of ʿArafah',
  when: 'Standing at ʿArafah, facing the Qiblah',
  arabic:
    'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
  transliteration:
    'Lā ilāha illā-llāhu waḥdahu lā sharīka lah, lahu-l-mulku wa lahu-l-ḥamd, wa huwa ʿalā kulli shayʾin qadīr',
  translation:
    'There is no god but Allah alone, without partner; His is the dominion and His the praise, and He is over all things capable.',
  daleel: {
    source: 'hadith',
    reference: 'Jāmiʿ al-Tirmidhī 3585',
    narrator: 'ʿAmr ibn Shuʿayb (from his father, from his grandfather)',
    grade: 'Ḥasan',
    text: 'The best of supplication is the supplication of the Day of ʿArafah, and the best that I and the Prophets before me have said is: "Lā ilāha illā-llāhu waḥdah…"',
  },
};

export const DUA_MASHAR: Dua = {
  id: 'mashar',
  title: 'At al-Mashʿar al-Ḥarām (Muzdalifah)',
  when: 'After Fajr, facing the Qiblah until it grows bright',
  arabic: 'اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ، اللَّهُمَّ كَمَا أَوْقَفْتَنَا فِيهِ وَأَرَيْتَنَا، فَوَفِّقْنَا لِذِكْرِكَ',
  transliteration: 'Allāhu akbar, lā ilāha illā-llāh… Allāhumma kamā awqaftanā fīhi wa araytanā, fa-waffiqnā li-dhikrik',
  translation:
    'Allah is the Greatest; there is no god but Allah… O Allah, as You have made us stand here and shown us, grant us success in Your remembrance.',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ Muslim 1218 (the standing at al-Mashʿar)',
    narrator: 'Jābir',
    grade: 'Ṣaḥīḥ',
    text: 'He ﷺ came to al-Mashʿar al-Ḥarām, faced the Qiblah, supplicated, magnified and declared Allah’s oneness, and kept standing until it grew very light.',
  },
};

/** All duʿās, indexed by id — for steps to reference without copying Arabic. */
export const PILGRIMAGE_DUAS: Dua[] = [
  TALBIYAH,
  DUA_NIYYAH_UMRAH,
  DUA_NIYYAH_HAJJ,
  DUA_ISHTIRAT,
  DUA_ENTER_MASJID,
  DUA_FIRST_SIGHT_KAABA,
  DUA_BLACK_STONE,
  DUA_BETWEEN_CORNERS,
  DUA_MAQAM_VERSE,
  DUA_ZAMZAM,
  DUA_SAFA_VERSE,
  DUA_ON_SAFA_MARWAH,
  DUA_ARAFAH,
  DUA_MASHAR,
];

/** Look up a duʿā by id (used by the journey content). */
export function duaById(id: string): Dua | undefined {
  return PILGRIMAGE_DUAS.find((d) => d.id === id);
}
