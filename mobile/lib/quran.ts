/**
 * lib/quran.ts — pure lookup, search, and reference helpers for the muṣḥaf.
 *
 * No React or storage here: just data over the bundled SURAHS / JUZ tables.
 */
import { SURAHS, JUZ } from '../content/quran';
import type { SurahMeta, JuzMark, AyahRef } from '../content/quran/types';

const BY_NUMBER: Map<number, SurahMeta> = new Map(
  SURAHS.map((s) => [s.number, s]),
);

/** Look up a surah by its 1–114 number. */
export function getSurah(n: number): SurahMeta | undefined {
  return BY_NUMBER.get(n);
}

/** Look up a juzʾ start marker by its 1–30 number. */
export function getJuz(n: number): JuzMark | undefined {
  return JUZ.find((j) => j.juz === n);
}

const ARABIC_DIGITS = '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669';

/** Convert Western digits to Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩). */
export function toArabicDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)]);
}

/**
 * Fold text for accent- and diacritic-insensitive matching: lowercases,
 * strips Latin and Arabic diacritics, removes hamza/ʿayn marks and hyphens,
 * and unifies common Arabic letter variants.
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF]/g, '')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/[\u2018\u2019'\u02bc\u02be\u02bf`\u2032-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Search the 114 surahs. A bare in-range number returns that surah; otherwise
 * matches the transliterated name, English meaning, or Arabic name.
 */
export function searchSurahs(query: string): SurahMeta[] {
  const q = query.trim();
  if (!q) return [...SURAHS];

  const num = Number(q);
  if (Number.isInteger(num) && num >= 1 && num <= 114) {
    const exact = BY_NUMBER.get(num);
    return exact ? [exact] : [];
  }

  const nq = normalize(q);
  if (!nq) return [...SURAHS];
  return SURAHS.filter(
    (s) =>
      normalize(s.name).includes(nq) ||
      normalize(s.meaning).includes(nq) ||
      normalize(s.arabicName).includes(nq),
  );
}

/**
 * Parse a textual ayah reference such as "2:255", "2.255", or "2 255".
 * Returns null when malformed or out of range.
 */
export function parseReference(input: string): AyahRef | null {
  const m = input.trim().match(/^(\d{1,3})\s*[:.\s]\s*(\d{1,3})$/);
  if (!m) return null;
  const surah = Number(m[1]);
  const ayah = Number(m[2]);
  const meta = getSurah(surah);
  if (!meta || ayah < 1 || ayah > meta.ayahCount) return null;
  return { surah, ayah };
}

/** Which juzʾ (1–30) contains the given surah:ayah position. */
export function juzOf(surah: number, ayah: number): number {
  let result = 1;
  for (const j of JUZ) {
    if (j.surah < surah || (j.surah === surah && j.ayah <= ayah)) {
      result = j.juz;
    } else {
      break;
    }
  }
  return result;
}

/** Stable string key for an ayah, e.g. "2:255". */
export function ayahKey(surah: number, ayah: number): string {
  return `${surah}:${ayah}`;
}

/** A human-friendly reference, e.g. "Al-Baqarah 2:255" or "Al-Baqarah". */
export function formatRef(surah: number, ayah?: number): string {
  const meta = getSurah(surah);
  const name = meta ? meta.name : `Surah ${surah}`;
  return ayah != null ? `${name} ${surah}:${ayah}` : name;
}

/**
 * Prefix sums of ayah counts: AYAHS_BEFORE[n] is the number of ayahs in all
 * surahs before surah n (1-based), so the global index of surah n's first ayah
 * is AYAHS_BEFORE[n] + 1. Index 0 is unused.
 */
const AYAHS_BEFORE: number[] = (() => {
  const acc = new Array(116).fill(0);
  for (let n = 2; n <= 115; n += 1) {
    acc[n] = acc[n - 1] + (BY_NUMBER.get(n - 1)?.ayahCount ?? 0);
  }
  return acc;
})();

/**
 * The running ayah index across the whole muṣḥaf, 1..6236 — the numbering used
 * by per-ayah recitation CDNs. Al-Fātiḥah 1:1 → 1, al-Baqarah 2:1 → 8, and the
 * final ayah an-Nās 114:6 → 6236. Returns 0 for an out-of-range reference.
 */
export function globalAyahNumber(surah: number, ayah: number): number {
  const meta = getSurah(surah);
  if (!meta || ayah < 1 || ayah > meta.ayahCount) return 0;
  return AYAHS_BEFORE[surah] + ayah;
}

