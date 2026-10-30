/**
 * Content localization.
 *
 * The UI catalogue in i18n/ covers labels; this covers the body of the app —
 * duʿāʾ meanings, Sīrah, fiqh explanations. English is the source of truth and
 * every field falls back to it independently, so a half-translated module is
 * usable rather than broken.
 *
 * Provenance travels with the translation: a machine draft must stay
 * distinguishable from a reading a person has checked.
 */
export type Provenance = 'human' | 'machine';

export type TranslatedValue = string | string[];

export type LocaleTable = {
  meta: {
    locale: string;
    /** How the strings in this table were produced. */
    provenance: Provenance;
    generatedAt?: string;
    model?: string;
  };
  /** Entry ids a person has read and corrected. Never overwritten by the script. */
  human?: string[];
  entries: Record<string, Record<string, TranslatedValue>>;
};

/**
 * Fields that carry the original rather than a rendering of it. Translating
 * any of these would corrupt the source, so the pipeline must never touch them.
 */
export const PROTECTED_FIELDS = [
  'id',
  'arabic',
  'transliteration',
  'source',
  'reference',
  'narrator',
  'grade',
  'code',
  'daleel',
] as const;

const isBlank = (v: TranslatedValue): boolean =>
  typeof v === 'string' ? v.trim().length === 0 : v.length === 0;

/** Whether a table holds a usable translation for one field of one entry. */
export function hasTranslation(
  table: LocaleTable | null | undefined,
  id: string,
  field: string,
): boolean {
  const value = table?.entries?.[id]?.[field];
  return value !== undefined && !isBlank(value);
}

/**
 * Return `entry` with the named fields replaced by their translations.
 * Fields with no usable translation keep their English value.
 */
export function localizeEntry<T extends { id: string }>(
  entry: T,
  table: LocaleTable | null | undefined,
  fields: readonly (keyof T & string)[],
): T {
  const row = table?.entries?.[entry.id];
  if (!row) return entry;

  let changed = false;
  const out = { ...entry };
  for (const field of fields) {
    if ((PROTECTED_FIELDS as readonly string[]).includes(field)) continue;
    const value = row[field];
    if (value === undefined || isBlank(value)) continue;
    // Only substitute like for like — an array field needs an array.
    if (Array.isArray(entry[field]) !== Array.isArray(value)) continue;
    (out as Record<string, unknown>)[field] = value;
    changed = true;
  }
  return changed ? out : entry;
}

export function localize<T extends { id: string }>(
  entries: readonly T[],
  table: LocaleTable | null | undefined,
  fields: readonly (keyof T & string)[],
): T[] {
  if (!table) return entries as T[];
  return entries.map((e) => localizeEntry(e, table, fields));
}

/** 'human' when someone has checked this entry, 'machine' when it is a draft. */
export function provenanceOf(
  table: LocaleTable | null | undefined,
  id: string,
): Provenance | null {
  if (!table?.entries?.[id]) return null;
  return table.human?.includes(id) ? 'human' : table.meta.provenance;
}

/** True when any entry on screen is an unreviewed machine draft. */
export function hasMachineDraft(
  table: LocaleTable | null | undefined,
  ids: readonly string[],
): boolean {
  if (!table || table.meta.provenance === 'human') return false;
  return ids.some((id) => provenanceOf(table, id) === 'machine');
}

/** Share of the requested fields that the table actually translates, 0–1. */
export function coverage<T extends { id: string }>(
  entries: readonly T[],
  table: LocaleTable | null | undefined,
  fields: readonly (keyof T & string)[],
): number {
  const total = entries.length * fields.length;
  if (total === 0) return 1;
  if (!table) return 0;
  let present = 0;
  for (const entry of entries) {
    for (const field of fields) {
      if (hasTranslation(table, entry.id, field)) present += 1;
    }
  }
  return present / total;
}

/** Protected fields a table wrongly contains — must always be empty. */
export function protectedFieldsIn(table: LocaleTable): string[] {
  const found = new Set<string>();
  for (const row of Object.values(table.entries)) {
    for (const field of Object.keys(row)) {
      if ((PROTECTED_FIELDS as readonly string[]).includes(field)) found.add(field);
    }
  }
  return [...found].sort();
}

/** Entry ids in the table that no longer exist in the content. */
export function orphanIds<T extends { id: string }>(
  entries: readonly T[],
  table: LocaleTable,
): string[] {
  const known = new Set(entries.map((e) => e.id));
  return Object.keys(table.entries)
    .filter((id) => !known.has(id))
    .sort();
}

/** A lazily-required table per locale, mirroring the Qurʾān SURAH_FILES pattern. */
export type LocaleLoaders = Record<string, () => LocaleTable>;

export function loadTable(loaders: LocaleLoaders, code: string): LocaleTable | null {
  const load = loaders[code];
  if (!load) return null;
  try {
    return load();
  } catch {
    // A missing or malformed table must never break the screen — fall back to English.
    return null;
  }
}
