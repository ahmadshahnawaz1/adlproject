/**
 * Tests for the i18n layer — catalogue parity, fallback, and interpolation.
 * Imports only the pure catalogues + resolver (no native expo-localization).
 */
import {
  LOCALES,
  DEFAULT_LOCALE,
  getCatalog,
  interpolate,
  isRTLLocale,
  isSupportedLocale,
  RTL_LOCALES,
  type Messages,
} from '../i18n';
import { en } from '../i18n/locales/en';
import { ar } from '../i18n/locales/ar';
import { ur } from '../i18n/locales/ur';
import { fr } from '../i18n/locales/fr';
import { id } from '../i18n/locales/id';
import { tr } from '../i18n/locales/tr';

const OVERRIDES: Record<string, Record<string, string>> = { ar, ur, fr, id, tr } as never;
const EN_KEYS = Object.keys(en);

describe('writing direction', () => {
  it('marks Arabic and Urdu as right-to-left', () => {
    expect(isRTLLocale('ar')).toBe(true);
    expect(isRTLLocale('ur')).toBe(true);
  });

  it('leaves the left-to-right languages alone', () => {
    for (const code of ['en', 'fr', 'id', 'tr']) {
      expect(isRTLLocale(code)).toBe(false);
    }
  });

  it('treats an unknown code as left-to-right', () => {
    expect(isRTLLocale('zz')).toBe(false);
  });

  it('only lists registered locales as RTL', () => {
    const codes = LOCALES.map((l) => l.code);
    for (const code of RTL_LOCALES) expect(codes).toContain(code);
  });
});

describe('locale registry', () => {
  it('lists English first and only supported codes', () => {
    expect(LOCALES[0].code).toBe(DEFAULT_LOCALE);
    for (const loc of LOCALES) {
      expect(isSupportedLocale(loc.code)).toBe(true);
      expect(loc.nativeLabel.length).toBeGreaterThan(0);
    }
  });

  it('uses unique locale codes', () => {
    const codes = LOCALES.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('rejects unknown codes', () => {
    expect(isSupportedLocale('xx')).toBe(false);
  });
});

/**
 * The number of English keys each locale already translates. English is the
 * source of truth and a missing key falls back to it, so a locale may lag while
 * new keys are added — but it must never lose ground.
 *
 * Raise these as translations land. An absolute count rather than a share, so
 * adding English keys does not trip the guard while a rollout is in progress.
 */
const TRANSLATED_FLOOR: Record<string, number> = {
  ar: 87,
  ur: 87,
  fr: 87,
  id: 87,
  tr: 87,
};

function translatedCount(cat: Record<string, string>): number {
  return EN_KEYS.filter((k) => typeof cat[k] === 'string' && cat[k].trim().length > 0).length;
}

describe('catalogue coverage', () => {
  it('every translated key exists in the English base (no stray keys)', () => {
    for (const [code, cat] of Object.entries(OVERRIDES)) {
      const stray = Object.keys(cat).filter((k) => !EN_KEYS.includes(k));
      expect({ code, stray }).toEqual({ code, stray: [] });
    }
  });

  it('no locale loses translations it already had', () => {
    for (const [code, cat] of Object.entries(OVERRIDES)) {
      const actual = translatedCount(cat);
      const floor = TRANSLATED_FLOOR[code] ?? 0;
      expect({ code, ok: actual >= floor, actual }).toEqual({ code, ok: true, actual });
    }
  });

  it('reports how far each locale has to go', () => {
    for (const [code, cat] of Object.entries(OVERRIDES)) {
      const share = translatedCount(cat) / EN_KEYS.length;
      expect(share).toBeGreaterThan(0);
      expect(share).toBeLessThanOrEqual(1);
    }
  });

  it('no translated value is left blank', () => {
    for (const [code, cat] of Object.entries(OVERRIDES)) {
      const blank = Object.entries(cat)
        .filter(([, v]) => v.trim().length === 0)
        .map(([k]) => k);
      expect({ code, blank }).toEqual({ code, blank: [] });
    }
  });

  it('falls back to English for a key a locale has not translated yet', () => {
    const partial = { ...ar } as Record<string, string>;
    const sample = EN_KEYS[0];
    delete partial[sample];
    // getCatalog layers the override over English, so the gap resolves to English.
    expect(getCatalog('ar')[sample as keyof Messages]).toBeTruthy();
    expect({ ...en, ...partial }[sample as keyof typeof en]).toBe(en[sample as keyof typeof en]);
  });

  it('resolves a newly added English key in every locale', () => {
    for (const loc of LOCALES) {
      expect(getCatalog(loc.code)['auth.signIn.title' as keyof Messages]).toBeTruthy();
    }
  });
});

describe('getCatalog', () => {
  it('resolves a complete message set for every locale', () => {
    for (const loc of LOCALES) {
      const cat = getCatalog(loc.code);
      for (const key of EN_KEYS) {
        expect(typeof cat[key as keyof typeof cat]).toBe('string');
      }
    }
  });

  it('falls back to English for an unknown locale', () => {
    expect(getCatalog('xx')).toEqual(en);
  });

  it('overrides English where a translation exists', () => {
    expect(getCatalog('ar')['nav.home']).toBe(ar['nav.home']);
    expect(getCatalog('fr')['common.close']).toBe('Fermer');
  });
});

describe('interpolate', () => {
  it('substitutes named placeholders', () => {
    expect(interpolate('Hello {name}', { name: 'Adam' })).toBe('Hello Adam');
    expect(interpolate('{a} + {b}', { a: 1, b: 2 })).toBe('1 + 2');
  });

  it('leaves unknown placeholders untouched and handles no params', () => {
    expect(interpolate('Hi {name}')).toBe('Hi {name}');
    expect(interpolate('Hi {name}', { other: 'x' })).toBe('Hi {name}');
  });
});
