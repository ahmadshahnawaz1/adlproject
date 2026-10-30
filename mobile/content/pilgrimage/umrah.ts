/**
 * umrah.ts — the journey of ʿUmrah, the "lesser pilgrimage", as four pillars
 * performed in order: Iḥrām → Ṭawāf → Saʿī → Ḥalq/Taqṣīr. Each stage carries
 * its actions, supplications, evidence, the differences between the schools,
 * and the common mistakes. The screen walks the pilgrim through it step by
 * step, in Learn or Perform mode.
 *
 * Sources: the Farewell Pilgrimage narration of Jābir (Muslim 1218) is the
 * backbone; individual rulings are cited at their steps.
 */

import {
  DUA_BETWEEN_CORNERS,
  DUA_BLACK_STONE,
  DUA_ENTER_MASJID,
  DUA_FIRST_SIGHT_KAABA,
  DUA_ISHTIRAT,
  DUA_MAQAM_VERSE,
  DUA_NIYYAH_UMRAH,
  DUA_ON_SAFA_MARWAH,
  DUA_SAFA_VERSE,
  DUA_ZAMZAM,
  TALBIYAH,
} from './duas';
import type { Journey } from './types';

export const UMRAH_JOURNEY: Journey = {
  kind: 'umrah',
  title: 'ʿUmrah',
  arabicTitle: 'الْعُمْرَة',
  tagline: 'The lesser pilgrimage — a sacred visit, performed in four pillars.',
  durationLabel: 'A few hours',
  stages: [
    /* ----------------------------------------------------------- *
     * Pillar 1 — Iḥrām
     * ----------------------------------------------------------- */
    {
      id: 'ihram',
      title: 'Iḥrām at the Mīqāt',
      arabicTitle: 'الْإِحْرَام',
      shortLabel: 'Iḥrām',
      caption: 'Enter the sacred state — purify, robe, intend, and call out.',
      steps: [
        {
          id: 'prepare-ihram',
          title: 'Prepare for iḥrām',
          arabicTitle: 'الاسْتِعْدَاد',
          scene: 'miqat',
          rank: 'sunnah',
          locationLabel: 'Before / at the Mīqāt',
          summary:
            'At the appointed station, cleanse and robe yourself as the Prophet ﷺ did, so that you cross into the sacred state prepared.',
          actions: [
            { id: 'ghusl', text: 'Perform ghusl (a full bath), as the Prophet ﷺ did for his iḥrām.' },
            {
              id: 'perfume',
              text: 'Apply perfume to the body — not the garments — before entering iḥrām.',
              detail: 'Its lingering trace afterwards is no harm; do not scent the iḥrām cloths themselves.',
            },
            {
              id: 'garments',
              text: 'Men: wear the two white unstitched cloths (izār and ridāʾ). Women: ordinary modest dress, without niqāb or gloves.',
            },
            { id: 'pray', text: 'Pray two rakʿahs (e.g. the obligatory prayer if due, or two of intention).' },
          ],
          daleel: [
            {
              source: 'hadith',
              reference: 'Jāmiʿ al-Tirmidhī 830',
              narrator: 'Zayd ibn Thābit',
              grade: 'Ḥasan',
              text: 'He saw the Prophet ﷺ strip for his iḥrām and perform ghusl.',
            },
          ],
          notes: [
            {
              id: 'women-menses',
              text: 'A menstruating woman still enters iḥrām and does everything except Ṭawāf around the House until she is pure.',
              gender: 'female',
              daleel: {
                source: 'hadith',
                reference: 'Ṣaḥīḥ al-Bukhārī 305, Muslim 1211',
                narrator: 'ʿĀʾishah',
                grade: 'Ṣaḥīḥ',
                text: 'The Prophet ﷺ told her: "Do as the pilgrim does, but do not circle the House until you are pure."',
              },
            },
          ],
          virtues: ['Every step toward the House is recorded; the journey itself is worship.'],
        },
        {
          id: 'niyyah-talbiyah',
          title: 'Intend ʿUmrah and raise the Talbiyah',
          arabicTitle: 'النِّيَّة وَالتَّلْبِيَة',
          scene: 'miqat',
          rank: 'rukn',
          locationLabel: 'At the Mīqāt',
          summary:
            'Make the intention in the heart to enter ʿUmrah, voice it once, and begin the Talbiyah — the proclamation that does not cease until the Ṭawāf.',
          actions: [
            { id: 'niyyah', text: 'Intend ʿUmrah in your heart and say it once: "Labbayka-llāhumma ʿumrah."' },
            { id: 'begin-talbiyah', text: 'Begin the Talbiyah, raising the voice (men) and softly (women), repeating it often.' },
            {
              id: 'ishtirat',
              text: 'If you fear illness or being prevented, add the safeguarding condition (ishtirāṭ).',
            },
          ],
          duas: [DUA_NIYYAH_UMRAH, TALBIYAH, DUA_ISHTIRAT],
          daleel: [
            {
              source: 'hadith',
              reference: 'Ṣaḥīḥ al-Bukhārī 1549, Muslim 1184',
              narrator: 'Ibn ʿUmar',
              grade: 'Ṣaḥīḥ',
              text: 'They raised the Talbiyah from the mīqāt, declaring the rite they intended.',
            },
          ],
          mistakes: [
            'Passing the mīqāt without iḥrām, then having to return or offer a sacrifice.',
            'Believing the intention must be uttered aloud at length — it is in the heart; the tongue merely affirms it once.',
          ],
        },
        {
          id: 'enter-haram',
          title: 'Enter Makkah and the Sacred Mosque',
          arabicTitle: 'دُخُول الْحَرَم',
          scene: 'kaaba',
          rank: 'sunnah',
          locationLabel: 'Al-Masjid al-Ḥarām',
          siteId: 'haram',
          summary:
            'Approach the House with humility. Enter the mosque with the right foot and the duʿā of entry; at the first sight of the Kaʿbah, supplicate — a moment hoped for acceptance.',
          actions: [
            { id: 'right-foot', text: 'Enter with the right foot, saying the duʿā of entering the mosque.' },
            { id: 'first-sight', text: 'At the first sight of the Kaʿbah, raise your hands and supplicate freely.' },
            { id: 'stop-talbiyah-soon', text: 'Continue the Talbiyah until you begin the Ṭawāf, then stop it.' },
          ],
          duas: [DUA_ENTER_MASJID, DUA_FIRST_SIGHT_KAABA],
          virtues: ['Duʿā at the first sight of the House is among the hoped-for moments of acceptance.'],
        },
      ],
    },

    /* ----------------------------------------------------------- *
     * Pillar 2 — Ṭawāf
     * ----------------------------------------------------------- */
    {
      id: 'tawaf',
      title: 'Ṭawāf of the House',
      arabicTitle: 'الطَّوَاف',
      shortLabel: 'Ṭawāf',
      caption: 'Seven circuits around the Kaʿbah, beginning and ending at the Black Stone.',
      steps: [
        {
          id: 'tawaf-circuits',
          title: 'Circle the Kaʿbah seven times',
          arabicTitle: 'سَبْعَة أَشْوَاط',
          scene: 'tawaf',
          rank: 'rukn',
          locationLabel: 'Around the Kaʿbah',
          siteId: 'haram',
          summary:
            'Keeping the Kaʿbah on your left, complete seven circuits. Begin each at the Black Stone with the takbīr, and seal the rite with remembrance and duʿā.',
          counter: { kind: 'tawaf', total: 7, unitLabel: 'circuit', unitLabelPlural: 'circuits' },
          actions: [
            {
              id: 'istilam',
              text: 'Begin at the Black Stone: kiss it, or touch it and kiss the hand, or — if crowded — point to it and say "Allāhu akbar".',
              detail: 'Never harm others to reach it; pointing from afar fulfils the Sunnah.',
            },
            { id: 'kaaba-left', text: 'Keep the Kaʿbah on your left and circle anticlockwise, seven full circuits.' },
            {
              id: 'yamani',
              text: 'At the Yamānī corner, touch it if easy (no kissing, no pointing if you cannot reach it).',
            },
            {
              id: 'between-corners',
              text: 'Between the Yamānī corner and the Black Stone, recite "Rabbanā ātinā…"',
            },
            { id: 'finish', text: 'Complete the seventh circuit at the Black Stone, ending as you began.' },
          ],
          duas: [DUA_BLACK_STONE, DUA_BETWEEN_CORNERS],
          daleel: [
            {
              source: 'hadith',
              reference: 'Ṣaḥīḥ al-Bukhārī 1614, Muslim 1261',
              narrator: 'Ibn ʿUmar / Ibn ʿAbbās',
              grade: 'Ṣaḥīḥ',
              text: 'The Prophet ﷺ circled the House seven times, touching the Black Stone and the Yamānī corner.',
            },
          ],
          notes: [
            {
              id: 'idtiba',
              text: 'Men: uncover the right shoulder (iḍṭibāʿ) throughout this Ṭawāf, re-covering it for the prayer afterwards.',
              gender: 'male',
              daleel: {
                source: 'hadith',
                reference: 'Sunan Abī Dāwūd 1883',
                narrator: 'Yaʿlā ibn Umayyah',
                grade: 'Ṣaḥīḥ',
                text: 'The Prophet ﷺ performed Ṭawāf with the right shoulder uncovered.',
              },
            },
            {
              id: 'raml',
              text: 'Men: walk briskly with short, vigorous steps (raml) in the first three circuits, then walk normally in the last four.',
              gender: 'male',
              daleel: {
                source: 'hadith',
                reference: 'Ṣaḥīḥ al-Bukhārī 1644, Muslim 1261',
                narrator: 'Ibn ʿUmar',
                grade: 'Ṣaḥīḥ',
                text: 'The Prophet ﷺ did raml in the first three circuits and walked in the last four.',
              },
            },
            {
              id: 'wudu',
              text: 'The majority hold ritual purity (wuḍūʾ) is a condition for Ṭawāf; the Ḥanafīs hold its absence does not invalidate it but requires a compensatory sacrifice.',
              madhhab: ['hanafi'],
            },
          ],
          mistakes: [
            'Fighting through the crowd to kiss the Stone and harming others — pointing to it suffices.',
            'Wiping the body or face on the Kaʿbah’s cloth or the Maqām seeking blessing — no basis for this.',
            'Reciting a fixed scripted duʿā per circuit aloud in unison — there is no specific text except that between the corners.',
          ],
        },
        {
          id: 'maqam-prayer',
          title: 'Pray two rakʿahs at the Station of Ibrāhīm',
          arabicTitle: 'رَكْعَتَا الطَّوَاف',
          scene: 'maqam',
          rank: 'sunnah',
          locationLabel: 'Behind Maqām Ibrāhīm',
          siteId: 'haram',
          summary:
            'After the seventh circuit, cover the shoulder and pray two short rakʿahs behind the Station of Ibrāhīm, if possible — otherwise anywhere in the mosque.',
          actions: [
            { id: 'approach', text: 'Recite "Wa-ttakhidhū min maqāmi Ibrāhīma muṣallā" as you approach the Maqām.' },
            {
              id: 'two-rakahs',
              text: 'Pray two rakʿahs: Sūrat al-Kāfirūn in the first, al-Ikhlāṣ in the second (the Prophet’s practice).',
            },
            { id: 'crowded', text: 'If the Maqām is crowded, pray these two rakʿahs anywhere in the mosque — do not push.' },
          ],
          duas: [DUA_MAQAM_VERSE],
          daleel: [
            {
              source: 'hadith',
              reference: 'Ṣaḥīḥ Muslim 1218',
              narrator: 'Jābir',
              grade: 'Ṣaḥīḥ',
              text: 'He ﷺ prayed two rakʿahs behind the Maqām, reciting al-Kāfirūn and al-Ikhlāṣ.',
            },
          ],
        },
        {
          id: 'zamzam',
          title: 'Drink Zamzam',
          arabicTitle: 'مَاء زَمْزَم',
          scene: 'zamzam',
          rank: 'sunnah',
          locationLabel: 'The Zamzam fountains',
          siteId: 'haram',
          summary:
            'Drink your fill of the blessed water of Zamzam — "for whatever it is drunk for" — and supplicate.',
          actions: [
            { id: 'drink', text: 'Drink Zamzam to your fill; some pour a little over the head.' },
            { id: 'dua', text: 'Supplicate with a sincere need — the water is for whatever it is drunk for.' },
          ],
          duas: [DUA_ZAMZAM],
          virtues: ['Zamzam is blessed water and a food that satisfies (Muslim 2473).'],
        },
      ],
    },

    /* ----------------------------------------------------------- *
     * Pillar 3 — Saʿī
     * ----------------------------------------------------------- */
    {
      id: 'sai',
      title: 'Saʿī between Ṣafā and Marwah',
      arabicTitle: 'السَّعْي',
      shortLabel: 'Saʿī',
      caption: 'Seven trips between the two hills — re-living Hājar’s search for water.',
      steps: [
        {
          id: 'sai-trips',
          title: 'Walk seven trips Ṣafā ⇄ Marwah',
          arabicTitle: 'سَبْعَة أَشْوَاط',
          scene: 'sai',
          rank: 'rukn',
          locationLabel: 'The Masʿā (Ṣafā → Marwah)',
          siteId: 'safa-marwah',
          summary:
            'Begin at Ṣafā and end at Marwah; each one-way crossing counts as one trip, so seven trips end upon Marwah. Upon each hill, face the Qiblah and proclaim Allah’s greatness.',
          counter: { kind: 'sai', total: 7, unitLabel: 'trip', unitLabelPlural: 'trips' },
          actions: [
            { id: 'safa-verse', text: 'At the foot of Ṣafā recite the verse (2:158) once, and say "I begin with what Allah began with".' },
            { id: 'on-safa', text: 'Climb Ṣafā, face the Qiblah, raise the hands and say the dhikr three times, supplicating between.' },
            { id: 'walk', text: 'Walk toward Marwah; do the like upon Marwah. Ṣafā → Marwah is one trip; Marwah → Ṣafā is the next.' },
            { id: 'end-marwah', text: 'Complete the seventh trip upon Marwah.' },
          ],
          duas: [DUA_SAFA_VERSE, DUA_ON_SAFA_MARWAH],
          daleel: [
            {
              source: 'quran',
              reference: 'Qurʾān 2:158',
              text: '"Indeed Ṣafā and Marwah are among the symbols of Allah…"',
            },
            {
              source: 'hadith',
              reference: 'Ṣaḥīḥ Muslim 1218',
              narrator: 'Jābir',
              grade: 'Ṣaḥīḥ',
              text: 'He ﷺ began with Ṣafā, climbed it, faced the Qiblah, and made it seven trips, ending at Marwah.',
            },
          ],
          notes: [
            {
              id: 'green-zone',
              text: 'Men: jog briskly between the two green markers (where the valley once dipped); walk the rest. Women walk throughout.',
              gender: 'male',
              daleel: {
                source: 'hadith',
                reference: 'Ṣaḥīḥ Muslim 1218',
                narrator: 'Jābir',
                grade: 'Ṣaḥīḥ',
                text: 'When his feet reached the valley floor he ﷺ jogged until he climbed out of it.',
              },
            },
            {
              id: 'purity-not-required',
              text: 'Ritual purity is recommended but not a condition for Saʿī; a menstruating woman may perform it (after her Ṭawāf becomes valid).',
            },
          ],
          mistakes: [
            'Counting a return as part of one trip — so ending at Ṣafā thinking seven are done. Seven trips end at Marwah.',
            'Women jogging in the green zone — the brisk pace is for men only.',
          ],
          virtues: ['In the Saʿī the believer re-lives the trust and striving of Hājar — beloved to Allah.'],
        },
      ],
    },

    /* ----------------------------------------------------------- *
     * Pillar 4 — Ḥalq / Taqṣīr
     * ----------------------------------------------------------- */
    {
      id: 'halq',
      title: 'Ḥalq or Taqṣīr — release from iḥrām',
      arabicTitle: 'الْحَلْق وَالتَّقْصِير',
      shortLabel: 'Taḥallul',
      caption: 'Shave or trim the hair — and the ʿUmrah is complete.',
      steps: [
        {
          id: 'halq-taqsir',
          title: 'Shave or shorten the hair',
          arabicTitle: 'الْحَلْق أَو التَّقْصِير',
          scene: 'halq',
          rank: 'wajib',
          locationLabel: 'After the Saʿī',
          summary:
            'Men shave the whole head (greater reward) or shorten it evenly; women gather the hair and trim a fingertip’s length from the ends. With this, iḥrām is released and the ʿUmrah is complete.',
          actions: [
            { id: 'men', text: 'Men: shave the entire head (afḍal) or shorten all of it evenly.' },
            { id: 'women', text: 'Women: gather the hair and cut about a fingertip’s length (≈ 2–3 cm) from the ends.' },
            { id: 'tahallul', text: 'With this, the iḥrām is released — its prohibitions lift and the ʿUmrah is complete.' },
          ],
          daleel: [
            {
              source: 'hadith',
              reference: 'Ṣaḥīḥ al-Bukhārī 1727, Muslim 1301',
              narrator: 'Ibn ʿUmar',
              grade: 'Ṣaḥīḥ',
              text: 'The Prophet ﷺ supplicated three times for those who shaved and once for those who shortened.',
            },
          ],
          notes: [
            {
              id: 'shaving-better',
              text: 'Shaving carries the greater reward for men; one who has little time before Ḥajj (tamattuʿ) may shorten now and shave after Ḥajj.',
              gender: 'male',
            },
            {
              id: 'women-no-shave',
              text: 'Women never shave the head — they only shorten the ends.',
              gender: 'female',
            },
          ],
          mistakes: [
            'Trimming only a few hairs rather than from all of the head/ends.',
            'Men shaving part and leaving part (qazaʿ) — shave or shorten all of it.',
          ],
          virtues: ['The Prophet ﷺ supplicated for forgiveness and mercy for those who shaved their heads.'],
        },
      ],
    },
  ],
};
