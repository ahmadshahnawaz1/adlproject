/**
 * Tests for lib/learn — the pure logic over the Learning Hub.
 */
import {
  ALL_LESSONS,
  SIRAH_EVENTS,
  LEARN_TOPICS,
  NEW_MUSLIM_TRACK,
  lessonById,
  lessonsInTopic,
  topicById,
  sirahEventById,
  blockText,
  bodyText,
  searchLessons,
  searchSirah,
  searchLearn,
  groupedLessons,
  trackLength,
  trackStepById,
  trackStepIndex,
  trackProgress,
  isTrackComplete,
} from '../lib/learn';

describe('content integrity', () => {
  it('has a deep Sīrah timeline (30+ events) in strict order', () => {
    expect(SIRAH_EVENTS.length).toBeGreaterThanOrEqual(30);
    for (let i = 1; i < SIRAH_EVENTS.length; i++) {
      expect(SIRAH_EVENTS[i].order).toBeGreaterThan(SIRAH_EVENTS[i - 1].order);
    }
  });

  it('exposes the four topics including the New Muslim track', () => {
    const ids = LEARN_TOPICS.map((t) => t.id).sort();
    expect(ids).toEqual(['aqidah', 'fiqh', 'new-muslim', 'sirah']);
  });

  it('has ʿaqīdah and fiqh lessons that all carry a known topicId', () => {
    expect(ALL_LESSONS.length).toBeGreaterThanOrEqual(15);
    for (const lesson of ALL_LESSONS) {
      expect(['aqidah', 'fiqh']).toContain(lesson.topicId);
      expect(lesson.body.length).toBeGreaterThan(0);
    }
  });

  it('uses unique lesson ids', () => {
    const ids = ALL_LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses unique Sīrah event ids', () => {
    const ids = SIRAH_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('resolvers', () => {
  it('resolves a lesson by id', () => {
    expect(lessonById('aqidah-tawhid-uluhiyyah')?.title).toBe('Tawḥīd of Worship');
    expect(lessonById('nope')).toBeUndefined();
  });

  it('resolves a topic by id', () => {
    expect(topicById('sirah')?.kind).toBe('sirah');
    expect(topicById('nope')).toBeUndefined();
  });

  it('resolves a Sīrah event by id', () => {
    expect(sirahEventById('sirah-hijrah')?.year).toBe('622 CE / 1 AH');
    expect(sirahEventById('nope')).toBeUndefined();
  });

  it('lists lessons in a topic', () => {
    const fiqh = lessonsInTopic('fiqh');
    expect(fiqh.length).toBeGreaterThan(0);
    expect(fiqh.every((l) => l.topicId === 'fiqh')).toBe(true);
  });
});

describe('block text extraction', () => {
  it('reads text out of every block kind', () => {
    expect(blockText({ kind: 'para', text: 'hello' })).toBe('hello');
    expect(blockText({ kind: 'heading', text: 'Section' })).toBe('Section');
    expect(blockText({ kind: 'point', items: ['a', 'b'] })).toBe('a b');
    expect(blockText({ kind: 'steps', items: ['one', 'two'] })).toBe('one two');
    expect(
      blockText({ kind: 'ayah', reference: '1:1', arabic: 'x', translation: 'praise' }),
    ).toContain('praise');
    expect(
      blockText({
        kind: 'hadith',
        daleel: { source: 'hadith', reference: 'Bukhārī 1', text: 'deeds' },
      }),
    ).toContain('deeds');
    expect(blockText({ kind: 'callout', tone: 'note', text: 'aside' })).toContain('aside');
    expect(
      blockText({ kind: 'dua', arabic: 'x', translation: 'O Allah' }),
    ).toContain('O Allah');
  });

  it('concatenates a whole body', () => {
    const text = bodyText([
      { kind: 'para', text: 'alpha' },
      { kind: 'point', items: ['beta'] },
    ]);
    expect(text).toBe('alpha beta');
  });
});

describe('search', () => {
  it('finds a lesson by title token', () => {
    const hits = searchLessons('tawhid');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((l) => l.id.startsWith('aqidah-tawhid'))).toBe(true);
  });

  it('is diacritic-insensitive', () => {
    expect(searchLessons('salah').length).toBeGreaterThan(0);
    expect(searchLessons('ṣalāh').length).toBeGreaterThan(0);
  });

  it('searches the Sīrah by event keyword', () => {
    const hits = searchSirah('badr');
    expect(hits[0]?.id).toBe('sirah-badr');
  });

  it('requires every token to match (logical AND)', () => {
    expect(searchLessons('tawhid zzzznotaword')).toEqual([]);
  });

  it('returns nothing for an empty query', () => {
    expect(searchLessons('')).toEqual([]);
    expect(searchSirah('   ')).toEqual([]);
    expect(searchLearn('')).toEqual([]);
  });

  it('unifies lessons and Sīrah, lessons first', () => {
    const hits = searchLearn('prayer');
    expect(hits.length).toBeGreaterThan(0);
    const firstSirah = hits.findIndex((h) => h.kind === 'sirah');
    const lastLesson = hits.map((h) => h.kind).lastIndexOf('lesson');
    if (firstSirah !== -1) expect(lastLesson).toBeLessThan(firstSirah);
  });
});

describe('grouped lessons', () => {
  it('groups a topic by its section header in first-seen order', () => {
    const groups = groupedLessons('aqidah');
    expect(groups.length).toBeGreaterThan(1);
    const flat = groups.flatMap((g) => g.lessons);
    expect(flat).toEqual(lessonsInTopic('aqidah'));
    // no duplicate group labels
    const labels = groups.map((g) => g.group);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe('new muslim track progress', () => {
  it('has an ordered, non-trivial set of steps', () => {
    expect(trackLength()).toBeGreaterThanOrEqual(8);
    expect(trackStepIndex(NEW_MUSLIM_TRACK.steps[0].id)).toBe(0);
    expect(trackStepById('nope')).toBeUndefined();
  });

  it('computes a completion fraction', () => {
    expect(trackProgress([])).toBe(0);
    const allIds = NEW_MUSLIM_TRACK.steps.map((s) => s.id);
    expect(trackProgress(allIds)).toBe(1);
    expect(isTrackComplete(allIds)).toBe(true);
  });

  it('ignores unknown ids and never exceeds 1', () => {
    const allIds = NEW_MUSLIM_TRACK.steps.map((s) => s.id);
    expect(trackProgress([...allIds, 'ghost-step'])).toBe(1);
    expect(trackProgress(['ghost-step'])).toBe(0);
  });

  it('is roughly half for half the steps', () => {
    const half = NEW_MUSLIM_TRACK.steps
      .slice(0, Math.floor(trackLength() / 2))
      .map((s) => s.id);
    const p = trackProgress(half);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(1);
  });
});
