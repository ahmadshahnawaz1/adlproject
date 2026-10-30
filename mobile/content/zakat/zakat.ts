/**
 * zakat.ts — the sourced content model for Adl's Zakat calculator.
 *
 * Everything here is data: the thresholds (niṣāb), the rate, the karat
 * purities, the worksheet's asset groups and fields, the evidence (daleel)
 * behind each ruling, the madhab notes, common mistakes and the
 * pending-scholar-review disclaimer. The UI and the pure calculator in
 * lib/zakat.ts read from this file so the numbers and the wording live in one
 * reviewable place.
 *
 * Authenticity bar (matching the wudū feature): every threshold and rate is
 * cited to Qurʾān and Sunnah; differences between the madhāhib are noted, not
 * asserted; the user chooses. Nothing here is a fatwa — see ZAKAT_DISCLAIMER.
 */

/** A single proof-text, mirroring the wudū model's shape. */
export type Daleel = {
  source: 'quran' | 'hadith';
  reference: string;
  narrator?: string;
  grade?: string;
  text: string;
};

/* ------------------------------------------------------------------ *
 * Thresholds, rate and purities — all cited below in EVIDENCE.
 * ------------------------------------------------------------------ */

/** Niṣāb of gold: 20 mithqāl / dīnār ≈ 87.48 g of pure gold. */
export const NISAB_GOLD_GRAMS = 87.48;
/** Niṣāb of silver: 200 dirhams ≈ 612.36 g of silver. */
export const NISAB_SILVER_GRAMS = 612.36;

/** The zakat rate on wealth for a lunar year: one-fortieth = 2.5%. */
export const ZAKAT_RATE_LUNAR = 0.025;
/**
 * If calculated over a solar (Gregorian) year, the rate is adjusted up to
 * keep it equivalent to a lunar year: 2.5% × (365.25 / 354.367) ≈ 2.5775%.
 */
export const ZAKAT_RATE_SOLAR = 0.025775;

/** A lunar year in days — used to compute the ḥawl (zakat anniversary). */
export const LUNAR_YEAR_DAYS = 354.367;

/** Purity of common gold karats (fraction of pure gold). */
export const KARAT_PURITY: Record<number, number> = {
  24: 1,
  22: 0.9167,
  21: 0.875,
  18: 0.75,
};

/* ------------------------------------------------------------------ *
 * Evidence
 * ------------------------------------------------------------------ */

export const DALEEL_COMMAND: Daleel = {
  source: 'quran',
  reference: 'al-Baqarah 2:267',
  text: 'O you who believe! Spend from the good things you have earned and from what We have brought forth for you from the earth.',
};

export const DALEEL_RATE: Daleel = {
  source: 'hadith',
  reference: 'Ṣaḥīḥ al-Bukhārī 1454',
  narrator: 'Anas ibn Mālik',
  grade: 'Ṣaḥīḥ',
  text: 'In the prescription of zakat that Abū Bakr wrote: on silver, a fortieth (2.5%) is due.',
};

export const DALEEL_SILVER_NISAB: Daleel = {
  source: 'hadith',
  reference: 'Sunan Abī Dāwūd 1573',
  narrator: 'ʿAlī ibn Abī Ṭālib',
  grade: 'Ṣaḥīḥ',
  text: 'When you possess two hundred dirhams and a year passes upon them, five dirhams are due — and nothing is due on gold until you have twenty dīnārs.',
};

export const DALEEL_GOLD_NISAB: Daleel = {
  source: 'hadith',
  reference: 'Sunan Abī Dāwūd 1573',
  narrator: 'ʿAlī ibn Abī Ṭālib',
  grade: 'Ṣaḥīḥ',
  text: 'On twenty dīnārs of gold, half a dīnār is due — that is one-fortieth (2.5%).',
};

export const DALEEL_HAWL: Daleel = {
  source: 'hadith',
  reference: 'Sunan Abī Dāwūd 1573 · Jāmiʿ at-Tirmidhī 632',
  narrator: 'ʿĀʾishah & ʿAlī',
  grade: 'Ṣaḥīḥ',
  text: 'There is no zakat upon wealth until a (lunar) year passes over it.',
};

/* ------------------------------------------------------------------ *
 * The worksheet model — asset/liability groups and their fields.
 * Both the worksheet and the guided wizard render from ZAKAT_GROUPS.
 * ------------------------------------------------------------------ */

export type AssetKey =
  // Cash
  | 'cashOnHand'
  | 'bankBalance'
  | 'foreignCash'
  | 'otherCash'
  // Gold (in grams, by karat) & silver (in grams)
  | 'gold24'
  | 'gold22'
  | 'gold21'
  | 'gold18'
  | 'silverGrams'
  // Investments
  | 'stocksTrading'
  | 'stocksLongTerm'
  | 'crypto'
  | 'pension'
  // Business
  | 'businessCash'
  | 'inventory'
  | 'rawMaterials'
  // Receivables
  | 'strongReceivables'
  // Liabilities
  | 'shortTermDebt'
  | 'longTermDebtDue'
  | 'businessLiabilities';

export type ZakatFieldKind = 'currency' | 'grams';

export type ZakatField = {
  key: AssetKey;
  label: string;
  hint?: string;
  kind: ZakatFieldKind;
  karat?: 24 | 22 | 21 | 18;
};

export type ZakatGroupKind = 'asset' | 'liability';

export type ZakatGroup = {
  id: string;
  title: string;
  subtitle: string;
  /** Lucide icon key, mapped to a component in the UI layer. */
  icon: 'wallet' | 'gem' | 'trending-up' | 'briefcase' | 'hand-coins' | 'receipt';
  kind: ZakatGroupKind;
  fields: ZakatField[];
  tip?: string;
  daleel?: Daleel[];
};

export const ZAKAT_GROUPS: ZakatGroup[] = [
  {
    id: 'cash',
    title: 'Cash & bank',
    subtitle: 'Money you can access',
    icon: 'wallet',
    kind: 'asset',
    fields: [
      { key: 'cashOnHand', label: 'Cash on hand', kind: 'currency', hint: 'Notes & coins you hold' },
      { key: 'bankBalance', label: 'Bank accounts', kind: 'currency', hint: 'Checking, savings, e-wallets' },
      { key: 'foreignCash', label: 'Foreign currency', kind: 'currency', hint: 'Converted to your currency' },
      { key: 'otherCash', label: 'Other liquid savings', kind: 'currency', hint: 'Prepaid, gift balances, etc.' },
    ],
    daleel: [DALEEL_COMMAND, DALEEL_RATE],
  },
  {
    id: 'metals',
    title: 'Gold & silver',
    subtitle: 'By weight — purity handled for you',
    icon: 'gem',
    kind: 'asset',
    fields: [
      { key: 'gold24', label: 'Gold 24K', kind: 'grams', karat: 24, hint: 'Pure gold, grams' },
      { key: 'gold22', label: 'Gold 22K', kind: 'grams', karat: 22, hint: 'Grams' },
      { key: 'gold21', label: 'Gold 21K', kind: 'grams', karat: 21, hint: 'Grams' },
      { key: 'gold18', label: 'Gold 18K', kind: 'grams', karat: 18, hint: 'Grams' },
      { key: 'silverGrams', label: 'Silver', kind: 'grams', hint: 'Total grams' },
    ],
    tip: 'Investment gold and silver are always counted. Whether everyday jewellery is included differs by madhab — the Ḥanafīs include it; many Mālikī, Shāfiʿī and Ḥanbalī scholars exempt jewellery kept for personal use. Choose your position in Settings.',
    daleel: [DALEEL_GOLD_NISAB, DALEEL_SILVER_NISAB],
  },
  {
    id: 'investments',
    title: 'Investments',
    subtitle: 'Shares, funds, crypto, pensions',
    icon: 'trending-up',
    kind: 'asset',
    fields: [
      { key: 'stocksTrading', label: 'Shares for trading', kind: 'currency', hint: 'Bought to sell — full market value' },
      { key: 'stocksLongTerm', label: 'Long-term shares & funds', kind: 'currency', hint: 'Held for growth/dividends' },
      { key: 'crypto', label: 'Cryptocurrency', kind: 'currency', hint: 'Current market value' },
      { key: 'pension', label: 'Accessible pension', kind: 'currency', hint: 'Vested / withdrawable portion' },
    ],
    tip: 'Shares bought to trade are zakatable at full value. For long-term holdings, scholars differ: pay on a proxy of the zakatable assets behind each share (default ~30%), pay on the full value (most cautious), or pay only on dividends received. Choose the method in Settings.',
  },
  {
    id: 'business',
    title: 'Business assets',
    subtitle: 'Trade goods & business cash',
    icon: 'briefcase',
    kind: 'asset',
    fields: [
      { key: 'businessCash', label: 'Business cash', kind: 'currency', hint: 'Tills, business accounts' },
      { key: 'inventory', label: 'Stock for sale', kind: 'currency', hint: 'Resale value of inventory' },
      { key: 'rawMaterials', label: 'Raw materials', kind: 'currency', hint: 'Goods that become stock' },
    ],
    tip: 'Trade goods (ʿurūḍ at-tijārah) are valued at their current selling price on your zakat date. Fixed assets you use to run the business — premises, tools, vehicles — are not zakatable.',
  },
  {
    id: 'receivables',
    title: 'Money owed to you',
    subtitle: 'Loans & reliable receivables',
    icon: 'hand-coins',
    kind: 'asset',
    fields: [
      { key: 'strongReceivables', label: 'Strong debts owed to you', kind: 'currency', hint: 'Expected back — e.g. a loan to a reliable person' },
    ],
    tip: 'A “strong” debt — one you reasonably expect to recover — is zakatable each year. A “weak” or doubtful debt is usually only zakated once, in the year you actually receive it.',
  },
  {
    id: 'liabilities',
    title: 'Debts you owe',
    subtitle: 'Deducted from your wealth',
    icon: 'receipt',
    kind: 'liability',
    fields: [
      { key: 'shortTermDebt', label: 'Debts due now', kind: 'currency', hint: 'Bills, credit cards, overdue amounts' },
      { key: 'longTermDebtDue', label: 'Long-term debt — next 12 months', kind: 'currency', hint: 'E.g. this year of mortgage/loan instalments' },
      { key: 'businessLiabilities', label: 'Business payables', kind: 'currency', hint: 'Owed to suppliers/staff' },
    ],
    tip: 'Immediate debts are deducted from your zakatable wealth. For long-term debts (like a mortgage), many contemporary scholars deduct only the portion due within the coming year, not the whole balance. Choose your debt policy in Settings.',
  },
];

/** Every asset key, useful for building the empty worksheet. */
export const ASSET_KEYS: AssetKey[] = ZAKAT_GROUPS.flatMap((g) => g.fields.map((f) => f.key));

/* ------------------------------------------------------------------ *
 * Settings model + defaults
 * ------------------------------------------------------------------ */

export type NisabStandard = 'silver' | 'gold';
export type DebtPolicy = 'dueNow' | 'twelveMonth' | 'none';
export type YearType = 'lunar' | 'solar';
export type StocksMethod = 'proxy' | 'full' | 'dividends';
export type PriceMode = 'manual' | 'online';

export type ZakatSettings = {
  nisabStandard: NisabStandard;
  goldPerGram: number;
  silverPerGram: number;
  priceMode: PriceMode;
  pricesUpdatedAt: string | null;
  priceSource: string | null;
  currency: string;
  /** Count everyday gold/silver jewellery as zakatable (Ḥanafī / cautious). */
  jewelryZakatable: boolean;
  debtPolicy: DebtPolicy;
  yearType: YearType;
  stocksMethod: StocksMethod;
  stocksProxyPct: number;
  hawlStartISO: string | null;
};

/**
 * Seeded, offline defaults. Metal prices are placeholders the user updates
 * (manually or with one tap online) — the app never assumes a live price.
 * Default niṣāb is silver: it is the lower threshold, so more people qualify
 * and more reaches the poor — the more charitable, widely-encouraged choice.
 */
export const DEFAULT_ZAKAT_SETTINGS: ZakatSettings = {
  nisabStandard: 'silver',
  goldPerGram: 85,
  silverPerGram: 1.05,
  priceMode: 'manual',
  pricesUpdatedAt: null,
  priceSource: null,
  currency: 'USD',
  jewelryZakatable: true,
  debtPolicy: 'dueNow',
  yearType: 'lunar',
  stocksMethod: 'proxy',
  stocksProxyPct: 30,
  hawlStartISO: null,
};

export type ZakatValues = Record<AssetKey, number>;

export function emptyValues(): ZakatValues {
  return ASSET_KEYS.reduce((acc, k) => {
    acc[k] = 0;
    return acc;
  }, {} as ZakatValues);
}

export const DEFAULT_ZAKAT_VALUES: ZakatValues = emptyValues();

/* ------------------------------------------------------------------ *
 * Learn / FAQ content
 * ------------------------------------------------------------------ */

export type ZakatNote = { title: string; body: string };

export const ZAKAT_MISTAKES: ZakatNote[] = [
  {
    title: 'Forgetting the ḥawl',
    body: 'Zakat is due once a lunar year passes over wealth that meets the niṣāb — set your zakat date and keep it each year.',
  },
  {
    title: 'Only counting cash',
    body: 'Gold, silver, shares, business stock, crypto and reliable loans owed to you are all zakatable — not just the money in your account.',
  },
  {
    title: 'Deducting the entire mortgage',
    body: 'Most contemporary scholars deduct only the instalments due within the coming year, not the whole long-term balance.',
  },
  {
    title: 'Using the wrong rate for a solar year',
    body: 'A lunar year is ~11 days shorter than a solar one. If you calculate on the Gregorian calendar, use 2.5775% instead of 2.5%.',
  },
];

export const ZAKAT_DISCLAIMER =
  'This calculator is an educational tool, not a fatwa. The thresholds and rate are sourced to Qurʾān and authentic Sunnah, and points of difference between the madhāhib are noted so you can choose. For your specific situation — complex investments, debts, business structures or doubtful assets — please consult a qualified scholar. Content is pending formal scholarly review.';
