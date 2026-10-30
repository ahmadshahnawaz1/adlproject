/**
 * ihram.ts — the state of iḥrām: where it is assumed (the mawāqīt), what it
 * forbids (the maḥdhūrāt), and the expiations (fidya) for its violations.
 *
 * Iḥrām is both an intention and a sacred state. The pilgrim makes the niyyah
 * at (or before passing) the appointed station, dons its garments, begins the
 * Talbiyah, and then refrains from a set of otherwise-permitted things until
 * the rites release them. The data here feeds the IhramGuideCard and the
 * iḥrām step of both journeys.
 */

import type { Mahdhur, Miqat } from './types';

/* ------------------------------------------------------------------ *
 * The five mawāqīt — the stations of iḥrām
 * ------------------------------------------------------------------ *
 * The Prophet ﷺ fixed these for the people of the named regions and for any
 * who pass them intending Ḥajj or ʿUmrah (al-Bukhārī 1524, Muslim 1181). One
 * who lives nearer than a mīqāt assumes iḥrām from their own place; the people
 * of Makkah assume Ḥajj from Makkah itself.
 */
export const MAWAQIT: Miqat[] = [
  {
    id: 'dhul-hulayfah',
    name: 'Dhū al-Ḥulayfah (Abyār ʿAlī)',
    arabicName: 'ذُو الْحُلَيْفَة',
    forText: 'People of Madinah and those passing through it',
    coords: { latitude: 24.4139, longitude: 39.5728 },
    approxKmFromMakkah: 410,
  },
  {
    id: 'juhfah',
    name: 'Al-Juḥfah (near Rābigh)',
    arabicName: 'الْجُحْفَة',
    forText: 'People of Shām, Egypt, the Maghrib and those beyond',
    coords: { latitude: 22.7, longitude: 39.13 },
    approxKmFromMakkah: 187,
  },
  {
    id: 'qarn-al-manazil',
    name: 'Qarn al-Manāzil (As-Sayl al-Kabīr)',
    arabicName: 'قَرْن الْمَنَازِل',
    forText: 'People of Najd and those approaching from the east (incl. Ṭāʾif)',
    coords: { latitude: 21.6286, longitude: 40.3447 },
    approxKmFromMakkah: 75,
  },
  {
    id: 'yalamlam',
    name: 'Yalamlam (As-Saʿdiyyah)',
    arabicName: 'يَلَمْلَم',
    forText: 'People of Yemen and those approaching from the south',
    coords: { latitude: 20.5167, longitude: 39.8667 },
    approxKmFromMakkah: 92,
  },
  {
    id: 'dhat-irq',
    name: 'Dhāt ʿIrq',
    arabicName: 'ذَات عِرْق',
    forText: 'People of Iraq and those approaching from the north-east',
    coords: { latitude: 21.9333, longitude: 40.4167 },
    approxKmFromMakkah: 94,
  },
];

/**
 * A note for those who arrive by air: the mīqāt is a place on the earth, not
 * the airport. A traveller flying over or level with a mīqāt assumes iḥrām
 * before crossing it — in practice this is done on the plane (the crew usually
 * announce it), or before boarding when the route makes the timing unclear.
 */
export const MIQAT_BY_AIR =
  'When flying, enter iḥrām before your aircraft is level with the mīqāt — not after landing in Jeddah. Cabin crew typically announce the approach; prepare your garments and intention beforehand. Jeddah itself is inside the mīqāt boundary for those coming from outside.';

/* ------------------------------------------------------------------ *
 * The maḥdhūrāt — what iḥrām forbids
 * ------------------------------------------------------------------ *
 * The basis is the Qurʾān — "so let there be no obscenity (rafath), nor
 * wickedness, nor disputing during Ḥajj" (2:197) — and the detailed Sunnah on
 * dress, scent, hunting and marriage. The fidya for several is grounded in
 * 2:196 and the ḥadīth of Kaʿb ibn ʿUjrah (al-Bukhārī 1814, Muslim 1201): a
 * choice of fasting three days, feeding six needy people, or sacrificing a
 * sheep.
 */

/** The threefold expiation many violations share (the "fidyat al-adhā"). */
export const FIDYAT_AL_ADHA =
  'A choice of three (fidyat al-adhā, Qurʾān 2:196): fast three days, OR feed six needy people (half a ṣāʿ each), OR sacrifice a sheep.';

export const MAHDHURAT: Mahdhur[] = [
  {
    id: 'sewn-clothes',
    text: 'For men: wearing sewn/fitted garments (shirts, trousers, underwear) or anything covering the head directly (a cap, turban). The two unstitched white cloths (izār and ridāʾ) are worn instead.',
    gender: 'male',
    fidya: FIDYAT_AL_ADHA,
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 1542, Muslim 1177',
      narrator: 'Ibn ʿUmar',
      grade: 'Ṣaḥīḥ',
      text: 'A man asked what the muḥrim wears; the Prophet ﷺ said he does not wear shirts, turbans, trousers, hooded cloaks, or leather socks (khuff) unless he cannot find sandals.',
    },
  },
  {
    id: 'face-veil-gloves',
    text: 'For women: wearing the niqāb (a fitted face-veil) or gloves. She covers normally and may drape a cloth over her face from above when men are near, without it being fastened as a niqāb.',
    gender: 'female',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 1838',
      narrator: 'Ibn ʿUmar',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ said: "A woman in iḥrām is not to wear the niqāb nor gloves."',
    },
  },
  {
    id: 'perfume',
    text: 'Applying perfume or scent to the body or clothes after entering iḥrām (scenting the body beforehand is sunnah and its lingering trace is no harm).',
    fidya: FIDYAT_AL_ADHA,
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 1542',
      narrator: 'ʿĀʾishah',
      grade: 'Ṣaḥīḥ',
      text: 'I used to perfume the Prophet ﷺ for his iḥrām before he entered it, and for his exit before he circled the House.',
    },
  },
  {
    id: 'cutting-hair-nails',
    text: 'Removing hair from the body or clipping the nails.',
    fidya: FIDYAT_AL_ADHA,
    daleel: {
      source: 'quran',
      reference: 'Qurʾān 2:196',
      text: '"And do not shave your heads until the sacrificial animal reaches its place of slaughter."',
    },
  },
  {
    id: 'hunting',
    text: 'Hunting or assisting in hunting land game.',
    fidya: 'A like-for-like sacrifice or its food/fasting equivalent (Qurʾān 5:95).',
    daleel: {
      source: 'quran',
      reference: 'Qurʾān 5:95',
      text: '"O you who believe, do not kill game while you are in iḥrām."',
    },
  },
  {
    id: 'intimacy',
    text: 'Sexual relations and its preliminaries. Intercourse before the first taḥallul (release) of Ḥajj invalidates it — the gravest violation.',
    fidya: 'Before the first release in Ḥajj: the Ḥajj is invalidated, must be completed, made up the next year, and a badanah (camel) sacrificed (the ruling of the Companions).',
    daleel: {
      source: 'quran',
      reference: 'Qurʾān 2:197',
      text: '"So whoever undertakes Ḥajj therein, let there be no rafath (intimacy), nor wickedness, nor quarrelling during Ḥajj."',
    },
  },
  {
    id: 'marriage-contract',
    text: 'Contracting a marriage — for oneself or as an agent — or proposing.',
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 1409',
      narrator: 'ʿUthmān ibn ʿAffān',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ said: "The muḥrim does not marry, is not married off, and does not propose."',
    },
  },
];

/**
 * What iḥrām does NOT forbid — reassurances the pilgrim often needs, each
 * sound. One may wash and bathe, change the garments, shelter under an
 * umbrella or roof, wear a belt, sandals, ring, watch and spectacles, and kill
 * harmful creatures.
 */
export const IHRAM_PERMITTED: string[] = [
  'Washing the body and head, and changing or washing the iḥrām garments.',
  'Sheltering under an umbrella, a tent, or the roof of a vehicle.',
  'Wearing a belt or money-pouch, a wristwatch, a ring, sandals and spectacles.',
  'Killing harmful creatures — the scorpion, snake, mouse, biting dog and crow (al-Bukhārī 1829).',
  'For women: their ordinary clothing in any colour, provided it is modest and not a niqāb or gloves.',
];

/** The two garments of the male pilgrim, named for the IhramGuideCard. */
export const IHRAM_GARMENTS = {
  izar: 'Izār — the lower cloth, wrapped around the waist.',
  rida: 'Ridāʾ — the upper cloth, draped over the shoulders.',
} as const;
