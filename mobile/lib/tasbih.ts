/**
 * tasbih — the pure heart of the digital prayer-beads (subḥa / misbaḥa).
 *
 * It holds the canonical remembrances and a tiny, fully-tested counting engine:
 * a tap advances the count, fills the current round, rolls over into the next,
 * and — for the guided after-ṣalāh tasbīḥ — knows exactly which phrase is being
 * recited and when a phrase or a whole round has just completed. No React, no
 * storage, no side effects; the hook owns the persisted numbers and the haptics.
 */

/** A single remembrance and how many times it is repeated within one round. */
export type TasbihPhrase = {
  id: string;
  arabic: string;
  translit: string;
  translation: string;
  /** Repetitions of this phrase within one full round. */
  target: number;
};

/** A chosen dhikr — either a single phrase or a guided multi-phrase sitting. */
export type TasbihPreset = {
  id: string;
  title: string;
  arabicTitle: string;
  /** One English line naming the dhikr. */
  subtitle: string;
  /** The count that completes one full round. 0 means a free, open count. */
  target: number;
  /** An ordered sequence for guided sittings (e.g. the after-ṣalāh tasbīḥ). */
  phrases?: TasbihPhrase[];
  /** A short, cited virtue shown gently beneath the bead. */
  note?: string;
};

/** The live numbers of a sitting. */
export type TasbihCounter = {
  /** Progress within the current round, 0..target. */
  count: number;
  /** Full rounds completed in this sitting. */
  rounds: number;
  /** All-time remembrances counted, across every preset. */
  lifetime: number;
};

/** The classic round targets offered (33 after ṣalāh, the hundred, the tahlīl). */
export const TASBIH_TARGETS = [33, 99, 100] as const;

const SUBHANALLAH: TasbihPhrase = {
  id: 'subhanallah',
  arabic: 'سُبْحَانَ اللّٰه',
  translit: 'Subḥāna -llāh',
  translation: 'Glory be to Allāh',
  target: 33,
};
const ALHAMDULILLAH: TasbihPhrase = {
  id: 'alhamdulillah',
  arabic: 'الْحَمْدُ لِلّٰه',
  translit: 'Al-ḥamdu li-llāh',
  translation: 'All praise is for Allāh',
  target: 33,
};
const ALLAHUAKBAR: TasbihPhrase = {
  id: 'allahuakbar',
  arabic: 'اللّٰهُ أَكْبَر',
  translit: 'Allāhu akbar',
  translation: 'Allāh is the Greatest',
  target: 33,
};
const TAHLIL: TasbihPhrase = {
  id: 'tahlil',
  arabic: 'لَا إِلٰهَ إِلَّا اللّٰه',
  translit: 'Lā ilāha illā -llāh',
  translation: 'There is no god but Allāh',
  target: 1,
};

/**
 * The remembrances offered. The first is the guided after-ṣalāh tasbīḥ — 33,
 * 33, 33 and the hundred completed with the tahlīl — and the rest are single
 * dhikr counted to their sunnah totals, with a free count to close.
 */
export const TASBIH_PRESETS: TasbihPreset[] = [
  {
    id: 'after-salah',
    title: 'After ṣalāh',
    arabicTitle: 'تَسْبِيح الصَّلَاة',
    subtitle: 'Subḥānallāh · Alḥamdulillāh · Allāhu akbar — completed to 100',
    target: 100,
    phrases: [SUBHANALLAH, ALHAMDULILLAH, ALLAHUAKBAR, TAHLIL],
    note:
      'Whoever glorifies Allāh thirty-three times, praises Him thirty-three times and magnifies Him thirty-three times after every prayer — that is ninety-nine — and completes the hundred with the tahlīl, his sins are forgiven though they be like the foam of the sea. (Muslim 597)',
  },
  {
    id: 'subhanallah',
    title: 'Subḥānallāh',
    arabicTitle: SUBHANALLAH.arabic,
    subtitle: 'Glory be to Allāh',
    target: 33,
  },
  {
    id: 'alhamdulillah',
    title: 'Alḥamdulillāh',
    arabicTitle: ALHAMDULILLAH.arabic,
    subtitle: 'All praise is for Allāh',
    target: 33,
  },
  {
    id: 'allahuakbar',
    title: 'Allāhu akbar',
    arabicTitle: ALLAHUAKBAR.arabic,
    subtitle: 'Allāh is the Greatest',
    target: 33,
  },
  {
    id: 'tahlil',
    title: 'Tahlīl',
    arabicTitle: TAHLIL.arabic,
    subtitle: 'There is no god but Allāh',
    target: 100,
    note:
      'Whoever says “Lā ilāha illā -llāh, waḥdahu lā sharīka lah…” a hundred times in a day has a reward like freeing ten slaves. (Bukhārī 3293, Muslim 2691)',
  },
  {
    id: 'istighfar',
    title: 'Istighfār',
    arabicTitle: 'أَسْتَغْفِرُ اللّٰه',
    subtitle: 'I seek the forgiveness of Allāh',
    target: 100,
    note: 'The Prophet ﷺ would seek forgiveness more than seventy times a day. (Bukhārī 6307)',
  },
  {
    id: 'salawat',
    title: 'Ṣalawāt',
    arabicTitle: 'اللّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّد',
    subtitle: 'Blessings upon the Prophet ﷺ',
    target: 100,
    note: 'Whoever sends one blessing upon me, Allāh sends ten upon him. (Muslim 408)',
  },
  {
    id: 'free',
    title: 'Free count',
    arabicTitle: 'ذِكْر',
    subtitle: 'Count without a target',
    target: 0,
  },
];

export const DEFAULT_PRESET_ID = 'after-salah';

/** The preset with this id, or the default if none matches. */
export function presetById(id: string): TasbihPreset {
  return TASBIH_PRESETS.find((p) => p.id === id) ?? TASBIH_PRESETS[0];
}

/** Whether a preset counts to a fixed round (vs. an open, free count). */
export function hasTarget(preset: TasbihPreset): boolean {
  return preset.target > 0;
}

/** The per-phrase targets of a guided set, e.g. [33, 33, 33, 1]. */
export function phraseTargets(phrases: readonly TasbihPhrase[]): number[] {
  return phrases.map((p) => p.target);
}

/** The cumulative phrase boundaries of a guided set, e.g. [33, 66, 99, 100]. */
export function phraseBoundaries(phrases: readonly TasbihPhrase[]): number[] {
  const out: number[] = [];
  let sum = 0;
  for (const p of phrases) {
    sum += p.target;
    out.push(sum);
  }
  return out;
}

/** The fraction 0..1 of the current round (for the ring). Free counts → 0. */
export function roundFraction(count: number, target: number): number {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(1, count / target));
}

/** The phrase being recited now, given the progress within a round. */
export type ActivePhrase = {
  index: number;
  phrase: TasbihPhrase;
  /** Completed repetitions within this phrase, 0..target. */
  done: number;
  target: number;
};

/**
 * Resolve the active phrase for a round-progress `count` (0..roundTotal). At a
 * phrase boundary the just-finished phrase reads as full (e.g. 33/33); the next
 * tap moves on to the following phrase.
 */
export function activePhrase(count: number, phrases: readonly TasbihPhrase[]): ActivePhrase {
  const total = phraseBoundaries(phrases).at(-1) ?? 0;
  const pos = Math.max(0, Math.min(total, count));
  let start = 0;
  for (let i = 0; i < phrases.length; i++) {
    const t = phrases[i].target;
    const end = start + t;
    if (pos <= end) {
      return { index: i, phrase: phrases[i], done: pos - start, target: t };
    }
    start = end;
  }
  const last = phrases.length - 1;
  return { index: last, phrase: phrases[last], done: phrases[last].target, target: phrases[last].target };
}

/** The outcome of a single tap. */
export type TapResult = {
  next: TasbihCounter;
  /** A full round just completed on this tap. */
  roundCompleted: boolean;
  /** A guided phrase boundary (not the final one) was just crossed. */
  phraseCompleted: boolean;
};

/**
 * Advance the counter by one. Lifetime always grows; within a targeted preset
 * the count fills to the target (the round reads full at that moment, marking a
 * completed round) and the following tap restarts the round at one.
 */
export function tapCounter(c: TasbihCounter, preset: TasbihPreset): TapResult {
  const target = preset.target;
  const lifetime = c.lifetime + 1;
  let rounds = c.rounds;

  let next = c.count + 1;
  if (target > 0 && next > target) next = 1; // a fresh round begins
  const count = next;

  let roundCompleted = false;
  if (target > 0 && count === target) {
    rounds += 1;
    roundCompleted = true;
  }

  let phraseCompleted = false;
  if (!roundCompleted && preset.phrases) {
    phraseCompleted = phraseBoundaries(preset.phrases).includes(count);
  }

  return { next: { count, rounds, lifetime }, roundCompleted, phraseCompleted };
}

/** Step a single count back (only within the current round), easing miscounts. */
export function undoCounter(c: TasbihCounter): TasbihCounter {
  if (c.count <= 0) return c;
  return { count: c.count - 1, rounds: c.rounds, lifetime: Math.max(0, c.lifetime - 1) };
}

/** Reset the current sitting (count and rounds), preserving the lifetime total. */
export function resetCounter(c: TasbihCounter): TasbihCounter {
  return { count: 0, rounds: 0, lifetime: c.lifetime };
}
