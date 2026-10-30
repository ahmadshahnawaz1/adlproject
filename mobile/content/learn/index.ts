/**
 * content/learn — the barrel for the Learning Hub.
 *
 * Gathers the lesson sections (ʿAqīdah, Fiqh) and the New Muslim path, exposes
 * the topic tiles, the flattened collections, and small resolvers, and carries
 * the standing review disclaimer. The Sīrah has its own graded corpus in
 * content/sirah; the Sīrah tile here opens that journey.
 */
export * from './types';

import type { Lesson, LearnTopic, Track } from './types';
import { AQIDAH_LESSONS } from './aqidah';
import { FIQH_LESSONS } from './fiqh';
import { NEW_MUSLIM_TRACK } from './newmuslim';

export { AQIDAH_LESSONS, FIQH_LESSONS, NEW_MUSLIM_TRACK };

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

/** A plain note that the content awaits scholarly review. */
export const LEARN_DISCLAIMER =
  'These lessons and the events of the Sīrah are gathered from the Qurʾān, the authentic Sunnah, and the well-known works of Sīrah, and are pending final scholarly review. They are an introduction, not a substitute for learning from qualified teachers.';
