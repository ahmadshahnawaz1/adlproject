/**
 * content/tajweed — the recitation rules the coloured muṣḥaf marks.
 *
 * Each rule carries its Arabic name, a plain description, how long it is held,
 * and the colour it is drawn in. The colours follow the convention of the
 * widely used colour-coded maṣāḥif so a reader who learned from one of those
 * finds the same language here.
 *
 * Scope is stated honestly: Adl marks the rules it can detect from the text
 * with confidence. It is a reading aid, not a substitute for a teacher's ear.
 */

/** Every rule the engine can mark. */
export type TajweedRuleId =
  | 'ghunnah'
  | 'idgham-ghunnah'
  | 'idgham-no-ghunnah'
  | 'ikhfa'
  | 'iqlab'
  | 'idhhar'
  | 'ikhfa-shafawi'
  | 'idgham-shafawi'
  | 'qalqalah'
  | 'madd-muttasil'
  | 'madd-lazim'
  | 'madd-asli';

export type TajweedRule = {
  id: TajweedRuleId;
  /** English name. */
  title: string;
  /** Arabic name. */
  arabic: string;
  /** What the reciter does. */
  description: string;
  /** How long it is held, in ḥarakāt (counts), when that applies. */
  counts?: string;
  /** Hex colour used to draw it. */
  color: string;
};

/**
 * The rules, in teaching order. Colours are chosen to stay legible on both the
 * light and dark reader themes.
 */
export const TAJWEED_RULES: TajweedRule[] = [
  {
    id: 'ghunnah',
    title: 'Ghunnah',
    arabic: 'غُنَّة',
    description:
      'A nasal sound held on a nūn or mīm carrying shaddah. The sound resonates through the nose.',
    counts: '2 counts',
    color: '#22C55E',
  },
  {
    id: 'idgham-ghunnah',
    title: 'Idghām with ghunnah',
    arabic: 'إِدْغَام بِغُنَّة',
    description:
      'A silent nūn or tanwīn merges into a following ي ن م و, and the merged sound is nasalised.',
    counts: '2 counts',
    color: '#16A34A',
  },
  {
    id: 'idgham-no-ghunnah',
    title: 'Idghām without ghunnah',
    arabic: 'إِدْغَام بِلَا غُنَّة',
    description: 'A silent nūn or tanwīn merges into a following ل or ر with no nasal sound.',
    color: '#0D9488',
  },
  {
    id: 'ikhfa',
    title: 'Ikhfāʾ',
    arabic: 'إِخْفَاء',
    description:
      'A silent nūn or tanwīn is hidden before fifteen letters — neither fully pronounced nor merged, with a light ghunnah.',
    counts: '2 counts',
    color: '#8B5CF6',
  },
  {
    id: 'iqlab',
    title: 'Iqlāb',
    arabic: 'إِقْلَاب',
    description: 'A silent nūn or tanwīn turns into a mīm before ب, with a ghunnah.',
    counts: '2 counts',
    color: '#EC4899',
  },
  {
    id: 'idhhar',
    title: 'Iẓhār',
    arabic: 'إِظْهَار',
    description:
      'A silent nūn or tanwīn is pronounced clearly before the throat letters ء ه ع ح غ خ, with no nasalisation.',
    color: '#64748B',
  },
  {
    id: 'ikhfa-shafawi',
    title: 'Ikhfāʾ shafawī',
    arabic: 'إِخْفَاء شَفَوِي',
    description: 'A silent mīm is hidden before ب, with a ghunnah on the lips.',
    counts: '2 counts',
    color: '#A855F7',
  },
  {
    id: 'idgham-shafawi',
    title: 'Idghām shafawī',
    arabic: 'إِدْغَام شَفَوِي',
    description: 'A silent mīm merges into a following mīm, with a ghunnah.',
    counts: '2 counts',
    color: '#10B981',
  },
  {
    id: 'qalqalah',
    title: 'Qalqalah',
    arabic: 'قَلْقَلَة',
    description:
      'An echoing bounce on ق ط ب ج د when they carry sukūn or are stopped upon at the end of an āyah.',
    color: '#F59E0B',
  },
  {
    id: 'madd-muttasil',
    title: 'Madd wājib muttaṣil',
    arabic: 'مَدّ وَاجِب مُتَّصِل',
    description: 'An elongation letter followed by a hamzah in the same word — stretched obligatorily.',
    counts: '4–5 counts',
    color: '#DC2626',
  },
  {
    id: 'madd-lazim',
    title: 'Madd lāzim',
    arabic: 'مَدّ لَازِم',
    description: 'An elongation letter followed by a shaddah or a sukūn — the longest stretch.',
    counts: '6 counts',
    color: '#B91C1C',
  },
  {
    id: 'madd-asli',
    title: 'Madd ṭabīʿī',
    arabic: 'مَدّ طَبِيعِي',
    description: 'The natural elongation of ا و ي — the baseline stretch every reciter makes.',
    counts: '2 counts',
    color: '#EF4444',
  },
];

export function tajweedRule(id: TajweedRuleId): TajweedRule | undefined {
  return TAJWEED_RULES.find((r) => r.id === id);
}

export const TAJWEED_INTRO =
  'Tajwīd is giving every letter its due — its correct point of articulation and its proper qualities. Colouring the text shows where the rules fall so the eye learns what the ear should already be hearing.';

export const TAJWEED_SCOPE_NOTE =
  'Adl marks the rules it can determine from the written text with confidence: ghunnah, the rules of the silent nūn and tanwīn, the rules of the silent mīm, qalqalah, and the main elongations. Some rules — the fine points of tafkhīm and tarqīq, and stretches whose length depends on where the reciter stops — are left unmarked rather than marked wrongly.';

export const TAJWEED_DISCLAIMER =
  'Colour is a reading aid, not a teacher. Tajwīd is learned by reciting to someone who can hear you and correct you; no colouring can do that.';
