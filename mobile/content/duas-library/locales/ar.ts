/**
 * Arabic table for the Duʿāʾ Library.
 *
 * Provenance is `machine`: these strings were produced by a model and have not
 * been checked by a qualified reader. A reviewer promotes an entry by adding
 * its id to `human`, after which the generator will never overwrite it.
 *
 * `translation` is deliberately absent for most entries — the supplication is
 * already in Arabic, so an Arabic gloss of it adds nothing. Those fields fall
 * back to English by design.
 */
import type { LocaleTable } from '../../../lib/contentI18n';

const ar: LocaleTable = {
  meta: { locale: 'ar', provenance: 'machine', generatedAt: '2026-08-31' },
  human: [],
  entries: {
    'before-eating': {
      title: 'قبل الطعام',
      when: 'قبل تناول الطعام',
      tags: ['طعام', 'أكل', 'وجبة', 'بسم الله', 'مطبخ'],
    },
    'after-eating': {
      title: 'بعد الطعام',
      when: 'بعد الفراغ من الطعام',
      tags: ['طعام', 'أكل', 'حمد', 'شكر'],
    },
    'leaving-home': {
      title: 'عند الخروج من المنزل',
      when: 'عند مغادرة البيت',
      tags: ['بيت', 'منزل', 'خروج', 'توكل'],
    },
    'entering-home': {
      title: 'عند دخول المنزل',
      when: 'عند الرجوع إلى البيت',
      tags: ['بيت', 'منزل', 'دخول'],
    },
    'wearing-clothes': {
      title: 'عند لبس الثوب',
      when: 'عند ارتداء الملابس',
      tags: ['لباس', 'ثوب', 'ملابس'],
    },
    'entering-bathroom': {
      title: 'عند دخول الخلاء',
      when: 'قبل دخول الخلاء',
      tags: ['خلاء', 'حمام', 'دخول'],
    },
    'leaving-bathroom': {
      title: 'عند الخروج من الخلاء',
      when: 'بعد الخروج من الخلاء',
      tags: ['خلاء', 'حمام', 'خروج', 'غفران'],
    },
    'entering-mosque': {
      title: 'عند دخول المسجد',
      when: 'عند دخول المسجد',
      tags: ['مسجد', 'دخول', 'رحمة'],
    },
    'leaving-mosque': {
      title: 'عند الخروج من المسجد',
      when: 'عند مغادرة المسجد',
      tags: ['مسجد', 'خروج', 'فضل'],
    },
    'after-adhan': {
      title: 'بعد الأذان',
      when: 'عقب سماع الأذان',
      tags: ['أذان', 'صلاة', 'وسيلة', 'شفاعة'],
    },
    'travel-mount': {
      title: 'عند ركوب الدابة',
      when: 'عند ركوب وسيلة السفر',
      tags: ['سفر', 'ركوب', 'رحلة'],
    },
    'travel-ease': {
      title: 'دعاء تيسير السفر',
      when: 'عند بداية الرحلة',
      tags: ['سفر', 'تيسير', 'رحلة'],
    },
    'travel-return': {
      title: 'عند الرجوع من السفر',
      when: 'عند العودة إلى الأهل',
      tags: ['سفر', 'رجوع', 'عودة'],
    },
    'when-raining': {
      title: 'عند نزول المطر',
      when: 'أثناء نزول المطر',
      tags: ['مطر', 'غيث', 'سماء'],
    },
    'after-rain': {
      title: 'بعد المطر',
      when: 'عقب توقف المطر',
      tags: ['مطر', 'فضل', 'رحمة'],
    },
    wind: {
      title: 'عند هبوب الريح',
      when: 'عند اشتداد الريح',
      tags: ['ريح', 'عاصفة', 'طقس'],
    },
    thunder: {
      title: 'عند سماع الرعد',
      when: 'عند سماع الرعد',
      tags: ['رعد', 'برق', 'عاصفة'],
    },
  },
};

export default ar;
