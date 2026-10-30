/**
 * lib/hadithStore — native download/cache layer for hadith collections.
 *
 * Wraps expo-file-system (SDK 54 `File`/`Directory`). Downloading a collection
 * fetches its Arabic and English editions from the CDN, merges + grades them
 * (via lib/hadithEditions), and writes one `<documents>/hadith/<id>.json` of our
 * `Hadith[]` shape. Parsed lists are memo-cached per session.
 *
 * This module touches native + network APIs and is NOT imported by Jest-tested
 * code; the pure logic lives in lib/hadithEditions.
 */
import { Directory, File, Paths } from 'expo-file-system';
import { collectionById, type GradeRuling, type Hadith } from '../content/hadith';
import { editionUrl, mergeEditions, parseHadithEdition } from './hadithEditions';

const DIR_NAME = 'hadith';

function hadithDir(): Directory {
  return new Directory(Paths.document, DIR_NAME);
}

function collectionFile(id: string): File {
  return new File(hadithDir(), `${id}.json`);
}

function ensureDir(): Directory {
  const dir = hadithDir();
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

const listCache = new Map<string, Hadith[]>();

/** True when the collection's merged file is present on disk. */
export function isCollectionDownloaded(id: string): boolean {
  return collectionFile(id).exists;
}

/** Size on disk in bytes for one collection (0 when absent). */
export function collectionFileSize(id: string): number {
  const file = collectionFile(id);
  return file.exists ? file.size : 0;
}

/** The ids of every collection currently cached on disk. */
export function listDownloadedCollectionIds(): string[] {
  const dir = hadithDir();
  if (!dir.exists) return [];
  return dir
    .list()
    .filter((entry): entry is File => entry instanceof File)
    .map((file) => file.name.replace(/\.json$/i, ''))
    .filter((name) => name.length > 0);
}

/** Total bytes used by all downloaded collections. */
export function totalHadithBytes(): number {
  const dir = hadithDir();
  if (!dir.exists) return 0;
  return dir
    .list()
    .filter((entry): entry is File => entry instanceof File)
    .reduce((sum, file) => sum + (file.size || 0), 0);
}

async function fetchEdition(slug: string) {
  const res = await fetch(editionUrl(slug));
  if (!res.ok) throw new Error(`Hadith edition request failed (${res.status})`);
  return parseHadithEdition(await res.json());
}

/**
 * Download a collection: fetch its Arabic + English editions, merge and grade
 * them, then write the result to disk. Throws (leaving no partial file) on any
 * network or parse failure, so a corrupt download is never trusted.
 */
export async function downloadCollection(id: string): Promise<number> {
  const collection = collectionById(id);
  if (!collection || !collection.editionArabic || !collection.editionEnglish) {
    throw new Error('This collection is not downloadable.');
  }
  ensureDir();
  const dest = collectionFile(id);
  const fallback: GradeRuling = collection.authenticity === 'mixed' ? 'daif' : collection.authenticity;

  try {
    const [arabic, english] = await Promise.all([
      fetchEdition(collection.editionArabic),
      fetchEdition(collection.editionEnglish),
    ]);
    const merged = mergeEditions(id, fallback, arabic, english);
    if (merged.length === 0) throw new Error('Merged collection was empty.');
    if (dest.exists) dest.delete();
    dest.create();
    dest.write(JSON.stringify(merged));
    listCache.set(id, merged);
  } catch (err) {
    if (dest.exists) dest.delete();
    throw err instanceof Error ? err : new Error('The collection could not be downloaded.');
  }
  return dest.exists ? dest.size : 0;
}

/** Delete one collection from disk and drop its cache. */
export function deleteCollection(id: string): void {
  const file = collectionFile(id);
  if (file.exists) file.delete();
  listCache.delete(id);
}

/** Read a downloaded collection's narrations, caching the parse. Null if absent. */
export async function getCollectionHadith(id: string): Promise<Hadith[] | null> {
  const cached = listCache.get(id);
  if (cached) return cached;
  const file = collectionFile(id);
  if (!file.exists) return null;
  try {
    const list = JSON.parse(await file.text()) as Hadith[];
    listCache.set(id, list);
    return list;
  } catch {
    return null;
  }
}

/** Drop every in-memory parsed list (frees memory; files stay on disk). */
export function clearHadithCache(): void {
  listCache.clear();
}
