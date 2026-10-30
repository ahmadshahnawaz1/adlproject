/**
 * Tests for lib/sirah — the pure logic over the graded Sīrah corpus.
 */
import {
  SIRAH_EVENTS,
  SIRAH_ERAS,
  SIRAH_PEOPLE,
  sirahEventById,
  personById,
  gradeMeta,
  gradeLabel,
  isEstablished,
  eventsByEra,
  groupedByEra,
  eventsWithPerson,
  searchSirah,
  sirahOfDay,
} from '../lib/sirah';

describe('corpus integrity', () => {
  it('has a complete, strictly-ordered timeline', () => {
    expect(SIRAH_EVENTS.length).toBeGreaterThanOrEqual(30);
    for (let i = 1; i < SIRAH_EVENTS.length; i++) {
      expect(SIRAH_EVENTS[i].order).toBeGreaterThan(SIRAH_EVENTS[i - 1].order);
    }
  });

  it('uses unique event ids and always carries a grade + sources', () => {
    const ids = SIRAH_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of SIRAH_EVENTS) {
      expect(gradeMeta(e.grade)).toBeTruthy();
      expect(e.sources.length).toBeGreaterThan(0);
      expect(e.body.length).toBeGreaterThan(0);
    }
  });

  it('references only real eras and known people', () => {
    const eras = new Set(SIRAH_ERAS.map((e) => e.id));
    const people = new Set(SIRAH_PEOPLE.map((p) => p.id));
    for (const e of SIRAH_EVENTS) {
      expect(eras.has(e.era)).toBe(true);
      for (const pid of e.people ?? []) expect(people.has(pid)).toBe(true);
    }
  });
});

describe('grades', () => {
  it('ranks established above weak', () => {
    expect(gradeMeta('established').rank).toBeGreaterThan(gradeMeta('weak').rank);
    expect(gradeLabel('established')).toBe('Established');
  });

  it('treats Qurʾān/Ṣaḥīḥayn and ṣaḥīḥ/ḥasan as established', () => {
    expect(isEstablished('established')).toBe(true);
    expect(isEstablished('well-supported')).toBe(true);
    expect(isEstablished('weak')).toBe(false);
    expect(isEstablished('disputed')).toBe(false);
  });
});

describe('resolvers & grouping', () => {
  it('resolves an event and a person by id', () => {
    expect(sirahEventById('sr-hijrah')?.title).toContain('Hijrah');
    expect(sirahEventById('nope')).toBeUndefined();
    expect(personById('abu-bakr')?.epithet).toBe('al-Ṣiddīq');
  });

  it('lists events by era and groups the whole timeline', () => {
    expect(eventsByEra('battles').every((e) => e.era === 'battles')).toBe(true);
    const groups = groupedByEra();
    expect(groups.length).toBeGreaterThan(1);
    const flat = groups.flatMap((g) => g.events);
    expect(flat.length).toBe(SIRAH_EVENTS.length);
  });

  it('finds events a person is central to', () => {
    const khadijah = eventsWithPerson('khadijah');
    expect(khadijah.length).toBeGreaterThan(0);
    expect(khadijah.every((e) => e.people?.includes('khadijah'))).toBe(true);
  });
});

describe('search', () => {
  it('finds an event by keyword, diacritic-insensitive', () => {
    expect(searchSirah('badr')[0]?.id).toBe('sr-badr');
    expect(searchSirah('hijrah').length).toBeGreaterThan(0);
    expect(searchSirah('night journey').some((e) => e.id === 'sr-isra-miraj')).toBe(true);
  });

  it('requires every token to match and returns nothing for empty', () => {
    expect(searchSirah('badr zzzznotaword')).toEqual([]);
    expect(searchSirah('')).toEqual([]);
  });
});

describe('event of the day', () => {
  it('is deterministic for a given day and always valid', () => {
    const a = sirahOfDay(new Date('2026-03-01T09:00:00Z'));
    const b = sirahOfDay(new Date('2026-03-01T21:00:00Z'));
    expect(a.id).toBe(b.id);
    expect(SIRAH_EVENTS.some((e) => e.id === a.id)).toBe(true);
  });
});
