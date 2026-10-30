/**
 * The wudū (ablution) content model for Adl.
 *
 * This is *data, not prose buried in a screen* — held here so a qualified
 * scholar can review and correct it independently of any UI. Each step is the
 * agreed-upon Prophetic method, drawn primarily from the descriptions of the
 * Prophet's wudū narrated by ʿUthmān ibn ʿAffān and ʿAbdullāh ibn Zayd, and
 * grounded in the Qurʾān (al-Māʾidah 5:6).
 *
 * Two things are deliberate and important:
 *   1. Every step carries its daleel (evidence) so the user can verify, not
 *      merely trust. Aḥādīth cite collection, number, and grade.
 *   2. Obligatory (farḍ) acts — the four named in the Qurʾān — are separated
 *      from the perfected Sunnah acts, so a learner sees what makes wudū
 *      *valid* versus what makes it *complete*.
 *
 * Where the schools of fiqh differ (e.g. the exact extent of wiping the head,
 * or washing versus wiping the feet for those without leather socks), the note
 * marks it rather than presenting one ruling as universal. This content is
 * presented as pending review by a qualified scholar until verified in-app.
 */

/** The two tiers of an act of wudū. */
export type WuduCategory = 'fard' | 'sunnah';

/** A single evidence citation backing a step. */
export type Daleel = {
  /** Where it comes from. */
  source: 'quran' | 'hadith';
  /** Human-readable reference, e.g. "al-Māʾidah 5:6" or "Ṣaḥīḥ al-Bukhārī 159". */
  reference: string;
  /** The narrator, for aḥādīth (e.g. "ʿUthmān ibn ʿAffān"). */
  narrator?: string;
  /** Authentication grade for aḥādīth (e.g. "Ṣaḥīḥ", "Ḥasan"). */
  grade?: string;
  /** The cited text, translated. */
  text: string;
};

/** One chronological step of the ablution. */
export type WuduStep = {
  /** Stable key for animation art + state. */
  id:
    | 'niyyah'
    | 'tasmiyah'
    | 'hands'
    | 'mouth'
    | 'nose'
    | 'face'
    | 'arms'
    | 'head'
    | 'ears'
    | 'feet'
    | 'shahadah';
  /** English name. */
  name: string;
  /** Arabic name. */
  arabic: string;
  /** Romanised transliteration. */
  transliteration: string;
  /** Plain, unambiguous instruction. */
  instruction: string;
  /** How many times it is performed, when countable (e.g. 3). 0 = not counted. */
  times: number;
  /** Obligatory or perfecting Sunnah. */
  category: WuduCategory;
  /** Which limb/region the artwork should illustrate. */
  art:
    | 'heart'
    | 'bismillah'
    | 'hands'
    | 'mouth'
    | 'nose'
    | 'face'
    | 'arm'
    | 'head'
    | 'ears'
    | 'foot'
    | 'dua';
  /** A short clarifying tip — boundaries, common mistakes, etc. */
  tip?: string;
  /** The evidence backing this step. */
  daleel: Daleel[];
};

/** The four obligations named in the Qurʾān, for the "Essentials" filter. */
export const FARD_IDS: WuduStep['id'][] = ['face', 'arms', 'head', 'feet'];

/**
 * The complete Sunnah method, in the order the Prophet ﷺ performed it.
 */
export const WUDU_STEPS: WuduStep[] = [
  {
    id: 'niyyah',
    name: 'Intention',
    arabic: 'النِّيَّة',
    transliteration: 'an-Niyyah',
    instruction:
      'Resolve in your heart to perform wudū for the sake of Allah. The intention is held in the heart — it is not spoken aloud.',
    times: 0,
    category: 'sunnah',
    art: 'heart',
    tip: 'A silent, sincere intention is enough. Saying it aloud is not from the Sunnah.',
    daleel: [
      {
        source: 'hadith',
        reference: 'Ṣaḥīḥ al-Bukhārī 1, Ṣaḥīḥ Muslim 1907',
        narrator: 'ʿUmar ibn al-Khaṭṭāb',
        grade: 'Ṣaḥīḥ',
        text: '“Actions are but by intentions, and every person shall have only what they intended.”',
      },
    ],
  },
  {
    id: 'tasmiyah',
    name: 'Say Bismillāh',
    arabic: 'التَّسْمِيَة',
    transliteration: 'at-Tasmiyah',
    instruction: 'Begin by saying “Bismillāh” — in the name of Allah.',
    times: 0,
    category: 'sunnah',
    art: 'bismillah',
    daleel: [
      {
        source: 'hadith',
        reference: 'Sunan Abī Dāwūd 101, Jāmiʿ at-Tirmidhī 26',
        narrator: 'Abū Hurayrah',
        grade: 'Ḥasan',
        text: '“There is no wudū for the one who does not mention the name of Allah over it.”',
      },
    ],
  },
  {
    id: 'hands',
    name: 'Wash the hands',
    arabic: 'غَسْلُ الكَفَّيْن',
    transliteration: 'Ghasl al-kaffayn',
    instruction:
      'Wash both hands up to the wrists three times, passing water between the fingers.',
    times: 3,
    category: 'sunnah',
    art: 'hands',
    tip: 'Start with the right hand. Do not neglect between the fingers.',
    daleel: [
      {
        source: 'hadith',
        reference: 'Ṣaḥīḥ al-Bukhārī 159, Ṣaḥīḥ Muslim 226',
        narrator: 'ʿUthmān ibn ʿAffān',
        grade: 'Ṣaḥīḥ',
        text: '“…he washed his hands three times, then rinsed his mouth and nose…” — describing the Prophet’s ﷺ wudū.',
      },
    ],
  },
  {
    id: 'mouth',
    name: 'Rinse the mouth',
    arabic: 'المَضْمَضَة',
    transliteration: 'al-Maḍmaḍah',
    instruction: 'Take water into the mouth and rinse it thoroughly, three times.',
    times: 3,
    category: 'sunnah',
    art: 'mouth',
    daleel: [
      {
        source: 'hadith',
        reference: 'Ṣaḥīḥ al-Bukhārī 159, Ṣaḥīḥ Muslim 226',
        narrator: 'ʿUthmān ibn ʿAffān',
        grade: 'Ṣaḥīḥ',
        text: 'Part of the described wudū of the Prophet ﷺ: rinsing the mouth before washing the face.',
      },
    ],
  },
  {
    id: 'nose',
    name: 'Rinse the nose',
    arabic: 'الاِسْتِنْشَاق',
    transliteration: 'al-Istinshāq',
    instruction:
      'Sniff water gently into the nostrils, then blow it out (istinthār). Three times.',
    times: 3,
    category: 'sunnah',
    art: 'nose',
    tip: 'Be thorough unless fasting, when it should be gentle.',
    daleel: [
      {
        source: 'hadith',
        reference: 'Sunan Abī Dāwūd 142, Jāmiʿ at-Tirmidhī 788',
        narrator: 'Laqīṭ ibn Ṣabirah',
        grade: 'Ṣaḥīḥ',
        text: '“…and inhale water deeply into the nose, unless you are fasting.”',
      },
    ],
  },
  {
    id: 'face',
    name: 'Wash the face',
    arabic: 'غَسْلُ الوَجْه',
    transliteration: 'Ghasl al-wajh',
    instruction:
      'Wash the entire face three times — from the hairline to the chin, and from one ear to the other.',
    times: 3,
    category: 'fard',
    art: 'face',
    tip: 'This is the first of the four obligations named in the Qurʾān.',
    daleel: [
      {
        source: 'quran',
        reference: 'al-Māʾidah 5:6',
        text: '“…wash your faces and your hands up to the elbows…”',
      },
    ],
  },
  {
    id: 'arms',
    name: 'Wash the arms',
    arabic: 'غَسْلُ اليَدَيْن إلى المِرْفَقَيْن',
    transliteration: 'Ghasl al-yadayn ila al-mirfaqayn',
    instruction:
      'Wash the right arm from fingertips to the elbow three times, then the left the same way.',
    times: 3,
    category: 'fard',
    art: 'arm',
    tip: 'The elbows must be included. Begin with the right.',
    daleel: [
      {
        source: 'quran',
        reference: 'al-Māʾidah 5:6',
        text: '“…and your hands up to the elbows…”',
      },
    ],
  },
  {
    id: 'head',
    name: 'Wipe the head',
    arabic: 'مَسْحُ الرَّأْس',
    transliteration: 'Masḥ ar-raʾs',
    instruction:
      'With wet hands, wipe over the head once — from the front to the back, then back to the front.',
    times: 1,
    category: 'fard',
    art: 'head',
    tip: 'This is wiping (masḥ), not washing. Schools differ on the extent wiped.',
    daleel: [
      {
        source: 'quran',
        reference: 'al-Māʾidah 5:6',
        text: '“…and wipe over your heads…”',
      },
      {
        source: 'hadith',
        reference: 'Ṣaḥīḥ al-Bukhārī 185',
        narrator: 'ʿAbdullāh ibn Zayd',
        grade: 'Ṣaḥīḥ',
        text: 'He wiped his head with both hands, front to back and back to front, once.',
      },
    ],
  },
  {
    id: 'ears',
    name: 'Wipe the ears',
    arabic: 'مَسْحُ الأُذُنَيْن',
    transliteration: 'Masḥ al-udhunayn',
    instruction:
      'With the same wetness, wipe the inside of the ears with the index fingers and the back with the thumbs.',
    times: 1,
    category: 'sunnah',
    art: 'ears',
    tip: 'The ears are wiped as part of the head, with the same water.',
    daleel: [
      {
        source: 'hadith',
        reference: 'Sunan Ibn Mājah 443, Jāmiʿ at-Tirmidhī 37',
        narrator: 'Ibn ʿAbbās / al-Miqdām',
        grade: 'Ṣaḥīḥ',
        text: '“The two ears are part of the head.”',
      },
    ],
  },
  {
    id: 'feet',
    name: 'Wash the feet',
    arabic: 'غَسْلُ الرِّجْلَيْن إلى الكَعْبَيْن',
    transliteration: 'Ghasl ar-rijlayn ila al-kaʿbayn',
    instruction:
      'Wash the right foot to the ankle three times, passing water between the toes, then the left.',
    times: 3,
    category: 'fard',
    art: 'foot',
    tip: 'The ankles must be included. Take care to wash the heels thoroughly.',
    daleel: [
      {
        source: 'quran',
        reference: 'al-Māʾidah 5:6',
        text: '“…and your feet up to the ankles.”',
      },
      {
        source: 'hadith',
        reference: 'Ṣaḥīḥ al-Bukhārī 60, Ṣaḥīḥ Muslim 241',
        narrator: 'ʿAbdullāh ibn ʿAmr',
        grade: 'Ṣaḥīḥ',
        text: '“Woe to the heels from the Fire!” — a warning to wash the feet completely.',
      },
    ],
  },
  {
    id: 'shahadah',
    name: 'Supplication after wudū',
    arabic: 'الدُّعَاءُ بَعْدَ الوُضُوء',
    transliteration: 'ad-Duʿāʾ baʿd al-wuḍūʾ',
    instruction:
      'Raise your gaze and say the testimony of faith. The eight gates of Paradise are opened for the one who does so.',
    times: 0,
    category: 'sunnah',
    art: 'dua',
    tip: 'Ashhadu an lā ilāha illā Allāh, waḥdahu lā sharīka lah, wa ashhadu anna Muḥammadan ʿabduhu wa rasūluh.',
    daleel: [
      {
        source: 'hadith',
        reference: 'Ṣaḥīḥ Muslim 234',
        narrator: 'ʿUmar ibn al-Khaṭṭāb',
        grade: 'Ṣaḥīḥ',
        text: '“Whoever performs wudū well, then says the shahādah, the eight gates of Paradise are opened for him to enter by any he wishes.”',
      },
    ],
  },
];

/** Things that invalidate wudū and require renewing it before prayer. */
export type WuduNullifier = { text: string; daleel?: Daleel };

export const WUDU_NULLIFIERS: WuduNullifier[] = [
  {
    text: 'Anything that exits the front or back passage (urine, stool, or wind).',
    daleel: {
      source: 'quran',
      reference: 'al-Māʾidah 5:6',
      text: '“…or one of you has come from the toilet…”',
    },
  },
  {
    text: 'Deep sleep in which one loses awareness.',
    daleel: {
      source: 'hadith',
      reference: 'Sunan Abī Dāwūd 203',
      narrator: 'ʿAlī ibn Abī Ṭālib',
      grade: 'Ḥasan',
      text: '“The eye is the drawstring of the anus, so whoever sleeps, let him perform wudū.”',
    },
  },
  {
    text: 'Loss of consciousness through fainting or intoxication.',
  },
  {
    text: 'Eating camel meat (according to the stronger view).',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 360',
      narrator: 'Jābir ibn Samurah',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ ordered wudū after eating camel meat.',
    },
  },
];

/** A short, honest disclaimer surfaced in the UI. */
export const WUDU_DISCLAIMER =
  'Prepared from the Qurʾān and authentic Sunnah and presented as pending review by a qualified scholar. Where the schools of fiqh differ, follow reliable local scholarship.';
