/**
 * guidance.ts — the surrounding fiqh the runner does not walk through step by
 * step but every worshipper needs: the conditions that must be met before the
 * prayer (shurūṭ), the stillness and presence of heart that perfect it, the
 * common mistakes to avoid, the prostration of forgetfulness (sajdah sahw), the
 * sutrah (barrier), a balanced note on the woman's prayer, and the virtue of
 * praying in congregation. It feeds the SalahInfoSheet.
 *
 * As with the rest of Adl, every ruling is cited; where the schools differ it
 * is noted, not asserted; and the whole is presented as pending review by a
 * qualified scholar (see the disclaimer below).
 */
import type { Daleel } from './types';

export type GuidancePoint = {
  id: string;
  title?: string;
  text: string;
  daleel?: Daleel;
};

export type GuidanceSection = {
  id: string;
  title: string;
  intro?: string;
  points: GuidancePoint[];
};

export const SALAH_GUIDANCE: GuidanceSection[] = [
  {
    id: 'conditions',
    title: 'Before you begin — the conditions',
    intro: 'The prayer is only valid once these are met:',
    points: [
      {
        id: 'purity',
        title: 'Purity (ṭahārah)',
        text: 'Be free of minor impurity through wudū, and of major impurity through ghusl.',
        daleel: {
          source: 'quran',
          reference: 'al-Māʾidah 5:6',
          text: '“O you who believe, when you rise to pray, wash your faces and your hands up to the elbows…”',
        },
      },
      {
        id: 'cleanliness',
        title: 'Cleanliness',
        text: 'The body, the garment and the place of prayer should be free of impurity (najāsah).',
        daleel: {
          source: 'quran',
          reference: 'al-Muddaththir 74:4',
          text: '“And purify your garments.”',
        },
      },
      {
        id: 'awrah',
        title: 'Covering the ʿawrah',
        text: 'A man covers at least from the navel to the knee; a woman covers all but her face and hands.',
        daleel: {
          source: 'quran',
          reference: 'al-Aʿrāf 7:31',
          text: '“O children of Ādam, take your adornment at every place of prayer.”',
        },
      },
      {
        id: 'time',
        title: 'The time has entered',
        text: 'Each prayer has a beginning and an end; it is not valid before its time.',
        daleel: {
          source: 'quran',
          reference: 'an-Nisāʾ 4:103',
          text: '“Indeed, the prayer has been decreed upon the believers at fixed times.”',
        },
      },
      {
        id: 'qiblah',
        title: 'Facing the qiblah',
        text: 'Turn the body toward the Sacred Mosque in Makkah.',
        daleel: {
          source: 'quran',
          reference: 'al-Baqarah 2:144',
          text: '“So turn your face toward the Sacred Mosque, and wherever you are, turn your faces toward it.”',
        },
      },
      {
        id: 'niyyah',
        title: 'Intention (niyyah)',
        text: 'Resolve in the heart which prayer you intend. The intention is held in the heart and is not spoken aloud.',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ al-Bukhārī 1, Ṣaḥīḥ Muslim 1907',
          narrator: 'ʿUmar ibn al-Khaṭṭāb',
          grade: 'Ṣaḥīḥ',
          text: '“Actions are but by intentions.”',
        },
      },
    ],
  },
  {
    id: 'khushu',
    title: 'Stillness & presence of heart',
    intro: 'What turns the motions into a prayer that is accepted:',
    points: [
      {
        id: 'tumaninah',
        title: 'Calm stillness (ṭumaʾnīnah)',
        text: 'Settle in each posture until every joint is at rest before moving to the next. Hurrying through the prayer is a pillar left undone.',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ al-Bukhārī 757, Ṣaḥīḥ Muslim 397',
          narrator: 'Abū Hurayrah',
          grade: 'Ṣaḥīḥ',
          text: 'He commanded the man who prayed badly to be calm and at rest in his bowing, his rising, his prostration and his sitting.',
        },
      },
      {
        id: 'khushu-heart',
        title: 'Humble focus (khushūʿ)',
        text: 'Pray as though you see Allah; for though you do not see Him, He sees you. Lower the gaze to the place of prostration and let the heart attend.',
        daleel: {
          source: 'quran',
          reference: 'al-Muʾminūn 23:1–2',
          text: '“Successful indeed are the believers — those who humble themselves in their prayer.”',
        },
      },
    ],
  },
  {
    id: 'mistakes',
    title: 'Common mistakes to avoid',
    points: [
      {
        id: 'rushing',
        text: 'Pecking through bowing and prostration without settling — the most frequent error, and a grave one.',
      },
      {
        id: 'gaze-sky',
        text: 'Raising the eyes to the sky during prayer.',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ al-Bukhārī 750',
          narrator: 'Anas ibn Mālik',
          grade: 'Ṣaḥīḥ',
          text: 'He warned sternly against those who raise their gaze to the heavens in prayer.',
        },
      },
      {
        id: 'preceding-imam',
        text: 'Moving before the imām — bowing or rising ahead of him — rather than following.',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ al-Bukhārī 691',
          narrator: 'Abū Hurayrah',
          grade: 'Ṣaḥīḥ',
          text: '“The imām is appointed to be followed, so do not differ from him.”',
        },
      },
      {
        id: 'no-fatihah',
        text: 'Neglecting al-Fātiḥah, or reciting before standing fully upright.',
      },
      {
        id: 'fidgeting',
        text: 'Needless movement and fidgeting, which steals from the prayer’s stillness.',
      },
    ],
  },
  {
    id: 'sahw',
    title: 'The prostration of forgetfulness (sajdah sahw)',
    intro:
      'Two extra prostrations that mend an honest mistake in the prayer — for an addition, the omission of an obligatory act, or genuine doubt.',
    points: [
      {
        id: 'sahw-addition',
        title: 'For an addition',
        text: 'If you added a posture out of forgetfulness, prostrate twice after the salām.',
      },
      {
        id: 'sahw-omission',
        title: 'For an omission',
        text: 'If you left an obligatory act (such as the first tashahhud) and did not return, prostrate twice before the salām.',
      },
      {
        id: 'sahw-doubt',
        title: 'For doubt',
        text: 'If unsure how many rakaʿāt you prayed, build on what you are certain of (the lesser), complete the prayer, and prostrate twice before the salām.',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ Muslim 571',
          narrator: 'Abū Saʿīd al-Khudrī',
          grade: 'Ṣaḥīḥ',
          text: '“If one of you doubts in his prayer… let him discard the doubt and build on what he is sure of, then prostrate twice before he gives salām.”',
        },
      },
    ],
  },
  {
    id: 'sutrah',
    title: 'The barrier (sutrah)',
    points: [
      {
        id: 'sutrah-1',
        text: 'Pray toward a barrier — a wall, a pillar, or an object before you — and do not let anyone pass directly between you and it.',
        daleel: {
          source: 'hadith',
          reference: 'Sunan Abī Dāwūd 698',
          narrator: 'Abū Saʿīd al-Khudrī',
          grade: 'Ṣaḥīḥ',
          text: '“When one of you prays toward a barrier, let him keep close to it, so that Satan does not cut off his prayer.”',
        },
      },
    ],
  },
  {
    id: 'women',
    title: 'The woman’s prayer',
    points: [
      {
        id: 'women-1',
        text: 'The default is that a woman prays as the Prophet ﷺ prayed — the same postures and recitations — under the command, “Pray as you have seen me pray.” She covers all but the face and hands, and some scholars note that she draws her limbs closer together in bowing and prostration for modesty. No wholesale different prayer is established for her.',
      },
    ],
  },
  {
    id: 'jamaah',
    title: 'Praying in congregation',
    points: [
      {
        id: 'jamaah-1',
        text: 'Praying the obligatory prayer in congregation is greatly emphasised and far more rewarding than praying alone.',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ al-Bukhārī 645, Ṣaḥīḥ Muslim 650',
          narrator: 'ʿAbdullāh ibn ʿUmar',
          grade: 'Ṣaḥīḥ',
          text: '“Prayer in congregation is twenty-seven times more excellent than prayer offered alone.”',
        },
      },
    ],
  },
];

/** Shown at the foot of the info sheet — the same bar as the rest of Adl. */
export const SALAH_DISCLAIMER =
  'This guide follows the method of the Prophet ﷺ as recorded in the authentic Sunnah, and notes where the schools of fiqh differ rather than asserting one ruling as universal. It is presented for learning and is pending review by a qualified scholar. For your specific situation, ask a trustworthy person of knowledge.';
