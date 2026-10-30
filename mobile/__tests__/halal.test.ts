/**
 * Halal engine tests.
 *
 * The adversarial block matters most: a naive E-number regex or substring
 * alias match passes ordinary cases and then flags "vitamin E" as an additive
 * or reports "alcohol-free" as containing alcohol.
 */
import {
  expandUpcE,
  isSupportedBarcode,
  isValidEan8,
  isValidEan13,
  isValidUpcA,
  normalizeBarcode,
} from '../lib/halal/barcode';
import { joinNormalized, normalizeIngredient, parseIngredients } from '../lib/halal/parse';
import { matchAdditives, resetIndex } from '../lib/halal/match';
import {
  DEFAULT_PREFS,
  assessIngredients,
  type HalalPrefs,
} from '../lib/halal/assess';
import {
  ADDITIVES,
  ADDITIVE_BY_CODE,
  CLEAR_ROWS,
  FLAGGED_ADDITIVES,
  HALAL_DISCLAIMER,
  NAMED_INGREDIENTS,
  RULINGS,
  RULING_BY_AXIS,
  expandClear,
} from '../content/halal';

const codesIn = (raw: string, prefs: HalalPrefs = DEFAULT_PREFS) =>
  assessIngredients(raw, prefs).flags.map((f) => f.additive.code);

beforeEach(() => resetIndex());

describe('barcode check digits', () => {
  it('accepts real EAN-13 codes', () => {
    expect(isValidEan13('5000159484695')).toBe(true);
    expect(isValidEan13('4006381333931')).toBe(true);
  });

  it('rejects an EAN-13 with a wrong check digit', () => {
    expect(isValidEan13('5000159484694')).toBe(false);
    expect(isValidEan13('5000159484696')).toBe(false);
  });

  it('catches a single transposed digit', () => {
    expect(isValidEan13('5000159486495')).toBe(false);
  });

  it('validates EAN-8 and UPC-A', () => {
    expect(isValidEan8('96385074')).toBe(true);
    expect(isValidEan8('96385075')).toBe(false);
    expect(isValidUpcA('036000291452')).toBe(true);
    expect(isValidUpcA('036000291453')).toBe(false);
  });

  it('rejects anything that is not digits or is the wrong length', () => {
    expect(isValidEan13('abcdefghijklm')).toBe(false);
    expect(isValidEan13('500015948469')).toBe(false);
    expect(normalizeBarcode('')).toBeNull();
    expect(normalizeBarcode('hello')).toBeNull();
    expect(normalizeBarcode('12345')).toBeNull();
  });

  it('pads UPC-A to thirteen digits', () => {
    expect(normalizeBarcode('036000291452')).toBe('0036000291452');
  });

  it('expands UPC-E to UPC-A', () => {
    const expanded = expandUpcE('04252614');
    expect(expanded).not.toBeNull();
    expect(expanded).toHaveLength(12);
    expect(isValidUpcA(expanded!)).toBe(true);
  });

  it('rejects a UPC-E with an invalid number system', () => {
    expect(expandUpcE('54252614')).toBeNull();
    expect(expandUpcE('0425261')).toBeNull();
  });

  it('strips spaces and hyphens before validating', () => {
    expect(normalizeBarcode('5000159 484695')).toBe('5000159484695');
    expect(normalizeBarcode('5000-1594-84695')).toBe('5000159484695');
  });

  it('unwraps a GTIN-14 case code to its retail barcode', () => {
    expect(normalizeBarcode('15000159484695')).toBe('5000159484695');
  });

  it('reports support consistently with normalisation', () => {
    expect(isSupportedBarcode('5000159484695')).toBe(true);
    expect(isSupportedBarcode('5000159484694')).toBe(false);
  });
});

describe('parsing an ingredients list', () => {
  it('splits on commas and trims', () => {
    const t = parseIngredients('Sugar, Water, Salt');
    expect(t.map((x) => x.text)).toEqual(['Sugar', 'Water', 'Salt']);
  });

  it('drops the "Ingredients:" lead-in', () => {
    expect(parseIngredients('Ingredients: Sugar, Salt')[0].text).toBe('Sugar');
    expect(parseIngredients('INGRÉDIENTS: Sucre, Sel')[0].text).toBe('Sucre');
  });

  it('lifts bracketed contents out as their own ingredients', () => {
    const t = parseIngredients('Emulsifier (E471), Sugar');
    expect(t.map((x) => x.normalized)).toContain('emulsifier');
    expect(t.map((x) => x.normalized)).toContain('e471');
  });

  it('handles nested brackets', () => {
    const t = parseIngredients('Flavouring (contains milk, soy (lecithin)), Sugar');
    const n = t.map((x) => x.normalized);
    expect(n).toContain('milk');
    expect(n).toContain('lecithin');
    expect(n).toContain('sugar');
  });

  it('strips percentages and stray marks', () => {
    const t = parseIngredients('Cocoa 32%, *Sugar, Milk 12.5%');
    expect(t.map((x) => x.text)).toEqual(['Cocoa', 'Sugar', 'Milk']);
  });

  it('discards bare numbers left behind', () => {
    expect(parseIngredients('Sugar, 32, Salt').map((x) => x.text)).toEqual(['Sugar', 'Salt']);
  });

  it('splits on "and" and ampersands', () => {
    const n = parseIngredients('Salt and Pepper, Oil & Vinegar').map((x) => x.normalized);
    expect(n).toContain('salt');
    expect(n).toContain('pepper');
    expect(n).toContain('oil');
  });

  it('deduplicates repeats', () => {
    expect(parseIngredients('Sugar, sugar, SUGAR')).toHaveLength(1);
  });

  it('returns nothing for empty input', () => {
    expect(parseIngredients('')).toEqual([]);
    expect(parseIngredients('   ')).toEqual([]);
  });

  it('normalises accents and case', () => {
    expect(normalizeIngredient('Gélatine')).toBe('gelatine');
    expect(normalizeIngredient('  SUGAR!  ')).toBe('sugar');
  });

  it('joins back into a scannable string', () => {
    expect(joinNormalized(parseIngredients('Sugar, Salt'))).toBe('sugar , salt');
  });
});

describe('adversarial matching — the cases a naive matcher gets wrong', () => {
  it('does not read "vitamin E" as an E-number', () => {
    expect(codesIn('Sugar, Vitamin E, Salt')).toEqual([]);
  });

  it('does not read "vitamin E 400" as additive E400', () => {
    expect(codesIn('Vitamin E 400, Sugar')).toEqual([]);
  });

  it('does not match "e.g." or ordinary words starting with e', () => {
    expect(codesIn('Spices e.g. cumin, Ester gum substitute')).not.toContain('E473');
    expect(codesIn('Essence, Estragon, Emmental')).toEqual([]);
  });

  it('does not flag "alcohol-free"', () => {
    expect(codesIn('Alcohol-free flavouring, Water')).not.toContain('ethanol');
    expect(codesIn('Alcohol free base, Water')).not.toContain('ethanol');
  });

  it('does not flag "non-alcoholic" or "no gelatin"', () => {
    expect(codesIn('Non alcoholic malt drink')).not.toContain('ethanol');
    expect(codesIn('Sweets, no gelatin, sugar')).not.toContain('E441');
  });

  it('does not match "lard" inside "collard"', () => {
    expect(codesIn('Collard greens, water, salt')).not.toContain('lard');
  });

  it('does not match "wine" inside "wine vinegar" as the drink', () => {
    const codes = codesIn('White wine vinegar, water');
    expect(codes).toContain('wine-vinegar');
    expect(codes).not.toContain('alcoholic-drink');
  });

  it('prefers the specific entry over the general one', () => {
    const codes = codesIn('Pork gelatin, sugar');
    expect(codes).toContain('gelatin-pork');
    expect(codes).not.toContain('E441');
  });
});

describe('matching real-world label text', () => {
  it('finds E-numbers written in every common style', () => {
    for (const form of ['E471', 'E 471', 'E-471', 'e471', 'INS 471']) {
      expect(codesIn(`Sugar, ${form}, Salt`)).toContain('E471');
    }
  });

  it('finds an additive named in words rather than by number', () => {
    expect(codesIn('Sugar, mono- and diglycerides of fatty acids')).toContain('E471');
  });

  it('finds gelatin in several languages', () => {
    expect(codesIn('Sugar, gelatine')).toContain('E441');
    expect(codesIn('Zucker, Gelatine')).toContain('E441');
    expect(codesIn('Sucre, gélatine')).toContain('E441');
  });

  it('flags pork explicitly', () => {
    expect(codesIn('Pork, salt, spices')).toContain('pork');
  });

  it('reads a full confectionery label', () => {
    const codes = codesIn(
      'Glucose syrup, sugar, gelatine, dextrose, citric acid, fruit concentrate, flavouring, glazing agent (E903, E904), colour (E120)',
    );
    expect(codes).toContain('E441');
    expect(codes).toContain('E904');
    expect(codes).toContain('E120');
  });

  it('ignores additives with no concern', () => {
    expect(codesIn('Water, sugar, citric acid (E330), salt')).toEqual([]);
  });

  it('does not double-report the same additive', () => {
    const codes = codesIn('E471, mono and diglycerides, E471');
    expect(codes.filter((c) => c === 'E471')).toHaveLength(1);
  });
});

describe('the user’s own position changes the result', () => {
  const label = 'Sugar, emulsifier (E471), flavouring';

  it('warns by default', () => {
    const a = assessIngredients(label, DEFAULT_PREFS);
    expect(a.verdict).toBe('check');
    expect(a.flags.find((f) => f.additive.code === 'E471')!.level).toBe('check');
  });

  it('softens to a note when transformation is accepted', () => {
    const prefs: HalalPrefs = { ...DEFAULT_PREFS, istihalah: 'accept' };
    const flag = assessIngredients(label, prefs).flags.find((f) => f.additive.code === 'E471')!;
    expect(flag.level).toBe('note');
    expect(flag.relaxedBy).toContain('istihalah');
  });

  it('needs every position an entry rests on, not just one', () => {
    // Natural flavouring depends on all three axes.
    const partly: HalalPrefs = { ...DEFAULT_PREFS, istihalah: 'accept' };
    const all: HalalPrefs = { istihalah: 'accept', ahlKitab: 'accept', traceAlcohol: 'accept' };
    const one = assessIngredients('Natural flavouring', partly).flags[0];
    const every = assessIngredients('Natural flavouring', all).flags[0];
    expect(one.level).toBe('check');
    expect(every.level).toBe('note');
  });

  it('never softens something prohibited outright', () => {
    const all: HalalPrefs = { istihalah: 'accept', ahlKitab: 'accept', traceAlcohol: 'accept' };
    const a = assessIngredients('Pork, sugar', all);
    expect(a.verdict).toBe('prohibited');
    expect(a.flags[0].level).toBe('prohibited');
  });

  it('softens meat when the food of the People of the Book is accepted', () => {
    const accept: HalalPrefs = { ...DEFAULT_PREFS, ahlKitab: 'accept' };
    expect(assessIngredients('Beef, salt', DEFAULT_PREFS).verdict).toBe('check');
    expect(assessIngredients('Beef, salt', accept).verdict).toBe('none');
  });

  it('softens a trace-alcohol carrier but never wine itself', () => {
    const accept: HalalPrefs = { ...DEFAULT_PREFS, traceAlcohol: 'accept' };
    expect(assessIngredients('Vanilla extract, sugar', accept).verdict).toBe('none');
    expect(assessIngredients('White wine, water', accept).verdict).toBe('prohibited');
  });
});

describe('verdicts', () => {
  it('never returns a "halal" verdict for anything', () => {
    const labels = [
      'Water, sugar, salt',
      'Beef, salt',
      'Pork, salt',
      'E471, sugar',
      '',
    ];
    for (const l of labels) {
      expect(['prohibited', 'check', 'none']).toContain(assessIngredients(l).verdict);
    }
  });

  it('reports none for a plainly unremarkable list', () => {
    const a = assessIngredients('Water, sugar, salt, citric acid');
    expect(a.verdict).toBe('none');
    expect(a.flags).toEqual([]);
  });

  it('ranks prohibited above needs-checking in the flag order', () => {
    const a = assessIngredients('E471, pork, gelatine');
    expect(a.flags[0].level).toBe('prohibited');
  });

  it('marks that an animal ingredient is present', () => {
    expect(assessIngredients('Beef, salt').hasAnimal).toBe(true);
    expect(assessIngredients('Water, sugar').hasAnimal).toBe(false);
  });

  it('keeps every parsed ingredient for display', () => {
    const a = assessIngredients('Sugar, water, E471');
    expect(a.tokens).toHaveLength(3);
  });

  it('handles an empty ingredients list without inventing a verdict', () => {
    const a = assessIngredients('');
    expect(a.verdict).toBe('none');
    expect(a.tokens).toEqual([]);
    expect(a.flags).toEqual([]);
  });
});

describe('content integrity', () => {
  it('has no duplicate additive codes', () => {
    const codes = ADDITIVES.map((a) => a.code.toLowerCase());
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('never lets two additives claim the same alias', () => {
    const owner = new Map<string, string>();
    const clashes: string[] = [];
    for (const a of ADDITIVES) {
      for (const alias of [a.code, ...(a.aliases ?? [])]) {
        const key = normalizeIngredient(alias);
        if (!key) continue;
        const prev = owner.get(key);
        if (prev && prev !== a.code) clashes.push(`${key}: ${prev} vs ${a.code}`);
        owner.set(key, a.code);
      }
    }
    expect(clashes).toEqual([]);
  });

  it('gives every flagged entry a reason', () => {
    for (const a of ADDITIVES) {
      if (a.status === 'clear') continue;
      expect(a.concern && a.concern.length > 10).toBe(true);
    }
  });

  it('names a real axis in every dependsOn', () => {
    const axes = new Set(RULINGS.map((r) => r.axis));
    for (const a of ADDITIVES) {
      for (const axis of a.dependsOn ?? []) expect(axes.has(axis)).toBe(true);
    }
  });

  it('never marks a clear additive as depending on a scholarly position', () => {
    for (const a of expandClear(CLEAR_ROWS)) {
      expect(a.dependsOn).toBeUndefined();
      expect(a.status).toBe('clear');
    }
  });

  it('keeps fatty-acid and glycerol additives out of the clear list', () => {
    const clearCodes = new Set(CLEAR_ROWS.map(([c]) => c.toLowerCase()));
    for (const code of ['e471', 'e472', 'e422', 'e570', 'e572', 'e441', 'e120', 'e904', 'e473', 'e304']) {
      expect(clearCodes.has(code)).toBe(false);
    }
  });

  it('indexes every additive by code', () => {
    for (const a of ADDITIVES) expect(ADDITIVE_BY_CODE[a.code.toLowerCase()]).toBe(a);
  });

  it('carries a meaningful body of reference data', () => {
    expect(ADDITIVES.length).toBeGreaterThan(200);
    expect(FLAGGED_ADDITIVES.length).toBeGreaterThan(20);
    expect(NAMED_INGREDIENTS.length).toBeGreaterThan(15);
  });

  it('gives both positions and evidence for all three scholarly questions', () => {
    expect(RULINGS).toHaveLength(3);
    for (const r of RULINGS) {
      expect(r.positions).toHaveLength(2);
      expect(r.positions.map((p) => p.id).sort()).toEqual(['accept', 'avoid']);
      for (const p of r.positions) expect(p.held.length).toBeGreaterThan(0);
      expect(r.daleel.length).toBeGreaterThan(0);
      expect(RULING_BY_AXIS[r.axis]).toBe(r);
    }
  });

  it('states plainly that it is not a halal verdict', () => {
    expect(HALAL_DISCLAIMER).toMatch(/never tells you a product is halal/i);
  });
});
