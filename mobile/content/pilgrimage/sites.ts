/**
 * sites.ts — the sacred places of the pilgrimage, with coordinates and a short
 * description. The coordinates feed the location-aware layer (lib/sacredGeo.ts):
 * when the pilgrim is within a site's radius the hub can say "you are at
 * ʿArafah" and surface the relevant rite. Coordinates are approximate centres,
 * sufficient for proximity with a generous radius — never for navigation.
 */

import type { Site } from './types';

export const SITES: Site[] = [
  {
    id: 'haram',
    name: 'Al-Masjid al-Ḥarām (the Kaʿbah)',
    arabicName: 'الْمَسْجِد الْحَرَام',
    coords: { latitude: 21.4225, longitude: 39.8262 },
    radiusM: 600,
    description:
      'The Sacred Mosque enfolding the Kaʿbah — the qiblah of the world and the place of Ṭawāf. The Black Stone sits in its eastern corner; the Maqām Ibrāhīm stands nearby.',
  },
  {
    id: 'safa-marwah',
    name: 'Aṣ-Ṣafā & al-Marwah',
    arabicName: 'الصَّفَا وَالْمَرْوَة',
    coords: { latitude: 21.4232, longitude: 39.8269 },
    radiusM: 500,
    description:
      'The two hillocks within the mosque between which the Saʿī is performed — re-living Hājar’s search for water for her son Ismāʿīl.',
  },
  {
    id: 'mina',
    name: 'Minā',
    arabicName: 'مِنًى',
    coords: { latitude: 21.4133, longitude: 39.8933 },
    radiusM: 1500,
    description:
      'The valley of tents east of Makkah where the pilgrims stay on the 8th, and the nights of the 11th–13th. The three Jamarāt stand at its western edge.',
  },
  {
    id: 'arafah',
    name: 'ʿArafah (Jabal al-Raḥmah)',
    arabicName: 'عَرَفَة',
    coords: { latitude: 21.3549, longitude: 39.9841 },
    radiusM: 2500,
    description:
      'The plain of standing on the 9th — "Ḥajj is ʿArafah." The pilgrims gather here from noon to sunset in humble supplication; the Mount of Mercy rises at its edge.',
  },
  {
    id: 'muzdalifah',
    name: 'Muzdalifah (al-Mashʿar al-Ḥarām)',
    arabicName: 'مُزْدَلِفَة',
    coords: { latitude: 21.3833, longitude: 39.9367 },
    radiusM: 2000,
    description:
      'The open ground between ʿArafah and Minā where the pilgrims combine Maghrib and ʿishāʾ, gather pebbles, and pass the night under the sky.',
  },
  {
    id: 'jamarat',
    name: 'The Jamarāt',
    arabicName: 'الْجَمَرَات',
    coords: { latitude: 21.4222, longitude: 39.8736 },
    radiusM: 700,
    description:
      'Three pillars in Minā — al-Ṣughrā (the small), al-Wusṭā (the middle) and al-ʿAqabah (the large) — pelted with seven pebbles each, recalling Ibrāhīm’s rejection of Shayṭān.',
  },
];

/** The Makkah → Minā → ʿArafah → Muzdalifah → Minā arc, in travel order, for
 *  the animated SiteMap of the Ḥajj days. */
export const HAJJ_ROUTE_SITE_IDS = [
  'haram',
  'mina',
  'arafah',
  'muzdalifah',
  'jamarat',
] as const;

/** Look up a site by id. */
export function siteById(id: string): Site | undefined {
  return SITES.find((s) => s.id === id);
}
