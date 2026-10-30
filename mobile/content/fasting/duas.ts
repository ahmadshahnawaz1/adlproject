/**
 * duas.ts — the supplications of fasting, with transliteration, translation
 * and evidence. Read by the Duʿā cards in the Fasting & Ramadan hub.
 */
import type { Daleel } from './fasting';

export type Dua = {
  id: string;
  title: string;
  when: string;
  arabic: string;
  transliteration: string;
  translation: string;
  daleel?: Daleel;
};

export const FASTING_DUAS: Dua[] = [
  {
    id: 'niyyah',
    title: 'Intention for fasting',
    when: 'Before dawn (night before)',
    arabic: 'وَبِصَوْمِ غَدٍ نَوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
    transliteration: 'Wa bi-ṣawmi ghadin nawaytu min shahri Ramaḍān',
    translation: 'And I intend to fast tomorrow of the month of Ramadan.',
    daleel: {
      source: 'hadith',
      reference: 'Sunan an-Nasāʾī 2333',
      narrator: 'Ḥafṣah',
      grade: 'Ṣaḥīḥ',
      text: 'Whoever does not resolve to fast before dawn has no fast — the intention is by the heart; this wording is a means of affirming it.',
    },
  },
  {
    id: 'iftar-thirst',
    title: 'Duʿā at breaking the fast',
    when: 'At sunset (Maghrib)',
    arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
    transliteration: 'Dhahaba aẓ-ẓamaʾu wa-btallati-l-ʿurūqu wa thabata-l-ajru in shāʾa-llāh',
    translation: 'The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills.',
    daleel: {
      source: 'hadith',
      reference: 'Sunan Abī Dāwūd 2357',
      narrator: 'Ibn ʿUmar',
      grade: 'Ḥasan',
      text: 'The Prophet ﷺ would say this when he broke his fast.',
    },
  },
  {
    id: 'iftar-laka',
    title: 'Duʿā of breaking (to Allah)',
    when: 'At sunset (Maghrib)',
    arabic: 'اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    transliteration: 'Allāhumma laka ṣumtu wa ʿalā rizqika afṭartu',
    translation: 'O Allah, for You I have fasted, and with Your provision I break my fast.',
    daleel: {
      source: 'hadith',
      reference: 'Sunan Abī Dāwūd 2358',
      narrator: 'Muʿādh ibn Zuhrah',
      grade: 'Mursal',
      text: 'When the Prophet ﷺ broke his fast he would say this; a widely-recited supplication.',
    },
  },
  {
    id: 'qadr',
    title: 'Duʿā of Laylatul-Qadr',
    when: 'The odd nights of the last ten',
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    transliteration: 'Allāhumma innaka ʿafuwwun tuḥibbu-l-ʿafwa faʿfu ʿannī',
    translation: 'O Allah, You are Most Pardoning and love to pardon, so pardon me.',
    daleel: {
      source: 'hadith',
      reference: 'Jāmiʿ at-Tirmidhī 3513',
      narrator: 'ʿĀʾishah',
      grade: 'Ṣaḥīḥ',
      text: 'I asked: O Messenger of Allah, if I find Laylatul-Qadr, what shall I say? He said: say this.',
    },
  },
];

/** The takbīr of Eid, recited from the night before until the Eid prayer. */
export const EID_TAKBIR: Dua = {
  id: 'takbir',
  title: 'Takbīr of Eid',
  when: 'From sunset before Eid until the prayer',
  arabic: 'اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ لَا إِلَٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ',
  transliteration: 'Allāhu akbar, Allāhu akbar, lā ilāha illa-llāh, wa-llāhu akbar, Allāhu akbar, wa lillāhi-l-ḥamd',
  translation: 'Allah is the Greatest, Allah is the Greatest, there is no god but Allah; Allah is the Greatest, Allah is the Greatest, and to Allah belongs all praise.',
  daleel: {
    source: 'quran',
    reference: 'al-Baqarah 2:185',
    text: '…that you complete the number and magnify Allah for having guided you, and that you may be grateful.',
  },
};
