/**
 * Guards on the shipped locale tables.
 *
 * These run against the real content, so a table that drifts from the source —
 * a renamed duʿāʾ, or a translation that overwrites the Arabic — fails here
 * rather than on someone's phone.
 */
import { ALL_DUAS } from '../content/duas-library';
import { DUA_FIELDS, DUA_LOCALES } from '../content/duas-library/locales';
import { LOCALES } from '../i18n';
import {
  PROTECTED_FIELDS,
  coverage,
  loadTable,
  localize,
  orphanIds,
  protectedFieldsIn,
} from '../lib/contentI18n';

const CODES = Object.keys(DUA_LOCALES);

describe('duʿāʾ locale tables', () => {
  it('registers only locales the app actually ships', () => {
    const known = LOCALES.map((l) => l.code);
    for (const code of CODES) expect(known).toContain(code);
  });

  it.each(CODES)('%s loads', (code) => {
    expect(loadTable(DUA_LOCALES, code)).not.toBeNull();
  });

  it.each(CODES)('%s translates no protected field', (code) => {
    const table = loadTable(DUA_LOCALES, code)!;
    expect(protectedFieldsIn(table)).toEqual([]);
  });

  it.each(CODES)('%s references only duʿāʾ that exist', (code) => {
    const table = loadTable(DUA_LOCALES, code)!;
    expect(orphanIds(ALL_DUAS, table)).toEqual([]);
  });

  it.each(CODES)('%s leaves the Arabic and the citation untouched', (code) => {
    const table = loadTable(DUA_LOCALES, code);
    const localized = localize(ALL_DUAS, table, DUA_FIELDS);
    for (let i = 0; i < ALL_DUAS.length; i += 1) {
      expect(localized[i].arabic).toBe(ALL_DUAS[i].arabic);
      expect(localized[i].transliteration).toBe(ALL_DUAS[i].transliteration);
      expect(localized[i].daleel).toBe(ALL_DUAS[i].daleel);
      expect(localized[i].id).toBe(ALL_DUAS[i].id);
    }
  });

  it.each(CODES)('%s declares its own locale in its metadata', (code) => {
    expect(loadTable(DUA_LOCALES, code)!.meta.locale).toBe(code);
  });

  it.each(CODES)('%s marks every entry it has not had reviewed', (code) => {
    const table = loadTable(DUA_LOCALES, code)!;
    expect(['machine', 'human']).toContain(table.meta.provenance);
    for (const id of table.human ?? []) {
      expect(Object.keys(table.entries)).toContain(id);
    }
  });

  it('only names translatable fields', () => {
    for (const field of DUA_FIELDS) {
      expect(PROTECTED_FIELDS).not.toContain(field);
    }
  });

  it('reports partial coverage without failing', () => {
    const table = loadTable(DUA_LOCALES, 'ar');
    const share = coverage(ALL_DUAS, table, DUA_FIELDS);
    expect(share).toBeGreaterThan(0);
    expect(share).toBeLessThanOrEqual(1);
  });

  it('falls back to English for a duʿāʾ the table has not reached', () => {
    const table = loadTable(DUA_LOCALES, 'ar')!;
    const untouched = ALL_DUAS.find((d) => !(d.id in table.entries));
    if (!untouched) return;
    const localized = localize(ALL_DUAS, table, DUA_FIELDS);
    const same = localized.find((d) => d.id === untouched.id)!;
    expect(same.title).toBe(untouched.title);
  });
});
