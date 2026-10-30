/**
 * content/names/names1.ts — the Beautiful Names, 1–33.
 *
 * Wording of the meanings follows the plain sense of the Qurʾān; the
 * explanations are authored in-house and pending scholarly review.
 */
import type { DivineName } from './types';

export const NAMES_1: DivineName[] = [
  {
    id: 'ar-rahman',
    number: 1,
    arabic: 'الرَّحْمَٰن',
    transliteration: 'Ar-Raḥmān',
    meaning: 'The Most Merciful',
    explanation:
      'The One whose mercy is so vast it reaches every creature without exception — believer and disbeliever, in this life. To know Him by this name is to stop imagining that you are beyond His reach.',
    theme: 'mercy',
    quranRef: { surah: 1, ayah: 3 },
  },
  {
    id: 'ar-rahim',
    number: 2,
    arabic: 'الرَّحِيم',
    transliteration: 'Ar-Raḥīm',
    meaning: 'The Bestower of Mercy',
    explanation:
      'The One whose mercy is given especially to the believers, in this life and the next. Where Ar-Raḥmān is mercy\u2019s breadth, Ar-Raḥīm is its constancy toward those who turn to Him.',
    theme: 'mercy',
    quranRef: { surah: 1, ayah: 3 },
  },
  {
    id: 'al-malik',
    number: 3,
    arabic: 'الْمَلِك',
    transliteration: 'Al-Malik',
    meaning: 'The King',
    explanation:
      'The Sovereign who owns all dominion and needs nothing from what He owns. Every other authority is borrowed and temporary.',
    theme: 'majesty',
    quranRef: { surah: 59, ayah: 23 },
  },
  {
    id: 'al-quddus',
    number: 4,
    arabic: 'الْقُدُّوس',
    transliteration: 'Al-Quddūs',
    meaning: 'The Most Holy',
    explanation:
      'The One utterly pure of every defect, partner, and imperfection the mind could imagine. Whatever flaw you can conceive, He is far above it.',
    theme: 'majesty',
    quranRef: { surah: 59, ayah: 23 },
  },
  {
    id: 'as-salam',
    number: 5,
    arabic: 'السَّلَام',
    transliteration: 'As-Salām',
    meaning: 'The Source of Peace',
    explanation:
      'The One free from all deficiency, from whom every safety and peace flows — and the greeting the people of Paradise receive from Him.',
    theme: 'majesty',
    quranRef: { surah: 59, ayah: 23 },
  },
  {
    id: 'al-mumin',
    number: 6,
    arabic: 'الْمُؤْمِن',
    transliteration: 'Al-Muʾmin',
    meaning: 'The Granter of Security',
    explanation:
      'The One who confirms the truth of His messengers and gives His servants safety from fear. Trust placed in Him is never misplaced.',
    theme: 'majesty',
    quranRef: { surah: 59, ayah: 23 },
  },
  {
    id: 'al-muhaymin',
    number: 7,
    arabic: 'الْمُهَيْمِن',
    transliteration: 'Al-Muhaymin',
    meaning: 'The Guardian',
    explanation:
      'The Watcher over all things, guarding and preserving them. Nothing slips past His oversight, and nothing is left unattended.',
    theme: 'majesty',
    quranRef: { surah: 59, ayah: 23 },
  },
  {
    id: 'al-aziz',
    number: 8,
    arabic: 'الْعَزِيز',
    transliteration: 'Al-ʿAzīz',
    meaning: 'The Almighty',
    explanation:
      'The One whose might cannot be resisted and whose honour cannot be diminished. Strength that never needs to prove itself.',
    theme: 'majesty',
    quranRef: { surah: 59, ayah: 23 },
  },
  {
    id: 'al-jabbar',
    number: 9,
    arabic: 'الْجَبَّار',
    transliteration: 'Al-Jabbār',
    meaning: 'The Compeller',
    explanation:
      'The One whose will prevails over all — and who mends what is broken. The same root gives us the setting of a fractured bone.',
    theme: 'majesty',
    quranRef: { surah: 59, ayah: 23 },
  },
  {
    id: 'al-mutakabbir',
    number: 10,
    arabic: 'الْمُتَكَبِّر',
    transliteration: 'Al-Mutakabbir',
    meaning: 'The Supreme',
    explanation:
      'The One to whom greatness truly belongs. Pride is a garment that befits Him alone, and disgraces anyone else who wears it.',
    theme: 'majesty',
    quranRef: { surah: 59, ayah: 23 },
  },
  {
    id: 'al-khaliq',
    number: 11,
    arabic: 'الْخَالِق',
    transliteration: 'Al-Khāliq',
    meaning: 'The Creator',
    explanation:
      'The One who brings everything into being from nothing, measuring each thing precisely before it exists.',
    theme: 'creation',
    quranRef: { surah: 59, ayah: 24 },
  },
  {
    id: 'al-bari',
    number: 12,
    arabic: 'الْبَارِئ',
    transliteration: 'Al-Bāriʾ',
    meaning: 'The Originator',
    explanation:
      'The One who gives creation its distinct form, flawlessly and without any prior model to copy.',
    theme: 'creation',
    quranRef: { surah: 59, ayah: 24 },
  },
  {
    id: 'al-musawwir',
    number: 13,
    arabic: 'الْمُصَوِّر',
    transliteration: 'Al-Muṣawwir',
    meaning: 'The Fashioner',
    explanation:
      'The One who shapes every created thing, giving each its particular appearance. No two faces are the same because He willed them so.',
    theme: 'creation',
    quranRef: { surah: 59, ayah: 24 },
  },
  {
    id: 'al-ghaffar',
    number: 14,
    arabic: 'الْغَفَّار',
    transliteration: 'Al-Ghaffār',
    meaning: 'The All-Forgiving',
    explanation:
      'The One who forgives again and again, covering sins so completely that they are neither exposed nor held against the repentant.',
    theme: 'forgiveness',
    quranRef: { surah: 71, ayah: 10 },
  },
  {
    id: 'al-qahhar',
    number: 15,
    arabic: 'الْقَهَّار',
    transliteration: 'Al-Qahhār',
    meaning: 'The Subduer',
    explanation:
      'The One before whom every power is subdued. Tyrants pass; His authority does not.',
    theme: 'majesty',
    quranRef: { surah: 13, ayah: 16 },
  },
  {
    id: 'al-wahhab',
    number: 16,
    arabic: 'الْوَهَّاب',
    transliteration: 'Al-Wahhāb',
    meaning: 'The Bestower',
    explanation:
      'The One who gives freely and continually, without being asked and without expecting return.',
    theme: 'provision',
    quranRef: { surah: 3, ayah: 8 },
  },
  {
    id: 'ar-razzaq',
    number: 17,
    arabic: 'الرَّزَّاق',
    transliteration: 'Ar-Razzāq',
    meaning: 'The Provider',
    explanation:
      'The One who provides for every creature — the sustenance of bodies and of hearts. Anxiety over provision is answered by this name.',
    theme: 'provision',
    quranRef: { surah: 51, ayah: 58 },
  },
  {
    id: 'al-fattah',
    number: 18,
    arabic: 'الْفَتَّاح',
    transliteration: 'Al-Fattāḥ',
    meaning: 'The Opener',
    explanation:
      'The One who opens what is closed — closed doors, closed hearts, closed circumstances — and who judges between people with truth.',
    theme: 'provision',
    quranRef: { surah: 34, ayah: 26 },
  },
  {
    id: 'al-alim',
    number: 19,
    arabic: 'الْعَلِيم',
    transliteration: 'Al-ʿAlīm',
    meaning: 'The All-Knowing',
    explanation:
      'The One whose knowledge encompasses everything — what was, what is, what will be, and what never came to pass.',
    theme: 'knowledge',
    quranRef: { surah: 2, ayah: 32 },
  },
  {
    id: 'al-qabid',
    number: 20,
    arabic: 'الْقَابِض',
    transliteration: 'Al-Qābiḍ',
    meaning: 'The Withholder',
    explanation:
      'The One who withholds by perfect wisdom — restricting provision or ease for a purpose the servant may not yet see.',
    theme: 'provision',
    quranRef: { surah: 2, ayah: 245 },
  },
  {
    id: 'al-basit',
    number: 21,
    arabic: 'الْبَاسِط',
    transliteration: 'Al-Bāsiṭ',
    meaning: 'The Extender',
    explanation:
      'The One who expands provision, hearts, and horizons. What He opens, no one can close.',
    theme: 'provision',
    quranRef: { surah: 2, ayah: 245 },
  },
  {
    id: 'al-khafid',
    number: 22,
    arabic: 'الْخَافِض',
    transliteration: 'Al-Khāfiḍ',
    meaning: 'The Abaser',
    explanation:
      'The One who lowers the arrogant and the oppressor, however secure they imagine themselves to be.',
    theme: 'justice',
  },
  {
    id: 'ar-rafi',
    number: 23,
    arabic: 'الرَّافِع',
    transliteration: 'Ar-Rāfiʿ',
    meaning: 'The Exalter',
    explanation:
      'The One who raises whom He wills — by faith, by knowledge, by sincerity — often those the world overlooked.',
    theme: 'justice',
  },
  {
    id: 'al-muizz',
    number: 24,
    arabic: 'الْمُعِزّ',
    transliteration: 'Al-Muʿizz',
    meaning: 'The Honourer',
    explanation:
      'The One who grants honour. Dignity sought from Him lasts; dignity sought from people is on loan.',
    theme: 'justice',
    quranRef: { surah: 3, ayah: 26 },
  },
  {
    id: 'al-mudhill',
    number: 25,
    arabic: 'الْمُذِلّ',
    transliteration: 'Al-Mudhill',
    meaning: 'The Humiliator',
    explanation:
      'The One who humbles whom He wills. A reminder that no standing is secure except through Him.',
    theme: 'justice',
    quranRef: { surah: 3, ayah: 26 },
  },
  {
    id: 'as-sami',
    number: 26,
    arabic: 'السَّمِيع',
    transliteration: 'As-Samīʿ',
    meaning: 'The All-Hearing',
    explanation:
      'The One who hears every voice at once — including the prayer whispered so quietly that no one else could hear it.',
    theme: 'knowledge',
    quranRef: { surah: 2, ayah: 127 },
  },
  {
    id: 'al-basir',
    number: 27,
    arabic: 'الْبَصِير',
    transliteration: 'Al-Baṣīr',
    meaning: 'The All-Seeing',
    explanation:
      'The One who sees all things, outward and inward. He sees the deed and the intention behind it.',
    theme: 'knowledge',
    quranRef: { surah: 17, ayah: 1 },
  },
  {
    id: 'al-hakam',
    number: 28,
    arabic: 'الْحَكَم',
    transliteration: 'Al-Ḥakam',
    meaning: 'The Judge',
    explanation:
      'The One who judges finally and without appeal. Every wrong that escaped worldly courts still stands before Him.',
    theme: 'justice',
    quranRef: { surah: 6, ayah: 114 },
  },
  {
    id: 'al-adl',
    number: 29,
    arabic: 'الْعَدْل',
    transliteration: 'Al-ʿAdl',
    meaning: 'The Utterly Just',
    explanation:
      'The One who is justice itself and never wrongs anyone by even an atom\u2019s weight. The name this app is built around.',
    theme: 'justice',
    quranRef: { surah: 4, ayah: 40 },
  },
  {
    id: 'al-latif',
    number: 30,
    arabic: 'اللَّطِيف',
    transliteration: 'Al-Laṭīf',
    meaning: 'The Subtle and Kind',
    explanation:
      'The One who is gentle with His servants in ways too fine to notice — arranging good through paths you never saw forming.',
    theme: 'closeness',
    quranRef: { surah: 67, ayah: 14 },
  },
  {
    id: 'al-khabir',
    number: 31,
    arabic: 'الْخَبِير',
    transliteration: 'Al-Khabīr',
    meaning: 'The All-Aware',
    explanation:
      'The One aware of the innermost reality of everything — the hidden causes beneath what appears on the surface.',
    theme: 'knowledge',
    quranRef: { surah: 67, ayah: 14 },
  },
  {
    id: 'al-halim',
    number: 32,
    arabic: 'الْحَلِيم',
    transliteration: 'Al-Ḥalīm',
    meaning: 'The Forbearing',
    explanation:
      'The One who does not hasten to punish though He has every right to. His patience is the space in which repentance becomes possible.',
    theme: 'forgiveness',
    quranRef: { surah: 2, ayah: 235 },
  },
  {
    id: 'al-azim',
    number: 33,
    arabic: 'الْعَظِيم',
    transliteration: 'Al-ʿAẓīm',
    meaning: 'The Magnificent',
    explanation:
      'The One whose greatness no mind can encompass. Every attempt to measure Him falls short.',
    theme: 'majesty',
    quranRef: { surah: 2, ayah: 255 },
  },
];
