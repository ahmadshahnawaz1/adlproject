/**
 * lib/names — the pure logic over al-Asmāʾ al-Ḥusnā (F21).
 *
 * Forgiving diacritic-insensitive search, theme grouping for learning, a
 * deterministic "name of the day", and the quiz builder behind the memorisation
 * drill. Pure and synchronous — fully tested.
 */
import {
  DIVINE_NAMES,
  NAME_THEMES,
  TOTAL_NAMES,
  nameById,
  nameByNumber,
  themeMeta,
  type DivineName,
  type NameTheme,
  type NameThemeMeta,
} from '../content/names';
import { normalizeText, queryTokens } from './duaSearch';

export {
  DIVINE_NAMES,
  NAME_THEMES,
  TOTAL_NAMES,
  nameById,
  nameByNumber,
  themeMeta,
};
export type { DivineName, NameTheme, NameThemeMeta };

/** Every name belonging to one theme, in enumeration order. */
export function namesByTheme(theme: NameTheme): DivineName[] {
  return DIVINE_NAMES.filter((n) => n.theme === theme);
}

/** A theme and its names, for the grouped browse view. */
export type ThemeGroup = { theme: NameThemeMeta; names: DivineName[] };

/** All themes with their names, skipping any that are empty. */
export function groupedByTheme(): ThemeGroup[] {
  return NAME_THEMES.map((theme) => ({ theme, names: namesByTheme(theme.id) })).filter(
    (g) => g.names.length > 0,
  );
}

/**
 * Search the names by transliteration, meaning, Arabic, or explanation.
 * Every token must match (logical AND); empty query → [].
 */
export function searchNames(query: string): DivineName[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];
  return DIVINE_NAMES.map((name) => {
    const high = normalizeText(`${name.transliteration} ${name.meaning} ${name.number}`);
    const low = normalizeText(`${name.explanation} ${name.arabic}`);
    let score = 0;
    for (const token of tokens) {
      if (high.includes(token)) score += 3;
      else if (low.includes(token)) score += 1;
      else return { name, score: 0 };
    }
    return { name, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.name.number - b.name.number)
    .map((r) => r.name);
}

/** A stable name for the given day, so the whole day shares one reflection. */
export function nameOfDay(date: Date = new Date()): DivineName {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return DIVINE_NAMES[dayOfYear % DIVINE_NAMES.length];
}

/** One multiple-choice question: which meaning belongs to this name? */
export type QuizQuestion = {
  name: DivineName;
  /** Four candidate meanings, one of which is correct. */
  options: string[];
  answer: string;
};

/**
 * Build a multiple-choice question for a name, drawing distractors from the
 * other names. `pick` selects an index from a range and is injectable so the
 * quiz is deterministic under test.
 */
export function buildQuestion(
  name: DivineName,
  pick: (max: number) => number = (max) => Math.floor(Math.random() * max),
  optionCount = 4,
): QuizQuestion {
  const pool = DIVINE_NAMES.filter((n) => n.id !== name.id && n.meaning !== name.meaning);
  const distractors: string[] = [];
  const used = new Set<string>();
  while (distractors.length < Math.max(0, optionCount - 1) && distractors.length < pool.length) {
    const candidate = pool[pick(pool.length) % pool.length];
    if (!used.has(candidate.meaning)) {
      used.add(candidate.meaning);
      distractors.push(candidate.meaning);
    } else {
      // Fall back to a linear scan so a repeating `pick` still terminates.
      const next = pool.find((n) => !used.has(n.meaning));
      if (!next) break;
      used.add(next.meaning);
      distractors.push(next.meaning);
    }
  }
  const slot = pick(distractors.length + 1) % (distractors.length + 1);
  const options = [...distractors];
  options.splice(slot, 0, name.meaning);
  return { name, options, answer: name.meaning };
}

/** Progress through the names as a 0–1 fraction. */
export function memorisedFraction(memorisedCount: number): number {
  if (TOTAL_NAMES === 0) return 0;
  return Math.max(0, Math.min(1, memorisedCount / TOTAL_NAMES));
}
