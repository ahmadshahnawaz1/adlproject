/**
 * content/learn — the barrel for the Learning Hub.
 *
 * Gathers the four sections (Sīrah, ʿAqīdah, Fiqh, and the New Muslim path),
 * exposes the topic tiles, the flattened collections, and small resolvers, and
 * carries the standing review disclaimer.
 */
export * from './types';

import type { Lesson, LearnTopic, SirahEvent, Track } from './types';
import { AQIDAH_LESSONS } from './aqidah';
import { FIQH_LESSONS } from './fiqh';
import { SIRAH_MAKKAH } from './sirahMakkah';
import { SIRAH_MADINAH } from './sirahMadinah';
import { NEW_MUSLIM_TRACK } from './newmuslim';

export { AQIDAH_LESSONS, FIQH_LESSONS, SIRAH_MAKKAH, SIRAH_MADINAH, NEW_MUSLIM_TRACK };

/** The whole Sīrah timeline, ordered from the earliest event to the last. */
export const SIRAH_EVENTS: SirahEvent[] = [...SIRAH_MAKKAH, ...SIRAH_MADINAH].sort(
  (a, b) => a.order - b.order,
);

/** Every standalone lesson (ʿAqīdah + Fiqh), in catalogue order. */
export const ALL_LESSONS: Lesson[] = [...AQIDAH_LESSONS, ...FIQH_LESSONS];

/** The guided path for the new Muslim. */
export { NEW_MUSLIM_TRACK as NEW_MUSLIM };

/** The browsable sections of the hub, in the order they appear on the grid. */
export const LEARN_TOPICS: LearnTopic[] = [
  {
    id: 'new-muslim',
    title: 'New to Islam',
    arabic: 'الجديد في الإسلام',
    subtitle: 'Start here',
    blurb: 'A gentle, guided path from the testimony of faith to your first prayer.',
    icon: 'Sprout',
    kind: 'track',
  },
  {
    id: 'sirah',
    title: 'The Life of the Prophet ﷺ',
    arabic: 'السيرة النبوية',
    subtitle: 'Sīrah timeline',
    blurb: 'Walk the life of Muḥammad ﷺ as a timeline, from before revelation to the farewell.',
    icon: 'Footprints',
    kind: 'sirah',
  },
  {
    id: 'aqidah',
    title: 'Foundations of Belief',
    arabic: 'العقيدة',
    subtitle: 'ʿAqīdah',
    blurb: 'Tawḥīd, the six pillars of īmān, and the testimony that opens Islam.',
    icon: 'Gem',
    kind: 'lessons',
  },
  {
    id: 'fiqh',
    title: 'The Fiqh of Worship',
    arabic: 'فقه العبادات',
    subtitle: 'Fiqh',
    blurb: 'How a Muslim worships: purification, prayer, fasting, zakāh, and ḥajj.',
    icon: 'Scale',
    kind: 'lessons',
  },
];

/** The first section opened by default. */
export const DEFAULT_TOPIC_ID = 'new-muslim' as const;

/** Resolve a topic tile by id. */
export function topicById(id: string): LearnTopic | undefined {
  return LEARN_TOPICS.find((t) => t.id === id);
}

/** Resolve a standalone lesson by id. */
export function lessonById(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

/** All lessons belonging to a topic (ʿAqīdah or Fiqh). */
export function lessonsInTopic(topicId: string): Lesson[] {
  return ALL_LESSONS.filter((l) => l.topicId === topicId);
}

/** Resolve a Sīrah event by id. */
export function sirahEventById(id: string): SirahEvent | undefined {
  return SIRAH_EVENTS.find((e) => e.id === id);
}

/** A plain note that the content awaits scholarly review. */
export const LEARN_DISCLAIMER =
  'These lessons and the events of the Sīrah are gathered from the Qurʾān, the authentic Sunnah, and the well-known works of Sīrah, and are pending final scholarly review. They are an introduction, not a substitute for learning from qualified teachers.';
