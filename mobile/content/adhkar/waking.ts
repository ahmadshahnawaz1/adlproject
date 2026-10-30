/**
 * content/adhkar/waking.ts — the remembrances on waking (أَذْكَار الِاسْتِيْقَاظ),
 * said upon rising from sleep.
 */
import type { AdhkarCategory } from './types';

export const WAKING_ADHKAR: AdhkarCategory = {
  id: 'waking',
  title: 'On waking',
  arabic: 'أَذْكَار الِاسْتِيْقَاظ',
  subtitle: 'The remembrances upon waking from sleep',
  timeHint: 'On rising from sleep',
  dhikr: [
    {
      id: 'alhamdu-ahyana',
      arabic:
        'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
      transliteration: 'Al-ḥamdu lillāhi lladhī aḥyānā baʿda mā amātanā wa ilayhi n-nushūr.',
      translation:
        'All praise is for Allāh who gave us life after He caused us to die, and to Him is the resurrection.',
      repeat: 1,
      daleel: {
        source: 'hadith',
        reference: 'al-Bukhārī 6324',
        narrator: 'Ḥudhayfah',
        grade: 'Ṣaḥīḥ',
        text: 'When the Prophet ﷺ awoke he would say it.',
      },
    },
    {
      id: 'la-ilaha-waking',
      arabic:
        'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَٰهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
      transliteration:
        'Lā ilāha illā -llāhu waḥdahu lā sharīka lah… subḥāna -llāh, wal-ḥamdu lillāh, wa lā ilāha illā -llāh, wa -llāhu akbar, wa lā ḥawla wa lā quwwata illā billāh.',
      translation:
        'There is no god but Allāh alone… Glory be to Allāh, all praise is for Allāh, there is no god but Allāh, Allāh is the Greatest, and there is no might nor power except with Allāh.',
      repeat: 1,
      virtue: 'Whoever says it on waking at night and then prays, his supplication is answered.',
      daleel: {
        source: 'hadith',
        reference: 'al-Bukhārī 1154',
        narrator: 'ʿUbādah ibn aṣ-Ṣāmit',
        grade: 'Ṣaḥīḥ',
        text: 'Whoever wakes and says it, then asks, is answered; if he makes wuḍūʾ and prays, his prayer is accepted.',
      },
    },
    {
      id: 'last-verses-imran',
      arabic: 'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِأُولِي الْأَلْبَابِ … (الآيَاتُ)',
      transliteration: 'The closing verses of Sūrat Āl ʿImrān (3:190–200).',
      translation: 'Recite the closing verses of Āl ʿImrān, as the Prophet ﷺ did on rising for the night prayer.',
      repeat: 1,
      daleel: {
        source: 'hadith',
        reference: 'al-Bukhārī 4569, Muslim 256',
        narrator: 'Ibn ʿAbbās',
        grade: 'Ṣaḥīḥ',
        text: 'On waking for tahajjud, the Prophet ﷺ would recite the last ten verses of Āl ʿImrān.',
      },
    },
  ],
};
