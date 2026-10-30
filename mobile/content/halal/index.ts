import { expandClear, type Additive } from './types';
import { CLEAR_ROWS } from './additivesClear';
import { FLAGGED_ADDITIVES } from './additivesFlagged';
import { NAMED_INGREDIENTS } from './ingredients';

export * from './types';
export * from './rulings';
export { CLEAR_ROWS } from './additivesClear';
export { FLAGGED_ADDITIVES } from './additivesFlagged';
export { NAMED_INGREDIENTS } from './ingredients';

/** Everything the matcher knows about, flagged entries first. */
export const ADDITIVES: Additive[] = [
  ...NAMED_INGREDIENTS,
  ...FLAGGED_ADDITIVES,
  ...expandClear(CLEAR_ROWS),
];

export const ADDITIVE_BY_CODE: Record<string, Additive> = ADDITIVES.reduce(
  (acc, a) => {
    acc[a.code.toLowerCase()] = a;
    return acc;
  },
  {} as Record<string, Additive>,
);
