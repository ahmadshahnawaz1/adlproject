/**
 * recipients.ts — the eight categories (aṣnāf) eligible to receive zakat,
 * named in the Qurʾān. Shown in the calculator so paying is connected to
 * giving: the user sees exactly where their zakat may go.
 */
import type { Daleel } from './zakat';

export const ASNAF_AYAH: Daleel = {
  source: 'quran',
  reference: 'at-Tawbah 9:60',
  text: 'Zakat is only for the poor and the needy, and those employed to collect it, and for bringing hearts together, and for freeing captives, and for those in debt, and in the cause of Allah, and for the stranded traveller — an obligation from Allah. And Allah is All-Knowing, All-Wise.',
};

export type Recipient = {
  id: string;
  name: string;
  arabic: string;
  transliteration: string;
  description: string;
};

export const ASNAF: Recipient[] = [
  {
    id: 'fuqara',
    name: 'The poor',
    arabic: 'الفقراء',
    transliteration: 'al-Fuqarāʾ',
    description: 'Those with little to no income or means to meet their basic needs.',
  },
  {
    id: 'masakin',
    name: 'The needy',
    arabic: 'المساكين',
    transliteration: 'al-Masākīn',
    description: 'Those whose income does not cover their essential living costs.',
  },
  {
    id: 'amilin',
    name: 'Zakat administrators',
    arabic: 'العاملين عليها',
    transliteration: 'al-ʿĀmilīna ʿalayhā',
    description: 'Those appointed to collect, manage and distribute the zakat.',
  },
  {
    id: 'muallafa',
    name: 'Reconciled hearts',
    arabic: 'المؤلفة قلوبهم',
    transliteration: 'al-Muʾallafati qulūbuhum',
    description: 'New Muslims and others whose hearts are drawn closer through kindness.',
  },
  {
    id: 'riqab',
    name: 'Freeing captives',
    arabic: 'في الرقاب',
    transliteration: 'fir-Riqāb',
    description: 'Freeing slaves and captives, and helping those bound by bondage.',
  },
  {
    id: 'gharimin',
    name: 'Those in debt',
    arabic: 'الغارمين',
    transliteration: 'al-Ghārimīn',
    description: 'Those burdened by lawful debts they cannot repay.',
  },
  {
    id: 'sabilillah',
    name: 'In the cause of Allah',
    arabic: 'في سبيل الله',
    transliteration: 'fī sabīlillāh',
    description: 'Striving and works that serve the path of Allah.',
  },
  {
    id: 'ibnsabil',
    name: 'The wayfarer',
    arabic: 'ابن السبيل',
    transliteration: 'ibn as-sabīl',
    description: 'The stranded traveller cut off from their wealth, however wealthy at home.',
  },
];
