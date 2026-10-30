/**
 * The heirs this calculator recognises, and the ḥajb (exclusion) rules that
 * decide who inherits at all before any share is computed.
 *
 * Scope is deliberately the agreed core. Distant kin (dhawū al-arḥām), nephews,
 * uncles and cousins are not modelled: they only inherit once every heir below
 * is absent, and that case is referred to a scholar instead of guessed at.
 */
export type HeirId =
  | 'husband'
  | 'wife'
  | 'son'
  | 'daughter'
  | 'grandson'
  | 'granddaughter'
  | 'father'
  | 'mother'
  | 'paternalGrandfather'
  | 'paternalGrandmother'
  | 'maternalGrandmother'
  | 'fullBrother'
  | 'fullSister'
  | 'paternalBrother'
  | 'paternalSister'
  | 'maternalSibling';

export type HeirGroup = 'spouse' | 'descendants' | 'ascendants' | 'siblings';

export type HeirMeta = {
  id: HeirId;
  label: string;
  arabic: string;
  /** Plural label used when more than one is entered. */
  plural: string;
  group: HeirGroup;
  /** Highest number that can meaningfully inherit in this slot. */
  max: number;
  note?: string;
};

export const HEIRS: HeirMeta[] = [
  {
    id: 'husband',
    label: 'Husband',
    plural: 'Husband',
    arabic: 'زَوْج',
    group: 'spouse',
    max: 1,
  },
  {
    id: 'wife',
    label: 'Wife',
    plural: 'Wives',
    arabic: 'زَوْجَة',
    group: 'spouse',
    max: 4,
    note: 'Co-wives share a single spousal portion between them.',
  },
  { id: 'son', label: 'Son', plural: 'Sons', arabic: 'ٱبْن', group: 'descendants', max: 20 },
  {
    id: 'daughter',
    label: 'Daughter',
    plural: 'Daughters',
    arabic: 'بِنْت',
    group: 'descendants',
    max: 20,
  },
  {
    id: 'grandson',
    label: "Son's son",
    plural: "Son's sons",
    arabic: 'ٱبْن ٱلٱبْن',
    group: 'descendants',
    max: 20,
    note: 'Through a son, not a daughter — a daughter’s children are dhawū al-arḥām.',
  },
  {
    id: 'granddaughter',
    label: "Son's daughter",
    plural: "Son's daughters",
    arabic: 'بِنْت ٱلٱبْن',
    group: 'descendants',
    max: 20,
  },
  { id: 'father', label: 'Father', plural: 'Father', arabic: 'أَب', group: 'ascendants', max: 1 },
  { id: 'mother', label: 'Mother', plural: 'Mother', arabic: 'أُمّ', group: 'ascendants', max: 1 },
  {
    id: 'paternalGrandfather',
    label: "Father's father",
    plural: "Father's father",
    arabic: 'جَدّ',
    group: 'ascendants',
    max: 1,
  },
  {
    id: 'paternalGrandmother',
    label: "Father's mother",
    plural: "Father's mother",
    arabic: 'جَدَّة لِأَب',
    group: 'ascendants',
    max: 1,
  },
  {
    id: 'maternalGrandmother',
    label: "Mother's mother",
    plural: "Mother's mother",
    arabic: 'جَدَّة لِأُمّ',
    group: 'ascendants',
    max: 1,
  },
  {
    id: 'fullBrother',
    label: 'Full brother',
    plural: 'Full brothers',
    arabic: 'أَخ شَقِيق',
    group: 'siblings',
    max: 20,
  },
  {
    id: 'fullSister',
    label: 'Full sister',
    plural: 'Full sisters',
    arabic: 'أُخْت شَقِيقَة',
    group: 'siblings',
    max: 20,
  },
  {
    id: 'paternalBrother',
    label: 'Half-brother (father’s side)',
    plural: 'Half-brothers (father’s side)',
    arabic: 'أَخ لِأَب',
    group: 'siblings',
    max: 20,
  },
  {
    id: 'paternalSister',
    label: 'Half-sister (father’s side)',
    plural: 'Half-sisters (father’s side)',
    arabic: 'أُخْت لِأَب',
    group: 'siblings',
    max: 20,
  },
  {
    id: 'maternalSibling',
    label: 'Half-sibling (mother’s side)',
    plural: 'Half-siblings (mother’s side)',
    arabic: 'أَخ/أُخْت لِأُمّ',
    group: 'siblings',
    max: 20,
    note: 'Brothers and sisters on the mother’s side inherit equally — no 2:1.',
  },
];

export const HEIR_BY_ID: Record<HeirId, HeirMeta> = HEIRS.reduce(
  (acc, h) => {
    acc[h.id] = h;
    return acc;
  },
  {} as Record<HeirId, HeirMeta>,
);

export type HeirCounts = Partial<Record<HeirId, number>>;

export const GROUP_LABELS: Record<HeirGroup, string> = {
  spouse: 'Spouse',
  descendants: 'Children & their children',
  ascendants: 'Parents & grandparents',
  siblings: 'Brothers & sisters',
};

/** Clamp a raw count into what the slot can hold. */
export function clampCount(id: HeirId, value: number): number {
  const max = HEIR_BY_ID[id].max;
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(max, Math.floor(value)));
}

export function totalHeirs(counts: HeirCounts): number {
  return (Object.keys(counts) as HeirId[]).reduce((t, id) => t + (counts[id] ?? 0), 0);
}
