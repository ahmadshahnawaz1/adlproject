/**
 * content/learn/fiqh.ts — the fiqh of worship.
 *
 * A practical set of lessons on how a Muslim worships: intention and
 * purification, the five prayers, fasting, zakāh, and ḥajj. These complement
 * the app's dedicated guides (Wudū, How to Pray, Zakat, Fasting, Pilgrimage)
 * with the underlying fiqh. Evidence-cited; pending final scholarly review.
 */
import type { Lesson } from './types';

export const FIQH_LESSONS: Lesson[] = [
  {
    id: 'fiqh-niyyah',
    topicId: 'fiqh',
    group: 'Foundations',
    title: 'Intention in Worship',
    arabic: 'النية',
    summary: 'Deeds are by intentions — the hidden pillar of every act.',
    minutes: 3,
    tags: ['niyyah', 'intention', 'ikhlas', 'sincerity', 'fiqh'],
    body: [
      {
        kind: 'para',
        text: 'Every act of worship begins in the heart. The intention (niyyah) distinguishes worship from habit and sets for whom the deed is done. Worship must be both sincere — for Allah alone — and correct, in the manner the Prophet ﷺ taught.',
      },
      {
        kind: 'hadith',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ al-Bukhārī 1, Ṣaḥīḥ Muslim 1907',
          narrator: 'ʿUmar ibn al-Khaṭṭāb',
          grade: 'Ṣaḥīḥ',
          text: '"Actions are but by intentions, and every person will have only what they intended."',
        },
      },
      {
        kind: 'callout',
        tone: 'note',
        title: 'In the heart, not the tongue',
        text: 'The intention\u2019s place is the heart; it need not be spoken aloud. To resolve in your heart to pray ẓuhr for Allah is the intention itself.',
      },
    ],
  },
  {
    id: 'fiqh-taharah',
    topicId: 'fiqh',
    group: 'Purification',
    title: 'Purification (Ṭahārah)',
    arabic: 'الطهارة',
    summary: 'Worship is built on cleanliness — the key to prayer.',
    minutes: 3,
    tags: ['taharah', 'purity', 'cleanliness', 'wudu', 'fiqh'],
    body: [
      {
        kind: 'para',
        text: 'Ṭahārah is purity of body, clothing, and place, and the lifting of ritual impurity through wuḍūʾ or ghusl. It is a condition for the validity of prayer, and a beloved state in itself.',
      },
      {
        kind: 'ayah',
        reference: 'al-Baqarah 2:222',
        arabic: 'إِنَّ ٱللَّهَ يُحِبُّ ٱلتَّوَّٰبِينَ وَيُحِبُّ ٱلْمُتَطَهِّرِينَ',
        translation: 'Indeed, Allah loves those who turn to Him in repentance and those who purify themselves.',
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'See it in the app',
        text: 'The Wudū guide walks through every step of ablution with its evidence, posture by posture.',
      },
    ],
  },
  {
    id: 'fiqh-wudu',
    topicId: 'fiqh',
    group: 'Purification',
    title: 'Ablution (Wuḍūʾ)',
    arabic: 'الوضوء',
    summary: 'The washing that unlocks the prayer, and erases small sins.',
    minutes: 3,
    tags: ['wudu', 'ablution', 'taharah', 'fiqh'],
    body: [
      {
        kind: 'para',
        text: 'Wuḍūʾ is the prescribed washing before prayer. Allah named its obligatory parts in the Qurʾān: washing the face, the arms to the elbows, wiping the head, and washing the feet to the ankles.',
      },
      {
        kind: 'ayah',
        reference: 'al-Māʾidah 5:6',
        arabic: 'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِذَا قُمْتُمْ إِلَى ٱلصَّلَوٰةِ فَٱغْسِلُوا۟ وُجُوهَكُمْ وَأَيْدِيَكُمْ إِلَى ٱلْمَرَافِقِ وَٱمْسَحُوا۟ بِرُءُوسِكُمْ وَأَرْجُلَكُمْ إِلَى ٱلْكَعْبَيْنِ',
        translation: 'O you who believe, when you rise to pray, wash your faces and your forearms to the elbows, wipe your heads, and [wash] your feet to the ankles.',
      },
      {
        kind: 'hadith',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ Muslim 245',
          narrator: 'ʿUthmān ibn ʿAffān',
          grade: 'Ṣaḥīḥ',
          text: '"Whoever performs wuḍūʾ well, his sins leave his body, even from beneath his nails."',
        },
      },
    ],
  },
  {
    id: 'fiqh-ghusl',
    topicId: 'fiqh',
    group: 'Purification',
    title: 'The Ritual Bath (Ghusl)',
    arabic: 'الغسل',
    summary: 'Full purification from major ritual impurity.',
    minutes: 2,
    tags: ['ghusl', 'janabah', 'taharah', 'fiqh'],
    body: [
      {
        kind: 'para',
        text: 'Ghusl is washing the whole body to lift major ritual impurity (janābah) — such as after marital relations, and for a woman at the end of menstruation or post-natal bleeding. It is required before prayer and before touching or reciting the Qurʾān in that state.',
      },
      {
        kind: 'ayah',
        reference: 'al-Māʾidah 5:6',
        arabic: 'وَإِن كُنتُمْ جُنُبًا فَٱطَّهَّرُوا۟',
        translation: 'And if you are in a state of janābah, then purify yourselves [by bathing].',
      },
      {
        kind: 'steps',
        items: [
          'Intend purification in the heart and say "Bismillāh".',
          'Wash the hands, then the private parts and any impurity.',
          'Perform a complete wuḍūʾ.',
          'Pour water over the head three times, then over the whole body, ensuring the water reaches everywhere.',
        ],
      },
    ],
  },
  {
    id: 'fiqh-salah',
    topicId: 'fiqh',
    group: 'The Prayer',
    title: 'The Five Daily Prayers',
    arabic: 'الصلاة',
    summary: 'The second pillar of Islam and the first deed to be reckoned.',
    minutes: 4,
    tags: ['salah', 'prayer', 'fard', 'fiqh', 'pillar'],
    body: [
      {
        kind: 'para',
        text: 'The five daily prayers — Fajr, Ẓuhr, ʿAṣr, Maghrib, and ʿIshāʾ — are obligatory upon every accountable Muslim. They are the firmest link between a servant and their Lord and the first deed a person will be asked about on the Day of Judgement.',
      },
      {
        kind: 'ayah',
        reference: 'al-Nisāʾ 4:103',
        arabic: 'إِنَّ ٱلصَّلَوٰةَ كَانَتْ عَلَى ٱلْمُؤْمِنِينَ كِتَـٰبًا مَّوْقُوتًا',
        translation: 'Indeed, prayer has been decreed upon the believers a timed obligation.',
      },
      {
        kind: 'hadith',
        daleel: {
          source: 'hadith',
          reference: 'Sunan al-Tirmidhī 413',
          narrator: 'Abū Hurayrah',
          grade: 'Ṣaḥīḥ',
          text: '"The first thing for which a servant will be brought to account on the Day of Resurrection is his prayer. If it is sound, he has succeeded; if it is corrupt, he has failed."',
        },
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'See it in the app',
        text: 'The "How to Pray" guide teaches each prayer posture by posture, with the recitations and their evidence.',
      },
    ],
  },
  {
    id: 'fiqh-salah-conditions',
    topicId: 'fiqh',
    group: 'The Prayer',
    title: 'Conditions & Pillars of Ṣalāh',
    arabic: 'شروط وأركان الصلاة',
    summary: 'What must be in place before, and within, a valid prayer.',
    minutes: 4,
    tags: ['salah', 'conditions', 'arkan', 'qibla', 'fiqh'],
    body: [
      {
        kind: 'para',
        text: 'For the prayer to be valid, certain conditions must be met before it begins, and certain pillars must be fulfilled within it.',
      },
      { kind: 'heading', text: 'Conditions (before the prayer)' },
      {
        kind: 'point',
        items: [
          'Islam, sanity, and discernment.',
          'That the prescribed time for that prayer has entered.',
          'Purity from ritual impurity (wuḍūʾ or ghusl) and from physical impurity on body, clothing, and place.',
          'Covering the ʿawrah (the parts that must be covered).',
          'Facing the qiblah (the direction of the Kaʿbah).',
          'Intention in the heart.',
        ],
      },
      { kind: 'heading', text: 'Among the pillars (within the prayer)' },
      {
        kind: 'point',
        items: [
          'The opening takbīr ("Allāhu akbar").',
          'Standing for the obligatory prayer when able.',
          'Reciting al-Fātiḥah.',
          'Bowing (rukūʿ), then rising from it.',
          'Prostrating (sujūd) on the seven limbs, then sitting between the two prostrations.',
          'The final tashahhud and the closing salām, with stillness in each posture.',
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        text: 'The Qibla compass in the app helps you face the right direction wherever you are.',
      },
    ],
  },
  {
    id: 'fiqh-sawm',
    topicId: 'fiqh',
    group: 'Fasting',
    title: 'Fasting (Ṣawm)',
    arabic: 'الصوم',
    summary: 'Abstaining for Allah from dawn to sunset in Ramaḍān.',
    minutes: 3,
    tags: ['sawm', 'fasting', 'ramadan', 'fiqh', 'pillar'],
    body: [
      {
        kind: 'para',
        text: 'Fasting the month of Ramaḍān is the fourth pillar of Islam: to abstain from food, drink, and marital relations from the break of dawn until sunset, seeking Allah\u2019s reward and guarding the limbs from sin.',
      },
      {
        kind: 'ayah',
        reference: 'al-Baqarah 2:183',
        arabic: 'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُتِبَ عَلَيْكُمُ ٱلصِّيَامُ كَمَا كُتِبَ عَلَى ٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
        translation: 'O you who believe, fasting is prescribed for you as it was prescribed for those before you, that you may attain taqwā.',
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'See it in the app',
        text: 'The Fasting hub tracks Ramaḍān and voluntary fasts, with a make-up (qaḍāʾ) ledger and the rulings of fidyah and kaffārah.',
      },
    ],
  },
  {
    id: 'fiqh-zakah',
    topicId: 'fiqh',
    group: 'Zakāh',
    title: 'Obligatory Charity (Zakāh)',
    arabic: 'الزكاة',
    summary: 'A due of the wealthy to the poor — purifying both.',
    minutes: 3,
    tags: ['zakah', 'zakat', 'charity', 'nisab', 'fiqh', 'pillar'],
    body: [
      {
        kind: 'para',
        text: 'Zakāh is the third pillar of Islam: a fixed portion of qualifying wealth — most commonly 2.5% — given each lunar year to those entitled to it, once the wealth reaches the threshold (niṣāb) and a full year (ḥawl) has passed over it. It purifies wealth and the soul from greed.',
      },
      {
        kind: 'ayah',
        reference: 'al-Tawbah 9:103',
        arabic: 'خُذْ مِنْ أَمْوَٰلِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا',
        translation: 'Take from their wealth a charity by which you purify them and cause them to grow.',
      },
      {
        kind: 'para',
        text: 'Allah named its eight categories of recipients in Sūrat al-Tawbah (9:60), beginning with the poor and the needy.',
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'See it in the app',
        text: 'The Zakat calculator works out your niṣāb and what is due, and the Ṣadaqah tracker logs your giving across the year.',
      },
    ],
  },
  {
    id: 'fiqh-hajj',
    topicId: 'fiqh',
    group: 'Pilgrimage',
    title: 'Pilgrimage (Ḥajj)',
    arabic: 'الحج',
    summary: 'The journey of a lifetime, once upon those who are able.',
    minutes: 3,
    tags: ['hajj', 'pilgrimage', 'umrah', 'kaaba', 'fiqh', 'pillar'],
    body: [
      {
        kind: 'para',
        text: 'Ḥajj is the fifth pillar of Islam: the pilgrimage to the Sacred House in Makkah, obligatory once in a lifetime upon every Muslim who has the physical and financial means and a safe path. Its rites recall the legacy of Ibrāhīm and his family.',
      },
      {
        kind: 'ayah',
        reference: 'Āl ʿImrān 3:97',
        arabic: 'وَلِلَّهِ عَلَى ٱلنَّاسِ حِجُّ ٱلْبَيْتِ مَنِ ٱسْتَطَاعَ إِلَيْهِ سَبِيلًا',
        translation: 'And [due] to Allah from the people is a pilgrimage to the House — for whoever is able to find a way.',
      },
      {
        kind: 'hadith',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ al-Bukhārī 1521',
          narrator: 'Abū Hurayrah',
          grade: 'Ṣaḥīḥ',
          text: '"Whoever performs ḥajj for Allah and does not commit obscenity or wrongdoing returns [free of sin] as the day his mother bore him."',
        },
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'See it in the app',
        text: 'The Pilgrimage guide walks through ʿUmrah and Ḥajj as a cinematic, step-by-step journey.',
      },
    ],
  },
];
