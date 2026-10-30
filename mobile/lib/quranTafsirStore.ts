/**
 * lib/quranTafsirStore.ts — offline file cache for per-ayah tafsīr.
 *
 * Wraps lib/quranTafsir's network fetch with an on-disk cache under
 * `<documents>/quran-tafsir/<slug>/<surah>_<ayah>.txt` plus a small in-memory
 * memo. Once an ayah's tafsīr has been read online it stays available offline.
 *
 * Native module (expo-file-system); never imported by Jest-tested code.
 */
import { Directory, File, Paths } from 'expo-file-system';
import { fetchTafsirText } from './quranTafsir';

const DIR_NAME = 'quran-tafsir';

function tafsirDir(slug: string): Directory {
  return new Directory(Paths.document, DIR_NAME, slug);
}

function tafsirFile(slug: string, surah: number, ayah: number): File {
  return new File(tafsirDir(slug), `${surah}_${ayah}.txt`);
}

const memo = new Map<string, string>();

function memoKey(slug: string, surah: number, ayah: number): string {
  return `${slug}/${surah}/${ayah}`;
}

/** True when this ayah's tafsīr is already cached on disk. */
export function isTafsirCached(
  slug: string,
  surah: number,
  ayah: number,
): boolean {
  return tafsirFile(slug, surah, ayah).exists;
}

/**
 * Resolve one ayah's tafsīr text, preferring the in-memory memo, then the disk
 * cache, then the network (which is then written through to disk). Cleaned
 * plain text is returned ready to render.
 */
export async function getTafsirText(
  slug: string,
  surah: number,
  ayah: number,
): Promise<string> {
  const key = memoKey(slug, surah, ayah);
  const cached = memo.get(key);
  if (cached !== undefined) return cached;

  const file = tafsirFile(slug, surah, ayah);
  if (file.exists) {
    try {
      const text = await file.text();
      memo.set(key, text);
      return text;
    } catch {
      // Fall through to a fresh fetch if the cache is unreadable.
    }
  }

  const text = await fetchTafsirText(slug, surah, ayah);
  memo.set(key, text);
  try {
    const dir = tafsirDir(slug);
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
    if (file.exists) file.delete();
    file.write(text);
  } catch {
    // A failed cache write is non-fatal; the text is still returned.
  }
  return text;
}

/** Remove every cached tafsīr file (frees storage). */
export function clearTafsirCache(): void {
  memo.clear();
  const root = new Directory(Paths.document, DIR_NAME);
  if (root.exists) root.delete();
}
