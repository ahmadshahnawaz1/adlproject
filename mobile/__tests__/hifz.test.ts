/**
 * Tests for the spaced-repetition engine behind Ḥifẓ (F23).
 */
import {
  FIRST_INTERVAL,
  MAX_INTERVAL,
  MIN_EASE,
  SECOND_INTERVAL,
  START_EASE,
  addDays,
  dueCount,
  dueLabel,
  dueReviews,
  gradeReview,
  isDue,
  newReview,
  startedSurahs,
  strength,
  surahProgress,
  totalMemorised,
  type ReviewMap,
  type ReviewState,
} from '../lib/hifz';
import { HIFZ_ADAB, HIFZ_METHOD, HIFZ_DISCLAIMER, DALEEL_SLIPS_AWAY } from '../content/hifz';

const TODAY = new Date('2026-03-10T09:00:00');

describe('content integrity', () => {
  it('lays out the method in ordered, unique steps', () => {
    const ids = HIFZ_METHOD.map((s) => s.id);
    expect(ids.length).toBeGreaterThanOrEqual(4);
    expect(new Set(ids).size).toBe(ids.length);
    for (const step of HIFZ_METHOD) {
      expect(step.detail.length).toBeGreaterThan(30);
    }
  });

  it('carries the etiquette and the honest limits of an app', () => {
    expect(HIFZ_ADAB.length).toBeGreaterThan(0);
    expect(HIFZ_DISCLAIMER).toMatch(/teacher/i);
    expect(DALEEL_SLIPS_AWAY.reference).toMatch(/Bukh/);
  });
});

describe('addDays', () => {
  it('shifts a day key without drifting', () => {
    expect(addDays('2026-03-10', 1)).toBe('2026-03-11');
    expect(addDays('2026-03-10', 0)).toBe('2026-03-10');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('newReview', () => {
  it('starts due today with the default ease', () => {
    const s = newReview('2:255', TODAY);
    expect(s.id).toBe('2:255');
    expect(s.reps).toBe(0);
    expect(s.ease).toBe(START_EASE);
    expect(s.lapses).toBe(0);
    expect(s.dueKey).toBe('2026-03-10');
    expect(isDue(s, TODAY)).toBe(true);
  });
});

describe('gradeReview — the ladder', () => {
  it('first clean recall schedules one day out', () => {
    const s = gradeReview(newReview('1:1', TODAY), 'good', TODAY);
    expect(s.reps).toBe(1);
    expect(s.intervalDays).toBe(FIRST_INTERVAL);
    expect(s.dueKey).toBe('2026-03-11');
  });

  it('second clean recall schedules three days out', () => {
    let s = gradeReview(newReview('1:1', TODAY), 'good', TODAY);
    s = gradeReview(s, 'good', new Date('2026-03-11T09:00:00'));
    expect(s.reps).toBe(2);
    expect(s.intervalDays).toBe(SECOND_INTERVAL);
    expect(s.dueKey).toBe('2026-03-14');
  });

  it('thereafter the interval grows by the ease factor', () => {
    let s = gradeReview(newReview('1:1', TODAY), 'good', TODAY);
    s = gradeReview(s, 'good', TODAY);
    const before = s.intervalDays;
    s = gradeReview(s, 'good', TODAY);
    expect(s.reps).toBe(3);
    expect(s.intervalDays).toBe(Math.round(before * s.ease));
    expect(s.intervalDays).toBeGreaterThan(before);
  });

  it('never schedules beyond the cap', () => {
    let s: ReviewState = { id: '1:1', reps: 9, ease: 2.5, intervalDays: 170, dueKey: '2026-03-10', lapses: 0 };
    s = gradeReview(s, 'easy', TODAY);
    expect(s.intervalDays).toBeLessThanOrEqual(MAX_INTERVAL);
  });
});

describe('gradeReview — ease and lapses', () => {
  it('easy raises the ease, hard lowers it, good leaves it', () => {
    const base = newReview('1:1', TODAY);
    expect(gradeReview(base, 'easy', TODAY).ease).toBeGreaterThan(base.ease);
    expect(gradeReview(base, 'hard', TODAY).ease).toBeLessThan(base.ease);
    expect(gradeReview(base, 'good', TODAY).ease).toBe(base.ease);
  });

  it('a forgotten āyah restarts the ladder and counts a lapse', () => {
    let s = gradeReview(newReview('1:1', TODAY), 'good', TODAY);
    s = gradeReview(s, 'good', TODAY);
    s = gradeReview(s, 'good', TODAY);
    const lapsed = gradeReview(s, 'again', TODAY);
    expect(lapsed.reps).toBe(0);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.intervalDays).toBe(FIRST_INTERVAL);
    expect(lapsed.dueKey).toBe('2026-03-11');
  });

  it('one bad day dents the ease but does not destroy it', () => {
    const s = gradeReview(newReview('1:1', TODAY), 'again', TODAY);
    expect(s.ease).toBeLessThan(START_EASE);
    expect(s.ease).toBeGreaterThanOrEqual(MIN_EASE);
  });

  it('ease never falls below the floor, however often it is failed', () => {
    let s = newReview('1:1', TODAY);
    for (let i = 0; i < 40; i++) s = gradeReview(s, 'again', TODAY);
    expect(s.ease).toBe(MIN_EASE);
    expect(s.lapses).toBe(40);
  });

  it('hard advances the ladder but grows the interval more slowly than good', () => {
    let base = gradeReview(newReview('1:1', TODAY), 'good', TODAY);
    base = gradeReview(base, 'good', TODAY);
    const hard = gradeReview(base, 'hard', TODAY);
    const good = gradeReview(base, 'good', TODAY);
    expect(hard.reps).toBe(3);
    expect(hard.intervalDays).toBeLessThan(good.intervalDays);
  });
});

describe('the review queue', () => {
  const map: ReviewMap = {
    '1:1': { id: '1:1', reps: 2, ease: 2.5, intervalDays: 3, dueKey: '2026-03-08', lapses: 0 },
    '1:2': { id: '1:2', reps: 1, ease: 2.5, intervalDays: 1, dueKey: '2026-03-10', lapses: 0 },
    '1:3': { id: '1:3', reps: 4, ease: 2.5, intervalDays: 20, dueKey: '2026-04-01', lapses: 0 },
  };

  it('returns only what is due, most overdue first', () => {
    const due = dueReviews(map, TODAY);
    expect(due.map((s) => s.id)).toEqual(['1:1', '1:2']);
    expect(dueCount(map, TODAY)).toBe(2);
  });

  it('treats a future due date as not due', () => {
    expect(isDue(map['1:3'], TODAY)).toBe(false);
  });

  it('is empty when nothing is scheduled', () => {
    expect(dueReviews({}, TODAY)).toEqual([]);
    expect(dueCount({}, TODAY)).toBe(0);
  });
});

describe('strength', () => {
  it('is zero before the first recall and grows with the interval', () => {
    expect(strength(newReview('1:1', TODAY))).toBe(0);
    const weak: ReviewState = { id: 'a', reps: 1, ease: 2.5, intervalDays: 6, dueKey: '', lapses: 0 };
    const firm: ReviewState = { id: 'b', reps: 6, ease: 2.5, intervalDays: 60, dueKey: '', lapses: 0 };
    expect(strength(weak)).toBeCloseTo(0.1, 5);
    expect(strength(firm)).toBe(1);
  });

  it('is clamped at one', () => {
    const huge: ReviewState = { id: 'c', reps: 9, ease: 2.5, intervalDays: 900, dueKey: '', lapses: 0 };
    expect(strength(huge)).toBe(1);
  });
});

describe('progress', () => {
  const map: ReviewMap = {
    '114:1': { id: '114:1', reps: 1, ease: 2.5, intervalDays: 1, dueKey: '2026-03-01', lapses: 0 },
    '114:2': { id: '114:2', reps: 1, ease: 2.5, intervalDays: 1, dueKey: '2026-04-01', lapses: 0 },
    '112:1': { id: '112:1', reps: 1, ease: 2.5, intervalDays: 1, dueKey: '2026-03-01', lapses: 0 },
  };

  it('counts memorised āyahs within a surah against its real length', () => {
    const p = surahProgress(map, 114, TODAY);
    expect(p.total).toBe(6); // an-Nās has six āyahs
    expect(p.memorised).toBe(2);
    expect(p.due).toBe(1);
    expect(p.fraction).toBeCloseTo(2 / 6, 5);
  });

  it('reports zero for an untouched surah', () => {
    const p = surahProgress(map, 2, TODAY);
    expect(p.memorised).toBe(0);
    expect(p.fraction).toBe(0);
  });

  it('lists every surah begun, most complete first', () => {
    const started = startedSurahs(map, TODAY);
    expect(started.map((s) => s.surah).sort()).toEqual([112, 114]);
    // al-Ikhlāṣ is 1/4 vs an-Nās 2/6 — the larger fraction leads.
    expect(started[0].fraction).toBeGreaterThanOrEqual(started[1].fraction);
  });

  it('totals memorised āyahs across the muṣḥaf', () => {
    expect(totalMemorised(map)).toBe(3);
    expect(totalMemorised({})).toBe(0);
  });
});

describe('dueLabel', () => {
  it('reads naturally across horizons', () => {
    const at = (dueKey: string): ReviewState => ({ id: 'x', reps: 1, ease: 2.5, intervalDays: 1, dueKey, lapses: 0 });
    expect(dueLabel(at('2026-03-09'), TODAY)).toBe('Due now');
    expect(dueLabel(at('2026-03-10'), TODAY)).toBe('Due now');
    expect(dueLabel(at('2026-03-11'), TODAY)).toBe('Tomorrow');
    expect(dueLabel(at('2026-03-13'), TODAY)).toBe('In 3 days');
    expect(dueLabel(at('2026-03-24'), TODAY)).toBe('In 2 weeks');
    expect(dueLabel(at('2026-06-10'), TODAY)).toBe('In 3 months');
  });
});
