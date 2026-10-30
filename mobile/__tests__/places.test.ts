/**
 * Tests for lib/places — the pure Overpass query/parse/distance logic.
 */
import {
  haversineMeters,
  buildOverpassQuery,
  classifyElement,
  addressFromTags,
  parseOverpassResponse,
  sortByDistance,
  filterPlaces,
  formatDistance,
  kindsForFilter,
} from '../lib/places';

const MAKKAH = { latitude: 21.4225, longitude: 39.8262 };
const MADINAH = { latitude: 24.4709, longitude: 39.6121 };

describe('haversineMeters', () => {
  it('is zero for the same point', () => {
    expect(haversineMeters(MAKKAH, MAKKAH)).toBe(0);
  });

  it('matches the known Makkah→Madinah distance (~338 km)', () => {
    const km = haversineMeters(MAKKAH, MADINAH) / 1000;
    expect(km).toBeGreaterThan(330);
    expect(km).toBeLessThan(345);
  });

  it('is symmetric', () => {
    expect(haversineMeters(MAKKAH, MADINAH)).toBeCloseTo(haversineMeters(MADINAH, MAKKAH), 5);
  });
});

describe('buildOverpassQuery', () => {
  it('includes the mosque filter when requested', () => {
    const q = buildOverpassQuery(MAKKAH, 3000, ['mosque']);
    expect(q).toContain('"amenity"="place_of_worship"');
    expect(q).toContain('"religion"="muslim"');
    expect(q).toContain('around:3000,21.422500,39.826200');
    expect(q).not.toContain('diet:halal');
  });

  it('includes the halal filter when requested', () => {
    const q = buildOverpassQuery(MAKKAH, 1500, ['halal']);
    expect(q).toContain('"diet:halal"~"yes|only"');
    expect(q).toContain('restaurant|cafe|fast_food');
    expect(q).not.toContain('place_of_worship');
  });

  it('includes both and an output limit', () => {
    const q = buildOverpassQuery(MAKKAH, 2000, ['mosque', 'halal'], 25);
    expect(q).toContain('place_of_worship');
    expect(q).toContain('diet:halal');
    expect(q).toContain('out center tags 25;');
    expect(q).toContain('[out:json]');
  });
});

describe('classifyElement', () => {
  it('recognises a Muslim place of worship as a mosque', () => {
    expect(classifyElement({ amenity: 'place_of_worship', religion: 'Muslim' })).toBe('mosque');
  });

  it('recognises halal food', () => {
    expect(classifyElement({ amenity: 'restaurant', 'diet:halal': 'yes' })).toBe('halal');
    expect(classifyElement({ amenity: 'cafe', 'diet:halal': 'only' })).toBe('halal');
  });

  it('rejects a church and a non-halal café', () => {
    expect(classifyElement({ amenity: 'place_of_worship', religion: 'christian' })).toBeNull();
    expect(classifyElement({ amenity: 'cafe' })).toBeNull();
    expect(classifyElement({ amenity: 'restaurant', 'diet:halal': 'no' })).toBeNull();
  });
});

describe('addressFromTags', () => {
  it('assembles number, street and city', () => {
    expect(
      addressFromTags({ 'addr:housenumber': '10', 'addr:street': 'Main St', 'addr:city': 'Leeds' }),
    ).toBe('10 Main St, Leeds');
  });

  it('returns undefined with no address tags', () => {
    expect(addressFromTags({ amenity: 'restaurant' })).toBeUndefined();
  });
});

describe('parseOverpassResponse', () => {
  const sample = {
    elements: [
      {
        type: 'node',
        id: 1,
        lat: 21.4228,
        lon: 39.8265,
        tags: { name: 'Masjid al-Haram', amenity: 'place_of_worship', religion: 'muslim' },
      },
      {
        type: 'way',
        id: 2,
        center: { lat: 21.43, lon: 39.83 },
        tags: { name: 'Halal Grill', amenity: 'restaurant', 'diet:halal': 'yes' },
      },
      // dropped: no name
      { type: 'node', id: 3, lat: 21.42, lon: 39.82, tags: { amenity: 'restaurant', 'diet:halal': 'yes' } },
      // dropped: not a match
      { type: 'node', id: 4, lat: 21.42, lon: 39.82, tags: { name: 'Church', amenity: 'place_of_worship', religion: 'christian' } },
      // dropped: no coordinate
      { type: 'way', id: 5, tags: { name: 'Ghost Mosque', amenity: 'place_of_worship', religion: 'muslim' } },
    ],
  };

  it('keeps only named, classified, located elements', () => {
    const places = parseOverpassResponse(sample, MAKKAH);
    expect(places.map((p) => p.name).sort()).toEqual(['Halal Grill', 'Masjid al-Haram']);
  });

  it('reads coordinates from center for ways and computes distance', () => {
    const places = parseOverpassResponse(sample, MAKKAH);
    const grill = places.find((p) => p.name === 'Halal Grill')!;
    expect(grill.kind).toBe('halal');
    expect(grill.id).toBe('way/2');
    expect(grill.distanceMeters).toBeGreaterThan(0);
  });

  it('is safe against malformed input', () => {
    expect(parseOverpassResponse(null, MAKKAH)).toEqual([]);
    expect(parseOverpassResponse({}, MAKKAH)).toEqual([]);
    expect(parseOverpassResponse({ elements: 'x' }, MAKKAH)).toEqual([]);
  });
});

describe('sort, filter, format', () => {
  const places = [
    { id: 'a', kind: 'mosque' as const, name: 'A', coords: MAKKAH, distanceMeters: 500 },
    { id: 'b', kind: 'halal' as const, name: 'B', coords: MAKKAH, distanceMeters: 100 },
    { id: 'c', kind: 'mosque' as const, name: 'C', coords: MAKKAH, distanceMeters: 900 },
  ];

  it('sorts nearest-first without mutating', () => {
    const sorted = sortByDistance(places);
    expect(sorted.map((p) => p.id)).toEqual(['b', 'a', 'c']);
    expect(places[0].id).toBe('a'); // original untouched
  });

  it('filters by kind', () => {
    expect(filterPlaces(places, 'all')).toHaveLength(3);
    expect(filterPlaces(places, 'mosque').map((p) => p.id)).toEqual(['a', 'c']);
    expect(filterPlaces(places, 'halal').map((p) => p.id)).toEqual(['b']);
  });

  it('formats distance in m and km', () => {
    expect(formatDistance(800)).toBe('800 m');
    expect(formatDistance(1200)).toBe('1.2 km');
  });

  it('maps a filter to request kinds', () => {
    expect(kindsForFilter('all')).toEqual(['mosque', 'halal']);
    expect(kindsForFilter('mosque')).toEqual(['mosque']);
    expect(kindsForFilter('halal')).toEqual(['halal']);
  });
});
