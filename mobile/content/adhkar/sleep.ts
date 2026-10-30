/**
 * content/adhkar/sleep.ts — the remembrances before sleep (أَذْكَار النَّوْم),
 * said upon lying down for the night.
 */
import type { AdhkarCategory } from './types';

export const SLEEP_ADHKAR: AdhkarCategory = {
  id: 'sleep',
  title: 'Before sleep',
  arabic: 'أَذْكَار النَّوْم',
  subtitle: 'The remembrances before sleeping',
  timeHint: 'On lying down for the night',
  dhikr: [
    {
      id: 'muawwidhat-blow',
      arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ … قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ … قُلْ أَعُوذُ بِرَبِّ النَّاسِ …',
      transliteration: 'Sūrat al-Ikhlāṣ, al-Falaq and an-Nās — three times.',
      translation: 'Recite the three Qul sūrahs, then wipe over the body.',
      repeat: 3,
      note: 'Cup the palms, recite into them, then wipe over as much of the body as you can reach, beginning with the head and face — three times.',
      daleel: {
        source: 'hadith',
        reference: 'al-Bukhārī 5017',
        narrator: 'ʿĀʾishah',
        grade: 'Ṣaḥīḥ',
        text: 'Each night the Prophet ﷺ would recite them into his hands and wipe over his body.',
      },
    },
    {
      id: 'ayat-al-kursi',
      arabic:
        'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ … وَلَا يَئُودُهُ حِفْظُهُمَا، وَهُوَ الْعَلِيُّ الْعَظِيمُ',
      transliteration: 'Āyat al-Kursī (al-Baqarah 2:255).',
      translation: 'Āyat al-Kursī, recited on going to bed.',
      repeat: 1,
      virtue: 'A guardian from Allāh remains over you, and no devil comes near you until morning.',
      daleel: {
        source: 'hadith',
        reference: 'al-Bukhārī 2311',
        narrator: 'Abū Hurayrah',
        grade: 'Ṣaḥīḥ',
        text: 'Whoever recites it on going to bed has a guardian from Allāh, and Shayṭān does not approach until morning.',
      },
    },
    {
      id: 'last-two-baqarah',
      arabic: 'آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ … (الآيَتَانِ)',
      transliteration: 'The last two verses of Sūrat al-Baqarah (2:285–286).',
      translation: 'Recite the closing two verses of al-Baqarah.',
      repeat: 1,
      virtue: 'Whoever recites them at night, they will suffice him.',
      daleel: {
        source: 'hadith',
        reference: 'al-Bukhārī 5009, Muslim 807',
        narrator: 'Abū Masʿūd al-Badrī',
        grade: 'Ṣaḥīḥ',
        text: 'Whoever recites the last two verses of al-Baqarah at night, they will suffice him.',
      },
    },
    {
      id: 'allahumma-aslamtu',
      arabic:
        'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ',
      transliteration:
        'Allāhumma aslamtu nafsī ilayk, wa fawwaḍtu amrī ilayk, wa aljaʾtu ẓahrī ilayk…',
      translation:
        'O Allāh, I submit myself to You, entrust my affair to You, and turn my back to You, in hope and fear of You. There is no refuge or escape from You except to You. I believe in Your Book which You revealed, and Your Prophet whom You sent.',
      repeat: 1,
      virtue: 'Whoever says it and dies that night dies upon the fiṭrah (the natural way of Islām).',
      daleel: {
        source: 'hadith',
        reference: 'al-Bukhārī 247, Muslim 2710',
        narrator: 'al-Barāʾ ibn ʿĀzib',
        grade: 'Ṣaḥīḥ',
        text: 'Make it the last thing you say; if you die that night, you die upon the fiṭrah.',
      },
    },
    {
      id: 'bismika-amutu',
      arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
      transliteration: 'Bismika -llāhumma amūtu wa aḥyā.',
      translation: 'In Your name, O Allāh, I die and I live.',
      repeat: 1,
      daleel: {
        source: 'hadith',
        reference: 'al-Bukhārī 6324',
        narrator: 'Ḥudhayfah',
        grade: 'Ṣaḥīḥ',
        text: 'When the Prophet ﷺ went to bed he would say it.',
      },
    },
    {
      id: 'tasbih-fatimah-subhanallah',
      arabic: 'سُبْحَانَ اللَّهِ',
      transliteration: 'Subḥāna -llāh.',
      translation: 'Glory be to Allāh.',
      repeat: 33,
      virtue: 'The tasbīḥ taught to Fāṭimah — better for them than a servant.',
      daleel: {
        source: 'hadith',
        reference: 'al-Bukhārī 5362, Muslim 2727',
        narrator: 'ʿAlī ibn Abī Ṭālib',
        grade: 'Ṣaḥīḥ',
        text: 'Thirty-three subḥānallāh, thirty-three alḥamdulillāh and thirty-four Allāhu akbar on going to bed.',
      },
    },
    {
      id: 'tasbih-fatimah-alhamdulillah',
      arabic: 'الْحَمْدُ لِلَّهِ',
      transliteration: 'Al-ḥamdu lillāh.',
      translation: 'All praise is for Allāh.',
      repeat: 33,
      daleel: {
        source: 'hadith',
        reference: 'al-Bukhārī 5362, Muslim 2727',
        narrator: 'ʿAlī ibn Abī Ṭālib',
        grade: 'Ṣaḥīḥ',
        text: 'Part of the tasbīḥ of Fāṭimah said on going to bed.',
      },
    },
    {
      id: 'tasbih-fatimah-allahu-akbar',
      arabic: 'اللَّهُ أَكْبَرُ',
      transliteration: 'Allāhu akbar.',
      translation: 'Allāh is the Greatest.',
      repeat: 34,
      daleel: {
        source: 'hadith',
        reference: 'al-Bukhārī 5362, Muslim 2727',
        narrator: 'ʿAlī ibn Abī Ṭālib',
        grade: 'Ṣaḥīḥ',
        text: 'Thirty-four times, completing the tasbīḥ of Fāṭimah.',
      },
    },
  ],
};
