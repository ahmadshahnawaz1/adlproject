/**
 * voluntaryFasts.ts — the recommended (nafl) fasts of the year and the days on
 * which fasting is forbidden, each with its virtue and evidence. The hub uses
 * this to suggest the next recommended fast and to warn off the forbidden days.
 *
 * "When" is expressed in Hijri terms (month + day rules) so the next occurrence
 * can be computed offline from the Islamic calendar.
 */
import type { Daleel } from './fasting';
import {
  DHUL_HIJJAH_MONTH,
  MUHARRAM_MONTH,
  SHABAN_MONTH,
  SHAWWAL_MONTH,
} from './fasting';

/** A rule describing when a recommended fast falls, in Hijri terms. */
export type FastWhen =
  | { kind: 'weekday'; weekdays: number[] } // 0=Sun … 6=Sat (Gregorian weekday)
  | { kind: 'monthlyDays'; days: number[] } // Hijri days every month (e.g. 13,14,15)
  | { kind: 'hijriDate'; month: number; days: number[] } // specific month + day(s)
  | { kind: 'hijriRange'; month: number; from: number; to: number }; // a span of days

export type VoluntaryFast = {
  id: string;
  name: string;
  arabic: string;
  when: FastWhen;
  summary: string;
  virtue: string;
  daleel: Daleel;
};

export const VOLUNTARY_FASTS: VoluntaryFast[] = [
  {
    id: 'mon-thu',
    name: 'Mondays & Thursdays',
    arabic: 'الاثنين والخميس',
    when: { kind: 'weekday', weekdays: [1, 4] },
    summary: 'The two days on which deeds are raised to Allah.',
    virtue: 'The Prophet ﷺ used to fast Monday and Thursday, loving that his deeds be raised while fasting.',
    daleel: {
      source: 'hadith',
      reference: 'Jāmiʿ at-Tirmidhī 747',
      narrator: 'Abū Hurayrah',
      grade: 'Ḥasan',
      text: 'Deeds are presented on Monday and Thursday, so I love that my deeds be presented while I am fasting.',
    },
  },
  {
    id: 'ayyam-bid',
    name: 'Ayyām al-Bīḍ (white days)',
    arabic: 'أيام البيض',
    when: { kind: 'monthlyDays', days: [13, 14, 15] },
    summary: 'The three bright nights of every Hijri month — the 13th, 14th and 15th.',
    virtue: 'Fasting three days of each month is like fasting the whole month.',
    daleel: {
      source: 'hadith',
      reference: 'Sunan an-Nasāʾī 2422',
      narrator: 'Abū Dharr',
      grade: 'Ṣaḥīḥ',
      text: 'If you fast any part of the month, then fast the 13th, 14th and 15th.',
    },
  },
  {
    id: 'arafah',
    name: 'Day of ʿArafah',
    arabic: 'يوم عرفة',
    when: { kind: 'hijriDate', month: DHUL_HIJJAH_MONTH, days: [9] },
    summary: 'The 9th of Dhū al-Ḥijjah — for those not performing Ḥajj.',
    virtue: 'Fasting expiates the sins of the year before and the year after.',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 1162',
      narrator: 'Abū Qatādah',
      grade: 'Ṣaḥīḥ',
      text: 'Fasting the day of ʿArafah expiates the sins of the previous year and the coming year.',
    },
  },
  {
    id: 'ashura',
    name: 'ʿĀshūrāʾ (with Tāsūʿāʾ)',
    arabic: 'عاشوراء',
    when: { kind: 'hijriDate', month: MUHARRAM_MONTH, days: [9, 10] },
    summary: 'The 10th of Muḥarram, with the 9th to differ from others.',
    virtue: 'Fasting ʿĀshūrāʾ expiates the sins of the past year.',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 1162',
      narrator: 'Abū Qatādah',
      grade: 'Ṣaḥīḥ',
      text: 'Fasting the day of ʿĀshūrāʾ, I hope from Allah, expiates the year that came before it.',
    },
  },
  {
    id: 'shawwal',
    name: 'Six days of Shawwāl',
    arabic: 'ست من شوال',
    when: { kind: 'hijriRange', month: SHAWWAL_MONTH, from: 2, to: 30 },
    summary: 'Any six days of Shawwāl after Eid al-Fiṭr.',
    virtue: 'Following Ramadan with six of Shawwāl is like fasting the entire year.',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 1164',
      narrator: 'Abū Ayyūb',
      grade: 'Ṣaḥīḥ',
      text: 'Whoever fasts Ramadan then follows it with six days of Shawwāl, it is as though he fasted the whole year.',
    },
  },
  {
    id: 'dhul-hijjah',
    name: 'First nine of Dhū al-Ḥijjah',
    arabic: 'عشر ذي الحجة',
    when: { kind: 'hijriRange', month: DHUL_HIJJAH_MONTH, from: 1, to: 9 },
    summary: 'The best days of the year for righteous deeds.',
    virtue: 'No days are more beloved to Allah for good deeds than these ten.',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 969',
      narrator: 'Ibn ʿAbbās',
      grade: 'Ṣaḥīḥ',
      text: 'No good deeds done on other days are superior to those done in these (first ten of Dhū al-Ḥijjah).',
    },
  },
  {
    id: 'shaban',
    name: 'Shaʿbān',
    arabic: 'شعبان',
    when: { kind: 'hijriRange', month: SHABAN_MONTH, from: 1, to: 28 },
    summary: 'The month in which deeds are raised — the Prophet ﷺ fasted most of it.',
    virtue: 'It is a month people neglect, between Rajab and Ramadan, in which deeds ascend.',
    daleel: {
      source: 'hadith',
      reference: 'Sunan an-Nasāʾī 2357',
      narrator: 'Usāmah ibn Zayd',
      grade: 'Ḥasan',
      text: 'It is a month people neglect… in which deeds are raised to the Lord of the worlds, and I love that my deeds be raised while fasting.',
    },
  },
];

/** A day on which fasting is prohibited or disliked. */
export type ForbiddenFast = {
  id: string;
  name: string;
  when: FastWhen;
  reason: string;
  daleel: Daleel;
};

export const FORBIDDEN_FASTS: ForbiddenFast[] = [
  {
    id: 'eid-fitr',
    name: 'Eid al-Fiṭr',
    when: { kind: 'hijriDate', month: SHAWWAL_MONTH, days: [1] },
    reason: 'Fasting is forbidden on the day of Eid al-Fiṭr — it is a day of eating.',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 1991',
      narrator: 'Abū Saʿīd al-Khudrī',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ forbade fasting on the day of Fiṭr and the day of Naḥr (Eid al-Aḍḥā).',
    },
  },
  {
    id: 'eid-adha-tashriq',
    name: 'Eid al-Aḍḥā & days of Tashrīq',
    when: { kind: 'hijriDate', month: DHUL_HIJJAH_MONTH, days: [10, 11, 12, 13] },
    reason: 'The 10th–13th of Dhū al-Ḥijjah are days of eating, drinking and remembrance of Allah.',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 1141',
      narrator: 'Nubayshah al-Hudhalī',
      grade: 'Ṣaḥīḥ',
      text: 'The days of Tashrīq are days of eating, drinking and remembrance of Allah.',
    },
  },
];
