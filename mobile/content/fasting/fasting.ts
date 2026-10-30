/**
 * fasting.ts — the sourced content model for Adl's Fasting & Ramadan hub.
 *
 * Everything here is data: the timing rules (Imsāk, Suhūr, Iftār), the months
 * and nights of Ramadan, the three ʿashras, the evidence (daleel) behind each
 * ruling, the rules of qaḍāʾ / fidyah / kaffārah, common mistakes, and the
 * pending-scholar-review disclaimer. The UI and the pure logic in lib/fasting*
 * read from this file so the wording and the numbers live in one reviewable
 * place.
 *
 * Authenticity bar (matching the wudū and zakat features): every rule is cited
 * to Qurʾān and Sunnah; differences between the madhāhib are noted, not
 * asserted; the user chooses. Nothing here is a fatwa — see FASTING_DISCLAIMER.
 */

/** A single proof-text, mirroring the wudū and zakat models' shape. */
export type Daleel = {
  source: 'quran' | 'hadith';
  reference: string;
  narrator?: string;
  grade?: string;
  text: string;
};

/* ------------------------------------------------------------------ *
 * Core constants
 * ------------------------------------------------------------------ */

/** The 1-based Hijri month index of Ramadan. */
export const RAMADAN_MONTH = 9;
/** The 1-based Hijri month index of Shawwāl (Eid al-Fiṭr, six fasts). */
export const SHAWWAL_MONTH = 10;
/** The 1-based Hijri month index of Dhū al-Ḥijjah (ʿArafah, Tashrīq). */
export const DHUL_HIJJAH_MONTH = 12;
/** The 1-based Hijri month index of Muḥarram (ʿĀshūrāʾ). */
export const MUHARRAM_MONTH = 1;
/** The 1-based Hijri month index of Shaʿbān. */
export const SHABAN_MONTH = 8;

/** Default minutes before Fajr to stop eating (a cautious Imsāk buffer). */
export const DEFAULT_IMSAK_MIN = 10;
/** The night Ramadan's last ten begin (the search for Laylatul-Qadr). */
export const LAST_TEN_START = 21;
/** The odd nights of the last ten, most emphasised for Laylatul-Qadr. */
export const ODD_NIGHTS = [21, 23, 25, 27, 29] as const;

/* ------------------------------------------------------------------ *
 * Status of a single day's fast
 * ------------------------------------------------------------------ */

/** How a given day was observed. */
export type FastingStatus = 'fasted' | 'broke' | 'exempt' | 'none';

/** Why a fast was not kept (for the make-up / fidyah ledger). */
export type ExemptReason =
  | 'travel'
  | 'illness'
  | 'menstruation'
  | 'pregnancy'
  | 'nursing'
  | 'elderly'
  | 'other';

export type ExemptReasonInfo = {
  id: ExemptReason;
  label: string;
  /** Whether this reason is ordinarily made up later (qaḍāʾ) or paid (fidyah). */
  resolution: 'qada' | 'fidya' | 'either';
  note: string;
};

/** The recognised excuses for not fasting, each with how it is resolved. */
export const EXEMPT_REASONS: ExemptReasonInfo[] = [
  {
    id: 'travel',
    label: 'Travelling',
    resolution: 'qada',
    note: 'A traveller may break the fast and make up the days later.',
  },
  {
    id: 'illness',
    label: 'Illness',
    resolution: 'qada',
    note: 'One who is ill may break the fast and make up the days on recovery.',
  },
  {
    id: 'menstruation',
    label: 'Menstruation / nifās',
    resolution: 'qada',
    note: 'Fasting is not performed during menses or post-natal bleeding; these days are made up.',
  },
  {
    id: 'pregnancy',
    label: 'Pregnancy',
    resolution: 'either',
    note: 'If fasting is feared to harm mother or child, the day is broken; scholars differ between qaḍāʾ and fidyah.',
  },
  {
    id: 'nursing',
    label: 'Nursing',
    resolution: 'either',
    note: 'A nursing mother who fears harm may break the fast; scholars differ between qaḍāʾ and fidyah.',
  },
  {
    id: 'elderly',
    label: 'Elderly / chronic illness',
    resolution: 'fidya',
    note: 'One unable to fast permanently feeds a needy person for each day (fidyah) instead of making up.',
  },
  {
    id: 'other',
    label: 'Other',
    resolution: 'qada',
    note: 'Any other valid excuse — record the day and make it up.',
  },
];

/* ------------------------------------------------------------------ *
 * The three ʿAshras of Ramadan
 * ------------------------------------------------------------------ */

export type Ashra = {
  index: 0 | 1 | 2;
  /** Inclusive Hijri day range within Ramadan. */
  from: number;
  to: number;
  title: string;
  theme: string;
  arabic: string;
  description: string;
  dua: { arabic: string; transliteration: string; translation: string };
};

/**
 * The traditional division of Ramadan into three tens, each with its theme.
 * The duʿās are those commonly recited; the division itself is a well-known
 * framing rather than a binding ruling.
 */
export const ASHRAS: Ashra[] = [
  {
    index: 0,
    from: 1,
    to: 10,
    title: 'Days of Mercy',
    theme: 'Raḥmah',
    arabic: 'الرَّحْمَة',
    description: "The first ten days, in which we seek Allah's encompassing mercy.",
    dua: {
      arabic: 'رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ خَيْرُ الرَّاحِمِينَ',
      transliteration: 'Rabbi-ghfir wa-rḥam wa anta khayru-r-rāḥimīn',
      translation: 'My Lord, forgive and have mercy, for You are the best of those who show mercy.',
    },
  },
  {
    index: 1,
    from: 11,
    to: 20,
    title: 'Days of Forgiveness',
    theme: 'Maghfirah',
    arabic: 'الْمَغْفِرَة',
    description: 'The middle ten days, in which we turn to Allah seeking forgiveness.',
    dua: {
      arabic: 'أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ وَأَتُوبُ إِلَيْهِ',
      transliteration: 'Astaghfiru-llāha rabbī min kulli dhanbin wa atūbu ilayh',
      translation: 'I seek the forgiveness of Allah, my Lord, from every sin, and I repent to Him.',
    },
  },
  {
    index: 2,
    from: 21,
    to: 30,
    title: 'Refuge from the Fire',
    theme: 'ʿItq min an-Nār',
    arabic: 'الْعِتْق مِنَ النَّار',
    description: 'The last ten days, seeking freedom from the Fire — and within them, Laylatul-Qadr.',
    dua: {
      arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
      transliteration: 'Allāhumma innaka ʿafuwwun tuḥibbu-l-ʿafwa faʿfu ʿannī',
      translation: 'O Allah, You are Most Pardoning and love to pardon, so pardon me.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Evidence — the obligation, timing and merits of fasting
 * ------------------------------------------------------------------ */

export const DALEEL_OBLIGATION: Daleel = {
  source: 'quran',
  reference: 'al-Baqarah 2:183',
  text: 'O you who believe! Fasting is prescribed for you as it was prescribed for those before you, that you may attain taqwā (God-consciousness).',
};

export const DALEEL_RAMADAN: Daleel = {
  source: 'quran',
  reference: 'al-Baqarah 2:185',
  text: 'The month of Ramadan in which the Qurʾān was revealed, a guidance for mankind… so whoever among you witnesses the month, let him fast it.',
};

export const DALEEL_DAWN_TO_SUNSET: Daleel = {
  source: 'quran',
  reference: 'al-Baqarah 2:187',
  text: 'And eat and drink until the white thread of dawn becomes distinct to you from the black thread, then complete the fast until the night.',
};

export const DALEEL_SUHUR: Daleel = {
  source: 'hadith',
  reference: 'Ṣaḥīḥ al-Bukhārī 1923',
  narrator: 'Anas ibn Mālik',
  grade: 'Ṣaḥīḥ',
  text: 'Take suhūr, for in suhūr there is blessing.',
};

export const DALEEL_HASTEN_IFTAR: Daleel = {
  source: 'hadith',
  reference: 'Ṣaḥīḥ al-Bukhārī 1957',
  narrator: 'Sahl ibn Saʿd',
  grade: 'Ṣaḥīḥ',
  text: 'The people will remain upon good as long as they hasten to break the fast.',
};

export const DALEEL_BREAKING: Daleel = {
  source: 'hadith',
  reference: 'Sunan Abī Dāwūd 2356',
  narrator: 'Anas ibn Mālik',
  grade: 'Ḥasan',
  text: 'The Prophet ﷺ would break his fast with fresh dates before praying; if there were none, with dried dates; and if there were none, he would take a few sips of water.',
};

export const DALEEL_REWARD: Daleel = {
  source: 'hadith',
  reference: 'Ṣaḥīḥ al-Bukhārī 1904',
  narrator: 'Abū Hurayrah',
  grade: 'Ṣaḥīḥ',
  text: 'Allah said: every deed of the son of Ādam is for him except fasting; it is for Me, and I shall reward it.',
};

export const DALEEL_FORGIVENESS: Daleel = {
  source: 'hadith',
  reference: 'Ṣaḥīḥ al-Bukhārī 38',
  narrator: 'Abū Hurayrah',
  grade: 'Ṣaḥīḥ',
  text: 'Whoever fasts Ramadan out of faith and seeking reward, his previous sins are forgiven.',
};

export const DALEEL_QADR: Daleel = {
  source: 'quran',
  reference: 'al-Qadr 97:3',
  text: 'The Night of Decree is better than a thousand months.',
};

export const DALEEL_QADR_SEEK: Daleel = {
  source: 'hadith',
  reference: 'Ṣaḥīḥ al-Bukhārī 2017',
  narrator: 'ʿĀʾishah',
  grade: 'Ṣaḥīḥ',
  text: 'Seek Laylatul-Qadr in the odd nights of the last ten of Ramadan.',
};

export const DALEEL_QADAA: Daleel = {
  source: 'quran',
  reference: 'al-Baqarah 2:185',
  text: 'Whoever is ill or on a journey, then an equal number of other days. Allah intends ease for you, not hardship.',
};

export const DALEEL_FIDYAH: Daleel = {
  source: 'quran',
  reference: 'al-Baqarah 2:184',
  text: 'And upon those who are able to fast only with hardship is a ransom (fidyah): the feeding of a needy person.',
};

export const DALEEL_KAFFARAH: Daleel = {
  source: 'hadith',
  reference: 'Ṣaḥīḥ al-Bukhārī 1936',
  narrator: 'Abū Hurayrah',
  grade: 'Ṣaḥīḥ',
  text: 'A man broke his fast deliberately in Ramadan; the Prophet ﷺ ordered him to free a slave, or fast two consecutive months, or feed sixty needy people.',
};

/* ------------------------------------------------------------------ *
 * Sunan of fasting, common mistakes, disclaimer
 * ------------------------------------------------------------------ */

export type FastingNote = { title: string; body: string };

/** The recommended manners of the fast, each lightly sourced. */
export const FASTING_SUNAN: FastingNote[] = [
  { title: 'Take suhūr — and delay it', body: 'Eating before dawn is blessed; delaying it near to Fajr is from the Sunnah.' },
  { title: 'Hasten to break the fast', body: 'Break immediately at confirmed sunset (Maghrib), before praying.' },
  { title: 'Break on dates, then water', body: 'Fresh dates, then dried, then a few sips of water, following the Prophet ﷺ.' },
  { title: 'Make the duʿā at iftār', body: 'The fasting person has an answered supplication at the moment of breaking.' },
  { title: 'Guard the tongue and limbs', body: 'Fasting is not merely from food and drink, but from falsehood and ill conduct.' },
  { title: 'Increase in Qurʾān and charity', body: 'The Prophet ﷺ was most generous in Ramadan, and reviewed the Qurʾān with Jibrīl.' },
];

/** Frequent misunderstandings, gently corrected. */
export const FASTING_MISTAKES: FastingNote[] = [
  { title: 'Imsāk is not a separate ruling', body: 'Eating is permitted until Fajr; the Imsāk buffer is only a cautious few minutes, not an earlier deadline.' },
  { title: 'Unintentional eating does not break the fast', body: 'Whoever forgets and eats or drinks should complete the fast — Allah fed him and gave him drink.' },
  { title: 'Rinsing, bathing and miswāk are fine', body: 'These do not break the fast, provided water is not deliberately swallowed.' },
  { title: 'Missed days are a debt', body: 'Days broken for a valid excuse are made up before the next Ramadan where possible.' },
];

/** Shown wherever a ruling is surfaced — this is education, not a fatwa. */
export const FASTING_DISCLAIMER =
  'Times are computed from your location and prayer-time settings; sight the horizon where you can. Rulings here are educational and follow the majority where scholars differ — for your situation, consult a qualified scholar.';
