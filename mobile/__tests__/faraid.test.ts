/**
 * Farāʾiḍ engine tests.
 *
 * Every expectation below is a case with a settled answer in the classical
 * manuals, written as an exact fraction. If a change breaks one of these, the
 * engine is dividing someone's estate wrongly.
 */
import { distribute, BLOCK_GRANDFATHER_SIBLINGS } from '../lib/faraid/distribute';
import { breakdown } from '../lib/faraid/estate';
import { format, fr, add, sub, mul, div, cmp, toNumber, ZERO, ONE } from '../lib/faraid/fraction';
import type { HeirCounts, HeirId } from '../lib/faraid/heirs';
import { clampCount, HEIRS, HEIR_BY_ID } from '../lib/faraid/heirs';

/** Share of an heir as a "n/d" string, or '0' when they take nothing. */
function shareOf(counts: HeirCounts, id: HeirId): string {
  const r = distribute(counts);
  const row = r.shares.find((s) => s.id === id);
  return row ? format(row.share) : '0';
}

function totalOf(counts: HeirCounts): string {
  return format(distribute(counts).total);
}

describe('fraction arithmetic', () => {
  it('reduces on construction', () => {
    expect(fr(2, 4)).toEqual({ n: 1, d: 2 });
    expect(fr(0, 6)).toEqual({ n: 0, d: 1 });
  });

  it('normalises a negative denominator', () => {
    expect(fr(1, -2)).toEqual({ n: -1, d: 2 });
  });

  it('adds, subtracts, multiplies and divides exactly', () => {
    expect(format(add(fr(1, 6), fr(1, 3)))).toBe('1/2');
    expect(format(sub(ONE, fr(5, 6)))).toBe('1/6');
    expect(format(mul(fr(2, 3), fr(3, 4)))).toBe('1/2');
    expect(format(div(fr(1, 2), fr(1, 4)))).toBe('2');
  });

  it('compares without floating point error', () => {
    expect(cmp(fr(1, 3), fr(1, 3))).toBe(0);
    expect(cmp(fr(1, 3), fr(1, 2))).toBeLessThan(0);
    expect(cmp(fr(2, 3), fr(1, 2))).toBeGreaterThan(0);
  });

  it('keeps thirds exact where floats would not', () => {
    const third = fr(1, 3);
    expect(format(add(add(third, third), third))).toBe('1');
    expect(0.1 + 0.2).not.toBe(0.3); // the reason this module exists
  });
});

describe('estate: debts and the one-third bequest cap', () => {
  it('pays burial and debts before anything else', () => {
    const b = breakdown({ gross: 10000, funeral: 1000, debts: 3000, bequest: 0 });
    expect(b.net).toBe(6000);
  });

  it('caps a bequest at one third of what remains', () => {
    const b = breakdown({ gross: 12000, funeral: 0, debts: 0, bequest: 8000 });
    expect(b.bequestCap).toBe(4000);
    expect(b.bequest).toBe(4000);
    expect(b.bequestCapped).toBe(true);
    expect(b.net).toBe(8000);
  });

  it('leaves a bequest under the cap untouched', () => {
    const b = breakdown({ gross: 9000, funeral: 0, debts: 0, bequest: 1000 });
    expect(b.bequestCapped).toBe(false);
    expect(b.net).toBe(8000);
  });

  it('reports insolvency when debts swallow the estate', () => {
    const b = breakdown({ gross: 1000, funeral: 500, debts: 900, bequest: 100 });
    expect(b.insolvent).toBe(true);
    expect(b.net).toBe(0);
    expect(b.bequest).toBe(0);
  });

  it('ignores negative and non-finite input', () => {
    const b = breakdown({ gross: 1000, funeral: -50, debts: NaN, bequest: -1 });
    expect(b.net).toBe(1000);
  });
});

describe('spouse shares', () => {
  it('gives the husband a half with no children and a quarter with', () => {
    expect(shareOf({ husband: 1, fullSister: 1 }, 'husband')).toBe('1/2');
    expect(shareOf({ husband: 1, son: 1 }, 'husband')).toBe('1/4');
  });

  it('gives a wife a quarter with no children and an eighth with', () => {
    expect(shareOf({ wife: 1, fullSister: 1 }, 'wife')).toBe('1/4');
    expect(shareOf({ wife: 1, son: 1 }, 'wife')).toBe('1/8');
  });

  it('splits one spousal portion between co-wives', () => {
    const r = distribute({ wife: 4, son: 1 });
    const wives = r.shares.find((s) => s.id === 'wife')!;
    expect(format(wives.share)).toBe('1/8');
    expect(format(wives.perPerson)).toBe('1/32');
  });

  it('counts a grandchild as a child for the spouse’s reduction', () => {
    expect(shareOf({ husband: 1, granddaughter: 1 }, 'husband')).toBe('1/4');
  });
});

describe('children', () => {
  it('divides between son and daughter two to one', () => {
    expect(shareOf({ son: 1, daughter: 1 }, 'son')).toBe('2/3');
    expect(shareOf({ son: 1, daughter: 1 }, 'daughter')).toBe('1/3');
  });

  it('gives an only daughter a half and two or more daughters two thirds', () => {
    expect(shareOf({ daughter: 1, father: 1 }, 'daughter')).toBe('1/2');
    expect(shareOf({ daughter: 2, father: 1 }, 'daughter')).toBe('2/3');
  });

  it('solves wife with a son and a daughter', () => {
    const c: HeirCounts = { wife: 1, son: 1, daughter: 1 };
    expect(shareOf(c, 'wife')).toBe('1/8');
    expect(shareOf(c, 'son')).toBe('7/12');
    expect(shareOf(c, 'daughter')).toBe('7/24');
    expect(totalOf(c)).toBe('1');
  });
});

describe('son’s children', () => {
  it('excludes them when a son survives', () => {
    const r = distribute({ son: 1, grandson: 1, granddaughter: 1 });
    expect(r.excluded.map((e) => e.id).sort()).toEqual(['granddaughter', 'grandson']);
  });

  it('gives a son’s daughter a sixth to complete an only daughter’s two thirds', () => {
    const c: HeirCounts = { daughter: 1, granddaughter: 1, fullBrother: 1 };
    expect(shareOf(c, 'daughter')).toBe('1/2');
    expect(shareOf(c, 'granddaughter')).toBe('1/6');
    expect(totalOf(c)).toBe('1');
  });

  it('excludes a son’s daughter behind two daughters', () => {
    const r = distribute({ daughter: 2, granddaughter: 1, father: 1 });
    expect(r.excluded.find((e) => e.id === 'granddaughter')).toBeTruthy();
    expect(shareOf({ daughter: 2, granddaughter: 1, father: 1 }, 'daughter')).toBe('2/3');
  });

  it('lets a son’s son rescue the son’s daughter behind two daughters', () => {
    const c: HeirCounts = { daughter: 2, granddaughter: 1, grandson: 1 };
    expect(distribute(c).excluded).toHaveLength(0);
    expect(shareOf(c, 'daughter')).toBe('2/3');
    expect(shareOf(c, 'grandson')).toBe('2/9');
    expect(shareOf(c, 'granddaughter')).toBe('1/9');
    expect(totalOf(c)).toBe('1');
  });
});

describe('parents', () => {
  it('gives the mother a third with no children and few siblings', () => {
    expect(shareOf({ mother: 1, father: 1 }, 'mother')).toBe('1/3');
    expect(shareOf({ mother: 1, father: 1 }, 'father')).toBe('2/3');
  });

  it('reduces the mother to a sixth when children survive', () => {
    expect(shareOf({ mother: 1, father: 1, son: 1 }, 'mother')).toBe('1/6');
  });

  it('reduces the mother to a sixth for two or more siblings even though they inherit nothing', () => {
    const c: HeirCounts = { mother: 1, father: 1, fullBrother: 2 };
    expect(shareOf(c, 'mother')).toBe('1/6');
    expect(shareOf(c, 'father')).toBe('5/6');
    expect(distribute(c).excluded.find((e) => e.id === 'fullBrother')).toBeTruthy();
    expect(distribute(c).notes.join(' ')).toMatch(/Ibn ʿAbbās/);
  });

  it('keeps the mother at a third for a single sibling', () => {
    expect(shareOf({ mother: 1, father: 1, fullBrother: 1 }, 'mother')).toBe('1/3');
  });

  it('gives the father a sixth plus the remainder beside daughters', () => {
    const c: HeirCounts = { daughter: 1, father: 1, mother: 1 };
    expect(shareOf(c, 'daughter')).toBe('1/2');
    expect(shareOf(c, 'mother')).toBe('1/6');
    expect(shareOf(c, 'father')).toBe('1/3');
    expect(totalOf(c)).toBe('1');
    expect(distribute(c).shares.find((s) => s.id === 'father')!.kind).toBe('fard+asaba');
  });

  it('holds the father to a sixth when a son survives', () => {
    const c: HeirCounts = { son: 1, father: 1, mother: 1 };
    expect(shareOf(c, 'father')).toBe('1/6');
    expect(shareOf(c, 'son')).toBe('2/3');
  });
});

describe('al-ʿUmariyyatān', () => {
  it('husband, mother and father', () => {
    const c: HeirCounts = { husband: 1, mother: 1, father: 1 };
    expect(shareOf(c, 'husband')).toBe('1/2');
    expect(shareOf(c, 'mother')).toBe('1/6');
    expect(shareOf(c, 'father')).toBe('1/3');
    expect(totalOf(c)).toBe('1');
  });

  it('wife, mother and father', () => {
    const c: HeirCounts = { wife: 1, mother: 1, father: 1 };
    expect(shareOf(c, 'wife')).toBe('1/4');
    expect(shareOf(c, 'mother')).toBe('1/4');
    expect(shareOf(c, 'father')).toBe('1/2');
    expect(totalOf(c)).toBe('1');
  });

  it('does not apply once a child survives', () => {
    expect(shareOf({ husband: 1, mother: 1, father: 1, son: 1 }, 'mother')).toBe('1/6');
  });

  it('explains itself in the notes', () => {
    expect(distribute({ husband: 1, mother: 1, father: 1 }).notes.join(' ')).toMatch(/ʿUmariyyatān/);
  });
});

describe('grandparents', () => {
  it('excludes the grandfather behind the father', () => {
    const r = distribute({ father: 1, paternalGrandfather: 1, son: 1 });
    expect(r.excluded.find((e) => e.id === 'paternalGrandfather')?.excludedBy).toBe('the father');
  });

  it('lets the grandfather stand in for an absent father', () => {
    const c: HeirCounts = { paternalGrandfather: 1, son: 1 };
    expect(shareOf(c, 'paternalGrandfather')).toBe('1/6');
    expect(shareOf(c, 'son')).toBe('5/6');
  });

  it('excludes both grandmothers behind the mother', () => {
    const r = distribute({ mother: 1, paternalGrandmother: 1, maternalGrandmother: 1, son: 1 });
    expect(r.excluded.map((e) => e.id).sort()).toEqual(['maternalGrandmother', 'paternalGrandmother']);
  });

  it('excludes only the father’s mother behind the father', () => {
    const r = distribute({ father: 1, paternalGrandmother: 1, maternalGrandmother: 1, son: 1 });
    expect(r.excluded.map((e) => e.id)).toEqual(['paternalGrandmother']);
    expect(shareOf({ father: 1, paternalGrandmother: 1, maternalGrandmother: 1, son: 1 }, 'maternalGrandmother')).toBe('1/6');
  });

  it('shares one sixth between two grandmothers', () => {
    const c: HeirCounts = { paternalGrandmother: 1, maternalGrandmother: 1, son: 1 };
    expect(shareOf(c, 'paternalGrandmother')).toBe('1/12');
    expect(shareOf(c, 'maternalGrandmother')).toBe('1/12');
  });
});

describe('siblings', () => {
  it('excludes every sibling behind the father', () => {
    const r = distribute({ father: 1, fullBrother: 1, paternalSister: 1, maternalSibling: 2 });
    expect(r.excluded).toHaveLength(3);
  });

  it('excludes every sibling behind a son', () => {
    const r = distribute({ son: 1, fullBrother: 1, maternalSibling: 1 });
    expect(r.excluded).toHaveLength(2);
  });

  it('shares the mother’s side equally regardless of sex', () => {
    const r = distribute({ maternalSibling: 3, fullBrother: 1 });
    const mat = r.shares.find((s) => s.id === 'maternalSibling')!;
    expect(format(mat.share)).toBe('1/3');
    expect(format(mat.perPerson)).toBe('1/9');
  });

  it('gives a single maternal sibling a sixth', () => {
    expect(shareOf({ maternalSibling: 1, fullBrother: 1 }, 'maternalSibling')).toBe('1/6');
  });

  it('makes a full sister ʿaṣabah beside a daughter', () => {
    const c: HeirCounts = { daughter: 1, fullSister: 1 };
    expect(shareOf(c, 'daughter')).toBe('1/2');
    expect(shareOf(c, 'fullSister')).toBe('1/2');
    expect(distribute(c).shares.find((s) => s.id === 'fullSister')!.kind).toBe('asaba');
  });

  it('lets that ʿaṣabah sister exclude the father-side siblings', () => {
    const r = distribute({ daughter: 1, fullSister: 1, paternalBrother: 1 });
    expect(r.excluded.find((e) => e.id === 'paternalBrother')).toBeTruthy();
  });

  it('completes two thirds with a sixth for the half-sister', () => {
    const c: HeirCounts = { fullSister: 1, paternalSister: 1, maternalSibling: 2 };
    expect(shareOf(c, 'fullSister')).toBe('1/2');
    expect(shareOf(c, 'paternalSister')).toBe('1/6');
    expect(shareOf(c, 'maternalSibling')).toBe('1/3');
    expect(totalOf(c)).toBe('1');
  });

  it('excludes half-sisters behind two full sisters', () => {
    const r = distribute({ fullSister: 2, paternalSister: 1 });
    expect(r.excluded.find((e) => e.id === 'paternalSister')).toBeTruthy();
  });

  it('but a half-brother rescues them into ʿaṣabah', () => {
    const c: HeirCounts = { fullSister: 2, paternalSister: 1, paternalBrother: 1 };
    expect(distribute(c).excluded).toHaveLength(0);
    expect(shareOf(c, 'fullSister')).toBe('2/3');
    expect(shareOf(c, 'paternalBrother')).toBe('2/9');
    expect(shareOf(c, 'paternalSister')).toBe('1/9');
  });

  it('excludes father-side siblings behind a full brother', () => {
    const r = distribute({ fullBrother: 1, paternalBrother: 1, paternalSister: 1 });
    expect(r.excluded).toHaveLength(2);
  });
});

describe('ʿawl — when the shares overflow', () => {
  it('raises husband and two full sisters to a base of seven', () => {
    const c: HeirCounts = { husband: 1, fullSister: 2 };
    const r = distribute(c);
    expect(r.awl).toBe(true);
    expect(shareOf(c, 'husband')).toBe('3/7');
    expect(shareOf(c, 'fullSister')).toBe('4/7');
    expect(r.base).toBe(7);
    expect(totalOf(c)).toBe('1');
  });

  it('raises the classic base-six case to ten', () => {
    const c: HeirCounts = { husband: 1, mother: 1, maternalSibling: 2, fullSister: 2 };
    const r = distribute(c);
    expect(r.awl).toBe(true);
    expect(r.base).toBe(10);
    expect(shareOf(c, 'husband')).toBe('3/10');
    expect(shareOf(c, 'fullSister')).toBe('2/5'); // 4/10
    expect(shareOf(c, 'maternalSibling')).toBe('1/5'); // 2/10
    expect(shareOf(c, 'mother')).toBe('1/10');
    expect(totalOf(c)).toBe('1');
  });

  it('raises a base of twelve to thirteen', () => {
    const c: HeirCounts = { wife: 1, mother: 1, fullSister: 2 };
    const r = distribute(c);
    expect(r.base).toBe(13);
    expect(shareOf(c, 'wife')).toBe('3/13');
    expect(shareOf(c, 'mother')).toBe('2/13');
    expect(shareOf(c, 'fullSister')).toBe('8/13');
    expect(totalOf(c)).toBe('1');
  });

  it('never lets the total exceed the estate', () => {
    expect(totalOf({ husband: 1, mother: 1, fullSister: 2, maternalSibling: 2 })).toBe('1');
  });
});

describe('radd — when the shares fall short', () => {
  it('returns the surplus to a mother and daughter', () => {
    const c: HeirCounts = { mother: 1, daughter: 1 };
    const r = distribute(c);
    expect(r.radd).toBe(true);
    expect(shareOf(c, 'daughter')).toBe('3/4');
    expect(shareOf(c, 'mother')).toBe('1/4');
    expect(totalOf(c)).toBe('1');
  });

  it('keeps the husband out of the return', () => {
    const c: HeirCounts = { husband: 1, daughter: 1, mother: 1 };
    expect(shareOf(c, 'husband')).toBe('1/4');
    expect(shareOf(c, 'daughter')).toBe('9/16');
    expect(shareOf(c, 'mother')).toBe('3/16');
    expect(totalOf(c)).toBe('1');
  });

  it('does not return anything to a lone spouse', () => {
    const r = distribute({ wife: 1 });
    expect(r.radd).toBe(false);
    expect(format(r.total)).toBe('1/4');
    expect(r.notes.join(' ')).toMatch(/dhawū al-arḥām|public treasury/);
  });

  it('gives an only daughter the whole estate by radd', () => {
    expect(shareOf({ daughter: 1 }, 'daughter')).toBe('1');
  });

  it('returns the surplus between sisters of both kinds', () => {
    const c: HeirCounts = { fullSister: 1, paternalSister: 1 };
    expect(distribute(c).radd).toBe(true);
    expect(shareOf(c, 'fullSister')).toBe('3/4');
    expect(shareOf(c, 'paternalSister')).toBe('1/4');
    expect(totalOf(c)).toBe('1');
  });

  it('returns the surplus to a full sister and the mother’s side', () => {
    const c: HeirCounts = { fullSister: 1, maternalSibling: 3 };
    expect(shareOf(c, 'fullSister')).toBe('3/5');
    expect(shareOf(c, 'maternalSibling')).toBe('2/5');
    expect(totalOf(c)).toBe('1');
  });

  it('names the schools that send the surplus to the treasury instead', () => {
    expect(distribute({ mother: 1, daughter: 1 }).notes.join(' ')).toMatch(/Mālikī/);
  });
});

describe('the disputed grandfather case is refused, not guessed', () => {
  it('blocks a grandfather beside a full brother', () => {
    const r = distribute({ paternalGrandfather: 1, fullBrother: 1 });
    expect(r.blocked).toBe(BLOCK_GRANDFATHER_SIBLINGS);
    expect(r.shares).toHaveLength(0);
  });

  it('blocks a grandfather beside a half-sister on the father’s side', () => {
    expect(distribute({ paternalGrandfather: 1, paternalSister: 1 }).blocked).toBeTruthy();
  });

  it('names both positions so the user can seek a ruling', () => {
    const msg = distribute({ paternalGrandfather: 1, fullSister: 1 }).blocked!;
    expect(msg).toMatch(/Abū Ḥanīfa/);
    expect(msg).toMatch(/Zayd ibn Thābit/);
  });

  it('does not block when a son already excludes the siblings', () => {
    const r = distribute({ paternalGrandfather: 1, fullBrother: 1, son: 1 });
    expect(r.blocked).toBeNull();
    expect(shareOf({ paternalGrandfather: 1, fullBrother: 1, son: 1 }, 'son')).toBe('5/6');
  });

  it('does not block when the father already excludes both', () => {
    expect(distribute({ father: 1, paternalGrandfather: 1, fullBrother: 1 }).blocked).toBeNull();
  });

  it('does not block for maternal siblings, whom all schools exclude', () => {
    const r = distribute({ paternalGrandfather: 1, maternalSibling: 2 });
    expect(r.blocked).toBeNull();
    expect(r.excluded.find((e) => e.id === 'maternalSibling')).toBeTruthy();
  });
});

describe('invariants across every case', () => {
  const cases: HeirCounts[] = [
    { husband: 1, mother: 1, father: 1 },
    { wife: 1, mother: 1, father: 1 },
    { son: 2, daughter: 3, wife: 1, mother: 1, father: 1 },
    { daughter: 1, granddaughter: 1, fullSister: 1 },
    { husband: 1, fullSister: 2 },
    { mother: 1, daughter: 1 },
    { husband: 1, daughter: 1, mother: 1 },
    { wife: 2, son: 1 },
    { maternalSibling: 2, fullSister: 1, mother: 1 },
    { daughter: 2, granddaughter: 1, grandson: 1 },
    { fullSister: 2, paternalSister: 1, paternalBrother: 1 },
    { paternalGrandmother: 1, maternalGrandmother: 1, son: 1 },
    { father: 1, mother: 1, son: 1, daughter: 1, wife: 1 },
  ];

  it.each(cases.map((c, i) => [i, c] as const))(
    'case %i distributes the estate exactly once, with no negative share',
    (_i, c) => {
      const r = distribute(c);
      expect(r.blocked).toBeNull();
      expect(format(r.total)).toBe('1');
      for (const s of r.shares) {
        expect(s.share.n).toBeGreaterThan(0);
        expect(cmp(s.share, ONE)).toBeLessThanOrEqual(0);
        expect(format(mul(s.perPerson, fr(s.count)))).toBe(format(s.share));
      }
    },
  );

  it.each(cases.map((c, i) => [i, c] as const))(
    'case %i never lists an heir as both inheriting and excluded',
    (_i, c) => {
      const r = distribute(c);
      const inheriting = new Set(r.shares.map((s) => s.id));
      for (const e of r.excluded) expect(inheriting.has(e.id)).toBe(false);
    },
  );

  it('gives every inheriting heir a stated reason', () => {
    for (const c of cases) {
      for (const s of distribute(c).shares) expect(s.reason.length).toBeGreaterThan(0);
    }
  });
});

describe('input handling', () => {
  it('reports when nothing was entered', () => {
    expect(distribute({}).blocked).toMatch(/No heirs/);
  });

  it('ignores heirs entered as zero', () => {
    expect(distribute({ son: 0, daughter: 0 }).blocked).toMatch(/No heirs/);
  });

  it('caps a second husband and a fifth wife', () => {
    expect(distribute({ husband: 3, son: 1 }).shares.find((s) => s.id === 'husband')!.count).toBe(1);
    expect(distribute({ wife: 9, son: 1 }).shares.find((s) => s.id === 'wife')!.count).toBe(4);
  });

  it('clamps counts to the slot maximum', () => {
    expect(clampCount('husband', 5)).toBe(1);
    expect(clampCount('wife', 9)).toBe(4);
    expect(clampCount('son', -3)).toBe(0);
    expect(clampCount('son', 2.7)).toBe(2);
    expect(clampCount('son', NaN)).toBe(0);
  });

  it('describes every heir it accepts', () => {
    for (const h of HEIRS) {
      expect(HEIR_BY_ID[h.id]).toBe(h);
      expect(h.label.length).toBeGreaterThan(0);
      expect(h.arabic.length).toBeGreaterThan(0);
      expect(h.max).toBeGreaterThan(0);
    }
  });
});
