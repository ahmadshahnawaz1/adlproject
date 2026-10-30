/**
 * content/adhkar/afterSalah.ts — the remembrances after the obligatory prayer
 * (أَذْكَار بَعْدَ الصَّلَاة), said while still seated, before rising.
 */
import type { AdhkarCategory } from './types';

export const AFTER_SALAH_ADHKAR: AdhkarCategory = {
  id: 'after-salah',
  title: 'After ṣalāh',
  arabic: 'أَذْكَار بَعْدَ الصَّلَاة',
  subtitle: 'The remembrances after the obligatory prayer',
  timeHint: 'After the taslīm of each farḍ prayer',
  dhikr: [
    {
      id: 'istighfar',
      arabic: 'أَسْتَغْفِرُ اللَّهَ',
      transliteration: 'Astaghfiru -llāh.',
      translation: 'I seek the forgiveness of Allāh.',
      repeat: 3,
      daleel: {
        source: 'hadith',
        reference: 'Muslim 591',
        narrator: 'Thawbān',
        grade: 'Ṣaḥīḥ',
        text: 'When the Prophet ﷺ finished his prayer he would seek forgiveness three times.',
      },
    },
    {
      id: 'allahumma-antas-salam',
      arabic:
        'اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
      transliteration:
        'Allāhumma anta s-Salām, wa minka s-salām, tabārakta yā Dhā l-Jalāli wal-Ikrām.',
      translation:
        'O Allāh, You are Peace and from You is peace. Blessed are You, O Owner of Majesty and Honour.',
      repeat: 1,
      daleel: {
        source: 'hadith',
        reference: 'Muslim 591',
        narrator: 'Thawbān',
        grade: 'Ṣaḥīḥ',
        text: 'He ﷺ would say it after the istighfār that follows the prayer.',
      },
    },
    {
      id: 'la-ilaha-la-mania',
      arabic:
        'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',
      transliteration:
        'Lā ilāha illā -llāhu waḥdahu lā sharīka lah… Allāhumma lā māniʿa limā aʿṭayt, wa lā muʿṭiya limā manaʿt…',
      translation:
        'There is no god but Allāh alone… O Allāh, none can withhold what You give, and none can give what You withhold…',
      repeat: 1,
      daleel: {
        source: 'hadith',
        reference: 'al-Bukhārī 844, Muslim 593',
        narrator: 'al-Mughīrah ibn Shuʿbah',
        grade: 'Ṣaḥīḥ',
        text: 'He ﷺ would say it after every obligatory prayer.',
      },
    },
    {
      id: 'subhanallah',
      arabic: 'سُبْحَانَ اللَّهِ',
      transliteration: 'Subḥāna -llāh.',
      translation: 'Glory be to Allāh.',
      repeat: 33,
      daleel: {
        source: 'hadith',
        reference: 'Muslim 597',
        narrator: 'Abū Hurayrah',
        grade: 'Ṣaḥīḥ',
        text: 'Thirty-three of each, completing the hundred with the tahlīl, after every prayer.',
      },
    },
    {
      id: 'alhamdulillah',
      arabic: 'الْحَمْدُ لِلَّهِ',
      transliteration: 'Al-ḥamdu lillāh.',
      translation: 'All praise is for Allāh.',
      repeat: 33,
      daleel: {
        source: 'hadith',
        reference: 'Muslim 597',
        narrator: 'Abū Hurayrah',
        grade: 'Ṣaḥīḥ',
        text: 'Thirty-three of each after every prayer.',
      },
    },
    {
      id: 'allahu-akbar',
      arabic: 'اللَّهُ أَكْبَرُ',
      transliteration: 'Allāhu akbar.',
      translation: 'Allāh is the Greatest.',
      repeat: 33,
      daleel: {
        source: 'hadith',
        reference: 'Muslim 597',
        narrator: 'Abū Hurayrah',
        grade: 'Ṣaḥīḥ',
        text: 'Thirty-three of each after every prayer.',
      },
    },
    {
      id: 'tahlil-completion',
      arabic:
        'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
      transliteration:
        'Lā ilāha illā -llāhu waḥdahu lā sharīka lah, lahu l-mulku wa lahu l-ḥamd, wa huwa ʿalā kulli shayʾin qadīr.',
      translation:
        'There is no god but Allāh alone, without partner. His is the dominion and His the praise, and He is over all things competent.',
      repeat: 1,
      virtue: 'Completing the hundred with this, one’s sins are forgiven though like the foam of the sea.',
      daleel: {
        source: 'hadith',
        reference: 'Muslim 597',
        narrator: 'Abū Hurayrah',
        grade: 'Ṣaḥīḥ',
        text: 'Whoever completes the hundred with the tahlīl, his sins are forgiven.',
      },
    },
    {
      id: 'ayat-al-kursi',
      arabic:
        'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ … وَلَا يَئُودُهُ حِفْظُهُمَا، وَهُوَ الْعَلِيُّ الْعَظِيمُ',
      transliteration: 'Āyat al-Kursī (al-Baqarah 2:255).',
      translation: 'Āyat al-Kursī, recited after every obligatory prayer.',
      repeat: 1,
      virtue: 'Nothing keeps the one who recites it after each prayer from Paradise but death.',
      daleel: {
        source: 'hadith',
        reference: 'an-Nasāʾī al-Kubrā 9928',
        narrator: 'Abū Umāmah',
        grade: 'Ṣaḥīḥ',
        text: 'Whoever recites Āyat al-Kursī after every prayer, nothing stands between him and Paradise but death.',
      },
    },
    {
      id: 'allahumma-ainni',
      arabic:
        'اللَّهُمَّ أَعِنِّي عَلَىٰ ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ',
      transliteration: 'Allāhumma aʿinnī ʿalā dhikrika, wa shukrika, wa ḥusni ʿibādatik.',
      translation:
        'O Allāh, help me to remember You, to thank You, and to worship You well.',
      repeat: 1,
      daleel: {
        source: 'hadith',
        reference: 'Abū Dāwūd 1522',
        narrator: 'Muʿādh ibn Jabal',
        grade: 'Ṣaḥīḥ',
        text: 'The Prophet ﷺ counselled Muʿādh never to leave this after every prayer.',
      },
    },
  ],
};
