/**
 * content/tahajjud.ts — the words and worship of the night.
 *
 * The evidence for Qiyām al-Layl (Tahajjud): its virtues from the Qurʾān and
 * the Sunnah, the supplications of the night and of witr, practical notes on
 * how it was prayed, and an honest disclaimer about the calculated times. No
 * React, no I/O — typed data the Tahajjud screen renders, every proof-text
 * cited and shape-compatible with <DaleelBlock> and <DuaCard>.
 */

/** A single proof-text — Qurʾān or Sunnah. Shape-compatible with DaleelBlock. */
export type Daleel = {
  source: 'quran' | 'hadith';
  reference: string;
  narrator?: string;
  grade?: string;
  text: string;
};

/** A cited virtue of the night prayer, with optional Arabic of the verse. */
export type TahajjudVirtue = {
  id: string;
  /** A short English heading for the virtue. */
  title: string;
  /** The Arabic of the verse, where the proof is from the Qurʾān. */
  arabic?: string;
  daleel: Daleel;
};

/** A supplication of the night. Shape-compatible with <DuaCard>. */
export type TahajjudDua = {
  id: string;
  title: string;
  when: string;
  arabic: string;
  transliteration: string;
  translation: string;
  repeat?: number;
  daleel?: Daleel;
};

/** A short practical note on the manner of the night prayer. */
export type TahajjudNote = {
  id: string;
  title: string;
  body: string;
};

/** The Arabic name of the night prayer. */
export const TAHAJJUD_ARABIC = 'قِيَام اللَّيْل';

/** A one-line introduction shown beneath the title. */
export const TAHAJJUD_INTRO =
  'The voluntary night prayer — the Prophet ﷺ rose for it, and it was the way of the righteous before us.';

/* ------------------------------------------------------------------ *
 * Virtues — why the night prayer is beloved
 * ------------------------------------------------------------------ */

export const TAHAJJUD_VIRTUES: TahajjudVirtue[] = [
  {
    id: 'praised-station',
    title: 'A praised station',
    arabic:
      'وَمِنَ اللَّيْلِ فَتَهَجَّدْ بِهِ نَافِلَةً لَّكَ عَسَىٰ أَن يَبْعَثَكَ رَبُّكَ مَقَامًا مَّحْمُودًا',
    daleel: {
      source: 'quran',
      reference: 'Qurʾān — al-Isrāʾ 17:79',
      text: 'And from part of the night, pray with it as additional worship for you; it is expected that your Lord will raise you to a praised station.',
    },
  },
  {
    id: 'little-sleep',
    title: 'They slept but little',
    arabic:
      'كَانُوا قَلِيلًا مِّنَ اللَّيْلِ مَا يَهْجَعُونَ ۝ وَبِالْأَسْحَارِ هُمْ يَسْتَغْفِرُونَ',
    daleel: {
      source: 'quran',
      reference: 'Qurʾān — adh-Dhāriyāt 51:17–18',
      text: 'They used to sleep but little of the night, and in the hours before dawn they would seek forgiveness.',
    },
  },
  {
    id: 'arise-the-night',
    title: 'Arise to pray the night',
    arabic: 'يَا أَيُّهَا الْمُزَّمِّلُ ۝ قُمِ اللَّيْلَ إِلَّا قَلِيلًا',
    daleel: {
      source: 'quran',
      reference: 'Qurʾān — al-Muzzammil 73:1–2',
      text: 'O you who wraps himself in clothing, arise to pray the night, except for a little.',
    },
  },
  {
    id: 'potent-hours',
    title: 'The most potent hours',
    arabic: 'إِنَّ نَاشِئَةَ اللَّيْلِ هِيَ أَشَدُّ وَطْئًا وَأَقْوَمُ قِيلًا',
    daleel: {
      source: 'quran',
      reference: 'Qurʾān — al-Muzzammil 73:6',
      text: 'Indeed, the night vigil is stronger in tread and more upright in speech.',
    },
  },
  {
    id: 'forsaking-beds',
    title: 'They forsake their beds',
    arabic:
      'تَتَجَافَىٰ جُنُوبُهُمْ عَنِ الْمَضَاجِعِ يَدْعُونَ رَبَّهُمْ خَوْفًا وَطَمَعًا',
    daleel: {
      source: 'quran',
      reference: 'Qurʾān — as-Sajdah 32:16',
      text: 'Their sides part from their sleeping beds, calling upon their Lord in fear and in hope, and from what We have provided them they spend.',
    },
  },
  {
    id: 'the-descent',
    title: 'The Lord descends',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 1145 · Muslim 758',
      narrator: 'Abū Hurayrah',
      grade: 'Muttafaqun ʿalayh',
      text: 'Our Lord descends each night to the lowest heaven when the last third of the night remains, saying: “Who is calling upon Me, that I may answer him? Who is asking of Me, that I may give him? Who is seeking My forgiveness, that I may forgive him?”',
    },
  },
  {
    id: 'best-after-fard',
    title: 'The best prayer after the obligatory',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 1163',
      narrator: 'Abū Hurayrah',
      grade: 'Ṣaḥīḥ',
      text: 'The best fasting after Ramadan is in the month of Allah, Muḥarram, and the best prayer after the obligatory is the prayer of the night.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Supplications — the words of the night and of witr
 * ------------------------------------------------------------------ */

export const TAHAJJUD_DUAS: TahajjudDua[] = [
  {
    id: 'opening',
    title: 'On rising for the night',
    when: 'When standing for Tahajjud',
    arabic:
      'اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ قَيِّمُ السَّمَاوَاتِ وَالْأَرْضِ وَمَنْ فِيهِنَّ، وَلَكَ الْحَمْدُ أَنْتَ نُورُ السَّمَاوَاتِ وَالْأَرْضِ وَمَنْ فِيهِنَّ، أَنْتَ الْحَقُّ، وَوَعْدُكَ الْحَقُّ، وَلِقَاؤُكَ حَقٌّ',
    transliteration:
      'Allāhumma laka l-ḥamd, anta qayyimu s-samāwāti wa l-arḍi wa man fīhinn. Wa laka l-ḥamd, anta nūru s-samāwāti wa l-arḍi wa man fīhinn. Anta l-ḥaqq, wa waʿduka l-ḥaqq, wa liqāʾuka ḥaqq.',
    translation:
      'O Allah, to You belongs all praise; You are the Sustainer of the heavens and the earth and all within them. To You belongs all praise; You are the Light of the heavens and the earth and all within them. You are the Truth, Your promise is true, and the meeting with You is true.',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 1120',
      narrator: 'Ibn ʿAbbās',
      grade: 'Ṣaḥīḥ',
      text: 'When the Prophet ﷺ rose at night to pray Tahajjud, he would say this.',
    },
  },
  {
    id: 'light',
    title: 'A prayer for light',
    when: 'Said by the Prophet ﷺ in the night',
    arabic:
      'اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا، وَفِي لِسَانِي نُورًا، وَاجْعَلْ فِي سَمْعِي نُورًا، وَاجْعَلْ فِي بَصَرِي نُورًا، وَاجْعَلْ مِنْ خَلْفِي نُورًا، وَمِنْ أَمَامِي نُورًا، وَاجْعَلْ مِنْ فَوْقِي نُورًا، وَمِنْ تَحْتِي نُورًا، اللَّهُمَّ أَعْطِنِي نُورًا',
    transliteration:
      'Allāhumma j‘al fī qalbī nūran, wa fī lisānī nūran, wa j‘al fī sam‘ī nūran, wa j‘al fī baṣarī nūran, wa j‘al min khalfī nūran, wa min amāmī nūran, wa j‘al min fawqī nūran, wa min taḥtī nūran. Allāhumma a‘ṭinī nūrā.',
    translation:
      'O Allah, place light in my heart, light upon my tongue, light in my hearing and light in my sight; place light behind me and light before me, light above me and light below me. O Allah, grant me light.',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 6316 · Muslim 763',
      narrator: 'Ibn ʿAbbās',
      grade: 'Muttafaqun ʿalayh',
      text: 'Part of the supplication of the Prophet ﷺ as he rose to pray in the night.',
    },
  },
  {
    id: 'qunut',
    title: 'The supplication of witr (qunūt)',
    when: 'In the witr prayer',
    arabic:
      'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ',
    transliteration:
      'Allāhumma-hdinī fīman hadayt, wa ʿāfinī fīman ʿāfayt, wa tawallanī fīman tawallayt, wa bārik lī fīmā aʿṭayt, wa qinī sharra mā qaḍayt.',
    translation:
      'O Allah, guide me among those You have guided, grant me well-being among those You have granted well-being, take me into Your charge among those You have taken into Your charge, bless for me what You have given, and protect me from the evil of what You have decreed.',
    daleel: {
      source: 'hadith',
      reference: 'Sunan Abī Dāwūd 1425 · at-Tirmidhī 464',
      narrator: 'al-Ḥasan ibn ʿAlī',
      grade: 'Ṣaḥīḥ',
      text: 'The Messenger of Allah ﷺ taught me words to say in witr.',
    },
  },
  {
    id: 'after-witr',
    title: 'After witr',
    when: 'After completing witr (×3)',
    arabic: 'سُبْحَانَ الْمَلِكِ الْقُدُّوسِ',
    transliteration: 'Subḥāna l-Maliki l-Quddūs',
    translation: 'Glory be to the King, the Most Holy.',
    repeat: 3,
    daleel: {
      source: 'hadith',
      reference: 'Sunan an-Nasāʾī 1699 · Abū Dāwūd 1430',
      narrator: 'Ubayy ibn Kaʿb',
      grade: 'Ṣaḥīḥ',
      text: 'After giving salām, the Prophet ﷺ would say it three times, prolonging and raising his voice on the third.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Practice — how the night prayer was prayed
 * ------------------------------------------------------------------ */

export const TAHAJJUD_NOTES: TahajjudNote[] = [
  {
    id: 'rakahs',
    title: 'How many rakʿahs',
    body: 'ʿĀʾishah said the Prophet ﷺ would not pray more than eleven rakʿahs in the night, in Ramadan or outside it (al-Bukhārī 1147). He prayed two by two and sealed the night with a single witr. There is no fixed maximum — pray what you are able with presence of heart.',
  },
  {
    id: 'witr',
    title: 'Seal the night with witr',
    body: 'Make the last of your night prayer an odd number — one, three, five and so on. “Make the last of your prayer at night witr” (al-Bukhārī 998, Muslim 751). If you fear you will not wake, pray witr before sleeping.',
  },
  {
    id: 'dawud',
    title: 'The prayer of Dāwūd',
    body: 'The most beloved prayer to Allah is the prayer of Dāwūd ﷺ: he would sleep half the night, pray a third, and sleep a sixth (al-Bukhārī 1131). The last third is the hour of the divine descent — strive for it, even with a few rakʿahs.',
  },
  {
    id: 'waking',
    title: 'Waking for it',
    body: 'Sleep early, set an intention, and ask Allah to wake you. Whoever intends to rise but is overcome by sleep is written the reward of his prayer, and his sleep is a charity for him (an-Nasāʾī 1784). On waking, wipe your face, use the siwāk, and begin gently.',
  },
];

/** An honest word on the calculated times and the spirit of the worship. */
export const TAHAJJUD_DISCLAIMER =
  'The prayer times here are calculated estimates from your location and method, and the night thirds are derived from them. Treat them as a guide and, where you can, confirm Fajr with your local mosque. Qiyām al-Layl is voluntary — proceed gently and regularly, for the deeds most beloved to Allah are the most constant, even if few.';
