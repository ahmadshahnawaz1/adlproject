/**
 * Turning matches into something a user can act on.
 *
 * The only verdicts this module can produce are `prohibited`, `check` and
 * `none`. There is deliberately no `halal` — see HALAL_DISCLAIMER for why a
 * barcode cannot support that claim.
 */
import type { Additive, StandardAxis } from '../../content/halal';
import { matchAdditives, type Match } from './match';
import { parseIngredients, type IngredientToken } from './parse';

export type Stance = 'accept' | 'avoid';
export type HalalPrefs = Record<StandardAxis, Stance>;

/** Cautious by default: nothing is relaxed until the user chooses it. */
export const DEFAULT_PREFS: HalalPrefs = {
  istihalah: 'avoid',
  ahlKitab: 'avoid',
  traceAlcohol: 'avoid',
};

export type FlagLevel = 'prohibited' | 'check' | 'note';

export type Flag = {
  additive: Additive;
  matched: string;
  level: FlagLevel;
  /** Which of the user's positions softened this, if any. */
  relaxedBy?: StandardAxis[];
};

export type Verdict = 'prohibited' | 'check' | 'none';

export type Assessment = {
  flags: Flag[];
  verdict: Verdict;
  tokens: IngredientToken[];
  /** Meat or an animal derivative is present, so slaughter matters. */
  hasAnimal: boolean;
};

function levelFor(additive: Additive, prefs: HalalPrefs): { level: FlagLevel; relaxedBy?: StandardAxis[] } {
  if (additive.status === 'prohibited') return { level: 'prohibited' };
  if (additive.status === 'clear') return { level: 'note' };

  const axes = additive.dependsOn ?? [];
  // An entry only softens when every position it rests on has been accepted.
  const accepted = axes.length > 0 && axes.every((a) => prefs[a] === 'accept');
  if (accepted) return { level: 'note', relaxedBy: axes };
  return { level: 'check' };
}

export function assessMatches(
  matches: Match[],
  tokens: IngredientToken[],
  prefs: HalalPrefs = DEFAULT_PREFS,
): Assessment {
  const flags: Flag[] = [];

  for (const m of matches) {
    if (m.additive.status === 'clear') continue;
    const { level, relaxedBy } = levelFor(m.additive, prefs);
    flags.push({ additive: m.additive, matched: m.matched, level, relaxedBy });
  }

  flags.sort((a, b) => order(a.level) - order(b.level));

  const verdict: Verdict = flags.some((f) => f.level === 'prohibited')
    ? 'prohibited'
    : flags.some((f) => f.level === 'check')
      ? 'check'
      : 'none';

  const hasAnimal = matches.some(
    (m) => m.additive.status === 'animal' || m.additive.status === 'prohibited',
  );

  return { flags, verdict, tokens, hasAnimal };
}

function order(level: FlagLevel): number {
  return level === 'prohibited' ? 0 : level === 'check' ? 1 : 2;
}

/** Parse, match and assess an ingredients string in one step. */
export function assessIngredients(raw: string, prefs: HalalPrefs = DEFAULT_PREFS): Assessment {
  const tokens = parseIngredients(raw);
  return assessMatches(matchAdditives(tokens), tokens, prefs);
}
