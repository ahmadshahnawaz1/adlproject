/**
 * hajj.ts — the journey of Ḥajj, day by day, the fifth pillar of Islam. The
 * rites run from the 8th of Dhū al-Ḥijjah (Tarwiyah) through ʿArafah (9th),
 * the Day of Sacrifice (10th) and the days of Tashrīq (11th–13th), sealed by
 * the Farewell Ṭawāf.
 *
 * The three types are shown inline: tamattuʿ (ʿUmrah then Ḥajj, with a hady),
 * qirān (both together, with a hady), and ifrād (Ḥajj alone, no hady). Steps
 * that apply only to certain types carry `hajjTypes`; the rest apply to all.
 *
 * Backbone: the Farewell Pilgrimage of the Prophet ﷺ (Muslim 1218); rulings
 * cited at their steps.
 */

import {
  DUA_ARAFAH,
  DUA_MASHAR,
  DUA_NIYYAH_HAJJ,
  TALBIYAH,
} from './duas';
import type { Journey } from './types';

export const HAJJ_JOURNEY: Journey = {
  kind: 'hajj',
  title: 'Ḥajj',
  arabicTitle: 'الْحَجّ',
  tagline: 'The fifth pillar — five days of standing, striving and surrender.',
  durationLabel: '5–6 days (8th–13th Dhū al-Ḥijjah)',
  stages: [
    /* ----------------------------------------------------------- *
     * Preparation — type & iḥrām
     * ----------------------------------------------------------- */
    {
      id: 'preparation',
      title: 'Choose your Ḥajj and enter iḥrām',
      arabicTitle: 'النِّيَّة وَالْإِحْرَام',
      shortLabel: 'Prepare',
      caption: 'Decide how you will perform Ḥajj, then enter the sacred state.',
      steps: [
        {
          id: 'choose-type',
          title: 'Choose the type of Ḥajj',
          arabicTitle: 'أَنْوَاع الْحَجّ',
          scene: 'map',
          rank: 'sunnah',
          summary:
            'Ḥajj is performed in one of three ways. Choose yours — the steps adapt, and the others stay visible so you understand the whole.',
          actions: [
            {
              id: 'tamattu',
              text: 'Tamattuʿ: perform a full ʿUmrah on arrival, exit iḥrām, then enter iḥrām again for Ḥajj on the 8th. A hady (sacrifice) is due.',
              detail: 'The most common today, and what the Prophet ﷺ commanded those without a hady to do.',
            },
            {
              id: 'qiran',
              text: 'Qirān: intend ʿUmrah and Ḥajj together under one iḥrām from the mīqāt, not exiting until the 10th. A hady is due.',
            },
            {
              id: 'ifrad',
              text: 'Ifrād: intend Ḥajj alone from the mīqāt. No hady is due for the rite itself.',
            },
          ],
          daleel: [
            {
              source: 'hadith',
              reference: 'Ṣaḥīḥ al-Bukhārī 1572, Muslim 1211',
              narrator: 'ʿĀʾishah',
              grade: 'Ṣaḥīḥ',
              text: 'The Companions entered iḥrām variously — for Ḥajj, for ʿUmrah, and for both together — under the Prophet’s ﷺ guidance.',
            },
          ],
          notes: [
            {
              id: 'tamattu-umrah-first',
              text: 'Tamattuʿ pilgrims: complete the ʿUmrah journey first (Iḥrām → Ṭawāf → Saʿī → Taqṣīr), then resume here on the 8th.',
            },
          ],
        },
        {
          id: 'ihram-hajj',
          title: 'Enter iḥrām for Ḥajj',
          arabicTitle: 'إِحْرَام الْحَجّ',
          scene: 'miqat',
          rank: 'rukn',
          locationLabel: '8th Dhū al-Ḥijjah (or at the mīqāt)',
          summary:
            'Renew purity and intention, robe again, and raise the Talbiyah for Ḥajj. Qirān and ifrād pilgrims are already in iḥrām from the mīqāt.',
          actions: [
            { id: 'ghusl', text: 'Tamattuʿ: perform ghusl, perfume the body, robe, and intend Ḥajj from your lodging in Makkah.' },
            { id: 'niyyah', text: 'Intend Ḥajj and say once: "Labbayka-llāhumma ḥajjā."' },
            { id: 'talbiyah', text: 'Raise the Talbiyah, repeating it abundantly until you pelt al-ʿAqabah on the 10th.' },
          ],
          duas: [DUA_NIYYAH_HAJJ, TALBIYAH],
          notes: [
            {
              id: 'already-muhrim',
              text: 'Qirān and ifrād pilgrims do not re-enter iḥrām — they remain in the iḥrām assumed at the mīqāt.',
            },
            {
              id: 'qudum',
              text: 'Qirān/ifrād pilgrims who reached Makkah earlier are recommended a Ṭawāf of arrival (ṭawāf al-qudūm).',
            },
          ],
        },
      ],
    },

    /* ----------------------------------------------------------- *
     * Day 8 — Tarwiyah (to Minā)
     * ----------------------------------------------------------- */
    {
      id: 'day8-tarwiyah',
      title: 'Day of Tarwiyah — to Minā',
      arabicTitle: 'يَوْم التَّرْوِيَة',
      shortLabel: 'Minā · 8',
      caption: 'Set out to Minā and spend the day and night in prayer.',
      hijriDay: 8,
      steps: [
        {
          id: 'to-mina',
          title: 'Go to Minā and pray there',
          arabicTitle: 'الْخُرُوج إِلَى مِنًى',
          scene: 'mina',
          rank: 'sunnah',
          locationLabel: 'Minā',
          siteId: 'mina',
          summary:
            'On the morning of the 8th, travel to Minā. Pray Dhuhr, ʿAṣr, Maghrib, ʿishāʾ and the next Fajr there, shortening the four-unit prayers without combining them, and stay the night.',
          actions: [
            { id: 'travel', text: 'Travel to Minā in the morning, raising the Talbiyah along the way.' },
            { id: 'qasr', text: 'Shorten the four-rakʿah prayers to two (qaṣr); do not combine them — each in its own time.' },
            { id: 'night', text: 'Spend the night in Minā (a sunnah of the Prophet ﷺ), in worship and rest.' },
          ],
          daleel: [
            {
              source: 'hadith',
              reference: 'Sunan Abī Dāwūd 1911',
              narrator: 'Ibn ʿUmar',
              grade: 'Ṣaḥīḥ',
              text: 'The Prophet ﷺ prayed Dhuhr, ʿAṣr, Maghrib, ʿishāʾ and Fajr at Minā, then set out to ʿArafah.',
            },
          ],
          notes: [
            {
              id: 'mina-night-sunnah',
              text: 'Staying in Minā on the night before ʿArafah is a confirmed sunnah, not an obligation; modern logistics sometimes move pilgrims directly.',
            },
          ],
        },
      ],
    },

    /* ----------------------------------------------------------- *
     * Day 9 — ʿArafah & Muzdalifah (the greatest day)
     * ----------------------------------------------------------- */
    {
      id: 'day9-arafah',
      title: 'Day of ʿArafah',
      arabicTitle: 'يَوْم عَرَفَة',
      shortLabel: 'ʿArafah · 9',
      caption: 'The standing — "Ḥajj is ʿArafah." Then the night at Muzdalifah.',
      hijriDay: 9,
      steps: [
        {
          id: 'namira-prayers',
          title: 'To ʿArafah; combine Dhuhr and ʿAṣr',
          arabicTitle: 'صَلَاة الظُّهْر وَالْعَصْر',
          scene: 'arafah',
          rank: 'sunnah',
          locationLabel: 'Namirah / ʿArafah',
          siteId: 'arafah',
          summary:
            'After sunrise on the 9th, move to ʿArafah. At its time, pray Dhuhr and ʿAṣr together and shortened (two and two) with one adhān and two iqāmahs — following the Prophet’s ﷺ practice at Namirah.',
          actions: [
            { id: 'arrive', text: 'Ensure you are within the boundary of ʿArafah (all of it is a standing-place, save the valley of ʿUranah).' },
            { id: 'combine', text: 'Pray Dhuhr then ʿAṣr, joined and shortened, at the time of Dhuhr.' },
            { id: 'free', text: 'Then devote the rest of the day entirely to standing and supplication.' },
          ],
          daleel: [
            {
              source: 'hadith',
              reference: 'Ṣaḥīḥ Muslim 1218',
              narrator: 'Jābir',
              grade: 'Ṣaḥīḥ',
              text: 'At Namirah he ﷺ prayed Dhuhr and ʿAṣr together with one adhān and two iqāmahs, then rode to the standing-place.',
            },
          ],
        },
        {
          id: 'wuquf',
          title: 'Stand at ʿArafah until sunset',
          arabicTitle: 'الْوُقُوف بِعَرَفَة',
          scene: 'arafah',
          rank: 'rukn',
          locationLabel: 'The plain of ʿArafah',
          siteId: 'arafah',
          summary:
            'This is the greatest pillar — "Ḥajj is ʿArafah." Face the Qiblah, raise the hands, and pour out supplication from past noon until the sun sets. Miss this standing and the Ḥajj is missed.',
          actions: [
            { id: 'face-qibla', text: 'Face the Qiblah, raise your hands, and humble yourself before Allah.' },
            { id: 'supplicate', text: 'Supplicate abundantly — for yourself, your loved ones, the Ummah — with the best duʿā of this day.' },
            { id: 'until-sunset', text: 'Remain until the sun has fully set; do not leave the plain before then.' },
          ],
          duas: [DUA_ARAFAH],
          daleel: [
            {
              source: 'hadith',
              reference: 'Jāmiʿ al-Tirmidhī 889, Sunan an-Nasāʾī 3016',
              narrator: 'ʿAbd al-Raḥmān ibn Yaʿmar',
              grade: 'Ṣaḥīḥ',
              text: 'The Prophet ﷺ said: "Ḥajj is ʿArafah. Whoever reaches ʿArafah before dawn (of the 10th) has caught the Ḥajj."',
            },
          ],
          mistakes: [
            'Leaving ʿArafah before sunset — omitting part of the greatest pillar without need.',
            'Standing facing Jabal al-Raḥmah instead of the Qiblah, or climbing the mount believing it obligatory — it is not.',
            'Spending the day in idle talk and photos rather than in earnest duʿā.',
          ],
          virtues: ['On no day are more freed from the Fire than the Day of ʿArafah (Muslim 1348).'],
        },
        {
          id: 'to-muzdalifah',
          title: 'Night at Muzdalifah',
          arabicTitle: 'الْمَبِيت بِمُزْدَلِفَة',
          scene: 'muzdalifah',
          rank: 'wajib',
          locationLabel: 'Muzdalifah',
          siteId: 'muzdalifah',
          summary:
            'After sunset, move calmly to Muzdalifah. Pray Maghrib and ʿishāʾ together there (ʿishāʾ shortened), rest the night, gather pebbles, and after Fajr stand in remembrance until it grows light.',
          actions: [
            { id: 'combine', text: 'On arrival, pray Maghrib (three) and ʿishāʾ (two) together with one adhān and two iqāmahs.' },
            { id: 'rest', text: 'Sleep and rest — the Prophet ﷺ did not pray voluntary prayers between them, but slept until Fajr.' },
            { id: 'pebbles', text: 'Gather pebbles for the pelting (seven for the 10th suffice; the rest can be gathered in Minā).' },
            { id: 'fajr-dhikr', text: 'After Fajr, face the Qiblah at al-Mashʿar al-Ḥarām and supplicate until just before sunrise.' },
          ],
          duas: [DUA_MASHAR],
          daleel: [
            {
              source: 'hadith',
              reference: 'Ṣaḥīḥ Muslim 1218',
              narrator: 'Jābir',
              grade: 'Ṣaḥīḥ',
              text: 'He ﷺ combined Maghrib and ʿishāʾ at Muzdalifah, slept, prayed Fajr, then stood at al-Mashʿar until it grew very light.',
            },
          ],
          notes: [
            {
              id: 'weak-leave',
              text: 'The weak — women, children, the elderly — may leave Muzdalifah after midnight to avoid the crush, by the Prophet’s ﷺ concession.',
              daleel: {
                source: 'hadith',
                reference: 'Ṣaḥīḥ al-Bukhārī 1678, Muslim 1295',
                narrator: 'Ibn ʿAbbās / ʿĀʾishah',
                grade: 'Ṣaḥīḥ',
                text: 'He ﷺ permitted the weak among his family to leave Muzdalifah by night.',
              },
            },
          ],
        },
      ],
    },

    /* ----------------------------------------------------------- *
     * Day 10 — al-Naḥr (the Day of Sacrifice / Eid)
     * ----------------------------------------------------------- */
    {
      id: 'day10-nahr',
      title: 'Day of Sacrifice (ʿĪd)',
      arabicTitle: 'يَوْم النَّحْر',
      shortLabel: 'Naḥr · 10',
      caption: 'Pelt, sacrifice, shave, and return to the House. The busiest day.',
      hijriDay: 10,
      steps: [
        {
          id: 'rami-aqaba',
          title: 'Pelt Jamrat al-ʿAqabah (7 pebbles)',
          arabicTitle: 'رَمْي جَمْرَة الْعَقَبَة',
          scene: 'jamarat',
          rank: 'wajib',
          locationLabel: 'Minā — the large Jamrah',
          siteId: 'jamarat',
          summary:
            'On reaching Minā, pelt the large pillar (al-ʿAqabah) with seven pebbles, saying "Allāhu akbar" with each. With this, the Talbiyah ends.',
          counter: { kind: 'rami', total: 7, unitLabel: 'pebble', unitLabelPlural: 'pebbles' },
          actions: [
            { id: 'seven', text: 'Throw seven pebbles, one by one, into the basin — saying "Allāhu akbar" with each.' },
            { id: 'stop-talbiyah', text: 'Stop the Talbiyah with the first pebble.' },
          ],
          daleel: [
            {
              source: 'hadith',
              reference: 'Ṣaḥīḥ Muslim 1218',
              narrator: 'Jābir',
              grade: 'Ṣaḥīḥ',
              text: 'He ﷺ pelted al-ʿAqabah with seven pebbles, saying the takbīr with each, from the valley.',
            },
          ],
          mistakes: [
            'Hurling large stones or shoes in anger — small pebbles suffice; it is an act of remembrance.',
            'Continuing the Talbiyah after beginning to pelt al-ʿAqabah.',
          ],
        },
        {
          id: 'hady',
          title: 'Offer the sacrifice (hady)',
          arabicTitle: 'الْهَدْي',
          scene: 'mina',
          rank: 'wajib',
          locationLabel: 'Minā / Makkah',
          summary:
            'Tamattuʿ and qirān pilgrims offer a sacrifice in gratitude. One who cannot fasts three days in Ḥajj and seven on returning home (Qurʾān 2:196).',
          hajjTypes: ['tamattu', 'qiran'],
          actions: [
            { id: 'slaughter', text: 'Have a sheep (or a seventh of a camel/cow) slaughtered — usually via an authorised agency or sacrifice voucher.' },
            { id: 'fast-alt', text: 'If unable to afford it: fast three days during Ḥajj and seven after returning home.' },
          ],
          daleel: [
            {
              source: 'quran',
              reference: 'Qurʾān 2:196',
              text: '"…then whatever hady is feasible. And whoever cannot — a fast of three days during Ḥajj and seven when you return: ten complete."',
            },
          ],
          notes: [
            {
              id: 'ifrad-no-hady',
              text: 'Ifrād pilgrims owe no hady for the rite; any sacrifice they make is voluntary.',
            },
          ],
        },
        {
          id: 'halq-nahr',
          title: 'Shave or shorten — the first release',
          arabicTitle: 'الْحَلْق (التَّحَلُّل الْأَوَّل)',
          scene: 'halq',
          rank: 'wajib',
          locationLabel: 'Minā',
          summary:
            'Men shave the head (greater reward) or shorten; women trim a fingertip’s length. With this comes the first taḥallul — all iḥrām prohibitions lift except intimacy with one’s spouse.',
          actions: [
            { id: 'men', text: 'Men: shave the whole head (afḍal) or shorten it evenly.' },
            { id: 'women', text: 'Women: trim about a fingertip’s length from the ends.' },
            { id: 'first-tahallul', text: 'The first release: ordinary clothes, scent and most prohibitions return — only marital intimacy remains until the second release.' },
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
              id: 'order-flexible',
              text: 'The acts of the 10th — pelting, sacrifice, shaving, Ṭawāf — may be done out of order without harm; the Prophet ﷺ was asked about each and said: "Do it, no harm."',
              daleel: {
                source: 'hadith',
                reference: 'Ṣaḥīḥ al-Bukhārī 1721, Muslim 1306',
                narrator: 'Ibn ʿAbbās',
                grade: 'Ṣaḥīḥ',
                text: 'On the Day of Sacrifice he ﷺ was asked about doing the rites out of order and replied each time: "Do it, no harm."',
              },
            },
          ],
        },
        {
          id: 'tawaf-ifadah',
          title: 'Ṭawāf al-Ifāḍah (and Saʿī) — the second release',
          arabicTitle: 'طَوَاف الْإِفَاضَة',
          scene: 'tawaf',
          rank: 'rukn',
          locationLabel: 'Al-Masjid al-Ḥarām',
          siteId: 'haram',
          summary:
            'Go to Makkah and perform Ṭawāf al-Ifāḍah — a pillar of Ḥajj — followed by the Saʿī (for tamattuʿ, and for qirān/ifrād who did not do it after the arrival Ṭawāf). This completes the second and full taḥallul.',
          actions: [
            { id: 'tawaf', text: 'Perform seven circuits of Ṭawāf al-Ifāḍah — a pillar without which Ḥajj is incomplete.' },
            { id: 'sai', text: 'Perform the Saʿī (seven trips) if it is due upon you for Ḥajj.' },
            { id: 'second-tahallul', text: 'With this, the full taḥallul: every prohibition of iḥrām, including marital relations, is lifted.' },
          ],
          daleel: [
            {
              source: 'quran',
              reference: 'Qurʾān 22:29',
              text: '"…and let them circle the Ancient House."',
            },
          ],
          notes: [
            {
              id: 'ifadah-timing',
              text: 'Ṭawāf al-Ifāḍah may be delayed until the days of Tashrīq or even later if needed; many combine it with the Farewell Ṭawāf when leaving.',
            },
            {
              id: 'tamattu-sai',
              text: 'Tamattuʿ pilgrims perform a fresh Saʿī now; qirān and ifrād pilgrims who already did Saʿī after the arrival Ṭawāf do not repeat it.',
            },
          ],
        },
      ],
    },

    /* ----------------------------------------------------------- *
     * Days 11–13 — Tashrīq
     * ----------------------------------------------------------- */
    {
      id: 'tashriq',
      title: 'Days of Tashrīq',
      arabicTitle: 'أَيَّام التَّشْرِيق',
      shortLabel: 'Tashrīq · 11–13',
      caption: 'Stay in Minā; pelt the three Jamarāt each afternoon.',
      hijriDay: 11,
      steps: [
        {
          id: 'mina-nights',
          title: 'Stay overnight in Minā',
          arabicTitle: 'الْمَبِيت بِمِنًى',
          scene: 'mina',
          rank: 'wajib',
          locationLabel: 'Minā',
          siteId: 'mina',
          summary:
            'Spend the nights of the 11th and 12th (and the 13th, if staying) in Minā — a place of remembrance, eating, and the takbīr.',
          actions: [
            { id: 'stay', text: 'Pass the nights of Tashrīq in Minā, in dhikr and the takbīr after the prayers.' },
            { id: 'eat', text: 'These are "days of eating and drinking and remembrance of Allah" — fasting them is forbidden.' },
          ],
          daleel: [
            {
              source: 'hadith',
              reference: 'Ṣaḥīḥ Muslim 1141',
              narrator: 'Nubayshah al-Hudhalī',
              grade: 'Ṣaḥīḥ',
              text: 'The Prophet ﷺ said: "The days of Tashrīq are days of eating, drinking and remembrance of Allah."',
            },
          ],
        },
        {
          id: 'rami-tashriq',
          title: 'Pelt the three Jamarāt (each afternoon)',
          arabicTitle: 'رَمْي الْجَمَرَات',
          scene: 'jamarat',
          rank: 'wajib',
          locationLabel: 'Minā — the three Jamarāt',
          siteId: 'jamarat',
          summary:
            'After Dhuhr each day, pelt the three pillars in order — al-Ṣughrā (small), al-Wusṭā (middle), then al-ʿAqabah (large) — seven pebbles each, supplicating at length after the first two.',
          counter: { kind: 'rami', total: 21, unitLabel: 'pebble', unitLabelPlural: 'pebbles' },
          actions: [
            { id: 'order', text: 'Begin after the sun passes its zenith (Dhuhr). Pelt al-Ṣughrā first — seven pebbles with takbīr.' },
            { id: 'pause1', text: 'Step aside, face the Qiblah, and supplicate at length.' },
            { id: 'wusta', text: 'Pelt al-Wusṭā — seven pebbles — then again pause and supplicate at length.' },
            { id: 'aqaba', text: 'Pelt al-ʿAqabah last — seven pebbles — and do not pause after it.' },
          ],
          daleel: [
            {
              source: 'hadith',
              reference: 'Ṣaḥīḥ al-Bukhārī 1751',
              narrator: 'Ibn ʿUmar',
              grade: 'Ṣaḥīḥ',
              text: 'He pelted al-Ṣughrā with seven, then stood long supplicating; then al-Wusṭā likewise; then al-ʿAqabah without standing after it — saying this is how the Prophet ﷺ did it.',
            },
          ],
          notes: [
            {
              id: 'order-matters',
              text: 'Unlike the acts of the 10th, the order of the three Jamarāt (small → middle → large) is required; the time begins after midday.',
            },
            {
              id: 'weak-delegate',
              text: 'The weak or ill may appoint someone to pelt on their behalf; the agent pelts for himself first, then for the one he represents.',
            },
          ],
          mistakes: [
            'Pelting before Dhuhr on the days of Tashrīq, or out of order (large before small).',
            'Failing to supplicate after the first two pillars — a noticed sunnah of the standing.',
          ],
        },
        {
          id: 'taajjul',
          title: 'Hasten on the 12th, or stay for the 13th',
          arabicTitle: 'التَّعَجُّل وَالتَّأَخُّر',
          scene: 'mina',
          rank: 'sunnah',
          locationLabel: 'Minā',
          summary:
            'You may leave Minā after pelting on the 12th before sunset (taʿajjul), or stay to pelt again on the 13th (taʾakhkhur) — and staying is better. Whoever is overtaken by sunset of the 12th in Minā stays for the 13th.',
          actions: [
            { id: 'hasten', text: 'To hasten: complete the 12th’s pelting and leave Minā before sunset.' },
            { id: 'stay', text: 'To stay (better): remain the night of the 13th and pelt the three again after Dhuhr.' },
          ],
          daleel: [
            {
              source: 'quran',
              reference: 'Qurʾān 2:203',
              text: '"Whoever hastens in two days — no sin upon him; and whoever delays — no sin upon him — for one who fears Allah."',
            },
          ],
        },
      ],
    },

    /* ----------------------------------------------------------- *
     * Farewell
     * ----------------------------------------------------------- */
    {
      id: 'farewell',
      title: 'Farewell Ṭawāf',
      arabicTitle: 'طَوَاف الْوَدَاع',
      shortLabel: 'Wadāʿ',
      caption: 'Let your last act in Makkah be a circling of the House.',
      steps: [
        {
          id: 'tawaf-wada',
          title: 'Ṭawāf al-Wadāʿ before departing',
          arabicTitle: 'طَوَاف الْوَدَاع',
          scene: 'farewell',
          rank: 'wajib',
          locationLabel: 'Al-Masjid al-Ḥarām',
          siteId: 'haram',
          summary:
            'When ready to leave Makkah, perform a final Ṭawāf of seven circuits, so that the last of your covenant is with the Sacred House. Menstruating women are excused from it.',
          actions: [
            { id: 'last-act', text: 'Make this your last act before leaving — seven circuits, then depart.' },
            { id: 'no-sai', text: 'No Saʿī follows it; two rakʿahs of Ṭawāf, then leave with a heart attached to the House.' },
          ],
          daleel: [
            {
              source: 'hadith',
              reference: 'Ṣaḥīḥ al-Bukhārī 1755, Muslim 1328',
              narrator: 'Ibn ʿAbbās',
              grade: 'Ṣaḥīḥ',
              text: 'The people were ordered that the last of their acts be at the House, except that it was lightened for the menstruating woman.',
            },
          ],
          notes: [
            {
              id: 'menses-excused',
              text: 'A menstruating woman leaves without the Farewell Ṭawāf and owes nothing for it.',
              gender: 'female',
            },
          ],
          virtues: ['An accepted Ḥajj has no reward but Paradise (al-Bukhārī 1773).'],
        },
      ],
    },
  ],
};
