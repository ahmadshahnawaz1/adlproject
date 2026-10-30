/**
 * content/adhkar/morning.ts — the morning remembrances (أَذْكَار الصَّبَاح),
 * said from dawn until sunrise. An authentic, well-known selection from the
 * Qurʾān and the Sunnah, each carrying its evidence.
 */
import type { AdhkarCategory } from './types';

export const MORNING_ADHKAR: AdhkarCategory = {
  id: 'morning',
  title: 'Morning',
  arabic: 'أَذْكَار الصَّبَاح',
  subtitle: 'The remembrances of the morning',
  timeHint: 'From dawn (Fajr) until sunrise',
  dhikr: [
    {
      id: 'ayat-al-kursi',
      arabic:
        'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ، لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ، لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ، مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ، يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ، وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ، وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ، وَلَا يَئُودُهُ حِفْظُهُمَا، وَهُوَ الْعَلِيُّ الْعَظِيمُ',
      transliteration:
        'Allāhu lā ilāha illā huwa, al-Ḥayyu l-Qayyūm. Lā taʾkhudhuhu sinatun wa lā nawm…',
      translation:
        'Allāh — there is no god but He, the Ever-Living, the Sustainer. Neither drowsiness nor sleep overtakes Him… (Āyat al-Kursī).',
      repeat: 1,
      virtue: 'Whoever says it in the morning is protected from the jinn until evening.',
      daleel: {
        source: 'quran',
        reference: 'al-Baqarah 2:255',
        text: 'Recited morning and evening; al-Ḥākim graded the report of its protection ṣaḥīḥ.',
      },
    },
    {
      id: 'muawwidhat',
      arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ … قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ … قُلْ أَعُوذُ بِرَبِّ النَّاسِ …',
      transliteration: 'Sūrat al-Ikhlāṣ, al-Falaq and an-Nās — three times each.',
      translation:
        '“Say: He is Allāh, the One…”, “Say: I seek refuge in the Lord of daybreak…”, “Say: I seek refuge in the Lord of mankind…”',
      repeat: 3,
      virtue: 'They suffice you against all things.',
      daleel: {
        source: 'hadith',
        reference: 'Abū Dāwūd 5082, Tirmidhī 3575',
        narrator: 'ʿAbdullāh ibn Khubayb',
        grade: 'Ḥasan',
        text: 'Recite the three Qul sūrahs morning and evening, three times — they will suffice you against everything.',
      },
    },
    {
      id: 'sayyid-al-istighfar',
      arabic:
        'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
      transliteration:
        'Allāhumma anta Rabbī, lā ilāha illā anta, khalaqtanī wa anā ʿabduk…',
      translation:
        'O Allāh, You are my Lord; there is no god but You. You created me and I am Your servant… Forgive me, for none forgives sins but You.',
      repeat: 1,
      virtue: 'The chief of seeking forgiveness — whoever says it by day with certainty and dies that day enters Paradise.',
      daleel: {
        source: 'hadith',
        reference: 'al-Bukhārī 6306',
        narrator: 'Shaddād ibn Aws',
        grade: 'Ṣaḥīḥ',
        text: 'This is the sayyid al-istighfār (the chief manner of seeking forgiveness).',
      },
    },
    {
      id: 'asbahna',
      arabic:
        'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
      transliteration:
        'Aṣbaḥnā wa aṣbaḥa l-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illā -llāhu waḥdahu lā sharīka lah…',
      translation:
        'We have entered the morning and the dominion belongs to Allāh; all praise is for Allāh. There is no god but Allāh alone, without partner.',
      repeat: 1,
      daleel: {
        source: 'hadith',
        reference: 'Muslim 2723',
        narrator: 'ʿAbdullāh ibn Masʿūd',
        grade: 'Ṣaḥīḥ',
        text: 'The Prophet ﷺ would say this upon entering the morning.',
      },
    },
    {
      id: 'allahumma-bika-asbahna',
      arabic:
        'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
      transliteration:
        'Allāhumma bika aṣbaḥnā, wa bika amsaynā, wa bika naḥyā, wa bika namūt, wa ilayka n-nushūr.',
      translation:
        'O Allāh, by You we enter the morning and by You the evening, by You we live and by You we die, and to You is the resurrection.',
      repeat: 1,
      daleel: {
        source: 'hadith',
        reference: 'Tirmidhī 3391',
        narrator: 'Abū Hurayrah',
        grade: 'Ḥasan',
        text: 'The Prophet ﷺ taught this for the morning, with “wa ilayka l-maṣīr” in the evening.',
      },
    },
    {
      id: 'radhitu',
      arabic:
        'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا',
      transliteration: 'Raḍītu billāhi Rabbā, wa bil-Islāmi dīnā, wa bi-Muḥammadin ﷺ nabiyyā.',
      translation:
        'I am pleased with Allāh as my Lord, with Islām as my religion, and with Muḥammad ﷺ as my Prophet.',
      repeat: 3,
      virtue: 'Allāh has promised to please whoever says it morning and evening on the Day of Resurrection.',
      daleel: {
        source: 'hadith',
        reference: 'Abū Dāwūd 5072, Tirmidhī 3389',
        narrator: 'Thawbān',
        grade: 'Ḥasan',
        text: 'It is a right upon Allāh to please the one who says it three times morning and evening.',
      },
    },
    {
      id: 'hasbiyallah',
      arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
      transliteration: 'Ḥasbiya -llāhu lā ilāha illā huwa, ʿalayhi tawakkaltu, wa huwa Rabbu l-ʿarshi l-ʿaẓīm.',
      translation:
        'Allāh is sufficient for me; there is no god but He. Upon Him I rely, and He is the Lord of the Mighty Throne.',
      repeat: 7,
      virtue: 'Allāh suffices whoever says it seven times, in this world and the next.',
      daleel: {
        source: 'hadith',
        reference: 'Abū Dāwūd 5081',
        grade: 'Reported (acted upon)',
        text: 'Whoever says it seven times morning and evening, Allāh suffices him in what concerns him.',
      },
    },
    {
      id: 'bismillah-la-yadurru',
      arabic:
        'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ',
      transliteration:
        'Bismi -llāhi lladhī lā yaḍurru maʿa -smihi shayʾun fī l-arḍi wa lā fī s-samāʾ, wa huwa s-Samīʿu l-ʿAlīm.',
      translation:
        'In the name of Allāh, with whose name nothing in the earth or the heaven can cause harm, and He is the All-Hearing, the All-Knowing.',
      repeat: 3,
      virtue: 'Nothing will harm whoever says it three times morning and evening.',
      daleel: {
        source: 'hadith',
        reference: 'Abū Dāwūd 5088, Tirmidhī 3388',
        narrator: 'ʿUthmān ibn ʿAffān',
        grade: 'Ṣaḥīḥ',
        text: 'No sudden affliction will befall the one who says it three times morning and evening.',
      },
    },
    {
      id: 'subhanallah-wa-bihamdihi',
      arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
      transliteration: 'Subḥāna -llāhi wa bi-ḥamdih.',
      translation: 'Glory and praise be to Allāh.',
      repeat: 100,
      virtue: 'No one comes with better than this on the Day of Resurrection, save one who said the like or more.',
      daleel: {
        source: 'hadith',
        reference: 'Muslim 2692',
        narrator: 'Abū Hurayrah',
        grade: 'Ṣaḥīḥ',
        text: 'Whoever says it a hundred times a day has his sins wiped away though they be like the foam of the sea.',
      },
    },
    {
      id: 'tahlil-morning',
      arabic:
        'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
      transliteration:
        'Lā ilāha illā -llāhu waḥdahu lā sharīka lah, lahu l-mulku wa lahu l-ḥamd, wa huwa ʿalā kulli shayʾin qadīr.',
      translation:
        'There is no god but Allāh alone, without partner. His is the dominion and His the praise, and He is over all things competent.',
      repeat: 10,
      virtue: 'A reward like freeing slaves, and a shield from Shayṭān for the day.',
      daleel: {
        source: 'hadith',
        reference: 'al-Bukhārī 3293, Muslim 2691',
        narrator: 'Abū Hurayrah',
        grade: 'Ṣaḥīḥ',
        text: 'Whoever says it has the reward of freeing slaves and is guarded from Shayṭān until evening.',
      },
    },
  ],
};
