/**
 * heart.ts — the supplications of the heart's states: when it is heavy with
 * worry, when it turns back in repentance, when it seeks refuge, and when it
 * stands before a decision.
 *
 * Sections: `distress`, `forgiveness`, `protection`, `guidance`. Each is cited
 * to the Qurʾān or the Sunnah.
 */
import type { Dua } from './types';

/* ------------------------------------------------------------------ *
 * Anxiety & hardship
 * ------------------------------------------------------------------ */
export const DISTRESS_DUAS: Dua[] = [
  {
    id: 'anxiety-grief',
    category: 'distress',
    title: 'Worry & grief',
    when: 'In anxiety or sorrow',
    arabic:
      'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
    transliteration:
      'Allāhumma innī aʿūdhu bika mina-l-hammi wa-l-ḥazan, wa-l-ʿajzi wa-l-kasal, wa-l-bukhli wa-l-jubn, wa ḍalaʿi-d-dayni wa ghalabati-r-rijāl',
    translation:
      'O Allah, I seek refuge in You from worry and grief, from incapacity and laziness, from miserliness and cowardice, from the burden of debt and from being overpowered by men.',
    tags: ['anxiety', 'worry', 'grief', 'sadness', 'depression', 'stress', 'refuge'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 6369',
      narrator: 'Anas ibn Mālik',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ used to say this frequently.',
    },
  },
  {
    id: 'dua-yunus',
    category: 'distress',
    title: 'The supplication of Yūnus',
    when: 'In distress',
    arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    transliteration: 'Lā ilāha illā anta subḥānaka innī kuntu mina-ẓ-ẓālimīn',
    translation:
      'There is no deity except You; glory be to You. Indeed, I have been among the wrongdoers.',
    virtue: 'No Muslim supplicates with it for anything but Allah answers him.',
    tags: ['distress', 'difficulty', 'yunus', 'jonah', 'hardship', 'calamity'],
    daleel: {
      source: 'hadith',
      reference: 'Jāmiʿ at-Tirmidhī 3505',
      narrator: 'Saʿd ibn Abī Waqqāṣ',
      grade: 'Ṣaḥīḥ',
      text: 'The supplication of Dhu-n-Nūn when he called upon his Lord from within the depths of darkness. (Qurʾān 21:87)',
    },
  },
  {
    id: 'kalimat-faraj',
    category: 'distress',
    title: 'The words of relief',
    when: 'At times of distress',
    arabic:
      'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
    transliteration:
      'Lā ilāha illa-llāhu-l-ʿaẓīmu-l-ḥalīm, lā ilāha illa-llāhu rabbu-l-ʿarshi-l-ʿaẓīm, lā ilāha illa-llāhu rabbu-s-samāwāti wa rabbu-l-arḍi wa rabbu-l-ʿarshi-l-karīm',
    translation:
      'There is no deity but Allah, the Mighty, the Forbearing. There is no deity but Allah, Lord of the Magnificent Throne. There is no deity but Allah, Lord of the heavens, Lord of the earth, and Lord of the Noble Throne.',
    tags: ['distress', 'relief', 'hardship', 'calamity', 'faraj'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 6346, Ṣaḥīḥ Muslim 2730',
      narrator: 'Ibn ʿAbbās',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ would say this at times of distress.',
    },
  },
  {
    id: 'hasbunallah',
    category: 'distress',
    title: 'Allah is sufficient',
    when: 'When fearful or overwhelmed',
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    transliteration: 'Ḥasbunā-llāhu wa niʿma-l-wakīl',
    translation: 'Allah is sufficient for us, and He is the best Disposer of affairs.',
    tags: ['fear', 'reliance', 'tawakkul', 'trust', 'overwhelmed'],
    daleel: {
      source: 'quran',
      reference: 'Qurʾān — Āl ʿImrān 3:173',
      text: 'Those to whom people said, “The people have gathered against you, so fear them,” but it increased them in faith and they said, “Sufficient for us is Allah, and He is the best Disposer of affairs.”',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Forgiveness & repentance
 * ------------------------------------------------------------------ */
export const FORGIVENESS_DUAS: Dua[] = [
  {
    id: 'sayyid-istighfar',
    category: 'forgiveness',
    title: 'The master of seeking forgiveness',
    when: 'Morning & evening',
    arabic:
      'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration:
      'Allāhumma anta rabbī lā ilāha illā ant, khalaqtanī wa anā ʿabduk, wa anā ʿalā ʿahdika wa waʿdika ma-staṭaʿt, aʿūdhu bika min sharri mā ṣanaʿt, abūʾu laka bi-niʿmatika ʿalayy, wa abūʾu bi-dhanbī fa-ghfir lī fa-innahu lā yaghfiru-dh-dhunūba illā ant',
    translation:
      'O Allah, You are my Lord; there is no deity but You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil I have done. I acknowledge Your favour upon me, and I acknowledge my sin, so forgive me, for none forgives sins but You.',
    virtue:
      'Whoever says it with certainty by day and dies that day, or by night and dies that night, enters Paradise.',
    tags: ['forgiveness', 'istighfar', 'repentance', 'sayyid', 'morning', 'evening'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 6306',
      narrator: 'Shaddād ibn Aws',
      grade: 'Ṣaḥīḥ',
      text: 'This is the master of seeking forgiveness (sayyid al-istighfār).',
    },
  },
  {
    id: 'kaffarat-majlis',
    category: 'forgiveness',
    title: 'Expiation of a gathering',
    when: 'Ending a sitting',
    arabic:
      'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ',
    transliteration:
      'Subḥānaka-llāhumma wa bi-ḥamdik, ashhadu an lā ilāha illā ant, astaghfiruka wa atūbu ilayk',
    translation:
      'Glory be to You, O Allah, and praise; I bear witness that there is no deity but You; I seek Your forgiveness and turn to You in repentance.',
    virtue: 'It expiates whatever occurred in that sitting.',
    tags: ['forgiveness', 'gathering', 'expiation', 'repentance', 'majlis'],
    daleel: {
      source: 'hadith',
      reference: 'Jāmiʿ at-Tirmidhī 3433',
      narrator: 'Abū Hurayrah',
      grade: 'Ṣaḥīḥ',
      text: 'Whoever sits in a gathering and says this before rising, it is forgiven what occurred in that gathering.',
    },
  },
  {
    id: 'rabbana-zalamna',
    category: 'forgiveness',
    title: 'The words of Ādam',
    when: 'Seeking pardon',
    arabic:
      'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
    transliteration:
      'Rabbanā ẓalamnā anfusanā wa in lam taghfir lanā wa tarḥamnā la-nakūnanna mina-l-khāsirīn',
    translation:
      'Our Lord, we have wronged ourselves; and if You do not forgive us and have mercy upon us, we will surely be among the losers.',
    tags: ['forgiveness', 'repentance', 'adam', 'mercy'],
    daleel: {
      source: 'quran',
      reference: 'Qurʾān — al-Aʿrāf 7:23',
      text: 'The supplication of Ādam and Ḥawwāʾ after they had wronged themselves.',
    },
  },
  {
    id: 'dua-tawbah',
    category: 'forgiveness',
    title: 'Turning to Allah',
    when: 'Repenting often',
    arabic: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ، إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
    transliteration: 'Rabbi-ghfir lī wa tub ʿalayya, innaka anta-t-tawwābu-r-raḥīm',
    translation:
      'My Lord, forgive me and accept my repentance; indeed, You are the Accepter of repentance, the Merciful.',
    virtue: 'The Prophet ﷺ would say it a hundred times in a single sitting.',
    tags: ['forgiveness', 'repentance', 'tawbah'],
    daleel: {
      source: 'hadith',
      reference: 'Jāmiʿ at-Tirmidhī 3434, Sunan Abī Dāwūd 1516',
      narrator: 'Ibn ʿUmar',
      grade: 'Ṣaḥīḥ',
      text: 'We would count that the Prophet ﷺ said this a hundred times in one sitting.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Protection & refuge
 * ------------------------------------------------------------------ */
export const PROTECTION_DUAS: Dua[] = [
  {
    id: 'audhu-kalimat',
    category: 'protection',
    title: 'Refuge in Allah’s words',
    when: 'When fearing harm',
    repeat: 3,
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: 'Aʿūdhu bi-kalimāti-llāhi-t-tāmmāti min sharri mā khalaq',
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    virtue: 'Whoever says it three times in the evening, no harm will afflict him that night.',
    tags: ['protection', 'refuge', 'evil', 'harm', 'night', 'fear'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 2708',
      narrator: 'Khawlah bint Ḥakīm',
      grade: 'Ṣaḥīḥ',
      text: 'Whoever alights at a place and says this, nothing will harm him until he departs.',
    },
  },
  {
    id: 'protection-children',
    category: 'protection',
    title: 'Protection for children',
    when: 'Seeking refuge for them',
    arabic:
      'أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
    transliteration:
      'Uʿīdhukumā bi-kalimāti-llāhi-t-tāmmah, min kulli shayṭānin wa hāmmah, wa min kulli ʿaynin lāmmah',
    translation:
      'I seek protection for you both in the perfect words of Allah from every devil and poisonous creature, and from every envious eye.',
    virtue: 'With these words Ibrāhīm ﷺ would seek refuge for Ismāʿīl and Isḥāq.',
    tags: ['protection', 'children', 'evil eye', 'refuge', 'family'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 3371',
      narrator: 'Ibn ʿAbbās',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ would seek refuge for al-Ḥasan and al-Ḥusayn with these words.',
    },
  },
  {
    id: 'bismillah-no-harm',
    category: 'protection',
    title: 'Nothing can harm',
    when: 'Morning & evening',
    repeat: 3,
    arabic:
      'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration:
      'Bismillāhi-lladhī lā yaḍurru maʿa-smihi shayʾun fi-l-arḍi wa lā fi-s-samāʾ, wa huwa-s-samīʿu-l-ʿalīm',
    translation:
      'In the name of Allah, with whose name nothing on earth or in the heaven can cause harm, and He is the All-Hearing, the All-Knowing.',
    virtue: 'Whoever says it three times morning and evening, nothing will harm him.',
    tags: ['protection', 'harm', 'morning', 'evening', 'refuge'],
    daleel: {
      source: 'hadith',
      reference: 'Sunan Abī Dāwūd 5088, Jāmiʿ at-Tirmidhī 3388',
      narrator: 'ʿUthmān ibn ʿAffān',
      grade: 'Ṣaḥīḥ',
      text: 'Whoever says this three times in the morning and evening, nothing will harm him.',
    },
  },
  {
    id: 'refuge-trials',
    category: 'protection',
    title: 'Refuge from trials',
    when: 'Seeking protection',
    arabic:
      'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ جَهْدِ الْبَلَاءِ، وَدَرَكِ الشَّقَاءِ، وَسُوءِ الْقَضَاءِ، وَشَمَاتَةِ الْأَعْدَاءِ',
    transliteration:
      'Allāhumma innī aʿūdhu bika min jahdi-l-balāʾ, wa daraki-sh-shaqāʾ, wa sūʾi-l-qaḍāʾ, wa shamātati-l-aʿdāʾ',
    translation:
      'O Allah, I seek refuge in You from severe affliction, from being overtaken by wretchedness, from an evil decree, and from the gloating of enemies.',
    tags: ['protection', 'trials', 'affliction', 'enemies', 'refuge'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 6347, Ṣaḥīḥ Muslim 2707',
      narrator: 'Abū Hurayrah',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ would seek refuge from these four.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Guidance & istikhārah
 * ------------------------------------------------------------------ */
export const GUIDANCE_DUAS: Dua[] = [
  {
    id: 'istikhara',
    category: 'guidance',
    title: 'The prayer of guidance (Istikhārah)',
    when: 'After two rakʿah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوبِ. اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ، وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ',
    transliteration:
      'Allāhumma innī astakhīruka bi-ʿilmik, wa astaqdiruka bi-qudratik, wa asʾaluka min faḍlika-l-ʿaẓīm, fa-innaka taqdiru wa lā aqdir, wa taʿlamu wa lā aʿlam, wa anta ʿallāmu-l-ghuyūb. Allāhumma in kunta taʿlamu anna hādha-l-amra khayrun lī fī dīnī wa maʿāshī wa ʿāqibati amrī fa-qdurhu lī wa yassirhu lī thumma bārik lī fīh, wa in kunta taʿlamu anna hādha-l-amra sharrun lī... fa-ṣrifhu ʿannī wa-ṣrifnī ʿanh, wa-qdur liya-l-khayra ḥaythu kāna thumma arḍinī bih',
    translation:
      'O Allah, I seek Your guidance by Your knowledge, and Your power by Your might, and I ask You of Your great bounty. For You have power and I have none, You know and I know not, and You are the Knower of the unseen. O Allah, if You know this matter to be good for me in my religion, my livelihood and the outcome of my affairs, then decree it for me, make it easy for me, and bless me in it. But if You know it to be bad for me, then turn it away from me and turn me away from it, and decree for me what is good wherever it may be, and make me content with it.',
    virtue: 'Pray two voluntary rakʿah, then supplicate — naming your matter where “this matter” falls.',
    tags: ['istikhara', 'guidance', 'decision', 'choice', 'marriage', 'work'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 1166',
      narrator: 'Jābir ibn ʿAbdillāh',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ would teach us istikhārah in all matters as he would teach us a sūrah of the Qurʾān.',
    },
  },
  {
    id: 'steadfast-heart',
    category: 'guidance',
    title: 'Steadfastness of the heart',
    when: 'For firmness in faith',
    arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ',
    transliteration: 'Yā muqalliba-l-qulūbi thabbit qalbī ʿalā dīnik',
    translation: 'O Turner of the hearts, make my heart firm upon Your religion.',
    virtue: 'The Prophet ﷺ would say it often.',
    tags: ['steadfastness', 'heart', 'faith', 'firmness', 'guidance'],
    daleel: {
      source: 'hadith',
      reference: 'Jāmiʿ at-Tirmidhī 2140',
      narrator: 'Anas ibn Mālik',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ frequently said this; when asked, he said the hearts are between two of the Fingers of the Most Merciful.',
    },
  },
  {
    id: 'guidance-taqwa',
    category: 'guidance',
    title: 'Guidance & uprightness',
    when: 'Asking for the path',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى',
    transliteration: 'Allāhumma innī asʾaluka-l-hudā wa-t-tuqā wa-l-ʿafāfa wa-l-ghinā',
    translation: 'O Allah, I ask You for guidance, piety, chastity and self-sufficiency.',
    tags: ['guidance', 'piety', 'taqwa', 'contentment', 'chastity'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 2721',
      narrator: 'Ibn Masʿūd',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ used to say this.',
    },
  },
];
