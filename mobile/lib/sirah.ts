/**
 * lib/sirah — the pure logic over the graded Sīrah corpus (F20).
 *
 * Grade metadata (colour tone + rank, mirroring the hadith grader), era
 * grouping for the timeline, forgiving search, and a deterministic "event of the
 * day". Pure and synchronous — fully tested.
 */
import {
  SIRAH_EVENTS,
  SIRAH_ERAS,
  SIRAH_PEOPLE,
  type SirahEvent,
  type SirahEraMeta,
  type SirahGrade,
} from '../content/sirah';
import { normalizeText, queryTokens } from './duaSearch';
import { bodyText } from './learn';

// Re-export the rest of the content surface (sources, disclaimer, era helpers,
// ref types) so screens depend only on lib/sirah as the feature's public API.
export * from '../content/sirah';

/** A semantic colour tone the UI maps to a palette colour. */
export type GradeTone = 'success' | 'primary' | 'muted' | 'warning' | 'subtle';

export type GradeMeta = { label: string; short: string; tone: GradeTone; rank: number };

const GRADE_META: Record<SirahGrade, GradeMeta> = {
  established: { label: 'Established', short: 'Established', tone: 'success', rank: 4 },
  'well-supported': { label: 'Well-supported', short: 'Well-supported', tone: 'primary', rank: 3 },
  reported: { label: 'Reported', short: 'Reported', tone: 'muted', rank: 2 },
  weak: { label: 'Weak report', short: 'Weak', tone: 'warning', rank: 1 },
  disputed: { label: 'Disputed', short: 'Disputed', tone: 'subtle', rank: 0 },
};

/** Display metadata for a grade. */
export function gradeMeta(grade: SirahGrade): GradeMeta {
  return GRADE_META[grade] ?? GRADE_META.reported;
}

/** A short label for a grade. */
export function gradeLabel(grade: SirahGrade): string {
  return gradeMeta(grade).short;
}

/** Whether a grade counts as firmly authentic (Qurʾān/Ṣaḥīḥayn or ṣaḥīḥ/ḥasan). */
export function isEstablished(grade: SirahGrade): boolean {
  return gradeMeta(grade).rank >= GRADE_META['well-supported'].rank;
}

/** Every event of an era, in order. */
export function eventsByEra(eraId: string): SirahEvent[] {
  return SIRAH_EVENTS.filter((e) => e.era === eraId);
}

/** An era with its events — for the grouped timeline. */
export type EraGroup = { era: SirahEraMeta; events: SirahEvent[] };

/** Group the whole timeline by era, in era order. */
export function groupedByEra(): EraGroup[] {
  return SIRAH_ERAS.map((era) => ({ era, events: eventsByEra(era.id) })).filter((g) => g.events.length > 0);
}

/** Events a given person is central to. */
export function eventsWithPerson(personId: string): SirahEvent[] {
  return SIRAH_EVENTS.filter((e) => e.people?.includes(personId));
}

function haystack(e: SirahEvent): { high: string; low: string } {
  const high = `${e.title} ${e.arabic ?? ''} ${e.place} ${e.yearLabel} ${(e.tags ?? []).join(' ')}`;
  const low = `${e.summary} ${(e.lessons ?? []).join(' ')} ${bodyText(e.body)}`;
  return { high: normalizeText(high), low: normalizeText(low) };
}

/** Forgiving, diacritic-insensitive search across the timeline. Empty → []. */
export function searchSirah(query: string): SirahEvent[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];
  return SIRAH_EVENTS.map((event) => {
    const { high, low } = haystack(event);
    let score = 0;
    for (const t of tokens) {
      if (high.includes(t)) score += 3;
      else if (low.includes(t)) score += 1;
      else return { event, score: 0 };
    }
    return { event, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.event);
}

/** A deterministic "event of the day", stable for a given calendar day. */
export function sirahOfDay(date: Date = new Date()): SirahEvent {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return SIRAH_EVENTS[dayOfYear % SIRAH_EVENTS.length];
}
