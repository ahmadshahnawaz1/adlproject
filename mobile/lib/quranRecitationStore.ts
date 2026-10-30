/**
 * lib/quranRecitationStore.ts — native download/cache layer for Qurʾān audio.
 *
 * Wraps expo-file-system (SDK 54 `File`/`Directory` API). Each downloaded surah
 * is stored as a folder of per-āyah MP3s:
 *   `<documents>/quran-audio/<reciterId>/<surah>/<ayah>.mp3`
 * The player reads a local file when present and otherwise streams from the CDN.
 *
 * This module touches a native module and is therefore NOT imported by any
 * Jest-tested code; the pure catalog/URL logic lives in lib/quranRecitations.ts.
 */
import { Directory, File, Paths } from 'expo-file-system';
import { ayahAudioUrl } from './quranRecitations';

const DIR_NAME = 'quran-audio';

function rootDir(): Directory {
  return new Directory(Paths.document, DIR_NAME);
}

function reciterDir(reciterId: string): Directory {
  return new Directory(rootDir(), reciterId);
}

function surahDir(reciterId: string, surah: number): Directory {
  return new Directory(reciterDir(reciterId), String(surah));
}

function ayahFile(reciterId: string, surah: number, ayah: number): File {
  return new File(surahDir(reciterId, surah), `${ayah}.mp3`);
}

function ensureDir(dir: Directory): Directory {
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

/** Count the `.mp3` files in a surah folder (0 when absent). */
function countAyahFiles(reciterId: string, surah: number): number {
  const dir = surahDir(reciterId, surah);
  if (!dir.exists) return 0;
  return dir
    .list()
    .filter((entry): entry is File => entry instanceof File)
    .filter((f) => /\.mp3$/i.test(f.name)).length;
}

/** True once every āyah of the surah is present on disk. */
export function isSurahRecitationDownloaded(
  reciterId: string,
  surah: number,
  ayahCount: number,
): boolean {
  if (ayahCount <= 0) return false;
  return countAyahFiles(reciterId, surah) >= ayahCount;
}

/** Total bytes used by one downloaded surah. */
export function surahRecitationBytes(reciterId: string, surah: number): number {
  const dir = surahDir(reciterId, surah);
  if (!dir.exists) return 0;
  return dir
    .list()
    .filter((entry): entry is File => entry instanceof File)
    .reduce((sum, f) => sum + (f.size || 0), 0);
}

/** The local file URI for one āyah, or null when it is not cached. */
export function getAyahAudioPath(
  reciterId: string,
  surah: number,
  ayah: number,
): string | null {
  const file = ayahFile(reciterId, surah, ayah);
  return file.exists ? file.uri : null;
}

/** A downloaded surah folder, as discovered on disk. */
export interface DownloadedSurahAudio {
  reciterId: string;
  surah: number;
  ayahFiles: number;
  bytes: number;
}

/** Walk the cache and report every surah folder present, per reciter. */
export function listDownloadedRecitations(): DownloadedSurahAudio[] {
  const root = rootDir();
  if (!root.exists) return [];
  const out: DownloadedSurahAudio[] = [];
  for (const reciterEntry of root.list()) {
    if (!(reciterEntry instanceof Directory)) continue;
    const reciterId = reciterEntry.name;
    for (const surahEntry of reciterEntry.list()) {
      if (!(surahEntry instanceof Directory)) continue;
      const surah = Number(surahEntry.name);
      if (!Number.isInteger(surah)) continue;
      const files = surahEntry
        .list()
        .filter((entry): entry is File => entry instanceof File)
        .filter((f) => /\.mp3$/i.test(f.name));
      out.push({
        reciterId,
        surah,
        ayahFiles: files.length,
        bytes: files.reduce((sum, f) => sum + (f.size || 0), 0),
      });
    }
  }
  return out;
}

/**
 * Download an entire surah, āyah by āyah, reporting progress after each file.
 * Existing files are skipped so an interrupted download resumes cheaply. On any
 * failure the partial folder is removed and the error is rethrown, so a surah is
 * only ever reported as downloaded when it is genuinely complete.
 */
export async function downloadSurahRecitation(
  reciterId: string,
  surah: number,
  ayahCount: number,
  onProgress?: (done: number, total: number) => void,
): Promise<number> {
  ensureDir(surahDir(reciterId, surah));
  try {
    for (let ayah = 1; ayah <= ayahCount; ayah += 1) {
      const dest = ayahFile(reciterId, surah, ayah);
      if (!(dest.exists && dest.size > 0)) {
        const url = ayahAudioUrl(reciterId, surah, ayah);
        if (!url) throw new Error(`No audio URL for ${reciterId} ${surah}:${ayah}`);
        if (dest.exists) dest.delete();
        await File.downloadFileAsync(url, dest, { idempotent: true });
        if (!dest.exists || dest.size === 0) {
          if (dest.exists) dest.delete();
          throw new Error(`Empty audio download for ${surah}:${ayah}`);
        }
      }
      onProgress?.(ayah, ayahCount);
    }
  } catch (err) {
    deleteSurahRecitation(reciterId, surah);
    throw err instanceof Error ? err : new Error('Recitation download failed.');
  }
  return surahRecitationBytes(reciterId, surah);
}

/** Delete one downloaded surah folder. */
export function deleteSurahRecitation(reciterId: string, surah: number): void {
  const dir = surahDir(reciterId, surah);
  if (dir.exists) dir.delete();
}

/** Delete every downloaded surah for a reciter. */
export function deleteReciterRecitations(reciterId: string): void {
  const dir = reciterDir(reciterId);
  if (dir.exists) dir.delete();
}
