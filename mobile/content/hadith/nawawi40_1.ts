/**
 * content/hadith/nawawi40_1.ts — al-Nawawī's Forty, narrations 1–21.
 *
 * The most beloved primer of the Sunnah: a complete, authentic collection of
 * comprehensive prophetic traditions gathered by Imām al-Nawawī. Each carries
 * its Arabic, a translation, its narrator, and its grade with source. Continued
 * in nawawi40_2.ts. Pending final scholarly review.
 */
import type { Hadith } from './types';

export const NAWAWI_40_PART1: Hadith[] = [
  {
    id: 'nawawi-1',
    collectionId: 'nawawi40',
    number: 1,
    chapter: 'Deeds are by intentions',
    arabic:
      'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ.',
    translation:
      'Actions are but by intentions, and every person shall have only what they intended. So whoever migrated for Allah and His Messenger, his migration is for Allah and His Messenger; and whoever migrated for some worldly gain or a woman to marry, his migration is for that to which he migrated.',
    narrator: 'ʿUmar ibn al-Khaṭṭāb',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 1', 'Muslim 1907'],
    topics: ['intention', 'character'],
  },
  {
    id: 'nawawi-2',
    collectionId: 'nawawi40',
    number: 2,
    chapter: 'Islam, Īmān and Iḥsān (the ḥadīth of Jibrīl)',
    arabic:
      'الْإِسْلَامُ أَنْ تَشْهَدَ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَتُقِيمَ الصَّلَاةَ، وَتُؤْتِيَ الزَّكَاةَ، وَتَصُومَ رَمَضَانَ، وَتَحُجَّ الْبَيْتَ إِنِ اسْتَطَعْتَ إِلَيْهِ سَبِيلًا… وَالْإِحْسَانُ أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ.',
    translation:
      'Islam is to testify that there is no deity but Allah and that Muḥammad is the Messenger of Allah, to establish the prayer, give zakāh, fast Ramaḍān, and make pilgrimage to the House if able. …And iḥsān is to worship Allah as though you see Him, and though you do not see Him, He surely sees you.',
    narrator: 'ʿUmar ibn al-Khaṭṭāb',
    grade: { ruling: 'sahih', grader: 'Muslim' },
    references: ['Muslim 8'],
    topics: ['faith', 'worship', 'ihsan'],
  },
  {
    id: 'nawawi-3',
    collectionId: 'nawawi40',
    number: 3,
    chapter: 'The pillars of Islam',
    arabic:
      'بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَحَجِّ الْبَيْتِ، وَصَوْمِ رَمَضَانَ.',
    translation:
      'Islam is built upon five: the testimony that there is no deity but Allah and that Muḥammad is the Messenger of Allah, establishing the prayer, giving zakāh, pilgrimage to the House, and fasting Ramaḍān.',
    narrator: 'ʿAbdullāh ibn ʿUmar',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 8', 'Muslim 16'],
    topics: ['faith', 'worship'],
  },
  {
    id: 'nawawi-4',
    collectionId: 'nawawi40',
    number: 4,
    chapter: 'Creation and the decree',
    arabic:
      'إِنَّ أَحَدَكُمْ يُجْمَعُ خَلْقُهُ فِي بَطْنِ أُمِّهِ أَرْبَعِينَ يَوْمًا نُطْفَةً، ثُمَّ يَكُونُ عَلَقَةً مِثْلَ ذَلِكَ، ثُمَّ يَكُونُ مُضْغَةً مِثْلَ ذَلِكَ، ثُمَّ يُرْسَلُ إِلَيْهِ الْمَلَكُ فَيَنْفُخُ فِيهِ الرُّوحَ، وَيُؤْمَرُ بِأَرْبَعِ كَلِمَاتٍ: بِكَتْبِ رِزْقِهِ وَأَجَلِهِ وَعَمَلِهِ وَشَقِيٍّ أَوْ سَعِيدٍ.',
    translation:
      'Each of you is gathered in creation in his mother’s womb for forty days as a drop, then a clinging clot for a like period, then a lump for a like period; then an angel is sent to breathe the soul into him and is commanded with four matters: to write his provision, his lifespan, his deeds, and whether he will be wretched or blessed.',
    narrator: 'ʿAbdullāh ibn Masʿūd',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 3208', 'Muslim 2643'],
    topics: ['qadar', 'faith'],
  },
  {
    id: 'nawawi-5',
    collectionId: 'nawawi40',
    number: 5,
    chapter: 'Rejecting innovation',
    arabic: 'مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ.',
    translation:
      'Whoever introduces into this affair of ours something that is not part of it, it is rejected.',
    narrator: 'ʿĀʾishah',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 2697', 'Muslim 1718'],
    topics: ['sunnah', 'innovation'],
  },
  {
    id: 'nawawi-6',
    collectionId: 'nawawi40',
    number: 6,
    chapter: 'The lawful and the doubtful',
    arabic:
      'إِنَّ الْحَلَالَ بَيِّنٌ وَإِنَّ الْحَرَامَ بَيِّنٌ، وَبَيْنَهُمَا أُمُورٌ مُشْتَبِهَاتٌ لَا يَعْلَمُهُنَّ كَثِيرٌ مِنَ النَّاسِ، فَمَنِ اتَّقَى الشُّبُهَاتِ فَقَدِ اسْتَبْرَأَ لِدِينِهِ وَعِرْضِهِ… أَلَا وَإِنَّ فِي الْجَسَدِ مُضْغَةً إِذَا صَلَحَتْ صَلَحَ الْجَسَدُ كُلُّهُ، وَإِذَا فَسَدَتْ فَسَدَ الْجَسَدُ كُلُّهُ، أَلَا وَهِيَ الْقَلْبُ.',
    translation:
      'The lawful is clear and the unlawful is clear, and between them are doubtful matters unknown to many people. Whoever guards against the doubtful has protected his religion and honour. …Truly in the body is a morsel of flesh which, if sound, the whole body is sound, and if corrupt, the whole body is corrupt. Truly it is the heart.',
    narrator: 'al-Nuʿmān ibn Bashīr',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 52', 'Muslim 1599'],
    topics: ['halal-haram', 'heart', 'taqwa'],
  },
  {
    id: 'nawawi-7',
    collectionId: 'nawawi40',
    number: 7,
    chapter: 'Religion is sincerity',
    arabic: 'الدِّينُ النَّصِيحَةُ. قُلْنَا: لِمَنْ؟ قَالَ: لِلَّهِ، وَلِكِتَابِهِ، وَلِرَسُولِهِ، وَلِأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ.',
    translation:
      'Religion is sincerity (naṣīḥah). We said: To whom? He said: To Allah, to His Book, to His Messenger, to the leaders of the Muslims, and to their common folk.',
    narrator: 'Tamīm al-Dārī',
    grade: { ruling: 'sahih', grader: 'Muslim' },
    references: ['Muslim 55'],
    topics: ['sincerity', 'character'],
  },
  {
    id: 'nawawi-8',
    collectionId: 'nawawi40',
    number: 8,
    chapter: 'The sanctity of the Muslim',
    arabic:
      'أُمِرْتُ أَنْ أُقَاتِلَ النَّاسَ حَتَّى يَشْهَدُوا أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَيُقِيمُوا الصَّلَاةَ، وَيُؤْتُوا الزَّكَاةَ، فَإِذَا فَعَلُوا ذَلِكَ عَصَمُوا مِنِّي دِمَاءَهُمْ وَأَمْوَالَهُمْ إِلَّا بِحَقِّ الْإِسْلَامِ، وَحِسَابُهُمْ عَلَى اللَّهِ.',
    translation:
      'I have been commanded to fight the people until they testify that there is no deity but Allah and that Muḥammad is the Messenger of Allah, establish the prayer and give zakāh. If they do so, they have protected their lives and property from me except by the right of Islam, and their reckoning is with Allah.',
    narrator: 'ʿAbdullāh ibn ʿUmar',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 25', 'Muslim 22'],
    topics: ['faith', 'rights'],
  },
  {
    id: 'nawawi-9',
    collectionId: 'nawawi40',
    number: 9,
    chapter: 'Do what you are able',
    arabic:
      'مَا نَهَيْتُكُمْ عَنْهُ فَاجْتَنِبُوهُ، وَمَا أَمَرْتُكُمْ بِهِ فَأْتُوا مِنْهُ مَا اسْتَطَعْتُمْ، فَإِنَّمَا أَهْلَكَ الَّذِينَ مِنْ قَبْلِكُمْ كَثْرَةُ مَسَائِلِهِمْ وَاخْتِلَافُهُمْ عَلَى أَنْبِيَائِهِمْ.',
    translation:
      'What I have forbidden you, avoid; and what I have commanded you, do as much of it as you can. For those before you were destroyed only by their excessive questioning and their disagreement with their prophets.',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 7288', 'Muslim 1337'],
    topics: ['obedience', 'ease'],
  },
  {
    id: 'nawawi-10',
    collectionId: 'nawawi40',
    number: 10,
    chapter: 'Allah is good and accepts only good',
    arabic:
      'إِنَّ اللَّهَ طَيِّبٌ لَا يَقْبَلُ إِلَّا طَيِّبًا، وَإِنَّ اللَّهَ أَمَرَ الْمُؤْمِنِينَ بِمَا أَمَرَ بِهِ الْمُرْسَلِينَ… ثُمَّ ذَكَرَ الرَّجُلَ يُطِيلُ السَّفَرَ أَشْعَثَ أَغْبَرَ يَمُدُّ يَدَيْهِ إِلَى السَّمَاءِ: يَا رَبِّ، يَا رَبِّ، وَمَطْعَمُهُ حَرَامٌ وَمَشْرَبُهُ حَرَامٌ… فَأَنَّى يُسْتَجَابُ لَهُ؟',
    translation:
      'Allah is Good and accepts only what is good. Allah has commanded the believers with what He commanded the messengers. …Then he mentioned a man, dishevelled and dusty from long travel, stretching his hands to the sky: “O Lord, O Lord,” while his food is unlawful, his drink unlawful, and he is nourished by the unlawful — so how can he be answered?',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'Muslim' },
    references: ['Muslim 1015'],
    topics: ['halal-haram', 'dua', 'sincerity'],
  },
  {
    id: 'nawawi-11',
    collectionId: 'nawawi40',
    number: 11,
    chapter: 'Leave what makes you doubt',
    arabic: 'دَعْ مَا يَرِيبُكَ إِلَى مَا لَا يَرِيبُكَ.',
    translation: 'Leave that which makes you doubt for that which does not make you doubt.',
    narrator: 'al-Ḥasan ibn ʿAlī',
    grade: { ruling: 'sahih', grader: 'al-Tirmidhī', source: 'Ṣaḥīḥ' },
    references: ['al-Tirmidhī 2518', 'al-Nasāʾī 5711'],
    topics: ['doubt', 'taqwa'],
  },
  {
    id: 'nawawi-12',
    collectionId: 'nawawi40',
    number: 12,
    chapter: 'Leaving what does not concern you',
    arabic: 'مِنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ.',
    translation:
      'Part of a person’s excellence in Islam is his leaving what does not concern him.',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'hasan', grader: 'al-Tirmidhī' },
    references: ['al-Tirmidhī 2317', 'Ibn Mājah 3976'],
    topics: ['character', 'restraint'],
  },
  {
    id: 'nawawi-13',
    collectionId: 'nawawi40',
    number: 13,
    chapter: 'Love for your brother',
    arabic: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.',
    translation:
      'None of you truly believes until he loves for his brother what he loves for himself.',
    narrator: 'Anas ibn Mālik',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 13', 'Muslim 45'],
    topics: ['brotherhood', 'faith'],
  },
  {
    id: 'nawawi-14',
    collectionId: 'nawawi40',
    number: 14,
    chapter: 'The sanctity of Muslim blood',
    arabic:
      'لَا يَحِلُّ دَمُ امْرِئٍ مُسْلِمٍ إِلَّا بِإِحْدَى ثَلَاثٍ: الثَّيِّبُ الزَّانِي، وَالنَّفْسُ بِالنَّفْسِ، وَالتَّارِكُ لِدِينِهِ الْمُفَارِقُ لِلْجَمَاعَةِ.',
    translation:
      'The blood of a Muslim is not lawful except in one of three cases: a married person who commits adultery, a life for a life, and one who forsakes his religion and abandons the community.',
    narrator: 'ʿAbdullāh ibn Masʿūd',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 6878', 'Muslim 1676'],
    topics: ['rights', 'justice'],
  },
  {
    id: 'nawawi-15',
    collectionId: 'nawawi40',
    number: 15,
    chapter: 'Speak good or be silent',
    arabic:
      'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ ضَيْفَهُ.',
    translation:
      'Whoever believes in Allah and the Last Day, let him speak good or remain silent. Whoever believes in Allah and the Last Day, let him honour his neighbour. And whoever believes in Allah and the Last Day, let him honour his guest.',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 6018', 'Muslim 47'],
    topics: ['speech', 'character', 'neighbours'],
  },
  {
    id: 'nawawi-16',
    collectionId: 'nawawi40',
    number: 16,
    chapter: 'Do not become angry',
    arabic: 'لَا تَغْضَبْ. فَرَدَّدَ مِرَارًا، قَالَ: لَا تَغْضَبْ.',
    translation:
      'A man said, “Advise me.” He said: “Do not become angry.” The man repeated his request several times, and each time he said: “Do not become angry.”',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī' },
    references: ['al-Bukhārī 6116'],
    topics: ['character', 'anger'],
  },
  {
    id: 'nawawi-17',
    collectionId: 'nawawi40',
    number: 17,
    chapter: 'Excellence in all things',
    arabic:
      'إِنَّ اللَّهَ كَتَبَ الْإِحْسَانَ عَلَى كُلِّ شَيْءٍ، فَإِذَا قَتَلْتُمْ فَأَحْسِنُوا الْقِتْلَةَ، وَإِذَا ذَبَحْتُمْ فَأَحْسِنُوا الذِّبْحَةَ، وَلْيُحِدَّ أَحَدُكُمْ شَفْرَتَهُ وَلْيُرِحْ ذَبِيحَتَهُ.',
    translation:
      'Allah has prescribed excellence (iḥsān) in all things. So when you kill, kill well; and when you slaughter, slaughter well. Let one of you sharpen his blade and put his animal at ease.',
    narrator: 'Shaddād ibn Aws',
    grade: { ruling: 'sahih', grader: 'Muslim' },
    references: ['Muslim 1955'],
    topics: ['ihsan', 'mercy'],
  },
  {
    id: 'nawawi-18',
    collectionId: 'nawawi40',
    number: 18,
    chapter: 'Fear Allah wherever you are',
    arabic:
      'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ.',
    translation:
      'Fear Allah wherever you are, follow a bad deed with a good one to wipe it out, and treat people with good character.',
    narrator: 'Abū Dharr & Muʿādh ibn Jabal',
    grade: { ruling: 'hasan', grader: 'al-Tirmidhī' },
    references: ['al-Tirmidhī 1987'],
    topics: ['taqwa', 'character', 'repentance'],
  },
  {
    id: 'nawawi-19',
    collectionId: 'nawawi40',
    number: 19,
    chapter: 'Be mindful of Allah',
    arabic:
      'يَا غُلَامُ، إِنِّي أُعَلِّمُكَ كَلِمَاتٍ: احْفَظِ اللَّهَ يَحْفَظْكَ، احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ… وَاعْلَمْ أَنَّ الْأُمَّةَ لَوِ اجْتَمَعَتْ عَلَى أَنْ يَنْفَعُوكَ بِشَيْءٍ لَمْ يَنْفَعُوكَ إِلَّا بِشَيْءٍ قَدْ كَتَبَهُ اللَّهُ لَكَ.',
    translation:
      'O young man, I will teach you some words: Be mindful of Allah and He will protect you; be mindful of Allah and you will find Him before you. …Know that if the whole nation gathered to benefit you, they could not benefit you except with what Allah has already written for you.',
    narrator: 'ʿAbdullāh ibn ʿAbbās',
    grade: { ruling: 'hasan-sahih', grader: 'al-Tirmidhī' },
    references: ['al-Tirmidhī 2516'],
    topics: ['tawakkul', 'qadar', 'faith'],
  },
  {
    id: 'nawawi-20',
    collectionId: 'nawawi40',
    number: 20,
    chapter: 'Modesty',
    arabic: 'إِنَّ مِمَّا أَدْرَكَ النَّاسُ مِنْ كَلَامِ النُّبُوَّةِ الْأُولَى: إِذَا لَمْ تَسْتَحِ فَاصْنَعْ مَا شِئْتَ.',
    translation:
      'Among what people have grasped from the words of the earlier prophethood is: If you feel no shame, then do as you wish.',
    narrator: 'Abū Masʿūd al-Badrī',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī' },
    references: ['al-Bukhārī 3483'],
    topics: ['modesty', 'character'],
  },
  {
    id: 'nawawi-21',
    collectionId: 'nawawi40',
    number: 21,
    chapter: 'Steadfastness',
    arabic: 'قُلْ آمَنْتُ بِاللَّهِ ثُمَّ اسْتَقِمْ.',
    translation: 'Say, “I believe in Allah,” and then be steadfast.',
    narrator: 'Sufyān ibn ʿAbdillāh',
    grade: { ruling: 'sahih', grader: 'Muslim' },
    references: ['Muslim 38'],
    topics: ['faith', 'steadfastness'],
  },
];
