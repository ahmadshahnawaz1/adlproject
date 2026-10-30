/**
 * lib/salah.ts — the pure engine that expands a prayer into its full, ordered
 * list of steps.
 *
 * The content model (content/salah) holds the postures and recitations once;
 * this file assembles them into a concrete prayer: it walks the rakaʿāt, opens
 * with the takbīr, recites al-Fātiḥah every standing and an added sūrah only in
 * the first two, reads aloud only in the audible rakaʿāt, drops the sitting
 * (tashahhud) after every two rakaʿāt and at the end, weaves in the qunūt of
 * Witr, and handles the funeral prayer's four standing takbīrs as a special
 * case. No React, no I/O — just data in, ordered steps out, so it is trivially
 * testable.
 */
import {
  BASMALAH,
  DEFAULT_PRAYER_ID,
  DUA_BEFORE_SALAM,
  DUA_MAYYIT,
  FATIHAH,
  ISTIFTAH,
  JANAZAH_TEMPLATES,
  JULUS_DUA,
  POSTURE_TEMPLATES,
  PRAYERS,
  QUNUT,
  SALAH_NABI,
  SALAM,
  SURAH_IKHLAS,
  TAAWWUDH,
  TAHMID,
  TAKBIR,
  TASBIH_RUKU,
  TASBIH_SUJUD,
  TASHAHHUD,
  TASMI,
  prayerById,
  type Prayer,
  type PrayerId,
  type Recitation,
  type SalahRank,
  type SalahStep,
  type TemplateKey,
} from '../content/salah';

/** Re-export the catalogue so screens can import everything from one place. */
export { PRAYERS, prayerById, DEFAULT_PRAYER_ID };

/** Build one concrete step from a posture template plus its context. */
function makeStep(
  templateKey: TemplateKey,
  stepKey: string,
  rakah: number,
  totalRakahs: number,
  recitations: Recitation[],
  extra?: { audible?: boolean; variant?: 'first' | 'final' },
): SalahStep {
  return {
    ...POSTURE_TEMPLATES[templateKey],
    key: stepKey,
    rakah,
    totalRakahs,
    recitations,
    ...extra,
  };
}

/** The funeral prayer: four standing takbīrs, no bowing or prostration. */
function expandJanazah(): SalahStep[] {
  const recitations: Recitation[][] = [
    [TAAWWUDH, BASMALAH, FATIHAH],
    [SALAH_NABI],
    [DUA_MAYYIT],
    [SALAM],
  ];
  return JANAZAH_TEMPLATES.map((template, i) => ({
    ...template,
    key: `janazah-${i + 1}`,
    rakah: 0,
    totalRakahs: 0,
    recitations: recitations[i] ?? [],
  }));
}

/**
 * Expand a prayer into its ordered steps. Daily prayers and Witr share the
 * rakʿah engine; the funeral prayer is handled specially.
 */
export function expandPrayer(prayer: Prayer): SalahStep[] {
  if (prayer.kind === 'janazah') return expandJanazah();

  const total = prayer.rakahCount;
  const steps: SalahStep[] = [];

  for (let r = 1; r <= total; r++) {
    // 1 · The opening takbīr (only entering the prayer, in the first rakʿah).
    if (r === 1) {
      steps.push(makeStep('takbir', 'r1-takbir', r, total, [TAKBIR, ISTIFTAH]));
    }

    // 2 · Standing & recitation. al-Fātiḥah every rakʿah; a sūrah only in the
    //     first two; the seeking of refuge once, at the first recitation.
    const qiyamRecitations: Recitation[] = [];
    if (r === 1) qiyamRecitations.push(TAAWWUDH);
    qiyamRecitations.push(BASMALAH, FATIHAH);
    if (r <= 2) qiyamRecitations.push(SURAH_IKHLAS);
    const audible = r <= prayer.audibleRakahs;
    steps.push(makeStep('qiyam', `r${r}-qiyam`, r, total, qiyamRecitations, { audible }));

    // 3 · Bowing.
    steps.push(makeStep('ruku', `r${r}-ruku`, r, total, [TASBIH_RUKU]));

    // 4 · Rising erect — with the qunūt of Witr in the final rakʿah.
    const itidalRecitations: Recitation[] = [TASMI, TAHMID];
    if (prayer.hasQunut && r === total) itidalRecitations.push(QUNUT);
    steps.push(makeStep('itidal', `r${r}-itidal`, r, total, itidalRecitations));

    // 5 · First prostration.
    steps.push(makeStep('sujud', `r${r}-sujud-1`, r, total, [TASBIH_SUJUD]));

    // 6 · Sitting between the two prostrations.
    steps.push(makeStep('julus', `r${r}-julus`, r, total, [JULUS_DUA]));

    // 7 · Second prostration.
    steps.push(makeStep('sujud', `r${r}-sujud-2`, r, total, [TASBIH_SUJUD]));

    // 8 · The sitting — after every two rakaʿāt, and at the very end.
    const isFinal = r === total;
    const isFirstSitting = r === 2 && total > 2;
    if (isFinal) {
      steps.push(
        makeStep('tashahhud', `r${r}-tashahhud-final`, r, total, [
          TASHAHHUD,
          SALAH_NABI,
          DUA_BEFORE_SALAM,
        ], { variant: 'final' }),
      );
      steps.push(makeStep('salam', 'salam', r, total, [SALAM]));
    } else if (isFirstSitting) {
      steps.push(
        makeStep('tashahhud', `r${r}-tashahhud-first`, r, total, [TASHAHHUD], {
          variant: 'first',
        }),
      );
    }
  }

  return steps;
}

/** Resolve a prayer by id and expand it; falls back to the default prayer. */
export function getPrayerSteps(prayerId: PrayerId): SalahStep[] {
  const prayer = prayerById(prayerId) ?? prayerById(DEFAULT_PRAYER_ID)!;
  return expandPrayer(prayer);
}

/** The distinct rakʿah numbers present in a step list (for the progress rail). */
export function rakahNumbers(steps: SalahStep[]): number[] {
  const seen = new Set<number>();
  for (const step of steps) {
    if (step.rakah > 0) seen.add(step.rakah);
  }
  return [...seen].sort((a, b) => a - b);
}

/** A human label for an act's legal rank. */
export function rankLabel(rank: SalahRank): string {
  switch (rank) {
    case 'rukn':
      return 'Pillar · Rukn';
    case 'wajib':
      return 'Obligatory · Wājib';
    case 'sunnah':
      return 'Sunnah';
  }
}
