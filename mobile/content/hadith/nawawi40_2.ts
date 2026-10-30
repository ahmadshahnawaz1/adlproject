/**
 * content/hadith/nawawi40_2.ts — al-Nawawī's Forty, narrations 22–42.
 * Continues nawawi40_1.ts. Several here are aḥādīth qudsī. Pending review.
 */
import type { Hadith } from './types';

export const NAWAWI_40_PART2: Hadith[] = [
  {
    id: 'nawawi-22',
    collectionId: 'nawawi40',
    number: 22,
    chapter: 'The road to Paradise',
    arabic:
      'أَرَأَيْتَ إِذَا صَلَّيْتُ الْمَكْتُوبَاتِ، وَصُمْتُ رَمَضَانَ، وَأَحْلَلْتُ الْحَلَالَ، وَحَرَّمْتُ الْحَرَامَ، وَلَمْ أَزِدْ عَلَى ذَلِكَ شَيْئًا، أَأَدْخُلُ الْجَنَّةَ؟ قَالَ: نَعَمْ.',
    translation:
      'A man asked: “If I pray the obligatory prayers, fast Ramaḍān, treat the lawful as lawful and the unlawful as unlawful, and add nothing to that — shall I enter Paradise?” He said: “Yes.”',
    narrator: 'Jābir ibn ʿAbdillāh',
    grade: { ruling: 'sahih', grader: 'Muslim' },
    references: ['Muslim 15'],
    topics: ['worship', 'paradise'],
  },
  {
    id: 'nawawi-23',
    collectionId: 'nawawi40',
    number: 23,
    chapter: 'Purity is half of faith',
    arabic:
      'الطُّهُورُ شَطْرُ الْإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلَأُ الْمِيزَانَ، وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلَآنِ — أَوْ تَمْلَأُ — مَا بَيْنَ السَّمَاءِ وَالْأَرْضِ… وَالْقُرْآنُ حُجَّةٌ لَكَ أَوْ عَلَيْكَ. كُلُّ النَّاسِ يَغْدُو، فَبَائِعٌ نَفْسَهُ فَمُعْتِقُهَا أَوْ مُوبِقُهَا.',
    translation:
      'Purity is half of faith. “Al-ḥamdu lillāh” fills the scale, and “subḥān Allāh” and “al-ḥamdu lillāh” fill what is between the heavens and the earth. …The Qurʾān is a proof for you or against you. Every person sets out and sells his soul, either freeing it or destroying it.',
    narrator: 'Abū Mālik al-Ashʿarī',
    grade: { ruling: 'sahih', grader: 'Muslim' },
    references: ['Muslim 223'],
    topics: ['purification', 'dhikr', 'quran'],
  },
  {
    id: 'nawawi-24',
    collectionId: 'nawawi40',
    number: 24,
    chapter: 'Allah forbade injustice (ḥadīth qudsī)',
    arabic:
      'يَا عِبَادِي، إِنِّي حَرَّمْتُ الظُّلْمَ عَلَى نَفْسِي وَجَعَلْتُهُ بَيْنَكُمْ مُحَرَّمًا، فَلَا تَظَالَمُوا… يَا عِبَادِي، إِنَّمَا هِيَ أَعْمَالُكُمْ أُحْصِيهَا لَكُمْ ثُمَّ أُوَفِّيكُمْ إِيَّاهَا، فَمَنْ وَجَدَ خَيْرًا فَلْيَحْمَدِ اللَّهَ، وَمَنْ وَجَدَ غَيْرَ ذَلِكَ فَلَا يَلُومَنَّ إِلَّا نَفْسَهُ.',
    translation:
      'O My servants, I have forbidden injustice for Myself and made it forbidden among you, so do not wrong one another. …O My servants, it is only your deeds that I record for you, then repay you for them. So whoever finds good, let him praise Allah; and whoever finds otherwise, let him blame none but himself.',
    narrator: 'Abū Dharr al-Ghifārī',
    grade: { ruling: 'sahih', grader: 'Muslim' },
    references: ['Muslim 2577'],
    topics: ['justice', 'qudsi', 'accountability'],
  },
  {
    id: 'nawawi-25',
    collectionId: 'nawawi40',
    number: 25,
    chapter: 'Every good deed is charity',
    arabic:
      'أَلَيْسَ قَدْ جَعَلَ اللَّهُ لَكُمْ مَا تَصَّدَّقُونَ؟ إِنَّ بِكُلِّ تَسْبِيحَةٍ صَدَقَةً، وَكُلِّ تَكْبِيرَةٍ صَدَقَةً، وَكُلِّ تَحْمِيدَةٍ صَدَقَةً، وَكُلِّ تَهْلِيلَةٍ صَدَقَةً، وَأَمْرٍ بِالْمَعْرُوفِ صَدَقَةً، وَنَهْيٍ عَنِ الْمُنْكَرِ صَدَقَةً، وَفِي بُضْعِ أَحَدِكُمْ صَدَقَةٌ.',
    translation:
      'Has Allah not given you means to give charity? Every “subḥān Allāh” is charity, every “Allāhu akbar” is charity, every “al-ḥamdu lillāh” is charity, every “lā ilāha illā Allāh” is charity, enjoining good is charity, forbidding evil is charity — and even in a man’s intimacy with his wife there is charity.',
    narrator: 'Abū Dharr al-Ghifārī',
    grade: { ruling: 'sahih', grader: 'Muslim' },
    references: ['Muslim 1006'],
    topics: ['charity', 'dhikr'],
  },
  {
    id: 'nawawi-26',
    collectionId: 'nawawi40',
    number: 26,
    chapter: 'Charity upon every joint',
    arabic:
      'كُلُّ سُلَامَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ، كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ: تَعْدِلُ بَيْنَ اثْنَيْنِ صَدَقَةٌ، وَتُعِينُ الرَّجُلَ فِي دَابَّتِهِ… وَالْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ، وَبِكُلِّ خُطْوَةٍ تَمْشِيهَا إِلَى الصَّلَاةِ صَدَقَةٌ، وَتُمِيطُ الْأَذَى عَنِ الطَّرِيقِ صَدَقَةٌ.',
    translation:
      'Every joint of a person owes charity each day the sun rises: to judge justly between two is charity; to help a man with his mount is charity; a good word is charity; every step you take to prayer is charity; and removing harm from the road is charity.',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 2989', 'Muslim 1009'],
    topics: ['charity', 'character'],
  },
  {
    id: 'nawawi-27',
    collectionId: 'nawawi40',
    number: 27,
    chapter: 'Righteousness and sin',
    arabic:
      'الْبِرُّ حُسْنُ الْخُلُقِ، وَالْإِثْمُ مَا حَاكَ فِي نَفْسِكَ وَكَرِهْتَ أَنْ يَطَّلِعَ عَلَيْهِ النَّاسُ.',
    translation:
      'Righteousness is good character, and sin is what wavers in your soul and which you would hate for people to discover.',
    narrator: 'al-Nawwās ibn Samʿān',
    grade: { ruling: 'sahih', grader: 'Muslim' },
    references: ['Muslim 2553'],
    topics: ['character', 'conscience'],
  },
  {
    id: 'nawawi-28',
    collectionId: 'nawawi40',
    number: 28,
    chapter: 'Holding to the Sunnah',
    arabic:
      'أُوصِيكُمْ بِتَقْوَى اللَّهِ، وَالسَّمْعِ وَالطَّاعَةِ… فَعَلَيْكُمْ بِسُنَّتِي وَسُنَّةِ الْخُلَفَاءِ الرَّاشِدِينَ الْمَهْدِيِّينَ، عَضُّوا عَلَيْهَا بِالنَّوَاجِذِ، وَإِيَّاكُمْ وَمُحْدَثَاتِ الْأُمُورِ، فَإِنَّ كُلَّ بِدْعَةٍ ضَلَالَةٌ.',
    translation:
      'I advise you to fear Allah and to hear and obey. …Hold fast to my Sunnah and the Sunnah of the rightly-guided successors; bite onto it with your molars. And beware of newly-invented matters, for every innovation is misguidance.',
    narrator: 'al-ʿIrbāḍ ibn Sāriyah',
    grade: { ruling: 'sahih', grader: 'al-Tirmidhī', source: 'Ḥasan ṣaḥīḥ' },
    references: ['Abū Dāwūd 4607', 'al-Tirmidhī 2676'],
    topics: ['sunnah', 'obedience', 'innovation'],
  },
  {
    id: 'nawawi-29',
    collectionId: 'nawawi40',
    number: 29,
    chapter: 'The gates of goodness',
    arabic:
      'أَلَا أَدُلُّكَ عَلَى أَبْوَابِ الْخَيْرِ؟ الصَّوْمُ جُنَّةٌ، وَالصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ، وَصَلَاةُ الرَّجُلِ فِي جَوْفِ اللَّيْلِ… أَلَا أُخْبِرُكَ بِرَأْسِ الْأَمْرِ وَعَمُودِهِ وَذِرْوَةِ سَنَامِهِ؟ رَأْسُ الْأَمْرِ الْإِسْلَامُ، وَعَمُودُهُ الصَّلَاةُ، وَذِرْوَةُ سَنَامِهِ الْجِهَادُ.',
    translation:
      'Shall I not guide you to the gates of goodness? Fasting is a shield; charity extinguishes sin as water extinguishes fire; and the prayer of a man in the depth of the night. …Shall I not tell you of the head of the matter, its pillar, and its peak? The head of the matter is Islam, its pillar is the prayer, and its peak is jihād.',
    narrator: 'Muʿādh ibn Jabal',
    grade: { ruling: 'hasan-sahih', grader: 'al-Tirmidhī' },
    references: ['al-Tirmidhī 2616'],
    topics: ['worship', 'fasting', 'prayer'],
  },
  {
    id: 'nawawi-30',
    collectionId: 'nawawi40',
    number: 30,
    chapter: 'The limits of Allah',
    arabic:
      'إِنَّ اللَّهَ فَرَضَ فَرَائِضَ فَلَا تُضَيِّعُوهَا، وَحَدَّ حُدُودًا فَلَا تَعْتَدُوهَا، وَحَرَّمَ أَشْيَاءَ فَلَا تَنْتَهِكُوهَا، وَسَكَتَ عَنْ أَشْيَاءَ رَحْمَةً لَكُمْ غَيْرَ نِسْيَانٍ فَلَا تَبْحَثُوا عَنْهَا.',
    translation:
      'Allah has laid down obligations, so do not neglect them; set limits, so do not transgress them; forbidden things, so do not violate them; and remained silent about things out of mercy, not forgetfulness, so do not seek after them.',
    narrator: 'Abū Thaʿlabah al-Khushanī',
    grade: { ruling: 'hasan', grader: 'al-Dāraquṭnī' },
    references: ['al-Dāraquṭnī'],
    topics: ['fiqh', 'limits'],
  },
  {
    id: 'nawawi-31',
    collectionId: 'nawawi40',
    number: 31,
    chapter: 'Detachment from the world',
    arabic:
      'ازْهَدْ فِي الدُّنْيَا يُحِبَّكَ اللَّهُ، وَازْهَدْ فِيمَا عِنْدَ النَّاسِ يُحِبَّكَ النَّاسُ.',
    translation:
      'Be detached from the world and Allah will love you; be detached from what people possess and people will love you.',
    narrator: 'Sahl ibn Saʿd',
    grade: { ruling: 'hasan', grader: 'Ibn Mājah' },
    references: ['Ibn Mājah 4102'],
    topics: ['zuhd', 'character'],
  },
  {
    id: 'nawawi-32',
    collectionId: 'nawawi40',
    number: 32,
    chapter: 'No harm',
    arabic: 'لَا ضَرَرَ وَلَا ضِرَارَ.',
    translation: 'There is to be no harm, nor reciprocating of harm.',
    narrator: 'Abū Saʿīd al-Khudrī',
    grade: { ruling: 'hasan', grader: 'Ibn Mājah' },
    references: ['Ibn Mājah 2341', 'Muwaṭṭaʾ Mālik'],
    topics: ['rights', 'justice'],
  },
  {
    id: 'nawawi-33',
    collectionId: 'nawawi40',
    number: 33,
    chapter: 'The burden of proof',
    arabic:
      'لَوْ يُعْطَى النَّاسُ بِدَعْوَاهُمْ لَادَّعَى رِجَالٌ أَمْوَالَ قَوْمٍ وَدِمَاءَهُمْ، لَكِنَّ الْبَيِّنَةَ عَلَى الْمُدَّعِي وَالْيَمِينَ عَلَى مَنْ أَنْكَرَ.',
    translation:
      'Were people given merely by their claims, some would claim the wealth and blood of others; but the burden of proof is upon the claimant, and the oath is upon the one who denies.',
    narrator: 'ʿAbdullāh ibn ʿAbbās',
    grade: { ruling: 'hasan', grader: 'al-Bayhaqī' },
    references: ['al-Bayhaqī', 'Muslim 1711 (part)'],
    topics: ['justice', 'evidence'],
  },
  {
    id: 'nawawi-34',
    collectionId: 'nawawi40',
    number: 34,
    chapter: 'Changing evil',
    arabic:
      'مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِلِسَانِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِقَلْبِهِ، وَذَلِكَ أَضْعَفُ الْإِيمَانِ.',
    translation:
      'Whoever of you sees an evil, let him change it with his hand; if he cannot, then with his tongue; and if he cannot, then with his heart — and that is the weakest of faith.',
    narrator: 'Abū Saʿīd al-Khudrī',
    grade: { ruling: 'sahih', grader: 'Muslim' },
    references: ['Muslim 49'],
    topics: ['enjoining-good', 'faith'],
  },
  {
    id: 'nawawi-35',
    collectionId: 'nawawi40',
    number: 35,
    chapter: 'Brotherhood',
    arabic:
      'لَا تَحَاسَدُوا، وَلَا تَنَاجَشُوا، وَلَا تَبَاغَضُوا، وَلَا تَدَابَرُوا… وَكُونُوا عِبَادَ اللَّهِ إِخْوَانًا. الْمُسْلِمُ أَخُو الْمُسْلِمِ، لَا يَظْلِمُهُ وَلَا يَخْذُلُهُ وَلَا يَحْقِرُهُ. التَّقْوَى هَاهُنَا — وَيُشِيرُ إِلَى صَدْرِهِ.',
    translation:
      'Do not envy one another, do not artificially inflate prices, do not hate one another, do not turn away from one another; be servants of Allah as brothers. The Muslim is the brother of the Muslim: he does not wrong him, forsake him, or despise him. Piety is here — and he pointed to his chest.',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'Muslim' },
    references: ['Muslim 2564'],
    topics: ['brotherhood', 'character', 'taqwa'],
  },
  {
    id: 'nawawi-36',
    collectionId: 'nawawi40',
    number: 36,
    chapter: 'Relieving the distressed',
    arabic:
      'مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ… وَاللَّهُ فِي عَوْنِ الْعَبْدِ مَا كَانَ الْعَبْدُ فِي عَوْنِ أَخِيهِ. وَمَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ.',
    translation:
      'Whoever relieves a believer of a distress of this world, Allah will relieve him of a distress on the Day of Resurrection. …Allah aids the servant so long as the servant aids his brother. And whoever treads a path seeking knowledge, Allah will make easy for him a path to Paradise.',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'Muslim' },
    references: ['Muslim 2699'],
    topics: ['mercy', 'knowledge', 'brotherhood'],
  },
  {
    id: 'nawawi-37',
    collectionId: 'nawawi40',
    number: 37,
    chapter: 'Good and bad deeds (ḥadīth qudsī)',
    arabic:
      'إِنَّ اللَّهَ كَتَبَ الْحَسَنَاتِ وَالسَّيِّئَاتِ ثُمَّ بَيَّنَ ذَلِكَ: فَمَنْ هَمَّ بِحَسَنَةٍ فَلَمْ يَعْمَلْهَا كَتَبَهَا اللَّهُ عِنْدَهُ حَسَنَةً كَامِلَةً، وَإِنْ هَمَّ بِهَا فَعَمِلَهَا كَتَبَهَا اللَّهُ عَشْرَ حَسَنَاتٍ إِلَى سَبْعِ مِئَةِ ضِعْفٍ إِلَى أَضْعَافٍ كَثِيرَةٍ.',
    translation:
      'Allah has recorded good and bad deeds, then made them clear: whoever intends a good deed but does not do it, Allah records it as a complete good deed; and if he intends it and does it, Allah records it as ten good deeds up to seven hundred times, up to many times over.',
    narrator: 'ʿAbdullāh ibn ʿAbbās',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī & Muslim', source: 'Muttafaq ʿalayh' },
    references: ['al-Bukhārī 6491', 'Muslim 131'],
    topics: ['qudsi', 'reward', 'intention'],
  },
  {
    id: 'nawawi-38',
    collectionId: 'nawawi40',
    number: 38,
    chapter: 'Nearness to Allah (ḥadīth qudsī)',
    arabic:
      'مَنْ عَادَى لِي وَلِيًّا فَقَدْ آذَنْتُهُ بِالْحَرْبِ… وَمَا تَقَرَّبَ إِلَيَّ عَبْدِي بِشَيْءٍ أَحَبَّ إِلَيَّ مِمَّا افْتَرَضْتُهُ عَلَيْهِ، وَمَا يَزَالُ عَبْدِي يَتَقَرَّبُ إِلَيَّ بِالنَّوَافِلِ حَتَّى أُحِبَّهُ، فَإِذَا أَحْبَبْتُهُ كُنْتُ سَمْعَهُ الَّذِي يَسْمَعُ بِهِ وَبَصَرَهُ الَّذِي يُبْصِرُ بِهِ.',
    translation:
      'Whoever shows enmity to a friend (walī) of Mine, I declare war upon him. …My servant does not draw near to Me with anything more beloved to Me than what I have made obligatory; and My servant keeps drawing near to Me with voluntary deeds until I love him — and when I love him, I become his hearing with which he hears and his sight with which he sees.',
    narrator: 'Abū Hurayrah',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī' },
    references: ['al-Bukhārī 6502'],
    topics: ['qudsi', 'nearness', 'worship'],
  },
  {
    id: 'nawawi-39',
    collectionId: 'nawawi40',
    number: 39,
    chapter: 'Pardon for mistakes',
    arabic:
      'إِنَّ اللَّهَ تَجَاوَزَ لِي عَنْ أُمَّتِي الْخَطَأَ وَالنِّسْيَانَ وَمَا اسْتُكْرِهُوا عَلَيْهِ.',
    translation:
      'Allah has pardoned for me my nation their mistakes, their forgetfulness, and what they are coerced to do.',
    narrator: 'ʿAbdullāh ibn ʿAbbās',
    grade: { ruling: 'hasan', grader: 'Ibn Mājah' },
    references: ['Ibn Mājah 2045'],
    topics: ['mercy', 'fiqh'],
  },
  {
    id: 'nawawi-40',
    collectionId: 'nawawi40',
    number: 40,
    chapter: 'A stranger in the world',
    arabic:
      'كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ. وَكَانَ ابْنُ عُمَرَ يَقُولُ: إِذَا أَمْسَيْتَ فَلَا تَنْتَظِرِ الصَّبَاحَ، وَإِذَا أَصْبَحْتَ فَلَا تَنْتَظِرِ الْمَسَاءَ، وَخُذْ مِنْ صِحَّتِكَ لِمَرَضِكَ وَمِنْ حَيَاتِكَ لِمَوْتِكَ.',
    translation:
      'Be in this world as though you were a stranger or a wayfarer. Ibn ʿUmar used to say: When evening comes, do not await the morning; when morning comes, do not await the evening. Take from your health for your sickness, and from your life for your death.',
    narrator: 'ʿAbdullāh ibn ʿUmar',
    grade: { ruling: 'sahih', grader: 'al-Bukhārī' },
    references: ['al-Bukhārī 6416'],
    topics: ['zuhd', 'reminder'],
  },
  {
    id: 'nawawi-41',
    collectionId: 'nawawi40',
    number: 41,
    chapter: 'Following the revelation',
    arabic: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يَكُونَ هَوَاهُ تَبَعًا لِمَا جِئْتُ بِهِ.',
    translation:
      'None of you truly believes until his desire follows what I have brought.',
    narrator: 'ʿAbdullāh ibn ʿAmr',
    grade: { ruling: 'hasan', grader: 'al-Nawawī (in al-Ḥujjah)' },
    references: ['al-Nawawī, al-Arbaʿīn 41'],
    topics: ['faith', 'obedience'],
  },
  {
    id: 'nawawi-42',
    collectionId: 'nawawi40',
    number: 42,
    chapter: 'The vastness of forgiveness (ḥadīth qudsī)',
    arabic:
      'يَا ابْنَ آدَمَ، إِنَّكَ مَا دَعَوْتَنِي وَرَجَوْتَنِي غَفَرْتُ لَكَ عَلَى مَا كَانَ مِنْكَ وَلَا أُبَالِي… يَا ابْنَ آدَمَ، لَوْ أَنَّكَ أَتَيْتَنِي بِقُرَابِ الْأَرْضِ خَطَايَا ثُمَّ لَقِيتَنِي لَا تُشْرِكُ بِي شَيْئًا لَأَتَيْتُكَ بِقُرَابِهَا مَغْفِرَةً.',
    translation:
      'O son of Ādam, so long as you call upon Me and place your hope in Me, I will forgive you whatever comes from you, and I will not mind. …O son of Ādam, were you to come to Me with sins nearly filling the earth, then meet Me without associating anything with Me, I would meet you with forgiveness nearly filling it.',
    narrator: 'Anas ibn Mālik',
    grade: { ruling: 'hasan', grader: 'al-Tirmidhī' },
    references: ['al-Tirmidhī 3540'],
    topics: ['qudsi', 'forgiveness', 'hope'],
  },
];
