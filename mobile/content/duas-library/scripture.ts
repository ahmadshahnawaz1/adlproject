/**
 * scripture.ts — the revealed and the taught supplications: the great “Rabbanā”
 * duʿās of the Qurʾān, and the comprehensive supplications of the Prophet ﷺ.
 *
 * Sections: `quran`, `prophetic`.
 */
import type { Dua } from './types';

/* ------------------------------------------------------------------ *
 * Qurʾānic supplications
 * ------------------------------------------------------------------ */
export const QURAN_DUAS: Dua[] = [
  {
    id: 'dunya-akhirah',
    category: 'quran',
    title: 'Good in both worlds',
    when: 'The most frequent duʿā',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: 'Rabbanā ātinā fi-d-dunyā ḥasanah, wa fi-l-ākhirati ḥasanah, wa qinā ʿadhāba-n-nār',
    translation:
      'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
    virtue: 'The supplication the Prophet ﷺ made most often.',
    tags: ['quran', 'rabbana', 'dunya', 'akhirah', 'comprehensive'],
    daleel: {
      source: 'quran',
      reference: 'Qurʾān — al-Baqarah 2:201',
      text: 'And among them is he who says, “Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.”',
    },
  },
  {
    id: 'la-tuakhidhna',
    category: 'quran',
    title: 'Do not take us to task',
    when: 'The close of al-Baqarah',
    arabic:
      'رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا، رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا، رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ، وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا، أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    transliteration:
      'Rabbanā lā tuʾākhidhnā in nasīnā aw akhṭaʾnā. Rabbanā wa lā taḥmil ʿalaynā iṣran kamā ḥamaltahu ʿala-lladhīna min qablinā. Rabbanā wa lā tuḥammilnā mā lā ṭāqata lanā bih, wa-ʿfu ʿannā wa-ghfir lanā wa-rḥamnā, anta mawlānā fa-nṣurnā ʿala-l-qawmi-l-kāfirīn',
    translation:
      'Our Lord, do not take us to task if we forget or err. Our Lord, do not lay upon us a burden like that which You laid upon those before us. Our Lord, do not burden us with what we cannot bear. Pardon us, forgive us, and have mercy on us. You are our Protector, so grant us victory over the disbelieving people.',
    virtue: 'Whoever recites the last two verses of al-Baqarah at night, they suffice him.',
    tags: ['quran', 'baqarah', 'forgiveness', 'burden', 'mercy', 'comprehensive'],
    daleel: {
      source: 'quran',
      reference: 'Qurʾān — al-Baqarah 2:286',
      text: 'The closing supplication of Sūrat al-Baqarah.',
    },
  },
  {
    id: 'afrigh-sabran',
    category: 'quran',
    title: 'Pour upon us patience',
    when: 'Facing hardship',
    arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    transliteration: 'Rabbanā afrigh ʿalaynā ṣabran wa thabbit aqdāmanā wa-nṣurnā ʿala-l-qawmi-l-kāfirīn',
    translation:
      'Our Lord, pour upon us patience, make our steps firm, and grant us victory over the disbelieving people.',
    tags: ['quran', 'patience', 'sabr', 'firmness', 'strength', 'hardship'],
    daleel: {
      source: 'quran',
      reference: 'Qurʾān — al-Baqarah 2:250',
      text: 'The supplication of Ṭālūt’s believing soldiers as they faced Jālūt (Goliath).',
    },
  },
  {
    id: 'shrah-sadri',
    category: 'quran',
    title: 'Expand my breast',
    when: 'Before a hard task',
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي، وَيَسِّرْ لِي أَمْرِي، وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي، يَفْقَهُوا قَوْلِي',
    transliteration: 'Rabbi-shraḥ lī ṣadrī, wa yassir lī amrī, wa-ḥlul ʿuqdatan min lisānī, yafqahū qawlī',
    translation:
      'My Lord, expand for me my breast, ease for me my task, and untie the knot from my tongue, that they may understand my speech.',
    tags: ['quran', 'musa', 'ease', 'speech', 'confidence', 'anxiety', 'exam'],
    daleel: {
      source: 'quran',
      reference: 'Qurʾān — Ṭā Hā 20:25–28',
      text: 'The supplication of Mūsā ﷺ when commanded to go to Firʿawn.',
    },
  },
  {
    id: 'qurrata-ayun',
    category: 'quran',
    title: 'Comfort of the eyes',
    when: 'For righteous family',
    arabic:
      'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    transliteration:
      'Rabbanā hab lanā min azwājinā wa dhurriyyātinā qurrata aʿyun, wa-jʿalnā li-l-muttaqīna imāmā',
    translation:
      'Our Lord, grant us from our spouses and offspring comfort to our eyes, and make us a model for the righteous.',
    tags: ['quran', 'family', 'spouse', 'children', 'offspring', 'marriage'],
    daleel: {
      source: 'quran',
      reference: 'Qurʾān — al-Furqān 25:74',
      text: 'Among the qualities of the servants of the Most Merciful.',
    },
  },
  {
    id: 'zidni-ilma',
    category: 'quran',
    title: 'Increase me in knowledge',
    when: 'Seeking knowledge',
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    transliteration: 'Rabbi zidnī ʿilmā',
    translation: 'My Lord, increase me in knowledge.',
    tags: ['quran', 'knowledge', 'ilm', 'study', 'learning', 'exam'],
    daleel: {
      source: 'quran',
      reference: 'Qurʾān — Ṭā Hā 20:114',
      text: 'And say, “My Lord, increase me in knowledge.”',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Comprehensive Prophetic supplications
 * ------------------------------------------------------------------ */
export const PROPHETIC_DUAS: Dua[] = [
  {
    id: 'all-good',
    category: 'prophetic',
    title: 'For all good',
    when: 'A comprehensive duʿā',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنَ الْخَيْرِ كُلِّهِ عَاجِلِهِ وَآجِلِهِ، مَا عَلِمْتُ مِنْهُ وَمَا لَمْ أَعْلَمْ، وَأَعُوذُ بِكَ مِنَ الشَّرِّ كُلِّهِ عَاجِلِهِ وَآجِلِهِ، مَا عَلِمْتُ مِنْهُ وَمَا لَمْ أَعْلَمْ',
    transliteration:
      'Allāhumma innī asʾaluka mina-l-khayri kullihi ʿājilihi wa ājilih, mā ʿalimtu minhu wa mā lam aʿlam, wa aʿūdhu bika mina-sh-sharri kullihi ʿājilihi wa ājilih, mā ʿalimtu minhu wa mā lam aʿlam',
    translation:
      'O Allah, I ask You for all good — of this world and the next, what I know of it and what I do not; and I seek refuge in You from all evil — of this world and the next, what I know of it and what I do not.',
    tags: ['comprehensive', 'prophetic', 'good', 'protection', 'jawami'],
    daleel: {
      source: 'hadith',
      reference: 'Sunan Ibn Mājah 3846',
      narrator: 'ʿĀʾishah',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ taught ʿĀʾishah this comprehensive supplication.',
    },
  },
  {
    id: 'dhikr-shukr',
    category: 'prophetic',
    title: 'Help me to remember You',
    when: 'After every prayer',
    arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ',
    transliteration: 'Allāhumma aʿinnī ʿalā dhikrika, wa shukrika, wa ḥusni ʿibādatik',
    translation:
      'O Allah, help me to remember You, to thank You, and to worship You in the best manner.',
    virtue: 'The Prophet ﷺ urged Muʿādh never to leave it after any prayer.',
    tags: ['prophetic', 'dhikr', 'gratitude', 'worship', 'prayer', 'salah'],
    daleel: {
      source: 'hadith',
      reference: 'Sunan Abī Dāwūd 1522',
      narrator: 'Muʿādh ibn Jabal',
      grade: 'Ṣaḥīḥ',
      text: 'O Muʿādh, do not leave saying at the end of every prayer: “Allāhumma aʿinnī...”',
    },
  },
  {
    id: 'islah-shan',
    category: 'prophetic',
    title: 'Set right all my affairs',
    when: 'For both worlds',
    arabic:
      'اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الْحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ الْمَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ',
    transliteration:
      'Allāhumma aṣliḥ lī dīniya-lladhī huwa ʿiṣmatu amrī, wa aṣliḥ lī dunyāya-llatī fīhā maʿāshī, wa aṣliḥ lī ākhiratiya-llatī fīhā maʿādī, wa-jʿali-l-ḥayāta ziyādatan lī fī kulli khayr, wa-jʿali-l-mawta rāḥatan lī min kulli sharr',
    translation:
      'O Allah, set right for me my religion which is the safeguard of my affairs; set right for me my world wherein is my living; set right for me my Hereafter to which is my return. Make my life an increase in every good, and make death a relief for me from every evil.',
    tags: ['prophetic', 'comprehensive', 'religion', 'dunya', 'akhirah', 'death'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 2720',
      narrator: 'Abū Hurayrah',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ would supplicate with this.',
    },
  },
  {
    id: 'jannah-fire',
    category: 'prophetic',
    title: 'Paradise & refuge from the Fire',
    when: 'Asking for Paradise',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ',
    transliteration: 'Allāhumma innī asʾaluka-l-jannata wa aʿūdhu bika mina-n-nār',
    translation: 'O Allah, I ask You for Paradise and seek refuge in You from the Fire.',
    virtue: 'The Prophet ﷺ said: “Around it (such requests) our supplications revolve.”',
    tags: ['prophetic', 'paradise', 'jannah', 'fire', 'refuge', 'hereafter'],
    daleel: {
      source: 'hadith',
      reference: 'Sunan Abī Dāwūd 792',
      narrator: 'A Companion of the Prophet ﷺ',
      grade: 'Ṣaḥīḥ',
      text: 'A man recited his tashahhud and asked for Paradise and refuge from the Fire; the Prophet ﷺ said our requests revolve around these.',
    },
  },
];
