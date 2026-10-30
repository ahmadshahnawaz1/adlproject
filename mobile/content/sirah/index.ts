/**
 * content/sirah — the barrel for the authenticity-graded Sīrah (F20).
 *
 * Assembles the eras into one ordered timeline, exposes the people registry and
 * resolvers, and carries the grading doctrine and disclaimer.
 */
export * from './types';
export { SIRAH_ERAS, eraMeta, SIRAH_SOURCES, SIRAH_DISCLAIMER } from './eras';
export { SIRAH_PEOPLE, personById } from './people';

import type { SirahEvent } from './types';
import { SIRAH_PRE_REVELATION } from './preRevelation';
import { SIRAH_MAKKAH } from './makkah';
import { SIRAH_MAKKAN_TRIALS } from './makkanTrials';
import { SIRAH_HIJRAH_MADINAH } from './hijrahMadinah';
import { SIRAH_BATTLES } from './battles';
import { SIRAH_CONQUEST_FAREWELL } from './conquestFarewell';

/** Every event, ordered from the earliest to the last. */
export const SIRAH_EVENTS: SirahEvent[] = [
  ...SIRAH_PRE_REVELATION,
  ...SIRAH_MAKKAH,
  ...SIRAH_MAKKAN_TRIALS,
  ...SIRAH_HIJRAH_MADINAH,
  ...SIRAH_BATTLES,
  ...SIRAH_CONQUEST_FAREWELL,
].sort((a, b) => a.order - b.order);

/** The id of the first event (the entry point of the timeline). */
export const FIRST_EVENT_ID = SIRAH_EVENTS[0]?.id;

/** Resolve an event by id. */
export function sirahEventById(id: string): SirahEvent | undefined {
  return SIRAH_EVENTS.find((e) => e.id === id);
}
