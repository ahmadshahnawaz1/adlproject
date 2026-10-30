/**
 * Jumuʿah and Eid: the rulings, the sunan around them, and the words of the
 * takbīr. Where the schools differ — most visibly in the number of takbīrs in
 * the Eid prayer — every position is given rather than one being chosen.
 */
export type Daleel = { source: string; arabic?: string; meaning: string };

export const JUMUAH_INTRO =
  'Jumuʿah is the weekly gathering that replaces Ẓuhr for those it is due upon: two rakʿahs prayed aloud in congregation, preceded by two khuṭbahs that are part of the prayer itself.';

export const JUMUAH_OBLIGATION =
  'It is obligatory on every adult, sane, resident Muslim man who is able to attend. It is not required of women, children, travellers, or the ill — though their prayer counts fully if they do attend, and Ẓuhr is prayed as usual by anyone excused.';

export const JUMUAH_DALEEL: Daleel[] = [
  {
    source: 'Sūrat al-Jumuʿah 62:9',
    arabic:
      'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِذَا نُودِىَ لِلصَّلَوٰةِ مِن يَوْمِ ٱلْجُمُعَةِ فَٱسْعَوْا۟ إِلَىٰ ذِكْرِ ٱللَّهِ وَذَرُوا۟ ٱلْبَيْعَ',
    meaning:
      'O you who believe, when the call to prayer is made on the day of Jumuʿah, hasten to the remembrance of Allah and leave off trade.',
  },
  {
    source: 'Abū Dāwūd 1067',
    arabic: 'ٱلْجُمُعَةُ حَقٌّ وَاجِبٌ عَلَىٰ كُلِّ مُسْلِمٍ فِي جَمَاعَةٍ إِلَّا أَرْبَعَةً',
    meaning:
      'Jumuʿah in congregation is an obligation upon every Muslim, except four: a slave, a woman, a child, and one who is ill.',
  },
  {
    source: 'Abū Dāwūd 1052, al-Tirmidhī 500',
    arabic: 'مَنْ تَرَكَ ثَلَاثَ جُمَعٍ تَهَاوُنًا بِهَا طَبَعَ ٱللَّهُ عَلَىٰ قَلْبِهِ',
    meaning:
      'Whoever leaves three Jumuʿahs out of neglect, Allah seals his heart. The warning is for abandoning it carelessly, not for a genuine excuse.',
  },
];

export type Sunnah = { id: string; title: string; detail: string; source?: string };

export const JUMUAH_SUNAN: Sunnah[] = [
  {
    id: 'ghusl',
    title: 'Ghusl',
    detail: 'Bathing on the day of Jumuʿah is strongly emphasised for anyone attending.',
    source: 'al-Bukhārī 879, Muslim 846',
  },
  {
    id: 'dress',
    title: 'Best clothes and perfume',
    detail: 'Clean the mouth with the siwāk, wear your best, and use perfume if you have it.',
    source: 'Ibn Mājah 1098',
  },
  {
    id: 'early',
    title: 'Go early',
    detail:
      'The reward is measured by how early you arrive — the first to come is likened to one who offers a camel, then a cow, then a ram, and so on until the imam appears.',
    source: 'al-Bukhārī 881, Muslim 850',
  },
  {
    id: 'walk',
    title: 'Walk to the mosque',
    detail: 'Walking rather than riding, with every step counted in your favour.',
    source: 'Abū Dāwūd 345',
  },
  {
    id: 'kahf',
    title: 'Read Sūrat al-Kahf',
    detail:
      'Read on the day of Jumuʿah — the window runs from Maghrib on Thursday to Maghrib on Friday.',
    source: 'al-Ḥākim 2/368, graded ṣaḥīḥ by al-Albānī',
  },
  {
    id: 'salawat',
    title: 'Send abundant ṣalāh on the Prophet ﷺ',
    detail: 'Friday is singled out for increasing the ṣalāh upon him ﷺ.',
    source: 'Abū Dāwūd 1047',
  },
  {
    id: 'tahiyyah',
    title: 'Two rakʿahs on entering',
    detail:
      'Pray two brief rakʿahs even if the imam has begun the khuṭbah — the Prophet ﷺ instructed a man to do exactly that, and to keep them short.',
    source: 'Muslim 875',
  },
  {
    id: 'after',
    title: 'Pray after Jumuʿah',
    detail: 'Four rakʿahs in the mosque, or two at home, following the prayer.',
    source: 'Muslim 881',
  },
];

export const KHUTBAH_ADAB: Sunnah[] = [
  {
    id: 'silence',
    title: 'Listen in silence',
    detail:
      'Even telling someone beside you to be quiet while the imam speaks is counted as idle talk that costs you the reward of the Jumuʿah.',
    source: 'al-Bukhārī 934, Muslim 851',
  },
  {
    id: 'still',
    title: 'Keep still',
    detail: 'Fidgeting with pebbles or a phone during the khuṭbah is described the same way.',
    source: 'Muslim 857',
  },
  {
    id: 'face',
    title: 'Face the imam',
    detail: 'The Companions would turn towards the imam as he delivered the khuṭbah.',
    source: 'al-Tirmidhī 509',
  },
];

export const SAAH_IJABAH =
  'There is an hour on Friday in which no Muslim asks Allah for something except that He gives it. The two strongest opinions place it between the imam sitting on the minbar and the end of the prayer, or in the last hour of the day before Maghrib — so ask in both.';

export const SAAH_DALEEL: Daleel = {
  source: 'al-Bukhārī 935, Muslim 852',
  arabic: 'فِيهِ سَاعَةٌ لَا يُوَافِقُهَا عَبْدٌ مُسْلِمٌ وَهُوَ قَائِمٌ يُصَلِّي يَسْأَلُ ٱللَّهَ شَيْئًا إِلَّا أَعْطَاهُ إِيَّاهُ',
  meaning:
    'In it is an hour in which no Muslim servant, standing in prayer and asking Allah for something, is refused it.',
};

// ---- Eid ---------------------------------------------------------------

export const EID_INTRO =
  'The two Eids are the only festivals Islam prescribes. The prayer is two rakʿahs in congregation, with extra takbīrs, prayed after sunrise and before the sun passes its zenith. There is no adhān and no iqāmah, and the khuṭbah comes after the prayer — the reverse of Jumuʿah.';

export type Opinion = { position: string; held: string; detail: string };

export const EID_RULING_OPINIONS: Opinion[] = [
  {
    position: 'Farḍ kifāyah',
    held: 'Ḥanbalī',
    detail: 'A communal obligation — if enough people pray it, the rest are excused.',
  },
  {
    position: 'Wājib',
    held: 'Ḥanafī',
    detail: 'Binding on every man it applies to, close to obligatory.',
  },
  {
    position: 'Sunnah muʾakkadah',
    held: 'Shāfiʿī, Mālikī',
    detail: 'A confirmed sunnah the Prophet ﷺ never omitted.',
  },
];

export const EID_TAKBIR_OPINIONS: Opinion[] = [
  {
    position: 'Seven, then five',
    held: 'Mālikī, Shāfiʿī, Ḥanbalī',
    detail:
      'Seven takbīrs in the first rakʿah before al-Fātiḥah, not counting the opening takbīr, and five in the second before al-Fātiḥah, not counting the takbīr for standing.',
  },
  {
    position: 'Three, then three',
    held: 'Ḥanafī',
    detail:
      'Three takbīrs after the opening supplication in the first rakʿah, and three before the bowing of the second.',
  },
];

export const TAKBIR_TEXT = {
  arabic:
    'ٱللَّهُ أَكْبَرُ، ٱللَّهُ أَكْبَرُ، لَا إِلَٰهَ إِلَّا ٱللَّهُ، وَٱللَّهُ أَكْبَرُ، ٱللَّهُ أَكْبَرُ، وَلِلَّهِ ٱلْحَمْدُ',
  transliteration:
    'Allāhu akbar, Allāhu akbar, lā ilāha illa-llāh, wa-llāhu akbar, Allāhu akbar, wa lillāhi-l-ḥamd',
  meaning:
    'Allah is the greatest, Allah is the greatest. There is no god but Allah. Allah is the greatest, Allah is the greatest, and to Allah belongs all praise.',
};

export const TAKBIR_TIMING = {
  fitr:
    'Begins at sunset on the last night of Ramaḍān and continues until the imam comes out for the prayer.',
  adha:
    'The unrestricted takbīr runs through the first ten days of Dhū al-Ḥijjah. The restricted takbīr follows every obligatory prayer from Fajr on the day of ʿArafah to ʿAṣr on the last of the days of Tashrīq.',
};

export const EID_SUNAN: Record<'fitr' | 'adha', Sunnah[]> = {
  fitr: [
    {
      id: 'zakat',
      title: 'Pay Zakāt al-Fiṭr first',
      detail:
        'It must reach those entitled to it before the prayer; given after, it counts as ordinary charity.',
      source: 'Abū Dāwūd 1609',
    },
    {
      id: 'eat',
      title: 'Eat before going out',
      detail: 'The Prophet ﷺ would eat an odd number of dates before leaving for the prayer.',
      source: 'al-Bukhārī 953',
    },
    {
      id: 'ghusl',
      title: 'Ghusl, best clothes, perfume',
      detail: 'Bathe and wear the best you have — Eid is a day of visible gratitude.',
    },
    {
      id: 'takbir',
      title: 'Say the takbīr on the way',
      detail: 'Aloud, from leaving the house until the prayer begins.',
    },
    {
      id: 'routes',
      title: 'Take a different way back',
      detail: 'He ﷺ would go by one road and return by another.',
      source: 'al-Bukhārī 986',
    },
    {
      id: 'attend',
      title: 'Bring the whole household',
      detail:
        'Umm ʿAṭiyyah reported that the women and girls were commanded to come out, even those excused from praying, to witness the gathering and the duʿāʾ.',
      source: 'al-Bukhārī 974, Muslim 890',
    },
  ],
  adha: [
    {
      id: 'fast',
      title: 'Do not eat until after the prayer',
      detail:
        'The reverse of al-Fiṭr — he ﷺ would not eat on the day of Aḍḥā until he returned and ate from his sacrifice.',
      source: 'al-Tirmidhī 542',
    },
    {
      id: 'ghusl',
      title: 'Ghusl, best clothes, perfume',
      detail: 'As on al-Fiṭr.',
    },
    {
      id: 'takbir',
      title: 'Say the takbīr',
      detail: 'Both freely through the ten days and after each prayer through the days of Tashrīq.',
    },
    {
      id: 'udhiyah',
      title: 'The sacrifice (uḍḥiyah)',
      detail:
        'Offered after the prayer, not before, and valid on the tenth and the three days of Tashrīq that follow.',
      source: 'al-Bukhārī 968',
    },
    {
      id: 'routes',
      title: 'Take a different way back',
      detail: 'As on al-Fiṭr.',
      source: 'al-Bukhārī 986',
    },
  ],
};

export const EID_GREETING = {
  arabic: 'تَقَبَّلَ ٱللَّهُ مِنَّا وَمِنْكُمْ',
  transliteration: 'Taqabbala-llāhu minnā wa minkum',
  meaning: 'May Allah accept from us and from you — the greeting reported from the Companions.',
};

export const JUMUAH_DISCLAIMER =
  'Timings for the Eid prayer and the sighting of the moon are settled by your local mosque or authority. Follow them where they differ from the dates shown here.';
