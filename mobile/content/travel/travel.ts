/**
 * content/travel — the concessions of the traveller (aḥkām al-musāfir).
 *
 * Shortening the four-rakʿah prayers (qaṣr) and joining pairs of prayers
 * (jamʿ) are established concessions, but the schools differ on the distance
 * that makes one a traveller and how long the concession lasts. Those
 * differences are laid out here rather than settled — the user follows their
 * own school or teacher. Evidence-cited, pending scholarly review.
 */

/** A proof-text. Shape-compatible with DaleelBlock. */
export type Daleel = {
  source: 'quran' | 'hadith';
  reference: string;
  narrator?: string;
  grade?: string;
  text: string;
};

/** A recognised position on a question where the schools differ. */
export type Position = {
  id: string;
  label: string;
  held: string;
  detail: string;
};

/** The two ways two prayers may be joined. */
export type JoinKind = 'taqdim' | 'takhir';

export const TRAVEL_NAME = 'أَحْكَامُ الْمُسَافِر';

export const TRAVEL_INTRO =
  'Travel brings a concession, not an obligation to be anxious about. Allah lightened the prayer for the traveller, and the Prophet ﷺ took that lightening — accepting it is following the Sunnah, not falling short of it.';

/* ------------------------------------------------------------------ *
 * The distance that makes one a traveller
 * ------------------------------------------------------------------ */

/**
 * The majority figure: four burud ≈ 48 Arabic miles ≈ 80 km. Adl uses this as
 * the default threshold and lets the user change it.
 */
export const DEFAULT_THRESHOLD_KM = 80;
export const MIN_THRESHOLD_KM = 40;
export const MAX_THRESHOLD_KM = 160;

export const DISTANCE_POSITIONS: Position[] = [
  {
    id: 'four-burud',
    label: 'About 80 km',
    held: 'The majority — Mālikī, Shāfiʿī, Ḥanbalī',
    detail:
      'Four burud (roughly 48 Arabic miles, about 80 km) is taken as the distance at which one becomes a traveller. This is the most widely followed figure.',
  },
  {
    id: 'hanafi',
    label: 'Three days’ walk (~83 km)',
    held: 'Ḥanafī',
    detail:
      'A journey of three days at a moderate pace. In practice the figure arrived at is close to the majority’s, though reasoned differently.',
  },
  {
    id: 'urf',
    label: 'Whatever custom calls travel',
    held: 'Ibn Taymiyyah and those who follow him',
    detail:
      'No fixed distance is given in the texts, so what the people of a land customarily call a journey is what counts. On this view a short but genuine journey may qualify.',
  },
];

export const DISTANCE_NOTE =
  'The Qurʾān and Sunnah do not fix a number in kilometres; the figures above are the scholars’ reasoning. Adl measures from the home you set, and you can adjust the threshold to match the position you follow.';

/* ------------------------------------------------------------------ *
 * How long the concession lasts
 * ------------------------------------------------------------------ */

export const DURATION_POSITIONS: Position[] = [
  {
    id: 'four-days',
    label: 'Up to 4 days at a destination',
    held: 'The majority — Mālikī, Shāfiʿī, Ḥanbalī',
    detail:
      'If you intend to stay four days or more in one place, you are treated as a resident and pray in full. Fewer than that, the concession continues.',
  },
  {
    id: 'hanafi-15',
    label: 'Up to 15 days',
    held: 'Ḥanafī',
    detail:
      'Intending a stay of fifteen days or more makes one a resident; below that the traveller’s prayer continues.',
  },
  {
    id: 'until-settled',
    label: 'Until you intend to settle',
    held: 'Ibn Taymiyyah, Ibn al-Qayyim and others',
    detail:
      'The concession lasts as long as you are away and have not taken the place as a residence — even for a long stay, if you remain a traveller in your own reckoning.',
  },
];

/* ------------------------------------------------------------------ *
 * Qaṣr — shortening
 * ------------------------------------------------------------------ */

export const QASR_RULE =
  'Only the four-rakʿah prayers are shortened, and they are prayed as two: Ẓuhr, ʿAṣr and ʿIshāʾ. Fajr remains two and Maghrib remains three — these are never shortened.';

export const DALEEL_QASR_QURAN: Daleel = {
  source: 'quran',
  reference: 'an-Nisāʾ 4:101',
  text:
    'And when you travel throughout the land, there is no blame upon you for shortening the prayer.',
};

export const DALEEL_QASR_CHARITY: Daleel = {
  source: 'hadith',
  reference: 'Ṣaḥīḥ Muslim 686',
  narrator: 'Yaʿlā ibn Umayyah',
  grade: 'Ṣaḥīḥ',
  text:
    '‘It is a charity Allah has given you, so accept His charity.’ — said when ʿUmar asked the Prophet ﷺ why we still shorten the prayer though we are safe.',
};

export const DALEEL_QASR_PRACTICE: Daleel = {
  source: 'hadith',
  reference: 'Ṣaḥīḥ al-Bukhārī 1102; Ṣaḥīḥ Muslim 690',
  narrator: 'Ibn ʿUmar',
  grade: 'Ṣaḥīḥ (Muttafaq ʿalayh)',
  text:
    'I accompanied the Prophet ﷺ and he would not pray more than two rakʿahs on a journey, and Abū Bakr, ʿUmar and ʿUthmān likewise.',
};

/* ------------------------------------------------------------------ *
 * Jamʿ — joining
 * ------------------------------------------------------------------ */

export const JOIN_RULE =
  'Two pairs may be joined: Ẓuhr with ʿAṣr, and Maghrib with ʿIshāʾ. Fajr is never joined to anything. Joining may be done early (jamʿ taqdīm), praying both in the first prayer’s time, or late (jamʿ taʾkhīr), praying both in the second’s.';

export const JOIN_KINDS: { kind: JoinKind; label: string; detail: string }[] = [
  {
    kind: 'taqdim',
    label: 'Join early — jamʿ taqdīm',
    detail: 'Pray both in the time of the earlier prayer, the earlier one first.',
  },
  {
    kind: 'takhir',
    label: 'Join late — jamʿ taʾkhīr',
    detail: 'Delay the earlier prayer into the time of the later one and pray both then.',
  },
];

export const DALEEL_JOIN: Daleel = {
  source: 'hadith',
  reference: 'Ṣaḥīḥ al-Bukhārī 1107; Ṣaḥīḥ Muslim 704',
  narrator: 'Anas ibn Mālik',
  grade: 'Ṣaḥīḥ (Muttafaq ʿalayh)',
  text:
    'When the Prophet ﷺ set out on a journey before the sun had passed its zenith, he would delay Ẓuhr until the time of ʿAṣr and then join them.',
};

export const JOIN_NOTE =
  'Joining is a wider concession than shortening: the majority allow it in travel, and many also allow it for genuine hardship such as illness or heavy rain. Shortening, however, is tied to travel alone.';

/* ------------------------------------------------------------------ *
 * The sunnah prayers, and other notes
 * ------------------------------------------------------------------ */

export const TRAVEL_NOTES: string[] = [
  'The regular sunnah prayers before and after the obligatory ones are left in travel — except the two before Fajr and the Witr, which the Prophet ﷺ kept.',
  'If you pray behind a resident imām, follow him and complete four rakʿahs; shortening is only for the one praying alone or behind another traveller.',
  'The concession begins once you have left the built-up area of your town, not from the moment you decide to travel.',
  'Fasting may also be broken while travelling and made up later — the choice is yours, and neither is blame.',
];

export const TRAVEL_DISCLAIMER =
  'These are the well-known positions of the schools, gathered for study and pending scholarly review. Adl does not choose a school for you — where the scholars differ the difference is shown, and you follow your own teacher.';
