/**
 * postures.ts — the reviewable prose for each bodily posture of the prayer: its
 * names, its rank, the physical instruction, a clarifying tip, the differences
 * between the schools and (where relevant) for women, and the evidence. The
 * engine in lib/salah.ts clones these templates per rakʿah and attaches the
 * right recitations from recitations.ts.
 *
 * The overarching proof for the whole method is the Prophet's ﷺ command,
 * “Pray as you have seen me pray” (Ṣaḥīḥ al-Bukhārī 631), and his correction of
 * the man who prayed badly, in which he commanded calm stillness (ṭumaʾnīnah)
 * in every posture (Ṣaḥīḥ al-Bukhārī 757, Ṣaḥīḥ Muslim 397).
 */
import type { PostureTemplate } from './types';

/** The keys the engine references when assembling a prayer. */
export type TemplateKey =
  | 'takbir'
  | 'qiyam'
  | 'ruku'
  | 'itidal'
  | 'sujud'
  | 'julus'
  | 'tashahhud'
  | 'salam';

export const POSTURE_TEMPLATES: Record<TemplateKey, PostureTemplate> = {
  takbir: {
    posture: 'takbir',
    name: 'The opening takbīr',
    arabic: 'تَكْبِيرَةُ الْإِحْرَام',
    transliteration: 'Takbīrat al-iḥrām',
    rank: 'rukn',
    art: 'takbir',
    instruction:
      'Stand facing the qiblah. Raise both hands to the level of the shoulders or the ears, and say “Allāhu akbar.” With this takbīr you enter the prayer, and what was lawful before it — speaking, eating, turning — is now forbidden until the salām.',
    tip: 'Then place the right hand over the left upon the chest, and lower your gaze to the place of prostration.',
    notes: [
      {
        id: 'takbir-hands-raise',
        text: 'The hands are raised at the opening takbīr by agreement, and (for most) again before bowing, on rising from it, and on standing for the third rakʿah.',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ al-Bukhārī 735',
          narrator: 'ʿAbdullāh ibn ʿUmar',
          grade: 'Ṣaḥīḥ',
          text: 'He would raise his hands level with his shoulders when he opened the prayer, when he bowed, and when he raised his head from bowing.',
        },
      },
      {
        id: 'takbir-hand-placement',
        text: 'On where the hands rest: the Shāfiʿīs and Ḥanbalīs place them on the chest, the Ḥanafīs below the navel, and among the Mālikīs is the view of letting them hang. Each follows a narration.',
      },
    ],
    daleel: [
      {
        source: 'hadith',
        reference: 'Ṣaḥīḥ al-Bukhārī 631',
        narrator: 'Mālik ibn al-Ḥuwayrith',
        grade: 'Ṣaḥīḥ',
        text: '“Pray as you have seen me pray.”',
      },
    ],
  },

  qiyam: {
    posture: 'qiyam',
    name: 'Standing & recitation',
    arabic: 'الْقِيَام',
    transliteration: 'al-Qiyām',
    rank: 'rukn',
    art: 'standing',
    instruction:
      'Standing, recite al-Fātiḥah — the pillar of every rakʿah. In the first two rakaʿāt, follow it with whatever you can of the Qurʾān; in the third and fourth, al-Fātiḥah alone suffices.',
    tip: 'Standing is obligatory in the farḍ prayer for whoever is able. One who genuinely cannot stand prays sitting, and if not, lying down.',
    notes: [
      {
        id: 'qiyam-jahr',
        text: 'The recitation is aloud (jahr) in Fajr and the first two rakaʿāt of Maghrib and ʿIshāʾ, and silent (sirr) in Ẓuhr, ʿAṣr and the remaining rakaʿāt.',
      },
      {
        id: 'qiyam-fatihah-behind-imam',
        text: 'Whether the follower recites al-Fātiḥah behind a reciting imām is a known difference among the schools; each rests on evidence.',
      },
    ],
    daleel: [
      {
        source: 'quran',
        reference: 'al-Baqarah 2:238',
        text: '“Guard strictly the prayers, especially the middle prayer, and stand before Allah devoutly obedient.”',
      },
    ],
  },

  ruku: {
    posture: 'ruku',
    name: 'Bowing',
    arabic: 'الرُّكُوع',
    transliteration: 'ar-Rukūʿ',
    rank: 'rukn',
    art: 'bowing',
    instruction:
      'Saying “Allāhu akbar,” bow so that the back is level and straight, grasping the knees with the fingers spread, the head neither raised above the back nor dropped below it. Be still — do not hurry.',
    tip: 'Stillness (ṭumaʾnīnah) is a pillar: settle in the bow until every joint is at rest before rising.',
    daleel: [
      {
        source: 'hadith',
        reference: 'Ṣaḥīḥ al-Bukhārī 757, Ṣaḥīḥ Muslim 397',
        narrator: 'Abū Hurayrah',
        grade: 'Ṣaḥīḥ',
        text: 'To the man who prayed badly: “…then bow until you are calm and at rest in bowing, then rise until you stand erect…”',
      },
    ],
  },

  itidal: {
    posture: 'itidal',
    name: 'Rising erect',
    arabic: 'الِاعْتِدَال',
    transliteration: 'al-Iʿtidāl',
    rank: 'rukn',
    art: 'rising',
    instruction:
      'Rise from the bow until you are standing fully erect and settled, saying “Samiʿa Llāhu liman ḥamidah” as you rise, and “Rabbanā wa laka l-ḥamd” once standing.',
    tip: 'Do not begin to descend into prostration until you have stood completely upright and still.',
    daleel: [
      {
        source: 'hadith',
        reference: 'Ṣaḥīḥ al-Bukhārī 795',
        narrator: 'Abū Hurayrah',
        grade: 'Ṣaḥīḥ',
        text: 'When the imām says “Samiʿa Llāhu liman ḥamidah,” say “Rabbanā wa laka l-ḥamd.”',
      },
    ],
  },

  sujud: {
    posture: 'sujud',
    name: 'Prostration',
    arabic: 'السُّجُود',
    transliteration: 'as-Sujūd',
    rank: 'rukn',
    art: 'prostration',
    instruction:
      'Saying “Allāhu akbar,” descend into prostration upon seven bones: the forehead together with the nose, both palms, both knees, and the toes of both feet. Keep the forearms raised off the ground, and be still.',
    tip: 'This is the posture closest to Allah — make it firm and unhurried.',
    notes: [
      {
        id: 'sujud-limbs-women',
        text: 'The majority hold that a woman prays as a man does in form; some scholars mention that she draws her limbs closer together. The seven points of contact are the same.',
        gender: 'female',
      },
    ],
    daleel: [
      {
        source: 'hadith',
        reference: 'Ṣaḥīḥ al-Bukhārī 812, Ṣaḥīḥ Muslim 490',
        narrator: 'ʿAbdullāh ibn ʿAbbās',
        grade: 'Ṣaḥīḥ',
        text: '“I have been commanded to prostrate upon seven bones: the forehead — and he pointed to his nose — the hands, the knees, and the ends of the feet.”',
      },
    ],
  },

  julus: {
    posture: 'julus',
    name: 'Sitting between prostrations',
    arabic: 'الْجَلْسَة بَيْنَ السَّجْدَتَيْن',
    transliteration: 'al-Jalsah bayna s-sajdatayn',
    rank: 'rukn',
    art: 'sitting',
    instruction:
      'Rise from the first prostration saying “Allāhu akbar,” and sit calmly — sitting upon the left foot with the right foot upright (iftirāsh) — and ask, “Rabbi ghfir lī.” Then prostrate a second time, settling again.',
    tip: 'Sit until your back is at rest before the second prostration; do not peck the ground like a bird.',
    daleel: [
      {
        source: 'hadith',
        reference: 'Ṣaḥīḥ al-Bukhārī 828',
        narrator: 'Abū Ḥumayd as-Sāʿidī',
        grade: 'Ṣaḥīḥ',
        text: 'When he sat between the two prostrations, he sat upon his left foot and raised the right.',
      },
    ],
  },

  tashahhud: {
    posture: 'tashahhud',
    name: 'The sitting & testimony',
    arabic: 'التَّشَهُّد',
    transliteration: 'at-Tashahhud',
    rank: 'rukn',
    art: 'sitting',
    instruction:
      'After every two rakaʿāt, and at the end of the prayer, sit and recite the tashahhud (at-Taḥiyyāt). In the final sitting, follow it with the ṣalāh upon the Prophet ﷺ and a supplication before the salām.',
    tip: 'During the testimony, raise the index finger of the right hand, pointing with it as you affirm the oneness of Allah.',
    notes: [
      {
        id: 'tashahhud-sitting-form',
        text: 'In the final sitting the Shāfiʿīs and Ḥanbalīs sit tawarruk (the left hip on the ground), while the Ḥanafīs sit iftirāsh in every sitting. Each follows a sound narration.',
      },
      {
        id: 'tashahhud-finger',
        text: 'Pointing the index finger in the tashahhud is established Sunnah.',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ Muslim 580',
          narrator: 'ʿAbdullāh ibn ʿUmar',
          grade: 'Ṣaḥīḥ',
          text: 'When he sat in the prayer he would point with his index finger.',
        },
      },
    ],
  },

  salam: {
    posture: 'salam',
    name: 'The closing salām',
    arabic: 'التَّسْلِيم',
    transliteration: 'at-Taslīm',
    rank: 'rukn',
    art: 'salam',
    instruction:
      'End the prayer by turning the face to the right, saying “As-salāmu ʿalaykum wa raḥmatu Llāh,” then to the left, saying it again. With this salām you leave the prayer.',
    tip: 'The first salām, to the right, is the obligatory pillar that releases the prayer.',
    daleel: [
      {
        source: 'hadith',
        reference: 'Ṣaḥīḥ Muslim 582',
        narrator: 'Saʿd ibn Abī Waqqāṣ',
        grade: 'Ṣaḥīḥ',
        text: 'He would give salām to his right and to his left.',
      },
    ],
  },
};

/**
 * The funeral prayer (Ṣalāt al-Janāzah) — four takbīrs while standing, with no
 * bowing or prostration. These ordered templates carry its prose; the engine
 * attaches the recitations and keys.
 */
export const JANAZAH_TEMPLATES: PostureTemplate[] = [
  {
    posture: 'takbir',
    name: 'First takbīr — al-Fātiḥah',
    arabic: 'التَّكْبِيرَةُ الْأُولَى',
    transliteration: 'at-Takbīrah al-ūlā',
    rank: 'rukn',
    art: 'takbir',
    instruction:
      'Standing, raise the hands and say “Allāhu akbar,” seek refuge, and recite al-Fātiḥah quietly. The funeral prayer has no bowing and no prostration — it is standing, supplication, and salām.',
    daleel: [
      {
        source: 'hadith',
        reference: 'Ṣaḥīḥ al-Bukhārī 1335',
        narrator: 'Ibn ʿAbbās',
        grade: 'Ṣaḥīḥ',
        text: 'He recited al-Fātiḥah over the deceased, saying, “It is from the Sunnah.”',
      },
    ],
  },
  {
    posture: 'takbir',
    name: 'Second takbīr — blessings upon the Prophet ﷺ',
    arabic: 'التَّكْبِيرَةُ الثَّانِيَة',
    transliteration: 'at-Takbīrah ath-thāniyah',
    rank: 'rukn',
    art: 'takbir',
    instruction:
      'Say “Allāhu akbar” again, and send blessings upon the Prophet ﷺ as in the tashahhud (the Ibrāhīmiyyah).',
  },
  {
    posture: 'takbir',
    name: 'Third takbīr — supplication for the deceased',
    arabic: 'التَّكْبِيرَةُ الثَّالِثَة',
    transliteration: 'at-Takbīrah ath-thālithah',
    rank: 'rukn',
    art: 'takbir',
    instruction:
      'Say “Allāhu akbar,” and supplicate sincerely for the deceased — for forgiveness and mercy.',
  },
  {
    posture: 'salam',
    name: 'Fourth takbīr & salām',
    arabic: 'التَّكْبِيرَةُ الرَّابِعَة',
    transliteration: 'at-Takbīrah ar-rābiʿah',
    rank: 'rukn',
    art: 'salam',
    instruction:
      'Say “Allāhu akbar” a fourth time, pause briefly, then give the salām to the right (and the left), ending the prayer.',
  },
];
