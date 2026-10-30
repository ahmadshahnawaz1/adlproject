/**
 * Farāʾiḍ reference material: the evidence the shares rest on, the order of
 * claims against an estate, and an honest statement of what this calculator
 * does not attempt.
 */
export type FaraidDaleel = {
  id: string;
  source: string;
  arabic: string;
  meaning: string;
};

export const FARAID_INTRO =
  'Farāʾiḍ is the law of inheritance — the one branch of fiqh whose shares Allah fixed in the Qurʾān Himself rather than leaving to human judgement. Enter who survived the deceased and this will work out each share exactly.';

export type FaraidStep = { title: string; detail: string };

/** Nothing reaches the heirs until these are settled, in this order. */
export const FARAID_ORDER: FaraidStep[] = [
  {
    title: 'Burial costs',
    detail: 'Washing, shrouding and burial are taken from the estate first, without extravagance.',
  },
  {
    title: 'Debts',
    detail:
      'Every debt is paid in full before any heir receives anything — debts owed to people and to Allah alike, such as unpaid zakāt.',
  },
  {
    title: 'The bequest (waṣiyyah)',
    detail:
      'Up to a third may be left to someone who is not an heir. Beyond a third requires the heirs’ consent, and a bequest to an existing heir is not valid without it.',
  },
  {
    title: 'The fixed shares',
    detail: 'Whatever remains is divided among the heirs by the shares below.',
  },
];

export const FARAID_DALEEL: FaraidDaleel[] = [
  {
    id: 'nisa-11',
    source: 'Sūrat al-Nisāʾ 4:11',
    arabic: 'يُوصِيكُمُ ٱللَّهُ فِىٓ أَوْلَٰدِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ ٱلْأُنثَيَيْنِ',
    meaning:
      'Allah instructs you concerning your children: to the male a share equal to that of two females. The same verse fixes the shares of the parents and of two or more daughters.',
  },
  {
    id: 'nisa-12',
    source: 'Sūrat al-Nisāʾ 4:12',
    arabic: 'وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَٰجُكُمْ إِن لَّمْ يَكُن لَّهُنَّ وَلَدٌ',
    meaning:
      'And yours is half of what your wives leave, if they have no child. This verse sets the shares of husband and wife, and of the brothers and sisters on the mother’s side.',
  },
  {
    id: 'nisa-176',
    source: 'Sūrat al-Nisāʾ 4:176',
    arabic: 'يَسْتَفْتُونَكَ قُلِ ٱللَّهُ يُفْتِيكُمْ فِى ٱلْكَلَٰلَةِ',
    meaning:
      'They ask you for a ruling. Say: Allah gives you a ruling concerning one who leaves neither parent nor child — the verse that fixes the shares of full and paternal siblings.',
  },
  {
    id: 'asaba',
    source: 'al-Bukhārī 6732, Muslim 1615',
    arabic: 'أَلْحِقُوا الْفَرَائِضَ بِأَهْلِهَا، فَمَا بَقِيَ فَهُوَ لِأَوْلَى رَجُلٍ ذَكَرٍ',
    meaning:
      'Give the fixed shares to those entitled to them; whatever remains goes to the nearest male relative. This is the basis of the ʿaṣabah — the residuary heirs.',
  },
  {
    id: 'wasiyyah',
    source: 'al-Bukhārī 2742, Muslim 1628',
    arabic: 'الثُّلُثُ، وَالثُّلُثُ كَثِيرٌ',
    meaning:
      'A third — and a third is a great deal. The Prophet ﷺ said this to Saʿd ibn Abī Waqqāṣ, capping what may be given away by bequest.',
  },
];

export type FaraidConcept = { term: string; arabic: string; detail: string };

export const FARAID_CONCEPTS: FaraidConcept[] = [
  {
    term: 'Fixed shares',
    arabic: 'ٱلْفُرُوض',
    detail:
      'A half, a quarter, an eighth, two thirds, a third or a sixth — the portions named in the Qurʾān for specific heirs.',
  },
  {
    term: 'Residuary heirs',
    arabic: 'ٱلْعَصَبَة',
    detail:
      'Those who take whatever is left after the fixed shares, and who take everything when there are no fixed-share heirs.',
  },
  {
    term: 'Exclusion',
    arabic: 'ٱلْحَجْب',
    detail:
      'A nearer relative can shut out a more distant one — a son excludes a grandson, a father excludes the brothers.',
  },
  {
    term: 'Increase',
    arabic: 'ٱلْعَوْل',
    detail:
      'When the fixed shares add up to more than the whole, every share shrinks in proportion so nothing is over-allotted.',
  },
  {
    term: 'Return',
    arabic: 'ٱلرَّدّ',
    detail:
      'When the shares fall short and nobody is left to claim the remainder, it returns to the fixed-share heirs — never to a spouse.',
  },
];

/** What this calculator deliberately does not attempt. */
export const FARAID_SCOPE = [
  'Distant kin (dhawū al-arḥām) such as a daughter’s children, nephews, uncles and cousins are not calculated. They inherit only when no heir listed here survives.',
  'A grandfather inheriting alongside brothers or sisters is left unanswered — the schools genuinely differ, so no single answer is shown.',
  'Great-grandchildren beyond a son’s children, and grandmothers beyond one on each side, are not modelled.',
  'A missing heir, an unborn child, a non-Muslim heir, and an heir who caused the death are all cases with their own rulings that this tool does not handle.',
];

export const FARAID_DISCLAIMER =
  'This is a study aid, not a legal ruling. Estates are divided in the presence of a qualified scholar or a sharīʿah court, who will weigh the details of your family and the law where you live. Check any figure here with them before acting on it.';

export const FARAID_WOMEN_NOTE =
  'The two-to-one share often asked about applies between a son and a daughter, and reflects the man’s obligation to maintain his family from his wealth while a woman’s remains her own. It is not a general rule: a mother and father can take equally, and in several cases a woman inherits the same as, or more than, a man in her position.';
