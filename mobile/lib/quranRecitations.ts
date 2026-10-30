/**
 * lib/quranRecitations.ts — the pure catalog and URL logic for Qurʾān audio.
 *
 * No React, storage, or filesystem here. It names a curated set of reciters,
 * each verified against the Al-Quran Cloud / Islamic Network CDN at a known
 * bitrate, and builds the per-āyah audio URLs by the running muṣḥaf index
 * (1..6236). The native download/cache layer lives in lib/quranRecitationStore.ts
 * and playback in hooks/useRecitationPlayer.ts — neither is imported here, so
 * this module stays test-safe.
 */
import { globalAyahNumber } from './quran';
import { formatBytes } from './quranEditions';

export { formatBytes };

/** Per-āyah audio CDN: `<base>/<bitrate>/<reciterId>/<globalAyah>.mp3`. */
export const RECITATION_CDN_BASE = 'https://cdn.islamic.network/quran/audio';

/** A measured (murattal) reciter available for streaming and download. */
export interface Reciter {
  /** Al-Quran Cloud edition id, e.g. "ar.alafasy". */
  id: string;
  /** Latin display name. */
  name: string;
  /** Arabic display name. */
  arabicName: string;
  /** The bitrate at which this reciter is hosted (kbps) — part of the URL. */
  bitrate: number;
  /** A short style label, e.g. "Murattal". */
  style: string;
}

/**
 * A curated catalog of well-known reciters. Each id + bitrate pair was verified
 * to return audio/mpeg for the boundary āyahs (1, 8, 6236). Murattal (measured)
 * recitations throughout, suited to following along in the reader.
 */
export const RECITERS: readonly Reciter[] = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', arabicName: 'مشاري راشد العفاسي', bitrate: 128, style: 'Murattal' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', arabicName: 'محمود خليل الحصري', bitrate: 128, style: 'Murattal' },
  { id: 'ar.minshawi', name: 'Mohamed Siddiq El-Minshawi', arabicName: 'محمد صديق المنشاوي', bitrate: 128, style: 'Murattal' },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit Abdul Samad', arabicName: 'عبد الباسط عبد الصمد', bitrate: 64, style: 'Murattal' },
  { id: 'ar.abdurrahmaansudais', name: 'Abdurrahman As-Sudais', arabicName: 'عبد الرحمن السديس', bitrate: 64, style: 'Murattal' },
  { id: 'ar.shaatree', name: 'Abu Bakr Ash-Shaatree', arabicName: 'أبو بكر الشاطري', bitrate: 128, style: 'Murattal' },
  { id: 'ar.mahermuaiqly', name: 'Maher Al Muaiqly', arabicName: 'ماهر المعيقلي', bitrate: 128, style: 'Murattal' },
  { id: 'ar.hudhaify', name: 'Ali Al-Hudhaify', arabicName: 'علي الحذيفي', bitrate: 128, style: 'Murattal' },
  { id: 'ar.muhammadjibreel', name: 'Muhammad Jibreel', arabicName: 'محمد جبريل', bitrate: 128, style: 'Murattal' },
];

/** The default reciter — clear, widely loved, and 128 kbps. */
export const DEFAULT_RECITER_ID = 'ar.alafasy';

const BY_ID: Map<string, Reciter> = new Map(RECITERS.map((r) => [r.id, r]));

/** Look up a reciter by id. */
export function findReciter(id: string): Reciter | undefined {
  return BY_ID.get(id);
}

/** A known reciter for the id, falling back to the default when unknown. */
export function reciterOrDefault(id: string | null | undefined): Reciter {
  return (id ? BY_ID.get(id) : undefined) ?? BY_ID.get(DEFAULT_RECITER_ID)!;
}

/**
 * The streaming URL for one āyah by its running muṣḥaf index (1..6236).
 * Returns an empty string for an unknown reciter or out-of-range index.
 */
export function ayahAudioUrlByGlobal(reciterId: string, globalAyah: number): string {
  const reciter = BY_ID.get(reciterId);
  if (!reciter) return '';
  if (!Number.isInteger(globalAyah) || globalAyah < 1 || globalAyah > 6236) return '';
  return `${RECITATION_CDN_BASE}/${reciter.bitrate}/${reciter.id}/${globalAyah}.mp3`;
}

/**
 * The streaming URL for a surah:ayah position. Returns an empty string when the
 * reciter is unknown or the reference is out of range.
 */
export function ayahAudioUrl(reciterId: string, surah: number, ayah: number): string {
  const global = globalAyahNumber(surah, ayah);
  if (global === 0) return '';
  return ayahAudioUrlByGlobal(reciterId, global);
}

/**
 * Every āyah URL for a whole surah, in order (length === ayahCount). Returns an
 * empty array for an unknown reciter.
 */
export function surahAudioUrls(
  reciterId: string,
  surah: number,
  ayahCount: number,
): string[] {
  if (!BY_ID.has(reciterId)) return [];
  const urls: string[] = [];
  for (let ayah = 1; ayah <= ayahCount; ayah += 1) {
    urls.push(ayahAudioUrl(reciterId, surah, ayah));
  }
  return urls;
}

/**
 * A rough estimate of a surah's download size in bytes, for a confirmation
 * prompt before downloading. Assumes ~6 s per āyah at the reciter's bitrate
 * (bitrate is kbps → bytes/s = bitrate * 1000 / 8).
 */
export function estimateSurahBytes(reciterId: string, ayahCount: number): number {
  const reciter = BY_ID.get(reciterId);
  if (!reciter || ayahCount <= 0) return 0;
  const bytesPerSecond = (reciter.bitrate * 1000) / 8;
  const secondsPerAyah = 6;
  return Math.round(bytesPerSecond * secondsPerAyah * ayahCount);
}
