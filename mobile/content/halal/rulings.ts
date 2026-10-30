/**
 * The three questions on which scholars genuinely differ, and which change the
 * answer for the same product.
 *
 * Adl does not settle any of them. The user chooses the position they follow,
 * and the opposing view stays visible beside it.
 */
import type { StandardAxis } from './types';

export type Position = {
  id: 'accept' | 'avoid';
  title: string;
  held: string;
  detail: string;
};

export type Ruling = {
  axis: StandardAxis;
  title: string;
  arabic: string;
  question: string;
  /** What turning this on means for the scan results. */
  effect: string;
  positions: Position[];
  daleel: { source: string; arabic?: string; meaning: string }[];
};

export const RULINGS: Ruling[] = [
  {
    axis: 'istihalah',
    title: 'Transformation',
    arabic: 'ٱلِٱسْتِحَالَة',
    question:
      'When a substance is chemically transformed into something else entirely, does the ruling on its origin still follow it?',
    effect:
      'Accepting it lowers additives whose only concern is a distant animal-fat origin — emulsifiers, glycerol, stearates — from a warning to a note.',
    positions: [
      {
        id: 'accept',
        title: 'Transformation changes the ruling',
        held: 'Ḥanafī, Mālikī, and many contemporary councils',
        detail:
          'A thing that has genuinely become another substance takes the ruling of what it now is, as impure wine becoming vinegar becomes lawful. Applied to additives, a fat processed into a new compound is no longer that fat.',
      },
      {
        id: 'avoid',
        title: 'The origin still rules',
        held: 'Shāfiʿī, Ḥanbalī, and most halal certifiers',
        detail:
          'What was unlawful remains unlawful however it is processed, except where a text makes an exception such as vinegar. Most certification bodies take this stricter line for gelatin in particular.',
      },
    ],
    daleel: [
      {
        source: 'Muslim 1983',
        arabic: 'نِعْمَ ٱلْإِدَامُ ٱلْخَلُّ',
        meaning:
          'What an excellent condiment vinegar is. Cited as evidence that a substance which changes may change in ruling.',
      },
    ],
  },
  {
    axis: 'ahlKitab',
    title: 'Meat of the People of the Book',
    arabic: 'طَعَامُ أَهْلِ ٱلْكِتَاب',
    question:
      'Is meat slaughtered by Jews and Christians lawful without knowing how it was slaughtered?',
    effect:
      'Accepting it lowers plain meat and meat-derived ingredients from a warning to a note in countries where the slaughterers are largely of the People of the Book.',
    positions: [
      {
        id: 'accept',
        title: 'Their food is lawful for you',
        held: 'The majority of the Companions and the four schools in principle',
        detail:
          'The verse permits the food of those given the Scripture, and the Prophet ﷺ ate from it. Many contemporary scholars extend this to commercially slaughtered meat in the West.',
      },
      {
        id: 'avoid',
        title: 'Requires Muslim slaughter and the tasmiyah',
        held: 'Widely held today given modern industrial slaughter',
        detail:
          'The concession assumes a slaughter resembling the lawful one. Where animals are killed by stunning or machine without the name of Allah, many scholars hold the concession does not apply.',
      },
    ],
    daleel: [
      {
        source: 'Sūrat al-Māʾidah 5:5',
        arabic: 'وَطَعَامُ ٱلَّذِينَ أُوتُوا۟ ٱلْكِتَٰبَ حِلٌّ لَّكُمْ',
        meaning: 'And the food of those who were given the Scripture is lawful for you.',
      },
      {
        source: 'Sūrat al-Anʿām 6:121',
        arabic: 'وَلَا تَأْكُلُوا۟ مِمَّا لَمْ يُذْكَرِ ٱسْمُ ٱللَّهِ عَلَيْهِ',
        meaning: 'And do not eat of that over which the name of Allah has not been mentioned.',
      },
    ],
  },
  {
    axis: 'traceAlcohol',
    title: 'Trace alcohol',
    arabic: 'ٱلْكُحُول ٱلْيَسِير',
    question:
      'Is a small quantity of ethanol used as a solvent or carrier, far below any intoxicating amount, treated as khamr?',
    effect:
      'Accepting it lowers flavourings, vanilla extract and similar carriers from a warning to a note. It never affects wine, beer or spirits themselves.',
    positions: [
      {
        id: 'accept',
        title: 'Not khamr, and not intoxicating',
        held: 'Many contemporary councils and certifiers',
        detail:
          'What is prohibited is the intoxicant. Ethanol used industrially as a solvent, in an amount that could never intoxicate and is not drunk for pleasure, is treated differently from wine.',
      },
      {
        id: 'avoid',
        title: 'Any amount follows the ruling of the whole',
        held: 'A cautious position held by many scholars',
        detail:
          'On the ḥadīth that what intoxicates in large amounts is unlawful in small amounts, any deliberate addition of alcohol is avoided.',
      },
    ],
    daleel: [
      {
        source: 'Sūrat al-Māʾidah 5:90',
        arabic: 'إِنَّمَا ٱلْخَمْرُ وَٱلْمَيْسِرُ وَٱلْأَنصَابُ وَٱلْأَزْلَٰمُ رِجْسٌ مِّنْ عَمَلِ ٱلشَّيْطَٰنِ',
        meaning:
          'Intoxicants, gambling, idols and divining arrows are but defilement from the work of Satan.',
      },
      {
        source: 'Abū Dāwūd 3681, al-Tirmidhī 1865',
        arabic: 'مَا أَسْكَرَ كَثِيرُهُ فَقَلِيلُهُ حَرَامٌ',
        meaning: 'What intoxicates in a large amount, a small amount of it is unlawful.',
      },
    ],
  },
];

export const RULING_BY_AXIS: Record<StandardAxis, Ruling> = RULINGS.reduce(
  (acc, r) => {
    acc[r.axis] = r;
    return acc;
  },
  {} as Record<StandardAxis, Ruling>,
);

export const HALAL_INTRO =
  'Scan a barcode and Adl reads the ingredients, then marks anything that needs your attention — what it is, where it comes from, and why scholars discuss it.';

/** The single most important sentence in the feature. */
export const HALAL_DISCLAIMER =
  'Adl never tells you a product is halal, because a barcode cannot. An ingredients list says nothing about how an animal was slaughtered, which certifier approved the plant, what else runs on the same line, or whether the recipe changed last month. Treat this as a prompt to look closer, not as a verdict.';

export const HALAL_SCOPE = [
  'Ingredient lists come from Open Food Facts, a public database maintained by volunteers. It can be incomplete, out of date, or wrong.',
  'Manufacturers reformulate products without changing the barcode, so a saved result can age badly.',
  'Nothing here can detect cross-contamination, shared production lines, or the method of slaughter.',
  'Certification marks on the packet, and your local halal authority, carry more weight than anything this screen shows you.',
];

export const OFF_ATTRIBUTION =
  'Product data from Open Food Facts, licensed under the Open Database Licence.';

export const NO_FLAGS_HEADLINE = 'No flagged ingredients';

export const NO_FLAGS_BODY =
  'Nothing in the list is on our watchlist. That is not a halal certification — check the packet for a certification mark.';
