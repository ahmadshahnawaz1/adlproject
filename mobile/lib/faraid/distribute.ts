/**
 * The farāʾiḍ solver.
 *
 * Order of operations follows the classical method: settle who is excluded
 * (ḥajb), assign the fixed Qurʾānic shares (furūḍ), hand the remainder to the
 * nearest residuary (ʿaṣabah), then correct the total by ʿawl if the shares
 * overflow or radd if they fall short.
 *
 * Where the schools genuinely differ the solver refuses to divide and says so
 * rather than silently picking one madhhab — see BLOCK_GRANDFATHER_SIBLINGS.
 */
import { add, cmp, div, fr, isZero, lcm, mul, ONE, sub, type Fraction, ZERO } from './fraction';
import type { HeirCounts, HeirId } from './heirs';

export type ShareKind = 'fard' | 'asaba' | 'fard+asaba' | 'radd' | 'excluded';

export type HeirShare = {
  id: HeirId;
  count: number;
  share: Fraction;
  perPerson: Fraction;
  kind: ShareKind;
  reason: string;
  excludedBy?: string;
};

export type FaraidResult = {
  shares: HeirShare[];
  excluded: HeirShare[];
  total: Fraction;
  awl: boolean;
  radd: boolean;
  /** aṣl al-masʾalah — the denominator the whole table resolves onto. */
  base: number;
  notes: string[];
  /** Set when the case is disputed or out of scope; no division is returned. */
  blocked: string | null;
};

export const BLOCK_GRANDFATHER_SIBLINGS =
  'A grandfather inheriting alongside brothers or sisters is one of the most disputed questions in farāʾiḍ. Abū Ḥanīfa held that the grandfather excludes them entirely; Zayd ibn Thābit and the majority had him share with them. Adl will not pick a side on your family’s estate — please take this case to a qualified scholar or a sharīʿah court.';

const NO_HEIRS =
  'No heirs were entered. Add at least one surviving relative to see a division.';

type Assigned = { share: Fraction; reason: string };

export function distribute(raw: HeirCounts): FaraidResult {
  const c = (id: HeirId) => Math.max(0, Math.floor(raw[id] ?? 0));

  const husband = Math.min(c('husband'), 1);
  const wives = Math.min(c('wife'), 4);
  const sons = c('son');
  const daughters = c('daughter');
  const grandsons = c('grandson');
  const granddaughters = c('granddaughter');
  const father = Math.min(c('father'), 1);
  const mother = Math.min(c('mother'), 1);
  const gf = Math.min(c('paternalGrandfather'), 1);
  const pgm = Math.min(c('paternalGrandmother'), 1);
  const mgm = Math.min(c('maternalGrandmother'), 1);
  const fullB = c('fullBrother');
  const fullS = c('fullSister');
  const patB = c('paternalBrother');
  const patS = c('paternalSister');
  const matSib = c('maternalSibling');

  const counts: Record<HeirId, number> = {
    husband, wife: wives, son: sons, daughter: daughters,
    grandson: grandsons, granddaughter: granddaughters,
    father, mother, paternalGrandfather: gf,
    paternalGrandmother: pgm, maternalGrandmother: mgm,
    fullBrother: fullB, fullSister: fullS,
    paternalBrother: patB, paternalSister: patS, maternalSibling: matSib,
  };

  const present = (Object.keys(counts) as HeirId[]).filter((k) => counts[k] > 0);
  const notes: string[] = [];
  const blockedResult = (msg: string): FaraidResult => ({
    shares: [], excluded: [], total: ZERO, awl: false, radd: false,
    base: 1, notes: [], blocked: msg,
  });

  if (present.length === 0) return blockedResult(NO_HEIRS);

  // ---- ḥajb: who is shut out, and by whom -------------------------------
  const out: Partial<Record<HeirId, string>> = {};
  const maleDesc = sons > 0 || grandsons > 0;
  const anyDesc = sons + daughters + grandsons + granddaughters > 0;

  if (sons > 0) {
    out.grandson = 'a son';
    out.granddaughter = 'a son';
  } else if (daughters >= 2 && grandsons === 0) {
    out.granddaughter = 'two or more daughters taking the full two-thirds';
  }

  if (father) out.paternalGrandfather = 'the father';

  if (mother) {
    out.maternalGrandmother = 'the mother';
    out.paternalGrandmother = 'the mother';
  } else if (father) {
    out.paternalGrandmother = 'the father';
  }

  if (anyDesc) out.maternalSibling = 'a child or grandchild';
  else if (father) out.maternalSibling = 'the father';
  else if (gf) out.maternalSibling = 'the grandfather';

  const sibBlock = maleDesc ? 'a son or son’s son' : father ? 'the father' : null;
  if (sibBlock) {
    out.fullBrother = sibBlock;
    out.fullSister = sibBlock;
    out.paternalBrother = sibBlock;
    out.paternalSister = sibBlock;
  } else if (fullB > 0) {
    out.paternalBrother = 'a full brother';
    out.paternalSister = 'a full brother';
  }

  const alive = (id: HeirId) => counts[id] > 0 && !out[id];

  // The one case we refuse: grandfather beside surviving brothers/sisters.
  if (
    alive('paternalGrandfather') &&
    (alive('fullBrother') || alive('fullSister') || alive('paternalBrother') || alive('paternalSister'))
  ) {
    return blockedResult(BLOCK_GRANDFATHER_SIBLINGS);
  }

  const femaleDescInherits = daughters > 0 || alive('granddaughter');
  // A full sister standing with daughters becomes ʿaṣabah and shuts out the
  // father-side siblings exactly as a full brother would.
  const sisterIsAsaba = alive('fullSister') && fullB === 0 && femaleDescInherits;
  if (sisterIsAsaba) {
    out.paternalBrother = 'a full sister inheriting as ʿaṣabah beside the daughters';
    out.paternalSister = out.paternalBrother;
  } else if (alive('fullSister') && fullS >= 2 && fullB === 0 && patB === 0) {
    out.paternalSister = 'two or more full sisters taking the full two-thirds';
  }

  // ---- furūḍ: the fixed Qurʾānic shares ---------------------------------
  const fard = new Map<HeirId, Assigned>();
  const rawSiblings = fullB + fullS + patB + patS + matSib;

  if (husband) {
    fard.set('husband', anyDesc
      ? { share: fr(1, 4), reason: 'One quarter — the deceased left children' }
      : { share: fr(1, 2), reason: 'One half — no surviving children' });
  }
  if (wives) {
    fard.set('wife', anyDesc
      ? { share: fr(1, 8), reason: 'One eighth — the deceased left children' }
      : { share: fr(1, 4), reason: 'One quarter — no surviving children' });
  }

  if (mother) {
    fard.set('mother', anyDesc || rawSiblings >= 2
      ? { share: fr(1, 6), reason: anyDesc
          ? 'One sixth — with children'
          : 'One sixth — reduced by two or more siblings' }
      : { share: fr(1, 3), reason: 'One third — no children and fewer than two siblings' });
    if (!anyDesc && rawSiblings >= 2 && (out.fullBrother || out.maternalSibling)) {
      notes.push(
        'The siblings here inherit nothing, yet they still reduce the mother from a third to a sixth. This is the position of the majority; Ibn ʿAbbās held she keeps the third.',
      );
    }
  }

  const grandmothers: HeirId[] = [];
  if (alive('maternalGrandmother')) grandmothers.push('maternalGrandmother');
  if (alive('paternalGrandmother')) grandmothers.push('paternalGrandmother');
  for (const g of grandmothers) {
    fard.set(g, {
      share: div(fr(1, 6), fr(grandmothers.length)),
      reason: grandmothers.length > 1
        ? 'A sixth shared between the grandmothers'
        : 'One sixth',
    });
  }

  if (father && anyDesc) {
    fard.set('father', {
      share: fr(1, 6),
      reason: maleDesc ? 'One sixth — a son inherits the remainder' : 'One sixth as a fixed share',
    });
  }
  if (alive('paternalGrandfather') && anyDesc) {
    fard.set('paternalGrandfather', {
      share: fr(1, 6),
      reason: 'One sixth, standing in place of the father',
    });
  }

  // ʿUmariyyatān — spouse, mother and father alone: the mother takes a third
  // of what is left after the spouse, not a third of the whole estate.
  const umariyya =
    (husband > 0 || wives > 0) && mother > 0 && father > 0 && !anyDesc && rawSiblings === 0;
  if (umariyya) {
    const spouse = husband ? fr(1, 2) : fr(1, 4);
    fard.set('mother', {
      share: div(sub(ONE, spouse), fr(3)),
      reason: 'One third of the remainder after the spouse (al-ʿUmariyyatān)',
    });
    notes.push(
      'This is one of the two ʿUmariyyatān cases: with only a spouse, mother and father surviving, the mother takes a third of the residue after the spouse’s share — the ruling of ʿUmar (raḍiyAllāhu ʿanhu) followed by the four schools.',
    );
  }

  if (sons === 0 && daughters > 0) {
    fard.set('daughter', daughters === 1
      ? { share: fr(1, 2), reason: 'One half — an only daughter' }
      : { share: fr(2, 3), reason: 'Two thirds shared between the daughters' });
  }

  if (alive('granddaughter') && grandsons === 0) {
    if (daughters === 1) {
      fard.set('granddaughter', {
        share: fr(1, 6),
        reason: 'One sixth, completing the daughters’ two thirds',
      });
    } else if (daughters === 0) {
      fard.set('granddaughter', granddaughters === 1
        ? { share: fr(1, 2), reason: 'One half — an only son’s daughter' }
        : { share: fr(2, 3), reason: 'Two thirds shared between them' });
    }
  }

  if (alive('fullSister') && fullB === 0 && !femaleDescInherits) {
    fard.set('fullSister', fullS === 1
      ? { share: fr(1, 2), reason: 'One half — an only full sister' }
      : { share: fr(2, 3), reason: 'Two thirds shared between the full sisters' });
  }

  if (alive('paternalSister') && patB === 0 && !femaleDescInherits) {
    if (fullS === 1 && alive('fullSister')) {
      fard.set('paternalSister', {
        share: fr(1, 6),
        reason: 'One sixth, completing the full sister’s two thirds',
      });
    } else if (fullS === 0) {
      fard.set('paternalSister', patS === 1
        ? { share: fr(1, 2), reason: 'One half — an only half-sister' }
        : { share: fr(2, 3), reason: 'Two thirds shared between them' });
    }
  }

  if (alive('maternalSibling')) {
    fard.set('maternalSibling', matSib === 1
      ? { share: fr(1, 6), reason: 'One sixth — a single sibling on the mother’s side' }
      : { share: fr(1, 3), reason: 'One third shared equally, brothers and sisters alike' });
  }

  // ---- ʿaṣabah: who takes what is left ----------------------------------
  type Residuary = { male: HeirId | null; female: HeirId | null; reason: string };
  const chain: Residuary[] = [
    { male: 'son', female: daughters > 0 ? 'daughter' : null, reason: 'Takes the remainder, the male twice the share of the female' },
    { male: 'grandson', female: alive('granddaughter') ? 'granddaughter' : null, reason: 'Takes the remainder, the male twice the share of the female' },
    { male: 'father', female: null, reason: 'Takes the remainder as the nearest male relative' },
    { male: 'paternalGrandfather', female: null, reason: 'Takes the remainder in place of the father' },
    { male: 'fullBrother', female: alive('fullSister') ? 'fullSister' : null, reason: 'Takes the remainder, the male twice the share of the female' },
    { male: 'paternalBrother', female: alive('paternalSister') ? 'paternalSister' : null, reason: 'Takes the remainder, the male twice the share of the female' },
  ];

  let residuary: Residuary | null = null;
  for (const link of chain) {
    if (link.male && alive(link.male)) {
      residuary = link;
      break;
    }
  }
  if (!residuary && sisterIsAsaba) {
    residuary = { male: null, female: 'fullSister', reason: 'Takes the remainder as ʿaṣabah beside the daughters' };
  }
  if (!residuary && !alive('fullSister') && alive('paternalSister') && patB === 0 && femaleDescInherits) {
    residuary = { male: null, female: 'paternalSister', reason: 'Takes the remainder as ʿaṣabah beside the daughters' };
  }

  // ---- assemble ---------------------------------------------------------
  const asaba = new Map<HeirId, Assigned>();
  let totalFard: Fraction = ZERO;
  fard.forEach((a) => { totalFard = add(totalFard, a.share); });

  let residue = sub(ONE, totalFard);
  let awl = false;
  let radd = false;
  const scale = { factor: ONE };

  if (cmp(residue, ZERO) < 0) {
    // ʿawl — the fixed shares overflow, so every share shrinks in proportion.
    awl = true;
    scale.factor = div(ONE, totalFard);
    residue = ZERO;
    notes.push(
      'The fixed shares add up to more than the estate, so the case is raised by ʿawl: the denominator increases and every heir’s portion shrinks proportionally. This is the ruling of ʿUmar (raḍiyAllāhu ʿanhu) and the four schools.',
    );
  } else if (!isZero(residue) && residuary) {
    const m = residuary.male;
    const f = residuary.female;
    const maleCount = m ? counts[m] : 0;
    const femaleCount = f ? counts[f] : 0;
    const units = 2 * maleCount + femaleCount;
    if (units > 0) {
      if (m && maleCount > 0) {
        asaba.set(m, { share: mul(residue, fr(2 * maleCount, units)), reason: residuary.reason });
      }
      if (f && femaleCount > 0) {
        asaba.set(f, { share: mul(residue, fr(femaleCount, units)), reason: residuary.reason });
      }
    }
    residue = ZERO;
  } else if (!isZero(residue)) {
    // radd — nothing left to claim the remainder, so it returns to the
    // fixed-share heirs. A spouse never takes part in radd.
    const reddable = [...fard.keys()].filter((k) => k !== 'husband' && k !== 'wife');
    let base: Fraction = ZERO;
    reddable.forEach((k) => { base = add(base, fard.get(k)!.share); });
    if (reddable.length > 0 && !isZero(base)) {
      radd = true;
      const extra = residue;
      reddable.forEach((k) => {
        const a = fard.get(k)!;
        fard.set(k, { ...a, share: add(a.share, mul(extra, div(a.share, base))) });
      });
      residue = ZERO;
      notes.push(
        'The fixed shares do not exhaust the estate and there is no residuary heir, so the surplus returns to the fixed-share heirs by radd, in proportion to their shares. A husband or wife takes no part in this. The Ḥanafīs and Ḥanbalīs rule this way; the Mālikīs and the earlier Shāfiʿīs directed the surplus to the public treasury instead.',
      );
    } else {
      notes.push(
        'The shares do not exhaust the estate and there is no heir to take the remainder. The surplus passes to the distant kin (dhawū al-arḥām) or, failing them, to the public treasury — a question to put to a scholar.',
      );
    }
  }

  const shares: HeirShare[] = [];
  const ids = new Set<HeirId>([...fard.keys(), ...asaba.keys()]);
  for (const id of ids) {
    const f = fard.get(id);
    const a = asaba.get(id);
    let share = add(f?.share ?? ZERO, a?.share ?? ZERO);
    if (awl) share = mul(share, scale.factor);
    const kind: ShareKind = f && a ? 'fard+asaba' : a ? 'asaba' : radd ? 'radd' : 'fard';
    const reason = f && a ? `${f.reason}, plus the remainder` : (a?.reason ?? f?.reason ?? '');
    shares.push({
      id,
      count: counts[id],
      share,
      perPerson: div(share, fr(counts[id])),
      kind,
      reason,
    });
  }

  const order = (Object.keys(counts) as HeirId[]);
  shares.sort((x, y) => order.indexOf(x.id) - order.indexOf(y.id));

  const excluded: HeirShare[] = present
    .filter((id) => out[id])
    .map((id) => ({
      id,
      count: counts[id],
      share: ZERO,
      perPerson: ZERO,
      kind: 'excluded' as const,
      reason: `Excluded by ${out[id]}`,
      excludedBy: out[id],
    }));

  let total: Fraction = ZERO;
  shares.forEach((s) => { total = add(total, s.share); });
  const base = shares.reduce((b, s) => lcm(b, s.share.d), 1);

  return { shares, excluded, total, awl, radd, base, notes, blocked: null };
}
