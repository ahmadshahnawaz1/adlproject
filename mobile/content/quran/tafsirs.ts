/**
 * Curated tafsīr editions (source: spa5k/tafsir_api).
 *
 * Verses are fetched per-ayah on demand and cached on device — tafsīr is far
 * too large to bundle. Every slug below was verified to resolve before
 * shipping. The default is Ibn Kathīr, the most widely read classical tafsīr.
 */
import type { TafsirEdition } from './types';

/** Edition id of the tafsīr selected by default. */
export const DEFAULT_TAFSIR_ID = 'en-tafisr-ibn-kathir';

/** Hand-picked, verified tafsīr editions across major languages. */
export const TAFSIRS: readonly TafsirEdition[] = [
  // English
  {
    id: 'en-tafisr-ibn-kathir',
    name: 'Tafsir Ibn Kathir',
    author: 'Ḥāfiẓ Ibn Kathīr',
    language: 'English',
  },
  {
    id: 'en-tafsir-maarif-ul-quran',
    name: 'Maʿariful Qurʾan',
    author: 'Mufti Muhammad Shafiʿ',
    language: 'English',
  },
  {
    id: 'en-tafsir-al-mukhtasar',
    name: 'Al-Mukhtaṣar (Tafsīr al-Wajīz)',
    author: 'Tafsir Center for Quranic Studies',
    language: 'English',
  },
  {
    id: 'en-al-jalalayn',
    name: 'Tafsīr al-Jalālayn',
    author: 'al-Maḥallī & al-Suyūṭī',
    language: 'English',
  },
  {
    id: 'en-tafsir-ibn-abbas',
    name: 'Tanwīr al-Miqbās (Ibn ʿAbbās)',
    author: 'Ibn ʿAbbās',
    language: 'English',
  },
  {
    id: 'en-tazkirul-quran',
    name: 'Tazkirul Quran',
    author: 'Maulana Wahiduddin Khan',
    language: 'English',
  },
  // Arabic
  {
    id: 'ar-tafsir-muyassar',
    name: 'التفسير الميسّر',
    author: 'مجمع الملك فهد',
    language: 'Arabic',
  },
  {
    id: 'ar-tafsir-ibn-kathir',
    name: 'تفسير ابن كثير',
    author: 'الحافظ ابن كثير',
    language: 'Arabic',
  },
  {
    id: 'ar-tafsir-as-saadi',
    name: 'تفسير السعدي',
    author: 'عبد الرحمن السعدي',
    language: 'Arabic',
  },
  {
    id: 'ar-tafsir-al-tabari',
    name: 'تفسير الطبري',
    author: 'ابن جرير الطبري',
    language: 'Arabic',
  },
  {
    id: 'ar-tafseer-al-qurtubi',
    name: 'تفسير القرطبي',
    author: 'الإمام القرطبي',
    language: 'Arabic',
  },
  {
    id: 'ar-tafsir-al-baghawi',
    name: 'تفسير البغوي',
    author: 'الإمام البغوي',
    language: 'Arabic',
  },
  // Urdu
  {
    id: 'ur-tafseer-ibn-e-kaseer',
    name: 'تفسیر ابن کثیر',
    author: 'الحافظ ابن کثیر',
    language: 'Urdu',
  },
  {
    id: 'ur-tafsir-bayan-ul-quran',
    name: 'بیان القرآن',
    author: 'ڈاکٹر اسرار احمد',
    language: 'Urdu',
  },
  {
    id: 'ur-tafsir-as-saadi-urdu',
    name: 'تفسیر السعدی',
    author: 'عبد الرحمن السعدی',
    language: 'Urdu',
  },
  // Bengali
  {
    id: 'bn-tafseer-ibn-e-kaseer',
    name: 'তাফসীর ইবনে কাসীর',
    author: 'হাফিজ ইবনে কাসীর',
    language: 'Bengali',
  },
  {
    id: 'bn-tafsir-abu-bakr-zakaria',
    name: 'তাফসীর আবু বকর জাকারিয়া',
    author: 'ড. আবু বকর মুহাম্মাদ যাকারিয়া',
    language: 'Bengali',
  },
  {
    id: 'bn-tafsir-ahsanul-bayaan',
    name: 'তাফসীর আহসানুল বায়ান',
    author: 'Bayaan Foundation',
    language: 'Bengali',
  },
];

/** Look up a tafsīr edition by id. */
export function getTafsir(id: string): TafsirEdition | undefined {
  return TAFSIRS.find((t) => t.id === id);
}
