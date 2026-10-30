/**
 * lib/quranEditions.ts — pure catalog logic for downloadable Qurʾān editions.
 *
 * No React, storage, or filesystem here. This layer groups, filters, and
 * searches the 490+ edition catalog and validates/indexes the raw payload
 * shape served by the fawazahmed0 Qurʾān CDN. The native download/cache layer
 * lives in lib/quranEditionStore.ts.
 */
import { EDITION_CATALOG, TOTAL_AYAHS } from '../content/quran';
import type { DownloadableEdition, DownloadableKind } from '../content/quran/types';
import { normalize } from './quran';

/** jsDelivr mirror of fawazahmed0/quran-api editions (one JSON per edition). */
export const EDITION_CDN_BASE =
  'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions';

/** Remote URL for a single edition's minified, full-text payload. */
export function editionUrl(id: string): string {
  return `${EDITION_CDN_BASE}/${encodeURIComponent(id)}.min.json`;
}

/** One verse row inside a downloaded edition payload. */
export interface RawEditionVerse {
  chapter: number;
  verse: number;
  text: string;
}

/** The on-disk shape of a downloaded edition: `{ quran: RawEditionVerse[] }`. */
export interface RawEditionPayload {
  quran: RawEditionVerse[];
}

/** A fully parsed edition: verse text indexed by `"surah:ayah"`. */
export type EditionIndex = Record<string, string>;

/** A catalog slice grouped under one language heading. */
export interface EditionLanguageGroup {
  language: string;
  editions: DownloadableEdition[];
}

/** Stable `"surah:ayah"` key used across the reader and edition indexes. */
export function verseKey(surah: number, ayah: number): string {
  return `${surah}:${ayah}`;
}

const BY_ID: Map<string, DownloadableEdition> = new Map(
  EDITION_CATALOG.map((e) => [e.id, e]),
);

/** Look up a catalog edition by its id. */
export function findEdition(id: string): DownloadableEdition | undefined {
  return BY_ID.get(id);
}

/** Every distinct language in the catalog, alphabetically sorted. */
export const EDITION_LANGUAGES: readonly string[] = Array.from(
  new Set(EDITION_CATALOG.map((e) => e.language)),
).sort((a, b) => a.localeCompare(b));

/** Filter a list of editions to a single kind (translation / transliteration). */
export function filterEditionsByKind(
  editions: readonly DownloadableEdition[],
  kind: DownloadableKind | 'all',
): DownloadableEdition[] {
  if (kind === 'all') return [...editions];
  return editions.filter((e) => e.kind === kind);
}

/**
 * Fuzzy-search editions by name, language, or id. Empty query returns the
 * full list unchanged. Matching is diacritic- and case-insensitive.
 */
export function searchEditions(
  editions: readonly DownloadableEdition[],
  query: string,
): DownloadableEdition[] {
  const q = normalize(query);
  if (!q) return [...editions];
  return editions.filter((e) => {
    const haystack = normalize(`${e.name} ${e.language} ${e.id}`);
    return haystack.includes(q);
  });
}

/**
 * Group editions by language, languages sorted alphabetically and editions
 * within each group sorted by name. Honours the input ordering otherwise.
 */
export function groupEditionsByLanguage(
  editions: readonly DownloadableEdition[],
): EditionLanguageGroup[] {
  const byLang = new Map<string, DownloadableEdition[]>();
  for (const ed of editions) {
    const bucket = byLang.get(ed.language);
    if (bucket) bucket.push(ed);
    else byLang.set(ed.language, [ed]);
  }
  return Array.from(byLang.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([language, eds]) => ({
      language,
      editions: eds.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

/**
 * Validate and index a freshly downloaded edition payload. Throws when the
 * shape is wrong or the verse coverage is implausible (a guard against
 * truncated downloads). Returns a `"surah:ayah" → text` index.
 */
export function parseEditionPayload(raw: unknown): EditionIndex {
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as RawEditionPayload).quran)) {
    throw new Error('Edition payload is missing its "quran" array.');
  }
  const rows = (raw as RawEditionPayload).quran;
  if (rows.length < TOTAL_AYAHS) {
    throw new Error(
      `Edition payload is incomplete: ${rows.length}/${TOTAL_AYAHS} verses.`,
    );
  }
  const index: EditionIndex = {};
  for (const row of rows) {
    if (
      typeof row.chapter !== 'number' ||
      typeof row.verse !== 'number' ||
      typeof row.text !== 'string'
    ) {
      continue;
    }
    index[verseKey(row.chapter, row.verse)] = row.text;
  }
  return index;
}

/** Human-readable byte size, e.g. `1.1 MB`. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${Math.max(1, Math.round(kb))} KB`;
}
