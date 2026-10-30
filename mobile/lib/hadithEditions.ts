/**
 * lib/hadithEditions — the pure CDN layer for downloadable collections.
 *
 * Builds URLs for the keyless, public hadith-api (fawazahmed0) on jsDelivr,
 * parses and validates an edition payload, maps its free-text gradings onto our
 * `GradeRuling`, and merges an Arabic + English edition into our `Hadith`
 * shape. No I/O here — the fetch/disk work lives in lib/hadithStore — so this is
 * fully unit-tested.
 */
import type { Grade, GradeRuling, Hadith } from '../content/hadith';

/** The public, keyless CDN base (same host family as the Qurʾān editions). */
export const HADITH_CDN_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

/** The download URL for one edition slug, e.g. "eng-bukhari". */
export function editionUrl(slug: string): string {
  return `${HADITH_CDN_BASE}/${slug}.min.json`;
}

/** One narration as it arrives from the CDN. */
export type RawHadith = {
  number: number;
  arabicNumber?: number;
  text: string;
  grades: { name: string; grade: string }[];
  reference?: { book?: number; hadith?: number };
};

type RawEdition = {
  hadiths?: {
    hadithnumber?: number;
    arabicnumber?: number;
    text?: string;
    grades?: { name?: string; grade?: string }[];
    reference?: { book?: number; hadith?: number };
  }[];
};

/**
 * Parse and validate an edition payload into clean `RawHadith[]`. Throws if the
 * shape is wrong or empty, so a corrupt download is never silently accepted.
 */
export function parseHadithEdition(json: unknown): RawHadith[] {
  const hadiths = (json as RawEdition | null)?.hadiths;
  if (!Array.isArray(hadiths) || hadiths.length === 0) {
    throw new Error('Hadith edition is empty or malformed');
  }
  const out: RawHadith[] = [];
  for (const h of hadiths) {
    if (typeof h?.hadithnumber !== 'number' || typeof h?.text !== 'string') continue;
    out.push({
      number: h.hadithnumber,
      arabicNumber: typeof h.arabicnumber === 'number' ? h.arabicnumber : undefined,
      text: h.text,
      grades: Array.isArray(h.grades)
        ? h.grades
            .filter((g) => g && (g.name || g.grade))
            .map((g) => ({ name: g.name ?? '', grade: g.grade ?? '' }))
        : [],
      reference: h.reference,
    });
  }
  if (out.length === 0) throw new Error('Hadith edition contained no usable narrations');
  return out;
}

/** Map a free-text grading onto a ruling; `fallback` covers unrecognised text. */
export function gradeRulingFromText(text: string, fallback: GradeRuling): GradeRuling {
  const t = text.toLowerCase();
  if (/(fabricat|mawdu|موضوع|maudu)/.test(t)) return 'mawdu';
  if (/(sahih|صحيح|authentic)/.test(t)) return 'sahih';
  if (/(hasan|حسن|good)/.test(t)) return 'hasan';
  if (/(da.?if|ضعيف|weak)/.test(t)) return 'daif';
  return fallback;
}

/** Build a `Grade` from a narration's raw gradings, taking the first grader. */
export function gradeFromRaw(grades: RawHadith['grades'], fallback: GradeRuling): Grade {
  const first = grades.find((g) => g.grade || g.name);
  if (!first) return { ruling: fallback };
  return {
    ruling: gradeRulingFromText(first.grade || first.name, fallback),
    grader: first.name || undefined,
    source: first.grade || undefined,
  };
}

/**
 * Merge an Arabic and an English edition into `Hadith[]`, joining by number.
 * `fallbackRuling` is the collection's dominant authenticity, used when a
 * narration carries no recognised grade.
 */
export function mergeEditions(
  collectionId: string,
  fallbackRuling: GradeRuling,
  arabic: RawHadith[],
  english: RawHadith[],
): Hadith[] {
  const englishByNumber = new Map(english.map((h) => [h.number, h]));
  return arabic.map((ar) => {
    const en = englishByNumber.get(ar.number);
    const grades = ar.grades.length > 0 ? ar.grades : en?.grades ?? [];
    return {
      id: `${collectionId}-${ar.number}`,
      collectionId,
      number: ar.number,
      arabic: ar.text,
      translation: en?.text ?? '',
      grade: gradeFromRaw(grades, fallbackRuling),
      references:
        ar.reference?.book != null
          ? [`Book ${ar.reference.book}, Ḥadīth ${ar.reference.hadith ?? ar.number}`]
          : undefined,
    } satisfies Hadith;
  });
}
