/**
 * lib/quranEditionStore.ts — native download/cache layer for Qurʾān editions.
 *
 * Wraps expo-file-system (SDK 54 `File`/`Directory` API). Each downloaded
 * edition is stored verbatim as `<documents>/quran-editions/<id>.json` in the
 * CDN's `{ quran: [...] }` shape. Parsed verse indexes are memo-cached so the
 * reader pays the JSON.parse cost only once per edition per session.
 *
 * This module touches a native module and is therefore NOT imported by any
 * Jest-tested code; the pure logic lives in lib/quranEditions.ts.
 */
import { Directory, File, Paths } from 'expo-file-system';
import {
  editionUrl,
  parseEditionPayload,
  type EditionIndex,
} from './quranEditions';

const DIR_NAME = 'quran-editions';

function editionsDir(): Directory {
  return new Directory(Paths.document, DIR_NAME);
}

function editionFile(id: string): File {
  return new File(editionsDir(), `${id}.json`);
}

/** Create the editions directory if it does not already exist. */
function ensureDir(): Directory {
  const dir = editionsDir();
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

const indexCache = new Map<string, EditionIndex>();

/** True when the edition's JSON is present on disk. */
export function isEditionDownloaded(id: string): boolean {
  return editionFile(id).exists;
}

/** Size on disk in bytes for one edition (0 when absent). */
export function editionFileSize(id: string): number {
  const file = editionFile(id);
  return file.exists ? file.size : 0;
}

/** The ids of every edition currently cached on disk. */
export function listDownloadedEditionIds(): string[] {
  const dir = editionsDir();
  if (!dir.exists) return [];
  return dir
    .list()
    .filter((entry): entry is File => entry instanceof File)
    .map((file) => file.name.replace(/\.json$/i, ''))
    .filter((name) => name.length > 0);
}

/** Total bytes used by all downloaded editions. */
export function totalEditionBytes(): number {
  const dir = editionsDir();
  if (!dir.exists) return 0;
  return dir
    .list()
    .filter((entry): entry is File => entry instanceof File)
    .reduce((sum, file) => sum + (file.size || 0), 0);
}

/**
 * Download one edition to disk, overwriting any previous copy. The body is
 * streamed straight to the file by the native layer, then validated by a
 * single parse so a corrupt/truncated download is caught before it is trusted.
 */
export async function downloadEdition(id: string): Promise<number> {
  ensureDir();
  const dest = editionFile(id);
  if (dest.exists) dest.delete();
  await File.downloadFileAsync(editionUrl(id), dest, { idempotent: true });
  // Validate immediately; throws (and removes the file) on a bad payload.
  try {
    const raw = JSON.parse(await dest.text());
    const index = parseEditionPayload(raw);
    indexCache.set(id, index);
  } catch (err) {
    if (dest.exists) dest.delete();
    throw err instanceof Error
      ? err
      : new Error('Downloaded edition could not be parsed.');
  }
  return dest.exists ? dest.size : 0;
}

/** Delete one edition from disk and drop its parsed cache. */
export function deleteEdition(id: string): void {
  const file = editionFile(id);
  if (file.exists) file.delete();
  indexCache.delete(id);
}

/**
 * Read + parse one downloaded edition into a `"surah:ayah" → text` index,
 * caching the result. Returns null when the edition is not on disk.
 */
export async function getEditionIndex(
  id: string,
): Promise<EditionIndex | null> {
  const cached = indexCache.get(id);
  if (cached) return cached;
  const file = editionFile(id);
  if (!file.exists) return null;
  const raw = JSON.parse(await file.text());
  const index = parseEditionPayload(raw);
  indexCache.set(id, index);
  return index;
}

/** Drop every in-memory parsed index (frees memory; files stay on disk). */
export function clearEditionIndexCache(): void {
  indexCache.clear();
}
