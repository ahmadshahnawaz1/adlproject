import {
  activeGoalCount,
  clampTasbihTarget,
  dayInputs,
  dayRecord,
  DEFAULT_GOAL_CONFIG,
  dhikrBestStreak,
  dhikrStreak,
  dhikrTrend,
  goalProgress,
  isDayComplete,
  MAX_TASBIH_TARGET,
  recordTasbih,
  type AdhkarCompletion,
  type DhikrGoalConfig,
  type DhikrLedger,
} from '../lib/dhikrGoals';
import { dayKey } from '../lib/streak';

const TODAY = new Date('2026-06-13T09:00:00');

function keyFromToday(offset: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offset);
  return dayKey(d);
}

const ALL_GOALS: DhikrGoalConfig = {
  morningAdhkar: true,
  eveningAdhkar: true,
  tasbihTarget: 100,
};

describe('dhikrGoals · config', () => {
  test('the default config has all three goals on', () => {
    expect(DEFAULT_GOAL_CONFIG).toEqual({
      morningAdhkar: true,
      eveningAdhkar: true,
      tasbihTarget: 100,
    });
    expect(activeGoalCount(DEFAULT_GOAL_CONFIG)).toBe(3);
  });

  test('activeGoalCount drops the tasbīḥ goal when target is 0', () => {
    expect(
      activeGoalCount({ morningAdhkar: true, eveningAdhkar: false, tasbihTarget: 0 }),
    ).toBe(1);
  });

  test('clampTasbihTarget keeps within bounds and rounds', () => {
    expect(clampTasbihTarget(-5)).toBe(0);
    expect(clampTasbihTarget(33.4)).toBe(33);
    expect(clampTasbihTarget(99999)).toBe(MAX_TASBIH_TARGET);
  });
});

describe('dhikrGoals · ledger', () => {
  test('dayRecord is zero when untouched', () => {
    expect(dayRecord({}, '2026-06-13')).toEqual({ tasbih: 0 });
  });

  test('recordTasbih accumulates and never goes below zero', () => {
    let ledger: DhikrLedger = {};
    ledger = recordTasbih(ledger, '2026-06-13', 33);
    ledger = recordTasbih(ledger, '2026-06-13', 67);
    expect(ledger['2026-06-13'].tasbih).toBe(100);
    ledger = recordTasbih(ledger, '2026-06-13', -250);
    expect(ledger['2026-06-13'].tasbih).toBe(0);
  });

  test('recordTasbih returns the same object on a no-op', () => {
    const ledger: DhikrLedger = { '2026-06-13': { tasbih: 0 } };
    expect(recordTasbih(ledger, '2026-06-13', 0)).toBe(ledger);
  });

  test('dayInputs reads tasbīḥ from the ledger and adhkār from history', () => {
    const ledger: DhikrLedger = { '2026-06-13': { tasbih: 50 } };
    const adhkar: AdhkarCompletion = { '2026-06-13': ['morning', 'after-salah'] };
    expect(dayInputs(ledger, adhkar, '2026-06-13')).toEqual({
      tasbih: 50,
      morningDone: true,
      eveningDone: false,
    });
  });
});

describe('dhikrGoals · goalProgress', () => {
  test('counts met goals and flags completion', () => {
    const p = goalProgress(
      { tasbih: 100, morningDone: true, eveningDone: true },
      ALL_GOALS,
    );
    expect(p.metGoals).toBe(3);
    expect(p.totalGoals).toBe(3);
    expect(p.allComplete).toBe(true);
    expect(p.tasbihPct).toBe(1);
    expect(p.tasbihMet).toBe(true);
  });

  test('partial day is not complete', () => {
    const p = goalProgress(
      { tasbih: 50, morningDone: true, eveningDone: false },
      ALL_GOALS,
    );
    expect(p.metGoals).toBe(1);
    expect(p.totalGoals).toBe(3);
    expect(p.allComplete).toBe(false);
    expect(p.tasbihPct).toBeCloseTo(0.5);
  });

  test('an inactive adhkār goal never counts even if done', () => {
    const config: DhikrGoalConfig = {
      morningAdhkar: false,
      eveningAdhkar: true,
      tasbihTarget: 0,
    };
    const p = goalProgress(
      { tasbih: 999, morningDone: true, eveningDone: true },
      config,
    );
    expect(p.totalGoals).toBe(1);
    expect(p.metGoals).toBe(1);
    expect(p.tasbihActive).toBe(false);
    expect(p.morningActive).toBe(false);
    expect(p.allComplete).toBe(true);
  });

  test('a day with no active goals is never complete', () => {
    const none: DhikrGoalConfig = {
      morningAdhkar: false,
      eveningAdhkar: false,
      tasbihTarget: 0,
    };
    expect(
      isDayComplete({ tasbih: 5, morningDone: true, eveningDone: true }, none),
    ).toBe(false);
  });

  test('tasbīḥ over target still caps the fraction at 1', () => {
    const p = goalProgress(
      { tasbih: 300, morningDone: false, eveningDone: false },
      { morningAdhkar: false, eveningAdhkar: false, tasbihTarget: 100 },
    );
    expect(p.tasbihPct).toBe(1);
    expect(p.tasbihMet).toBe(true);
  });
});

describe('dhikrGoals · streak', () => {
  function completeDay(
    ledger: DhikrLedger,
    adhkar: AdhkarCompletion,
    offset: number,
  ) {
    const key = keyFromToday(offset);
    ledger[key] = { tasbih: 100 };
    adhkar[key] = ['morning', 'evening'];
  }

  test('counts consecutive complete days ending today', () => {
    const ledger: DhikrLedger = {};
    const adhkar: AdhkarCompletion = {};
    completeDay(ledger, adhkar, 0);
    completeDay(ledger, adhkar, -1);
    completeDay(ledger, adhkar, -2);
    expect(dhikrStreak(ledger, adhkar, ALL_GOALS, TODAY)).toBe(3);
  });

  test('today not yet done does not break the streak', () => {
    const ledger: DhikrLedger = {};
    const adhkar: AdhkarCompletion = {};
    completeDay(ledger, adhkar, -1);
    completeDay(ledger, adhkar, -2);
    expect(dhikrStreak(ledger, adhkar, ALL_GOALS, TODAY)).toBe(2);
  });

  test('a partial day breaks the streak', () => {
    const ledger: DhikrLedger = {};
    const adhkar: AdhkarCompletion = {};
    completeDay(ledger, adhkar, 0);
    // yesterday: tasbīḥ short of target
    ledger[keyFromToday(-1)] = { tasbih: 10 };
    adhkar[keyFromToday(-1)] = ['morning', 'evening'];
    completeDay(ledger, adhkar, -2);
    expect(dhikrStreak(ledger, adhkar, ALL_GOALS, TODAY)).toBe(1);
  });

  test('streak is 0 when no goals are active', () => {
    const ledger: DhikrLedger = {};
    const adhkar: AdhkarCompletion = {};
    completeDay(ledger, adhkar, 0);
    expect(
      dhikrStreak(ledger, adhkar, {
        morningAdhkar: false,
        eveningAdhkar: false,
        tasbihTarget: 0,
      }, TODAY),
    ).toBe(0);
  });

  test('best streak finds the longest historical run', () => {
    const ledger: DhikrLedger = {};
    const adhkar: AdhkarCompletion = {};
    // a 4-day run far in the past
    completeDay(ledger, adhkar, -20);
    completeDay(ledger, adhkar, -19);
    completeDay(ledger, adhkar, -18);
    completeDay(ledger, adhkar, -17);
    // a 2-day run ending today
    completeDay(ledger, adhkar, -1);
    completeDay(ledger, adhkar, 0);
    expect(dhikrBestStreak(ledger, adhkar, ALL_GOALS)).toBe(4);
  });
});

describe('dhikrGoals · trend', () => {
  test('returns one entry per day, oldest → newest, ending today', () => {
    const ledger: DhikrLedger = {};
    const adhkar: AdhkarCompletion = {};
    ledger[keyFromToday(0)] = { tasbih: 100 };
    adhkar[keyFromToday(0)] = ['morning', 'evening'];

    const trend = dhikrTrend(ledger, adhkar, ALL_GOALS, 14, TODAY);
    expect(trend).toHaveLength(14);
    expect(trend[13].key).toBe(dayKey(TODAY));
    expect(trend[13].complete).toBe(true);
    expect(trend[13].metGoals).toBe(3);
    expect(trend[0].complete).toBe(false);
  });
});
