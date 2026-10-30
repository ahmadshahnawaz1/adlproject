/**
 * index.ts — the Duʿāʾ Library barrel.
 *
 * Re-exports the model, assembles every supplication into one searchable list,
 * describes the categories shown in the grid, and exposes small lookups used by
 * lib/duaSearch and the screen. The wording follows the Qurʾān and Ḥiṣn
 * al-Muslim; see the disclaimer below.
 */
export * from './types';

import type { Dua, DuaCategory, DuaCategoryId } from './types';
import { DAILY_DUAS, MOSQUE_DUAS, TRAVEL_DUAS, NATURE_DUAS } from './life';
import { DISTRESS_DUAS, FORGIVENESS_DUAS, PROTECTION_DUAS, GUIDANCE_DUAS } from './heart';
import { HEALTH_DUAS, PROVISION_DUAS } from './wellbeing';
import { QURAN_DUAS, PROPHETIC_DUAS } from './scripture';

export {
  DAILY_DUAS,
  MOSQUE_DUAS,
  TRAVEL_DUAS,
  NATURE_DUAS,
  DISTRESS_DUAS,
  FORGIVENESS_DUAS,
  PROTECTION_DUAS,
  GUIDANCE_DUAS,
  HEALTH_DUAS,
  PROVISION_DUAS,
  QURAN_DUAS,
  PROPHETIC_DUAS,
};

/** The library's sections, in display order, each with its grid icon. */
export const DUA_CATEGORIES: DuaCategory[] = [
  {
    id: 'daily',
    title: 'Everyday life',
    arabic: 'الْحَيَاةُ الْيَوْمِيَّة',
    subtitle: 'Eating, dressing, home & more',
    icon: 'Home',
  },
  {
    id: 'mosque',
    title: 'The mosque',
    arabic: 'الْمَسْجِد',
    subtitle: 'Entering, leaving & the adhān',
    icon: 'Landmark',
  },
  {
    id: 'travel',
    title: 'Travel',
    arabic: 'السَّفَر',
    subtitle: 'Setting out, the road & return',
    icon: 'Plane',
  },
  {
    id: 'nature',
    title: 'Weather & nature',
    arabic: 'الطَّقْسُ وَالطَّبِيعَة',
    subtitle: 'Rain, wind & thunder',
    icon: 'CloudSun',
  },
  {
    id: 'distress',
    title: 'Anxiety & hardship',
    arabic: 'الْكَرْبُ وَالْهَمّ',
    subtitle: 'Worry, grief & relief',
    icon: 'HeartPulse',
  },
  {
    id: 'forgiveness',
    title: 'Forgiveness',
    arabic: 'الِاسْتِغْفَار',
    subtitle: 'Seeking pardon & repentance',
    icon: 'Sparkles',
  },
  {
    id: 'protection',
    title: 'Protection & refuge',
    arabic: 'الْحِفْظُ وَالتَّعَوُّذ',
    subtitle: 'Seeking Allah’s protection',
    icon: 'ShieldCheck',
  },
  {
    id: 'guidance',
    title: 'Guidance & istikhārah',
    arabic: 'الْهُدَى وَالِاسْتِخَارَة',
    subtitle: 'Decisions & steadfastness',
    icon: 'Compass',
  },
  {
    id: 'provision',
    title: 'Provision & debt',
    arabic: 'الرِّزْقُ وَالدَّيْن',
    subtitle: 'Sustenance & relief from debt',
    icon: 'Coins',
  },
  {
    id: 'health',
    title: 'Health & healing',
    arabic: 'الصِّحَّةُ وَالشِّفَاء',
    subtitle: 'Illness, pain & well-being',
    icon: 'Stethoscope',
  },
  {
    id: 'quran',
    title: 'Qurʾānic supplications',
    arabic: 'أَدْعِيَةُ الْقُرْآن',
    subtitle: 'The great “Rabbanā” duʿās',
    icon: 'BookOpen',
  },
  {
    id: 'prophetic',
    title: 'Prophetic supplications',
    arabic: 'الْأَدْعِيَةُ النَّبَوِيَّة',
    subtitle: 'Comprehensive duʿās of the Prophet ﷺ',
    icon: 'ScrollText',
  },
];

/** Every supplication in the library, grouped by the category order above. */
export const ALL_DUAS: Dua[] = [
  ...DAILY_DUAS,
  ...MOSQUE_DUAS,
  ...TRAVEL_DUAS,
  ...NATURE_DUAS,
  ...DISTRESS_DUAS,
  ...FORGIVENESS_DUAS,
  ...PROTECTION_DUAS,
  ...GUIDANCE_DUAS,
  ...PROVISION_DUAS,
  ...HEALTH_DUAS,
  ...QURAN_DUAS,
  ...PROPHETIC_DUAS,
];

/** The first category to feature (Everyday life). */
export const DEFAULT_CATEGORY_ID: DuaCategoryId = 'daily';

/** Look up a category by id. */
export function categoryById(id: DuaCategoryId): DuaCategory | undefined {
  return DUA_CATEGORIES.find((c) => c.id === id);
}

/** The supplications belonging to one category, in catalogue order. */
export function duasInCategory(id: DuaCategoryId): Dua[] {
  return ALL_DUAS.filter((d) => d.category === id);
}

/** Look up a single supplication by id. */
export function duaById(id: string): Dua | undefined {
  return ALL_DUAS.find((d) => d.id === id);
}

/** Honest scope note shown on the library's info sheet. */
export const DUA_LIBRARY_DISCLAIMER =
  'These supplications are drawn from the Qurʾān and the authentic Sunnah, following Ḥiṣn al-Muslim and the major collections, with the narrator and grade noted. This is a study and worship aid, not a fatwa; the wording is pending formal scholarly review. Where a duʿā has a fixed count or manner, it is noted with it.';
