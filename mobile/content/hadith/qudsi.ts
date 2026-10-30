/**
 * content/hadith/qudsi.ts — selected authentic Aḥādīth Qudsī.
 *
 * Sacred narrations in which the Prophet ﷺ relates the words of Allah. A
 * curated, authentic set (distinct from those already in al-Nawawī's Forty),
 * each with its grade and source. Pending final scholarly review.
 */
import type { Hadith } from './types';

export const QUDSI: Hadith[] = [
  {
    id: 'qudsi-1',
    collectionId: 'qudsi',
    number: 1,
    chapter: 'As My servant expects of Me',
    arabic:
      'أَنَا عِنْدَ ظَنِّ عَبْدِي بِي، وَأَنَا مَعَهُ إِذَا ذَكَرَنِي، فَإِنْ ذَكَرَنِي فِي نَفْسِهِ ذَكَرْتُهُ فِي نَفْسِي، وَإِنْ ذَكَرَنِي فِي مَلَإٍ ذَكَرْتُهُ فِي مَلَإٍ خَيْرٍ مِنْهُمْ.',
    translation:
      'I am as My servant expects Me to be, and I am with him when he remembers Me. If he remembers Me within himself, I remember him within Myself; and if he remembers Me in a gathering, I remember him in a better gathering.',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 7405', 'Muslim 2675'],
    topics: ['dhikr', 'hope', 'qudsi'],
  },
  {
    id: 'qudsi-2',
    collectionId: 'qudsi',
    number: 2,
    chapter: 'My mercy prevails',
    arabic: 'إِنَّ رَحْمَتِي تَغْلِبُ غَضَبِي.',
    translation: 'Indeed My mercy prevails over My wrath.',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 7404', 'Muslim 2751'],
    topics: ['mercy', 'qudsi'],
  },
  {
    id: 'qudsi-3',
    collectionId: 'qudsi',
    number: 3,
    chapter: 'The reward of fasting',
    arabic:
      'كُلُّ عَمَلِ ابْنِ آدَمَ لَهُ إِلَّا الصِّيَامَ، فَإِنَّهُ لِي وَأَنَا أَجْزِي بِهِ. وَالصِّيَامُ جُنَّةٌ… وَلَخُلُوفُ فَمِ الصَّائِمِ أَطْيَبُ عِنْدَ اللَّهِ مِنْ رِيحِ الْمِسْكِ.',
    translation:
      'Every deed of the son of Ādam is for him except fasting; it is for Me, and I shall reward it. Fasting is a shield… and the breath of the fasting person is more fragrant to Allah than the scent of musk.',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 1904', 'Muslim 1151'],
    topics: ['fasting', 'reward', 'qudsi'],
  },
  {
    id: 'qudsi-4',
    collectionId: 'qudsi',
    number: 4,
    chapter: 'What no eye has seen',
    arabic:
      'أَعْدَدْتُ لِعِبَادِي الصَّالِحِينَ مَا لَا عَيْنٌ رَأَتْ، وَلَا أُذُنٌ سَمِعَتْ، وَلَا خَطَرَ عَلَى قَلْبِ بَشَرٍ.',
    translation:
      'I have prepared for My righteous servants what no eye has seen, no ear has heard, and no heart has conceived.',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 3244', 'Muslim 2824'],
    topics: ['paradise', 'reward', 'qudsi'],
  },
  {
    id: 'qudsi-5',
    collectionId: 'qudsi',
    number: 5,
    chapter: 'Pride is My cloak',
    arabic: 'الْكِبْرِيَاءُ رِدَائِي، وَالْعَظَمَةُ إِزَارِي، فَمَنْ نَازَعَنِي وَاحِدًا مِنْهُمَا عَذَّبْتُهُ.',
    translation:
      'Pride is My cloak and greatness is My garment; whoever contends with Me over either of them, I shall punish him.',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'Muslim' },
    references: ['Muslim 2620', 'Abū Dāwūd 4090'],
    topics: ['humility', 'qudsi'],
  },
  {
    id: 'qudsi-6',
    collectionId: 'qudsi',
    number: 6,
    chapter: 'Drawing near',
    arabic:
      'مَنْ تَقَرَّبَ إِلَيَّ شِبْرًا تَقَرَّبْتُ إِلَيْهِ ذِرَاعًا، وَمَنْ تَقَرَّبَ إِلَيَّ ذِرَاعًا تَقَرَّبْتُ إِلَيْهِ بَاعًا، وَمَنْ أَتَانِي يَمْشِي أَتَيْتُهُ هَرْوَلَةً.',
    translation:
      'Whoever draws near to Me a hand-span, I draw near to him an arm’s length; whoever draws near to Me an arm’s length, I draw near to him a fathom; and whoever comes to Me walking, I come to him running.',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 7536', 'Muslim 2675'],
    topics: ['nearness', 'mercy', 'qudsi'],
  },
  {
    id: 'qudsi-7',
    collectionId: 'qudsi',
    number: 7,
    chapter: 'Spend, and I shall spend on you',
    arabic: 'أَنْفِقْ يَا ابْنَ آدَمَ أُنْفِقْ عَلَيْكَ.',
    translation: 'Spend, O son of Ādam, and I shall spend on you.',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 5352', 'Muslim 993'],
    topics: ['charity', 'provision', 'qudsi'],
  },
  {
    id: 'qudsi-8',
    collectionId: 'qudsi',
    number: 8,
    chapter: 'Visiting the sick',
    arabic:
      'يَا ابْنَ آدَمَ، مَرِضْتُ فَلَمْ تَعُدْنِي… أَمَا عَلِمْتَ أَنَّ عَبْدِي فُلَانًا مَرِضَ فَلَمْ تَعُدْهُ؟ أَمَا عَلِمْتَ أَنَّكَ لَوْ عُدْتَهُ لَوَجَدْتَنِي عِنْدَهُ؟',
    translation:
      'O son of Ādam, I fell ill and you did not visit Me. …Did you not know that My servant so-and-so fell ill and you did not visit him? Did you not know that had you visited him, you would have found Me with him?',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'Muslim' },
    references: ['Muslim 2569'],
    topics: ['mercy', 'compassion', 'qudsi'],
  },
  {
    id: 'qudsi-9',
    collectionId: 'qudsi',
    number: 9,
    chapter: 'Do not revile Time',
    arabic:
      'يُؤْذِينِي ابْنُ آدَمَ يَسُبُّ الدَّهْرَ، وَأَنَا الدَّهْرُ، بِيَدِي الْأَمْرُ، أُقَلِّبُ اللَّيْلَ وَالنَّهَارَ.',
    translation:
      'The son of Ādam offends Me by reviling Time, yet I am Time: in My Hand is the command; I alternate the night and the day.',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 4826', 'Muslim 2246'],
    topics: ['qadar', 'qudsi'],
  },
  {
    id: 'qudsi-10',
    collectionId: 'qudsi',
    number: 10,
    chapter: 'The multiplied reward',
    arabic:
      'مَنْ جَاءَ بِالْحَسَنَةِ فَلَهُ عَشْرُ أَمْثَالِهَا وَأَزِيدُ، وَمَنْ جَاءَ بِالسَّيِّئَةِ فَجَزَاءُ سَيِّئَةٍ مِثْلُهَا أَوْ أَغْفِرُ.',
    translation:
      'Whoever brings a good deed shall have tenfold its like and more; and whoever brings an evil deed, its recompense is the like of it, or I forgive.',
    narrator: 'Abū Dharr',
    grade: { ruling: 'sahih', grader: 'Muslim' },
    references: ['Muslim 2687'],
    topics: ['reward', 'forgiveness', 'qudsi'],
  },
  {
    id: 'qudsi-11',
    collectionId: 'qudsi',
    number: 11,
    chapter: 'The call to forgiveness',
    arabic:
      'يَنْزِلُ رَبُّنَا كُلَّ لَيْلَةٍ إِلَى السَّمَاءِ الدُّنْيَا حِينَ يَبْقَى ثُلُثُ اللَّيْلِ الْآخِرُ، يَقُولُ: مَنْ يَدْعُونِي فَأَسْتَجِيبَ لَهُ، مَنْ يَسْأَلُنِي فَأُعْطِيَهُ، مَنْ يَسْتَغْفِرُنِي فَأَغْفِرَ لَهُ.',
    translation:
      'Our Lord descends each night to the lowest heaven when the last third of the night remains, saying: “Who is calling upon Me that I may answer him? Who is asking of Me that I may give him? Who is seeking My forgiveness that I may forgive him?”',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 1145', 'Muslim 758'],
    topics: ['dua', 'night-prayer', 'qudsi'],
  },
  {
    id: 'qudsi-12',
    collectionId: 'qudsi',
    number: 12,
    chapter: 'The two fears',
    arabic:
      'وَعِزَّتِي، لَا أَجْمَعُ عَلَى عَبْدِي خَوْفَيْنِ وَأَمْنَيْنِ: إِذَا خَافَنِي فِي الدُّنْيَا أَمَّنْتُهُ يَوْمَ الْقِيَامَةِ، وَإِذَا أَمِنَنِي فِي الدُّنْيَا أَخَفْتُهُ يَوْمَ الْقِيَامَةِ.',
    translation:
      'By My might, I will not combine two fears and two securities in My servant: if he fears Me in this world, I grant him security on the Day of Resurrection; and if he feels secure from Me in this world, I make him fear on the Day of Resurrection.',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'hasan', grader: 'Ibn Ḥibbān' },
    references: ['Ibn Ḥibbān 640'],
    topics: ['fear', 'hope', 'qudsi'],
  },
];
