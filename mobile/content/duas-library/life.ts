/**
 * life.ts — the supplications woven through an ordinary day: the table and the
 * garment, the threshold of the home, the mosque, the road, and the sky.
 *
 * Sections: `daily`, `mosque`, `travel`, `nature`. Every duʿā is cited to the
 * Sunnah, and the wording follows Ḥiṣn al-Muslim.
 */
import type { Dua } from './types';

/* ------------------------------------------------------------------ *
 * Everyday life — eating, dressing, the home, the lavatory
 * ------------------------------------------------------------------ */
export const DAILY_DUAS: Dua[] = [
  {
    id: 'before-eating',
    category: 'daily',
    title: 'Before eating',
    when: 'Before a meal',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillāh',
    translation: 'In the name of Allah.',
    virtue: 'If one forgets, say when remembering: “Bismillāhi awwalahu wa ākhirah.”',
    tags: ['eating', 'food', 'meal', 'bismillah', 'kitchen'],
    daleel: {
      source: 'hadith',
      reference: 'Sunan Abī Dāwūd 3767, Jāmiʿ at-Tirmidhī 1858',
      narrator: 'ʿĀʾishah',
      grade: 'Ṣaḥīḥ',
      text: 'When any of you eats, let him mention the name of Allah; and if he forgets at the beginning, let him say: “Bismillāhi awwalahu wa ākhirah.”',
    },
  },
  {
    id: 'after-eating',
    category: 'daily',
    title: 'After eating',
    when: 'After a meal',
    arabic:
      'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    transliteration:
      'Al-ḥamdu lillāhi-lladhī aṭʿamanī hādhā wa razaqanīhi min ghayri ḥawlin minnī wa lā quwwah',
    translation:
      'All praise is for Allah, who fed me this and provided it for me without any might or power on my part.',
    virtue: 'His past sins are forgiven.',
    tags: ['eating', 'food', 'meal', 'gratitude', 'alhamdulillah'],
    daleel: {
      source: 'hadith',
      reference: 'Sunan Abī Dāwūd 4023, Jāmiʿ at-Tirmidhī 3458',
      narrator: 'Muʿādh ibn Anas',
      grade: 'Ḥasan',
      text: 'Whoever eats food and then says this, his past sins are forgiven.',
    },
  },
  {
    id: 'leaving-home',
    category: 'daily',
    title: 'Leaving the home',
    when: 'On going out',
    arabic: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'Bismillāh, tawakkaltu ʿala-llāh, wa lā ḥawla wa lā quwwata illā billāh',
    translation:
      'In the name of Allah; I place my trust in Allah; there is no might nor power except with Allah.',
    virtue: 'It is said to him: you are guided, defended and protected — and the devil turns away.',
    tags: ['home', 'house', 'leaving', 'going out', 'protection'],
    daleel: {
      source: 'hadith',
      reference: 'Sunan Abī Dāwūd 5095, Jāmiʿ at-Tirmidhī 3426',
      narrator: 'Anas ibn Mālik',
      grade: 'Ṣaḥīḥ',
      text: 'Whoever says this on leaving his house, it is said to him: you are guided, defended and protected, and the devils withdraw from him.',
    },
  },
  {
    id: 'entering-home',
    category: 'daily',
    title: 'Entering the home',
    when: 'On coming in',
    arabic:
      'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
    transliteration:
      'Bismillāhi walajnā, wa bismillāhi kharajnā, wa ʿala-llāhi rabbinā tawakkalnā',
    translation:
      'In the name of Allah we enter, in the name of Allah we leave, and upon Allah our Lord we rely.',
    virtue: 'Then greet your household with salām.',
    tags: ['home', 'house', 'entering', 'family'],
    daleel: {
      source: 'hadith',
      reference: 'Sunan Abī Dāwūd 5096',
      narrator: 'Abū Mālik al-Ashʿarī',
      grade: 'Ḥasan',
      text: 'When a man enters his house, let him say this, and then greet his family.',
    },
  },
  {
    id: 'wearing-clothes',
    category: 'daily',
    title: 'Putting on clothes',
    when: 'On dressing',
    arabic:
      'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا الثَّوْبَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    transliteration:
      'Al-ḥamdu lillāhi-lladhī kasānī hādha-th-thawba wa razaqanīhi min ghayri ḥawlin minnī wa lā quwwah',
    translation:
      'All praise is for Allah, who clothed me with this garment and provided it for me without any might or power on my part.',
    virtue: 'His past sins are forgiven.',
    tags: ['clothes', 'clothing', 'dressing', 'garment'],
    daleel: {
      source: 'hadith',
      reference: 'Sunan Abī Dāwūd 4023, Jāmiʿ at-Tirmidhī 3560',
      narrator: 'Muʿādh ibn Anas',
      grade: 'Ḥasan',
      text: 'Whoever puts on a garment and says this, his past sins are forgiven.',
    },
  },
  {
    id: 'entering-bathroom',
    category: 'daily',
    title: 'Entering the lavatory',
    when: 'Before going in',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
    transliteration: '(Bismillāh.) Allāhumma innī aʿūdhu bika mina-l-khubthi wa-l-khabāʾith',
    translation:
      '(In the name of Allah.) O Allah, I seek refuge in You from the male and female devils.',
    tags: ['bathroom', 'toilet', 'lavatory', 'restroom', 'refuge'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 142, Ṣaḥīḥ Muslim 375',
      narrator: 'Anas ibn Mālik',
      grade: 'Ṣaḥīḥ',
      text: 'When the Prophet ﷺ entered the lavatory he would say this.',
    },
  },
  {
    id: 'leaving-bathroom',
    category: 'daily',
    title: 'Leaving the lavatory',
    when: 'On coming out',
    arabic: 'غُفْرَانَكَ',
    transliteration: 'Ghufrānak',
    translation: 'I seek Your forgiveness.',
    tags: ['bathroom', 'toilet', 'lavatory', 'forgiveness'],
    daleel: {
      source: 'hadith',
      reference: 'Sunan Abī Dāwūd 30, Jāmiʿ at-Tirmidhī 7',
      narrator: 'ʿĀʾishah',
      grade: 'Ṣaḥīḥ',
      text: 'When the Prophet ﷺ came out of the lavatory he would say: “Ghufrānak.”',
    },
  },
];

/* ------------------------------------------------------------------ *
 * The mosque — entering, leaving, and the call to prayer
 * ------------------------------------------------------------------ */
export const MOSQUE_DUAS: Dua[] = [
  {
    id: 'entering-mosque',
    category: 'mosque',
    title: 'Entering the mosque',
    when: 'Stepping in (right foot)',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: 'Allāhumma-ftaḥ lī abwāba raḥmatik',
    translation: 'O Allah, open for me the gates of Your mercy.',
    virtue: 'Preceded by the salutation upon the Prophet ﷺ.',
    tags: ['mosque', 'masjid', 'entering', 'prayer'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 713',
      narrator: 'Abū Usayd',
      grade: 'Ṣaḥīḥ',
      text: 'When one of you enters the mosque, let him say this.',
    },
  },
  {
    id: 'leaving-mosque',
    category: 'mosque',
    title: 'Leaving the mosque',
    when: 'Stepping out (left foot)',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    transliteration: 'Allāhumma innī asʾaluka min faḍlik',
    translation: 'O Allah, I ask You from Your bounty.',
    tags: ['mosque', 'masjid', 'leaving'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 713',
      narrator: 'Abū Usayd',
      grade: 'Ṣaḥīḥ',
      text: 'And when he leaves, let him say this.',
    },
  },
  {
    id: 'after-adhan',
    category: 'mosque',
    title: 'After the adhān',
    when: 'When the call ends',
    arabic:
      'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
    transliteration:
      'Allāhumma rabba hādhihi-d-daʿwati-t-tāmmah, wa-ṣ-ṣalāti-l-qāʾimah, āti Muḥammada-ni-l-wasīlata wa-l-faḍīlah, wa-bʿathhu maqāman maḥmūdani-lladhī waʿadtah',
    translation:
      'O Allah, Lord of this perfect call and established prayer, grant Muhammad the means (al-wasīlah) and the excellence, and raise him to the praised station which You have promised him.',
    virtue: 'He will be entitled to the Prophet’s intercession on the Day of Resurrection.',
    tags: ['adhan', 'call to prayer', 'mosque', 'intercession', 'iqamah'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 614',
      narrator: 'Jābir ibn ʿAbdillāh',
      grade: 'Ṣaḥīḥ',
      text: 'Whoever says this after the call, my intercession will be his on the Day of Resurrection.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Travel — setting out, the road, and the return
 * ------------------------------------------------------------------ */
export const TRAVEL_DUAS: Dua[] = [
  {
    id: 'travel-mount',
    category: 'travel',
    title: 'Setting out',
    when: 'On boarding',
    arabic:
      'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration:
      'Allāhu akbar (×3). Subḥāna-lladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn, wa innā ilā rabbinā la-munqalibūn',
    translation:
      'Allah is the Greatest (×3). Glory to Him who has subjected this to us, for we could never have accomplished it by ourselves; and indeed, to our Lord we will surely return.',
    tags: ['travel', 'journey', 'transport', 'vehicle', 'car', 'flight'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 1342',
      narrator: 'Ibn ʿUmar',
      grade: 'Ṣaḥīḥ',
      text: 'When the Prophet ﷺ mounted his camel to set out on a journey, he would say the takbīr three times, then say this. (Qurʾān 43:13–14)',
    },
  },
  {
    id: 'travel-ease',
    category: 'travel',
    title: 'For an easy journey',
    when: 'On the way',
    arabic:
      'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ',
    transliteration:
      'Allāhumma innā nasʾaluka fī safarinā hādha-l-birra wa-t-taqwā, wa mina-l-ʿamali mā tarḍā. Allāhumma hawwin ʿalaynā safaranā hādhā wa-ṭwi ʿannā buʿdah',
    translation:
      'O Allah, we ask You on this journey for righteousness, piety, and deeds that please You. O Allah, make this journey easy for us, and fold up for us its distance.',
    tags: ['travel', 'journey', 'ease', 'distance'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 1342',
      narrator: 'Ibn ʿUmar',
      grade: 'Ṣaḥīḥ',
      text: 'Then he would say this upon setting out on a journey.',
    },
  },
  {
    id: 'travel-return',
    category: 'travel',
    title: 'Returning home',
    when: 'On the way back',
    arabic: 'آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ',
    transliteration: 'Āyibūna tāʾibūna ʿābidūna li-rabbinā ḥāmidūn',
    translation: 'We return, repentant, worshipping, and to our Lord giving praise.',
    tags: ['travel', 'return', 'coming home', 'journey'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 1797, Ṣaḥīḥ Muslim 1344',
      narrator: 'Ibn ʿUmar',
      grade: 'Ṣaḥīḥ',
      text: 'When the Prophet ﷺ returned from a journey, he would say the takbīr on each elevation, then say this.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Weather & nature — rain, wind, thunder
 * ------------------------------------------------------------------ */
export const NATURE_DUAS: Dua[] = [
  {
    id: 'when-raining',
    category: 'nature',
    title: 'When it rains',
    when: 'As the rain falls',
    arabic: 'اللَّهُمَّ صَيِّبًا نَافِعًا',
    transliteration: 'Allāhumma ṣayyiban nāfiʿā',
    translation: 'O Allah, (let it be) a beneficial rain cloud.',
    tags: ['rain', 'weather', 'clouds', 'storm'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 1032',
      narrator: 'ʿĀʾishah',
      grade: 'Ṣaḥīḥ',
      text: 'When it rained, the Prophet ﷺ would say this.',
    },
  },
  {
    id: 'after-rain',
    category: 'nature',
    title: 'After rainfall',
    when: 'When the rain stops',
    arabic: 'مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ',
    transliteration: 'Muṭirnā bi-faḍli-llāhi wa raḥmatih',
    translation: 'We have been given rain by the grace and mercy of Allah.',
    tags: ['rain', 'weather', 'gratitude'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 846, Ṣaḥīḥ Muslim 71',
      narrator: 'Zayd ibn Khālid',
      grade: 'Ṣaḥīḥ',
      text: 'Allah said: among My servants are those who entered upon morning believing in Me — whoever says “we have been given rain by Allah’s grace and mercy” believes in Me.',
    },
  },
  {
    id: 'wind',
    category: 'nature',
    title: 'When the wind blows',
    when: 'In a strong wind',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا فِيهَا وَخَيْرَ مَا أُرْسِلَتْ بِهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا فِيهَا وَشَرِّ مَا أُرْسِلَتْ بِهِ',
    transliteration:
      'Allāhumma innī asʾaluka khayrahā wa khayra mā fīhā wa khayra mā ursilat bih, wa aʿūdhu bika min sharrihā wa sharri mā fīhā wa sharri mā ursilat bih',
    translation:
      'O Allah, I ask You for its good, the good within it, and the good it was sent with; and I seek refuge in You from its evil, the evil within it, and the evil it was sent with.',
    tags: ['wind', 'storm', 'weather', 'refuge'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 899',
      narrator: 'ʿĀʾishah',
      grade: 'Ṣaḥīḥ',
      text: 'When the wind blew strongly, the Prophet ﷺ would say this.',
    },
  },
  {
    id: 'thunder',
    category: 'nature',
    title: 'On hearing thunder',
    when: 'When thunder sounds',
    arabic: 'سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ',
    transliteration: 'Subḥāna-lladhī yusabbiḥu-r-raʿdu bi-ḥamdihi wa-l-malāʾikatu min khīfatih',
    translation:
      'Glory to Him whom the thunder glorifies with His praise, and so do the angels out of awe of Him.',
    tags: ['thunder', 'storm', 'weather', 'tasbih', 'lightning'],
    daleel: {
      source: 'hadith',
      reference: 'al-Muwaṭṭaʾ of Mālik 3641',
      narrator: 'ʿAbdullāh ibn az-Zubayr',
      grade: 'Ṣaḥīḥ (mawqūf)',
      text: 'When ʿAbdullāh ibn az-Zubayr heard thunder, he would cease speaking and say this.',
    },
  },
];
