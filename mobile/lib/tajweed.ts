/**
 * lib/tajweed — the recitation-rule analyser behind the coloured muṣḥaf (F25).
 *
 * Arabic script carries its vowels as combining marks, so the text is first
 * tokenised into "letter units" — a base letter with every mark that follows
 * it. The rules are then read off sequences of those units: a nūn carrying
 * shaddah is a ghunnah, a silent nūn before ب is an iqlāb, and so on. The
 * output is a list of spans over the original string, which the renderer turns
 * into coloured runs.
 *
 * Only rules that can be determined from the written text with confidence are
 * marked. Where a rule depends on where the reciter chooses to stop, or on fine
 * points of articulation, it is left unmarked rather than marked wrongly.
 *
 * Pure and synchronous — no React, fully tested.
 */
import { TAJWEED_RULES, tajweedRule, type TajweedRuleId } from '../content/tajweed';

export { TAJWEED_RULES, tajweedRule };
export type { TajweedRuleId };

/* ------------------------------------------------------------------ *
 * Arabic constants
 * ------------------------------------------------------------------ */

const FATHA = '\u064E';
const DAMMA = '\u064F';
const KASRA = '\u0650';
const SHADDA = '\u0651';
const SUKUN = '\u0652';
/** The Uthmani muṣḥaf writes sukūn as a small circle (U+06E1) rather than U+0652. */
const SUKUN_UTHMANI = '\u06E1';
const SUKUN_MARKS = new Set([SUKUN, SUKUN_UTHMANI]);
const TANWEEN_FATH = '\u064B';
const TANWEEN_DAMM = '\u064C';
const TANWEEN_KASR = '\u064D';
const SUPERSCRIPT_ALEF = '\u0670';

const ALEF = '\u0627';
const WAW = '\u0648';
const YA = '\u064A';
const ALEF_MAQSURA = '\u0649';
const NOON = '\u0646';
const MEEM = '\u0645';
const BA = '\u0628';

const TANWEEN = new Set([TANWEEN_FATH, TANWEEN_DAMM, TANWEEN_KASR]);
const HARAKAT = new Set([FATHA, DAMMA, KASRA]);

/** The five letters that bounce when silent. */
const QALQALAH_LETTERS = new Set(['\u0642', '\u0637', '\u0628', '\u062C', '\u062F']); // ق ط ب ج د

/** Every form of hamzah that triggers an obligatory stretch. */
const HAMZA_FORMS = new Set(['\u0621', '\u0623', '\u0624', '\u0625', '\u0626', '\u0622']);

/**
 * The Uthmani muṣḥaf often writes a hamzah as a plain seat carrying a combining
 * hamzah mark (ا + U+0654) rather than the precomposed أ, so both must be read.
 */
const HAMZA_ABOVE = '\u0654';
const HAMZA_BELOW = '\u0655';

/**
 * Throat letters — a silent nūn before these is pronounced clearly. The hamzah
 * counts in every form it is written in, not only the bare ء.
 */
const IDHHAR_LETTERS = new Set([
  ...HAMZA_FORMS,
  '\u0647', // ه
  '\u0639', // ع
  '\u062D', // ح
  '\u063A', // غ
  '\u062E', // خ
]);

/** A silent nūn merges into these with a ghunnah. */
const IDGHAM_GHUNNAH_LETTERS = new Set([YA, NOON, MEEM, WAW]);

/** A silent nūn merges into these without a ghunnah. */
const IDGHAM_NO_GHUNNAH_LETTERS = new Set(['\u0644', '\u0631']); // ل ر

/** Combining marks: harakāt, Qurʾānic annotation marks, and the small alef. */
function isDiacritic(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0;
  return (
    (c >= 0x064b && c <= 0x065f) || // harakāt and friends
    c === 0x0670 || // superscript alef
    (c >= 0x06d6 && c <= 0x06ed) // Uthmani annotation marks
  );
}

function isArabicLetter(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0;
  return (c >= 0x0621 && c <= 0x064a) || c === 0x0671 || (c >= 0x06fa && c <= 0x06ff);
}

/* ------------------------------------------------------------------ *
 * Tokenising
 * ------------------------------------------------------------------ */

/** A base letter together with the marks written on it. */
export type LetterUnit = {
  letter: string;
  marks: string;
  /** Index of the base letter in the source string. */
  start: number;
  /** Index just past the last mark. */
  end: number;
  /** True for spaces and punctuation between words. */
  separator: boolean;
};

/** Split Arabic text into letter units, keeping source offsets intact. */
export function tokenize(text: string): LetterUnit[] {
  const units: LetterUnit[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (isDiacritic(ch)) {
      // A mark with no letter before it; attach to the previous unit if we can.
      const prev = units[units.length - 1];
      if (prev && !prev.separator) {
        prev.marks += ch;
        prev.end = i + 1;
      }
      i += 1;
      continue;
    }
    if (!isArabicLetter(ch)) {
      units.push({ letter: ch, marks: '', start: i, end: i + 1, separator: true });
      i += 1;
      continue;
    }
    let j = i + 1;
    let marks = '';
    while (j < text.length && isDiacritic(text[j])) {
      marks += text[j];
      j += 1;
    }
    units.push({ letter: ch, marks, start: i, end: j, separator: false });
    i = j;
  }
  return units;
}

const has = (unit: LetterUnit, mark: string): boolean => unit.marks.includes(mark);

/** Either spelling of sukūn. */
function hasSukun(unit: LetterUnit): boolean {
  for (const m of unit.marks) if (SUKUN_MARKS.has(m)) return true;
  return false;
}

/** A hamzah, whether written as its own letter or as a mark on a seat. */
function isHamza(unit: LetterUnit): boolean {
  return (
    HAMZA_FORMS.has(unit.letter) ||
    unit.marks.includes(HAMZA_ABOVE) ||
    unit.marks.includes(HAMZA_BELOW)
  );
}

/** The bare, unmarked alef written after tanwīn fatḥ is not pronounced. */
function isSilentTanweenAlef(unit: LetterUnit): boolean {
  return unit.letter === ALEF && unit.marks.length === 0;
}

/** A letter is silent when it carries sukūn, or carries no vowel at all. */
function isSilent(unit: LetterUnit): boolean {
  if (has(unit, SHADDA)) return false;
  if (hasSukun(unit)) return true;
  for (const m of unit.marks) {
    if (HARAKAT.has(m) || TANWEEN.has(m) || m === SUPERSCRIPT_ALEF) return false;
  }
  return true;
}

function hasTanween(unit: LetterUnit): boolean {
  for (const m of unit.marks) if (TANWEEN.has(m)) return true;
  return false;
}

/** The next letter unit, skipping separators. */
function nextLetter(units: LetterUnit[], from: number): LetterUnit | null {
  for (let i = from + 1; i < units.length; i++) {
    if (!units[i].separator) return units[i];
  }
  return null;
}

/** Whether a word break falls between two unit indices. */
function crossesWord(units: LetterUnit[], a: number, b: number): boolean {
  for (let i = a + 1; i < b; i++) if (units[i].separator) return true;
  return false;
}

/** Index of the next non-separator unit. */
function nextIndex(units: LetterUnit[], from: number): number {
  for (let i = from + 1; i < units.length; i++) if (!units[i].separator) return i;
  return -1;
}

/* ------------------------------------------------------------------ *
 * Analysis
 * ------------------------------------------------------------------ */

/** A coloured range over the source string. */
export type TajweedSpan = { start: number; end: number; rule: TajweedRuleId };

/** A run of text, coloured when it falls under a rule. */
export type TajweedSegment = { text: string; rule: TajweedRuleId | null };

/** Is this unit an elongation letter carrying its matching vowel before it? */
function isMaddLetter(unit: LetterUnit, prev: LetterUnit | null): boolean {
  if (has(unit, SHADDA)) return false;
  // A seat carrying a hamzah is a consonant, not a stretch.
  if (isHamza(unit)) return false;
  // A superscript alef written on a letter is itself an elongation (الرَّحْمَٰن).
  if (has(unit, SUPERSCRIPT_ALEF)) return true;
  if (unit.letter === ALEF || unit.letter === ALEF_MAQSURA) {
    return !!prev && (has(prev, FATHA) || has(prev, SUPERSCRIPT_ALEF));
  }
  if (unit.letter === WAW) return isSilent(unit) && !!prev && has(prev, DAMMA);
  if (unit.letter === YA) return isSilent(unit) && !!prev && has(prev, KASRA);
  return false;
}

/**
 * Find every rule in a stretch of Qurʾānic text.
 * Spans never overlap: the first rule to claim a letter keeps it.
 */
export function analyze(text: string): TajweedSpan[] {
  const units = tokenize(text);
  const spans: TajweedSpan[] = [];
  const claimed = new Set<number>();

  const claim = (indices: number[], rule: TajweedRuleId) => {
    if (indices.some((i) => claimed.has(i))) return;
    const start = units[indices[0]].start;
    const end = units[indices[indices.length - 1]].end;
    indices.forEach((i) => claimed.add(i));
    spans.push({ start, end, rule });
  };

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    if (unit.separator) continue;

    // 1. Ghunnah — nūn or mīm with shaddah.
    if ((unit.letter === NOON || unit.letter === MEEM) && has(unit, SHADDA)) {
      claim([i], 'ghunnah');
      continue;
    }

    const next = nextLetter(units, i);
    const nextIdx = nextIndex(units, i);

    // 2. The silent nūn and tanwīn.
    const silentNoon = unit.letter === NOON && isSilent(unit);
    const tanween = hasTanween(unit);
    if ((silentNoon || tanween) && next) {
      // Tanwīn fatḥ is written with a silent alef after it; the rule looks past it.
      let target = next;
      let targetIdx = nextIdx;
      if (isSilentTanweenAlef(target)) {
        const after = nextLetter(units, targetIdx);
        const afterIdx = nextIndex(units, targetIdx);
        if (after) {
          target = after;
          targetIdx = afterIdx;
        }
      }
      const n = target.letter;
      const sameWord = !crossesWord(units, i, targetIdx);
      if (n === BA) {
        claim([i], 'iqlab');
        continue;
      }
      if (isHamza(target) || IDHHAR_LETTERS.has(n)) {
        claim([i], 'idhhar');
        continue;
      }
      if (IDGHAM_GHUNNAH_LETTERS.has(n) || IDGHAM_NO_GHUNNAH_LETTERS.has(n)) {
        // Within one word the nūn is pronounced clearly instead (iẓhār muṭlaq),
        // as in دُنْيَا and صِنْوَان.
        if (silentNoon && sameWord) {
          claim([i], 'idhhar');
          continue;
        }
        claim(
          [i, targetIdx],
          IDGHAM_GHUNNAH_LETTERS.has(n) ? 'idgham-ghunnah' : 'idgham-no-ghunnah',
        );
        continue;
      }
      claim([i], 'ikhfa');
      continue;
    }

    // 3. The silent mīm.
    if (unit.letter === MEEM && isSilent(unit) && next) {
      if (next.letter === BA) {
        claim([i], 'ikhfa-shafawi');
        continue;
      }
      if (next.letter === MEEM) {
        claim([i, nextIdx], 'idgham-shafawi');
        continue;
      }
    }

    // 4. Qalqalah — a bouncing letter carrying sukūn.
    if (QALQALAH_LETTERS.has(unit.letter) && isSilent(unit)) {
      claim([i], 'qalqalah');
      continue;
    }

    // 5. Elongation.
    const prev = i > 0 ? units[i - 1] : null;
    if (isMaddLetter(unit, prev && !prev.separator ? prev : null)) {
      if (next && isHamza(next) && !crossesWord(units, i, nextIdx)) {
        claim([i], 'madd-muttasil');
        continue;
      }
      if (next && (has(next, SHADDA) || hasSukun(next))) {
        claim([i], 'madd-lazim');
        continue;
      }
      claim([i], 'madd-asli');
    }
  }

  return spans.sort((a, b) => a.start - b.start);
}

/**
 * Split text into consecutive runs, each either plain or under one rule.
 * Concatenating the segments always reproduces the input exactly.
 */
export function segment(text: string): TajweedSegment[] {
  const spans = analyze(text);
  const segments: TajweedSegment[] = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.start < cursor) continue; // defensive: never emit overlapping runs
    if (span.start > cursor) segments.push({ text: text.slice(cursor, span.start), rule: null });
    segments.push({ text: text.slice(span.start, span.end), rule: span.rule });
    cursor = span.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), rule: null });
  return segments.filter((s) => s.text.length > 0);
}

/** How many times each rule occurs — used for the legend and for testing. */
export function ruleCounts(text: string): Partial<Record<TajweedRuleId, number>> {
  const counts: Partial<Record<TajweedRuleId, number>> = {};
  for (const span of analyze(text)) {
    counts[span.rule] = (counts[span.rule] ?? 0) + 1;
  }
  return counts;
}
