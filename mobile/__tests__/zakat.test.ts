import {
  computeZakat,
  formatMoney,
  goldValue,
  hawlStatus,
  longTermStocksValue,
  nisabValue,
  silverValue,
} from '../lib/zakat';
import {
  DEFAULT_ZAKAT_SETTINGS,
  NISAB_GOLD_GRAMS,
  NISAB_SILVER_GRAMS,
  ZAKAT_RATE_LUNAR,
  ZAKAT_RATE_SOLAR,
  emptyValues,
  type ZakatSettings,
  type ZakatValues,
} from '../content/zakat/zakat';

/** A worksheet with everything zero, then overlay only what a test needs. */
function valuesOf(overrides: Partial<ZakatValues> = {}): ZakatValues {
  return { ...emptyValues(), ...overrides };
}

function settingsOf(overrides: Partial<ZakatSettings> = {}): ZakatSettings {
  return { ...DEFAULT_ZAKAT_SETTINGS, ...overrides };
}

describe('zakat · metal valuation', () => {
  test('goldValue applies each karat purity', () => {
    const v = valuesOf({ gold24: 10, gold22: 10, gold21: 10, gold18: 10 });
    // (10*1 + 10*0.9167 + 10*0.875 + 10*0.75) * 50
    const expected = (10 + 9.167 + 8.75 + 7.5) * 50;
    expect(goldValue(v, 50)).toBeCloseTo(expected, 3);
  });

  test('pure 24K gold is unscaled', () => {
    expect(goldValue(valuesOf({ gold24: 5 }), 80)).toBeCloseTo(400, 6);
  });

  test('silverValue is grams times price', () => {
    expect(silverValue(valuesOf({ silverGrams: 100 }), 1.05)).toBeCloseTo(105, 6);
  });
});

describe('zakat · nisab', () => {
  test('silver standard uses the silver weight and price', () => {
    const s = settingsOf({ nisabStandard: 'silver', silverPerGram: 1 });
    expect(nisabValue(s)).toBeCloseTo(NISAB_SILVER_GRAMS, 6);
  });

  test('gold standard uses the gold weight and price', () => {
    const s = settingsOf({ nisabStandard: 'gold', goldPerGram: 1 });
    expect(nisabValue(s)).toBeCloseTo(NISAB_GOLD_GRAMS, 6);
  });
});

describe('zakat · long-term stocks methods', () => {
  const v = valuesOf({ stocksLongTerm: 1000 });

  test('full method counts the whole value', () => {
    expect(longTermStocksValue(v, settingsOf({ stocksMethod: 'full' }))).toBe(1000);
  });

  test('dividends method counts nothing from the holding itself', () => {
    expect(longTermStocksValue(v, settingsOf({ stocksMethod: 'dividends' }))).toBe(0);
  });

  test('proxy method scales by the proxy percentage', () => {
    expect(longTermStocksValue(v, settingsOf({ stocksMethod: 'proxy', stocksProxyPct: 30 }))).toBe(300);
  });

  test('proxy percentage is clamped to 0..100', () => {
    expect(longTermStocksValue(v, settingsOf({ stocksMethod: 'proxy', stocksProxyPct: 250 }))).toBe(1000);
    expect(longTermStocksValue(v, settingsOf({ stocksMethod: 'proxy', stocksProxyPct: -10 }))).toBe(0);
  });
});

describe('zakat · computeZakat thresholds', () => {
  test('below nisab → no zakat, reports the shortfall', () => {
    const s = settingsOf({ nisabStandard: 'silver', silverPerGram: 1 }); // nisab ≈ 612.36
    const r = computeZakat(valuesOf({ bankBalance: 500 }), s);
    expect(r.meetsNisab).toBe(false);
    expect(r.zakatDue).toBe(0);
    expect(r.shortfallToNisab).toBeCloseTo(NISAB_SILVER_GRAMS - 500, 4);
  });

  test('exactly at nisab → zakat is due', () => {
    const s = settingsOf({ nisabStandard: 'silver', silverPerGram: 1 });
    const r = computeZakat(valuesOf({ bankBalance: NISAB_SILVER_GRAMS }), s);
    expect(r.meetsNisab).toBe(true);
    expect(r.zakatDue).toBeCloseTo(NISAB_SILVER_GRAMS * ZAKAT_RATE_LUNAR, 6);
  });

  test('above nisab → 2.5% of the net', () => {
    const s = settingsOf({ nisabStandard: 'silver', silverPerGram: 1 });
    const r = computeZakat(valuesOf({ bankBalance: 10000 }), s);
    expect(r.zakatDue).toBeCloseTo(250, 6);
  });

  test('zero wealth never qualifies even though 0 >= 0 is false here', () => {
    const r = computeZakat(valuesOf(), settingsOf({ silverPerGram: 0, nisabStandard: 'silver' }));
    expect(r.meetsNisab).toBe(false);
    expect(r.zakatDue).toBe(0);
  });
});

describe('zakat · debt policy', () => {
  const base = valuesOf({ bankBalance: 10000, shortTermDebt: 2000, longTermDebtDue: 3000, businessLiabilities: 500 });

  test('dueNow deducts immediate debts only', () => {
    const r = computeZakat(base, settingsOf({ debtPolicy: 'dueNow', silverPerGram: 1 }));
    expect(r.liabilities).toBe(2500);
    expect(r.netZakatable).toBe(7500);
    expect(r.zakatDue).toBeCloseTo(187.5, 6);
  });

  test('twelveMonth also deducts the year of long-term debt', () => {
    const r = computeZakat(base, settingsOf({ debtPolicy: 'twelveMonth', silverPerGram: 1 }));
    expect(r.liabilities).toBe(5500);
    expect(r.netZakatable).toBe(4500);
  });

  test('none deducts nothing', () => {
    const r = computeZakat(base, settingsOf({ debtPolicy: 'none', silverPerGram: 1 }));
    expect(r.liabilities).toBe(0);
    expect(r.netZakatable).toBe(10000);
  });

  test('liabilities never push net below zero', () => {
    const r = computeZakat(valuesOf({ bankBalance: 100, shortTermDebt: 9999 }), settingsOf({ silverPerGram: 1 }));
    expect(r.netZakatable).toBe(0);
  });
});

describe('zakat · jewelry toggle', () => {
  const v = valuesOf({ gold24: 100 });
  test('jewelry counted when toggle is on', () => {
    const r = computeZakat(v, settingsOf({ jewelryZakatable: true, goldPerGram: 50, silverPerGram: 1 }));
    expect(r.grossAssets).toBeCloseTo(5000, 6);
  });
  test('jewelry excluded when toggle is off', () => {
    const r = computeZakat(v, settingsOf({ jewelryZakatable: false, goldPerGram: 50, silverPerGram: 1 }));
    expect(r.grossAssets).toBe(0);
  });
});

describe('zakat · solar vs lunar rate', () => {
  const s = settingsOf({ silverPerGram: 1, nisabStandard: 'silver' });
  test('lunar uses 2.5%', () => {
    expect(computeZakat(valuesOf({ bankBalance: 10000 }), { ...s, yearType: 'lunar' }).rate).toBe(ZAKAT_RATE_LUNAR);
  });
  test('solar uses 2.5775%', () => {
    const r = computeZakat(valuesOf({ bankBalance: 10000 }), { ...s, yearType: 'solar' });
    expect(r.rate).toBe(ZAKAT_RATE_SOLAR);
    expect(r.zakatDue).toBeCloseTo(257.75, 4);
  });
});

describe('zakat · breakdown lines', () => {
  test('only non-zero asset groups appear', () => {
    const r = computeZakat(valuesOf({ bankBalance: 1000, crypto: 500 }), settingsOf({ silverPerGram: 1 }));
    const keys = r.assetLines.map((l) => l.key);
    expect(keys).toContain('cash');
    expect(keys).toContain('investments');
    expect(keys).not.toContain('metals');
    expect(keys).not.toContain('business');
  });
});

describe('zakat · hawl status', () => {
  test('no start date → not started', () => {
    const h = hawlStatus(null);
    expect(h.started).toBe(false);
    expect(h.complete).toBe(false);
  });

  test('mid-year → not complete, days remaining counts down', () => {
    const start = new Date('2026-01-01T00:00:00.000Z').toISOString();
    const now = new Date('2026-06-01T00:00:00.000Z');
    const h = hawlStatus(start, now);
    expect(h.started).toBe(true);
    expect(h.complete).toBe(false);
    expect(h.daysRemaining).toBeGreaterThan(0);
    expect(h.progress).toBeGreaterThan(0);
    expect(h.progress).toBeLessThan(1);
  });

  test('after a full lunar year → complete', () => {
    const start = new Date('2025-01-01T00:00:00.000Z').toISOString();
    const now = new Date('2026-01-01T00:00:00.000Z'); // 365 days > 354.367
    const h = hawlStatus(start, now);
    expect(h.complete).toBe(true);
    expect(h.daysRemaining).toBe(0);
    expect(h.progress).toBe(1);
  });
});

describe('zakat · formatMoney', () => {
  test('formats whole amounts without forced decimals', () => {
    expect(formatMoney(1000, 'USD')).toBe('$1,000');
  });
  test('keeps cents when present', () => {
    expect(formatMoney(187.5, 'USD')).toBe('$187.50');
  });
  test('falls back gracefully for unknown currency codes', () => {
    const out = formatMoney(50, 'ZZZ');
    expect(out).toContain('50');
  });
});
