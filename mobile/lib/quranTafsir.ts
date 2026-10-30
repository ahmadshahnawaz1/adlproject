/**
 * lib/quranTafsir.ts — pure helpers for per-ayah tafsīr from the spa5k API.
 *
 * Tafsīr is fetched one ayah at a time (each commentary spans far too much
 * text to bundle) and the raw payload often carries light HTML. This layer
 * builds request URLs, cleans the HTML into readable plain text, and performs
 * the network fetch. The offline file cache lives in lib/quranTafsirStore.ts.
 */

/** jsDelivr mirror of spa5k/tafsir_api (one JSON per surah:ayah:edition). */
export const TAFSIR_CDN_BASE =
  'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir';

/** The raw per-ayah tafsīr payload shape. */
export interface RawTafsir {
  text: string;
  ayah: number;
  surah: number;
}

/** Remote URL for one ayah's tafsīr in a given edition. */
export function tafsirUrl(slug: string, surah: number, ayah: number): string {
  return `${TAFSIR_CDN_BASE}/${encodeURIComponent(slug)}/${surah}/${ayah}.json`;
}

const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&lsquo;': '‘',
  '&rsquo;': '’',
  '&mdash;': '—',
  '&ndash;': '–',
  '&hellip;': '…',
};

/**
 * Turn the lightly-marked-up tafsīr HTML into clean reading text: block tags
 * become paragraph breaks, all other tags are stripped, common entities are
 * decoded, and runaway whitespace is collapsed.
 */
export function stripTafsirHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/\r\n?/g, '\n')
    .replace(/<\s*(br|hr)\s*\/?\s*>/gi, '\n')
    .replace(/<\/\s*(p|div|h[1-6]|li|blockquote|tr)\s*>/gi, '\n\n')
    .replace(/<\s*li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? '')
    .replace(/[ \t\f\v\u00a0]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Fetch and clean one ayah's tafsīr. Throws on a non-OK response or a payload
 * without text so callers can surface a retry. Network only — caching is the
 * store's job.
 */
export async function fetchTafsirText(
  slug: string,
  surah: number,
  ayah: number,
): Promise<string> {
  const res = await fetch(tafsirUrl(slug, surah, ayah));
  if (!res.ok) {
    throw new Error(`Tafsīr request failed (${res.status}).`);
  }
  const raw = (await res.json()) as RawTafsir;
  if (!raw || typeof raw.text !== 'string') {
    throw new Error('Tafsīr payload is missing its text.');
  }
  return stripTafsirHtml(raw.text);
}
