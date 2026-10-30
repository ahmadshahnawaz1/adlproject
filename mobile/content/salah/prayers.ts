/**
 * prayers.ts — the prayers the guide can teach, as data the engine reads to
 * build each one's ordered step list. The numbers here drive everything: the
 * rakʿah count decides where the sittings fall, `audibleRakahs` decides what is
 * read aloud, and the kind selects the Witr (qunūt) or Janāzah variations.
 */
import type { Prayer } from './types';

export const PRAYERS: Prayer[] = [
  {
    id: 'fajr',
    kind: 'daily',
    name: 'Fajr',
    arabic: 'الْفَجْر',
    transliteration: 'al-Fajr',
    rakahCount: 2,
    audibleRakahs: 2,
    tagline: 'The dawn prayer — two rakaʿāt, recited aloud.',
    sunnahRawatib: '2 rakaʿāt of emphasised Sunnah before it.',
    special: 'Both rakaʿāt are recited aloud; some recite qunūt after the bow in the second.',
  },
  {
    id: 'dhuhr',
    kind: 'daily',
    name: 'Ẓuhr',
    arabic: 'الظُّهْر',
    transliteration: 'aẓ-Ẓuhr',
    rakahCount: 4,
    audibleRakahs: 0,
    tagline: 'The midday prayer — four rakaʿāt, recited silently.',
    sunnahRawatib: '4 rakaʿāt before and 2 after (emphasised Sunnah).',
  },
  {
    id: 'asr',
    kind: 'daily',
    name: 'ʿAṣr',
    arabic: 'الْعَصْر',
    transliteration: 'al-ʿAṣr',
    rakahCount: 4,
    audibleRakahs: 0,
    tagline: 'The afternoon prayer — four rakaʿāt, recited silently.',
    special: 'The “middle prayer” the Qurʾān commands us to guard.',
  },
  {
    id: 'maghrib',
    kind: 'daily',
    name: 'Maghrib',
    arabic: 'الْمَغْرِب',
    transliteration: 'al-Maghrib',
    rakahCount: 3,
    audibleRakahs: 2,
    tagline: 'The sunset prayer — three rakaʿāt; the first two aloud.',
    sunnahRawatib: '2 rakaʿāt of emphasised Sunnah after it.',
  },
  {
    id: 'isha',
    kind: 'daily',
    name: 'ʿIshāʾ',
    arabic: 'الْعِشَاء',
    transliteration: 'al-ʿIshāʾ',
    rakahCount: 4,
    audibleRakahs: 2,
    tagline: 'The night prayer — four rakaʿāt; the first two aloud.',
    sunnahRawatib: '2 rakaʿāt of emphasised Sunnah after it.',
  },
  {
    id: 'witr',
    kind: 'witr',
    name: 'Witr',
    arabic: 'الْوِتْر',
    transliteration: 'al-Witr',
    rakahCount: 3,
    audibleRakahs: 3,
    tagline: 'The night’s seal — an odd prayer closing the day, with qunūt.',
    hasQunut: true,
    special:
      'Witr may be a single rakʿah or more; three is shown here. The qunūt is supplicated in the last rakʿah — for most after the bow, and for the Ḥanafīs before it.',
  },
  {
    id: 'janazah',
    kind: 'janazah',
    name: 'Janāzah',
    arabic: 'الْجَنَازَة',
    transliteration: 'al-Janāzah',
    rakahCount: 0,
    audibleRakahs: 0,
    tagline: 'The funeral prayer — four takbīrs, standing, with no bowing.',
    special: 'A communal obligation (farḍ kifāyah): standing only, no rukūʿ or sujūd.',
  },
];

/** Resolve a prayer by its id. */
export function prayerById(id: Prayer['id']): Prayer | undefined {
  return PRAYERS.find((p) => p.id === id);
}

/** The default prayer the guide opens on. */
export const DEFAULT_PRAYER_ID: Prayer['id'] = 'fajr';
