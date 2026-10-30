/**
 * Barrel for the pilgrimage content model — one import surface for the pure
 * logic in lib/pilgrimage*, the hooks, the components and the screens.
 */
export * from './types';
export * from './ihram';
export * from './duas';
export * from './sites';
export * from './etiquette';
export * from './umrah';
export * from './hajj';

import { HAJJ_JOURNEY } from './hajj';
import type { Journey, PilgrimageKind } from './types';
import { UMRAH_JOURNEY } from './umrah';

/** Both journeys, in chooser order. */
export const JOURNEYS: Journey[] = [UMRAH_JOURNEY, HAJJ_JOURNEY];

/** Resolve a journey by its kind. */
export function journeyOf(kind: PilgrimageKind): Journey {
  return kind === 'hajj' ? HAJJ_JOURNEY : UMRAH_JOURNEY;
}
