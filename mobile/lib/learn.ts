/**
 * lib/learn — the pure logic over the Learning Hub content.
 *
 * Adds a forgiving, diacritic-insensitive search across the lessons and the
 * Sīrah timeline, small helpers to read the plain text out of a lesson's
 * blocks, the grouping of lessons under their section headers, and the
 * progress maths for the guided "New Muslim" path. Everything here is pure and
 * synchronous, so it is fully covered by tests.
 */
import {
  ALL_LESSONS,
  SIRAH_EVENTS,
  LEARN_TOPICS,
  NEW_MUSLIM_TRACK,
  lessonById,
  lessonsInTopic,
  topicById,
  sirahEventById,
  type Lesson,
  type LessonBlock,
  type SirahEvent,
  type Track,
  type TrackStep,
} from '../content/learn';
import { normalizeText, queryTokens } from './duaSearch';

export {
  ALL_LESSONS,
  SIRAH_EVENTS,
  LEARN_TOPICS,
  NEW_MUSLIM_TRACK,
  lessonById,
  lessonsInTopic,
  topicById,
  sirahEventById,
};
export { normalizeText, queryTokens };

/** Pull the searchable plain text out of a single lesson block. */
export function blockText(block: LessonBlock): string {
  switch (block.kind) {
    case 'para':
    case 'heading':
      return block.text;
    case 'point':
    case 'steps':
      return block.items.join(' ');
    case 'ayah':
      return `${block.reference} ${block.translation}`;
    case 'hadith':
      return `${block.daleel.reference} ${block.daleel.text} ${block.daleel.narrator ?? ''}`;
    case 'callout':
      return `${block.title ?? ''} ${block.text}`;
    case 'dua':
      return `${block.translation} ${block.transliteration ?? ''} ${block.reference ?? ''}`;
    default:
      return '';
  }
}

/** Concatenate the plain text of every block in a body. */
export function bodyText(body: LessonBlock[]): string {
  return body.map(blockText).join(' ');
}

/** A unified search hit, tagged by which collection it came from. */
export type LearnSearchHit =
  | { kind: 'lesson'; lesson: Lesson }
  | { kind: 'sirah'; event: SirahEvent };

function scoreTokens(haystackHigh: string, haystackLow: string, tokens: string[]): number {
  const high = normalizeText(haystackHigh);
  const low = normalizeText(haystackLow);
  let score = 0;
  for (const token of tokens) {
    if (high.includes(token)) score += 3;
    else if (low.includes(token)) score += 1;
    else return 0; // every token must match somewhere (logical AND)
  }
  return score;
}

/** Search the standalone lessons (ʿAqīdah + Fiqh). Empty query → []. */
export function searchLessons(query: string): Lesson[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];
  return ALL_LESSONS.map((lesson) => {
    const high = `${lesson.title} ${lesson.arabic ?? ''} ${lesson.group} ${(lesson.tags ?? []).join(' ')}`;
    const low = `${lesson.summary} ${bodyText(lesson.body)}`;
    return { lesson, score: scoreTokens(high, low, tokens) };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.lesson);
}

/** Search the Sīrah timeline. Empty query → []. */
export function searchSirah(query: string): SirahEvent[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];
  return SIRAH_EVENTS.map((event) => {
    const high = `${event.title} ${event.arabic ?? ''} ${event.place} ${event.year} ${(event.tags ?? []).join(' ')}`;
    const low = `${event.summary} ${bodyText(event.body)}`;
    return { event, score: scoreTokens(high, low, tokens) };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.event);
}

/** Search lessons and the Sīrah together, lessons first. Empty query → []. */
export function searchLearn(query: string): LearnSearchHit[] {
  const lessons: LearnSearchHit[] = searchLessons(query).map((lesson) => ({ kind: 'lesson', lesson }));
  const sirah: LearnSearchHit[] = searchSirah(query).map((event) => ({ kind: 'sirah', event }));
  return [...lessons, ...sirah];
}

/** A lesson group: a section header and its lessons, preserving order. */
export type LessonGroup = { group: string; lessons: Lesson[] };

/** Group a topic's lessons under their `group` header, in first-seen order. */
export function groupedLessons(topicId: string): LessonGroup[] {
  const groups: LessonGroup[] = [];
  for (const lesson of lessonsInTopic(topicId)) {
    let bucket = groups.find((g) => g.group === lesson.group);
    if (!bucket) {
      bucket = { group: lesson.group, lessons: [] };
      groups.push(bucket);
    }
    bucket.lessons.push(lesson);
  }
  return groups;
}

/** The number of steps in the New Muslim track. */
export function trackLength(track: Track = NEW_MUSLIM_TRACK): number {
  return track.steps.length;
}

/** Resolve a track step by id. */
export function trackStepById(id: string, track: Track = NEW_MUSLIM_TRACK): TrackStep | undefined {
  return track.steps.find((s) => s.id === id);
}

/** The index of a step in the track, or -1. */
export function trackStepIndex(id: string, track: Track = NEW_MUSLIM_TRACK): number {
  return track.steps.findIndex((s) => s.id === id);
}

/**
 * The completion fraction of the track (0..1), given the set of completed
 * step ids. Unknown ids are ignored so a stale save can never exceed 1.
 */
export function trackProgress(
  completedIds: Iterable<string>,
  track: Track = NEW_MUSLIM_TRACK,
): number {
  const total = track.steps.length;
  if (total === 0) return 0;
  const valid = new Set(track.steps.map((s) => s.id));
  let done = 0;
  for (const id of completedIds) if (valid.has(id)) done += 1;
  return Math.min(done, total) / total;
}

/** Whether every step of the track is complete. */
export function isTrackComplete(
  completedIds: Iterable<string>,
  track: Track = NEW_MUSLIM_TRACK,
): boolean {
  return trackProgress(completedIds, track) >= 1;
}

export type { Lesson, LessonBlock, SirahEvent, Track, TrackStep };
