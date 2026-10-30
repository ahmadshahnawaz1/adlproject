/**
 * content/names — the barrel for al-Asmāʾ al-Ḥusnā, the Beautiful Names.
 *
 * Gathers the ninety-nine names in their well-known order, the theme clusters
 * they are learned in, the source note, and the standing review disclaimer.
 */
export * from './types';

import type { DivineName, NameThemeMeta } from './types';
import { NAMES_1 } from './names1';
import { NAMES_2 } from './names2';
import { NAMES_3 } from './names3';

/** All ninety-nine names, in the well-known order. */
export const DIVINE_NAMES: DivineName[] = [...NAMES_1, ...NAMES_2, ...NAMES_3].sort(
  (a, b) => a.number - b.number,
);

export const TOTAL_NAMES = DIVINE_NAMES.length;

/** The clusters the names are grouped into for learning. */
export const NAME_THEMES: NameThemeMeta[] = [
  {
    id: 'mercy',
    title: 'Mercy',
    arabic: 'الرَّحْمَة',
    blurb: 'The names of compassion, kindness, and gentleness.',
  },
  {
    id: 'majesty',
    title: 'Majesty',
    arabic: 'الْجَلَال',
    blurb: 'Sovereignty, might, and greatness beyond measure.',
  },
  {
    id: 'knowledge',
    title: 'Knowledge',
    arabic: 'الْعِلْم',
    blurb: 'Knowing, hearing, seeing, and perfect wisdom.',
  },
  {
    id: 'provision',
    title: 'Provision',
    arabic: 'الرِّزْق',
    blurb: 'Sustenance, generosity, and open-handed giving.',
  },
  {
    id: 'justice',
    title: 'Justice',
    arabic: 'الْعَدْل',
    blurb: 'Judgement, fairness, and the setting right of wrongs.',
  },
  {
    id: 'creation',
    title: 'Creation',
    arabic: 'الْخَلْق',
    blurb: 'Originating, shaping, giving life and death.',
  },
  {
    id: 'forgiveness',
    title: 'Forgiveness',
    arabic: 'الْمَغْفِرَة',
    blurb: 'Pardon, covering of sin, and forbearance.',
  },
  {
    id: 'closeness',
    title: 'Closeness',
    arabic: 'الْقُرْب',
    blurb: 'Love, guidance, protection, and nearness.',
  },
  {
    id: 'eternity',
    title: 'Eternity',
    arabic: 'الْبَقَاء',
    blurb: 'Oneness, permanence, and what remains when all else passes.',
  },
];

export function themeMeta(id: string): NameThemeMeta | undefined {
  return NAME_THEMES.find((t) => t.id === id);
}

/** Resolve a name by its id. */
export function nameById(id: string): DivineName | undefined {
  return DIVINE_NAMES.find((n) => n.id === id);
}

/** Resolve a name by its position in the enumeration (1–99). */
export function nameByNumber(n: number): DivineName | undefined {
  return DIVINE_NAMES.find((x) => x.number === n);
}

/**
 * The honest scholarly position, shown in the app.
 *
 * The *count* is established: "Allah has ninety-nine names — one hundred less
 * one; whoever iḥṣāʾ them enters Paradise" (al-Bukhārī 2736, Muslim 2677). The
 * specific *list* below is the well-known enumeration transmitted through
 * al-Tirmidhī (3507) and Ibn Mājah (3861); many scholars — including Ibn
 * Taymiyyah and Ibn Ḥajar — hold that the enumeration is a narrator's addition
 * rather than the Prophet's ﷺ own words, and other names occur in the Qurʾān
 * and Sunnah outside it. The names themselves are established; the numbering
 * is a scholarly convenience, not a revealed boundary.
 */
export const NAMES_SOURCE_NOTE =
  'The number is established in al-Bukhārī (2736) and Muslim (2677). The specific list of ninety-nine is the well-known enumeration from al-Tirmidhī (3507) and Ibn Mājah (3861); many scholars hold that this listing is a narrator’s addition rather than prophetic speech, and further names appear in the Qurʾān and Sunnah beyond it. The names are established; the numbering is a convenience.';

export const NAMES_DISCLAIMER =
  'The meanings and reflections here are authored in-house from the plain sense of the Qurʾān and the works of the scholars, and are pending final scholarly review. They are an introduction to knowing Allah by His names, not a substitute for learning from qualified teachers.';

/** The virtue that motivates learning them, with its source. */
export const NAMES_VIRTUE = {
  text:
    'Allah has ninety-nine names — one hundred less one. Whoever comprehends them will enter Paradise.',
  reference: 'Ṣaḥīḥ al-Bukhārī 2736; Ṣaḥīḥ Muslim 2677',
  note:
    'To “comprehend” (iḥṣāʾ) them is understood by the scholars as more than counting: to memorise them, understand their meanings, and worship Allah by them.',
};
