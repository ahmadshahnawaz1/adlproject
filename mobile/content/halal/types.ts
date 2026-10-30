/**
 * Types for the halal ingredient reference.
 *
 * The vocabulary here is deliberately cautious. Nothing in this module says an
 * ingredient *is* halal — only whether it is prohibited outright, whether its
 * source has to be checked, or whether nothing about it was flagged.
 */

/** The three questions on which scholars genuinely differ. */
export type StandardAxis = 'istihalah' | 'ahlKitab' | 'traceAlcohol';

export type AdditiveStatus =
  /** Derived from swine, blood or khamr — prohibited by agreement. */
  | 'prohibited'
  /** Always of animal origin, so how the animal was slaughtered decides it. */
  | 'animal'
  /** May be plant, animal or synthetic — the label alone cannot tell you. */
  | 'source-dependent'
  /** From insects (cochineal, lac) — a discussion of its own. */
  | 'insect'
  /** Ethanol as a solvent, carrier or residue. */
  | 'alcohol'
  /** Mineral, synthetic or plant in every commercial route known to us. */
  | 'clear';

export type AdditiveCategory =
  | 'colour'
  | 'preservative'
  | 'antioxidant'
  | 'emulsifier'
  | 'stabiliser'
  | 'thickener'
  | 'acidity'
  | 'sweetener'
  | 'enhancer'
  | 'anti-caking'
  | 'glazing'
  | 'raising'
  | 'enzyme'
  | 'other';

export type Additive = {
  /** 'E471', or a bare name for ingredients with no E-number. */
  code: string;
  name: string;
  category: AdditiveCategory;
  status: AdditiveStatus;
  /** Extra strings that should match this entry in an ingredients list. */
  aliases?: string[];
  /** Where it is actually made from, in commercial practice. */
  sources?: string[];
  /** Why it is flagged, in plain words. Required for anything not 'clear'. */
  concern?: string;
  /** Which scholarly positions can change the answer for this entry. */
  dependsOn?: StandardAxis[];
  note?: string;
};

/** Compact form for additives with no halal concern: [code, name, category]. */
export type ClearRow = [string, string, AdditiveCategory];

export function expandClear(rows: ClearRow[]): Additive[] {
  return rows.map(([code, name, category]) => ({
    code,
    name,
    category,
    status: 'clear' as const,
  }));
}

export const STATUS_ORDER: Record<AdditiveStatus, number> = {
  prohibited: 0,
  animal: 1,
  insect: 2,
  alcohol: 3,
  'source-dependent': 4,
  clear: 5,
};

export const STATUS_LABEL: Record<AdditiveStatus, string> = {
  prohibited: 'Prohibited',
  animal: 'Animal origin',
  insect: 'From insects',
  alcohol: 'Alcohol',
  'source-dependent': 'Source unclear',
  clear: 'No concern noted',
};

export const CATEGORY_LABEL: Record<AdditiveCategory, string> = {
  colour: 'Colour',
  preservative: 'Preservative',
  antioxidant: 'Antioxidant',
  emulsifier: 'Emulsifier',
  stabiliser: 'Stabiliser',
  thickener: 'Thickener',
  acidity: 'Acidity regulator',
  sweetener: 'Sweetener',
  enhancer: 'Flavour enhancer',
  'anti-caking': 'Anti-caking agent',
  glazing: 'Glazing agent',
  raising: 'Raising agent',
  enzyme: 'Enzyme',
  other: 'Other',
};
