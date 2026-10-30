/**
 * lib/zakat.ts — the pure Zakat calculation engine.
 *
 * No React, no storage, no side effects — just functions that turn a
 * worksheet + settings + prices into a fully broken-down result. This is what
 * the unit tests exercise, and what every screen renders from.
 */
import {
  KARAT_PURITY,
  LUNAR_YEAR_DAYS,
  NISAB_GOLD_GRAMS,
  NISAB_SILVER_GRAMS,
  ZAKAT_RATE_LUNAR,
  ZAKAT_RATE_SOLAR,
  type ZakatSettings,
  type ZakatValues,
} from '../content/zakat/zakat';

const DAY_MS = 86_400_000;

/** Value of all gold the user holds, accounting for each karat's purity. */
export function goldValue(values: ZakatValues, goldPerGram: number): number {
  const pureGrams =
    values.gold24 * KARAT_PURITY[24] +
    values.gold22 * KARAT_PURITY[22] +
    values.gold21 * KARAT_PURITY[21] +
    values.gold18 * KARAT_PURITY[18];
  return pureGrams * goldPerGram;
}

/** Value of the user's silver. */
export function silverValue(values: ZakatValues, silverPerGram: number): number {
  return values.silverGrams * silverPerGram;
}

/** The niṣāb in the user's currency, for the chosen standard. */
export function nisabValue(settings: ZakatSettings): number {
  return settings.nisabStandard === 'gold'
    ? NISAB_GOLD_GRAMS * settings.goldPerGram
    : NISAB_SILVER_GRAMS * settings.silverPerGram;
}

/** The long-term-shares contribution, per the user's chosen method. */
export function longTermStocksValue(values: ZakatValues, settings: ZakatSettings): number {
  switch (settings.stocksMethod) {
    case 'full':
      return values.stocksLongTerm;
    case 'dividends':
      // Only dividends are zakatable; the user records those under cash.
      return 0;
    case 'proxy':
    default:
      return values.stocksLongTerm * (clampPct(settings.stocksProxyPct) / 100);
  }
}

function clampPct(p: number): number {
  if (!isFinite(p)) return 0;
  return Math.min(100, Math.max(0, p));
}

export type ZakatLine = { key: string; label: string; amount: number };

export type ZakatComputation = {
  currency: string;
  assetLines: ZakatLine[];
  liabilityLines: ZakatLine[];
  grossAssets: number;
  liabilities: number;
  netZakatable: number;
  nisab: number;
  nisabStandard: ZakatSettings['nisabStandard'];
  meetsNisab: boolean;
  rate: number;
  zakatDue: number;
  /** How much more wealth is needed to reach niṣāb (0 if already met). */
  shortfallToNisab: number;
};

/** The whole calculation, fully broken down. */
export function computeZakat(values: ZakatValues, settings: ZakatSettings): ZakatComputation {
  const cash = values.cashOnHand + values.bankBalance + values.foreignCash + values.otherCash;
  const metals = settings.jewelryZakatable
    ? goldValue(values, settings.goldPerGram) + silverValue(values, settings.silverPerGram)
    : 0;
  const investments =
    values.stocksTrading + longTermStocksValue(values, settings) + values.crypto + values.pension;
  const business = values.businessCash + values.inventory + values.rawMaterials;
  const receivables = values.strongReceivables;

  const assetLines: ZakatLine[] = [
    { key: 'cash', label: 'Cash & bank', amount: cash },
    { key: 'metals', label: 'Gold & silver', amount: metals },
    { key: 'investments', label: 'Investments', amount: investments },
    { key: 'business', label: 'Business assets', amount: business },
    { key: 'receivables', label: 'Money owed to you', amount: receivables },
  ].filter((l) => l.amount > 0);

  const grossAssets = cash + metals + investments + business + receivables;

  // Liabilities depend on the chosen debt policy.
  let deductible = 0;
  const liabilityLines: ZakatLine[] = [];
  if (settings.debtPolicy !== 'none') {
    const immediate = values.shortTermDebt + values.businessLiabilities;
    deductible += immediate;
    if (immediate > 0) liabilityLines.push({ key: 'immediate', label: 'Debts due now', amount: immediate });
    if (settings.debtPolicy === 'twelveMonth' && values.longTermDebtDue > 0) {
      deductible += values.longTermDebtDue;
      liabilityLines.push({ key: 'longterm', label: 'Long-term debt (12 months)', amount: values.longTermDebtDue });
    }
  }

  const netZakatable = Math.max(0, grossAssets - deductible);
  const nisab = nisabValue(settings);
  const meetsNisab = netZakatable >= nisab && netZakatable > 0;
  const rate = settings.yearType === 'solar' ? ZAKAT_RATE_SOLAR : ZAKAT_RATE_LUNAR;
  const zakatDue = meetsNisab ? netZakatable * rate : 0;
  const shortfallToNisab = meetsNisab ? 0 : Math.max(0, nisab - netZakatable);

  return {
    currency: settings.currency,
    assetLines,
    liabilityLines,
    grossAssets,
    liabilities: deductible,
    netZakatable,
    nisab,
    nisabStandard: settings.nisabStandard,
    meetsNisab,
    rate,
    zakatDue,
    shortfallToNisab,
  };
}

export type HawlStatus = {
  started: boolean;
  complete: boolean;
  dueDateISO: string | null;
  daysRemaining: number | null;
  daysElapsed: number | null;
  progress: number;
};

/** Where the user is in their lunar-year holding period. */
export function hawlStatus(startISO: string | null, now: Date = new Date()): HawlStatus {
  if (!startISO) {
    return { started: false, complete: false, dueDateISO: null, daysRemaining: null, daysElapsed: null, progress: 0 };
  }
  const start = new Date(startISO).getTime();
  const due = start + LUNAR_YEAR_DAYS * DAY_MS;
  const elapsed = Math.floor((now.getTime() - start) / DAY_MS);
  const remaining = Math.ceil((due - now.getTime()) / DAY_MS);
  const progress = Math.min(1, Math.max(0, (now.getTime() - start) / (due - start)));
  return {
    started: true,
    complete: now.getTime() >= due,
    dueDateISO: new Date(due).toISOString(),
    daysRemaining: Math.max(0, remaining),
    daysElapsed: Math.max(0, elapsed),
    progress,
  };
}

/** Format a money amount in the user's currency, with a safe fallback. */
export function formatMoney(amount: number, currency: string = 'USD'): string {
  const safe = isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: safe % 1 === 0 ? 0 : 2,
    }).format(safe);
  } catch {
    return `${currency} ${safe.toFixed(2)}`;
  }
}
