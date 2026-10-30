/**
 * pilgrimage.ts — the pure model over the journey content. It flattens a
 * journey into an ordered list of steps, tells whether a step applies to the
 * pilgrim's chosen Ḥajj type, measures progress (overall and per stage),
 * clamps the counted rituals (Ṭawāf / Saʿī / Ramī), and maps a Hijri day to
 * the stage it belongs to (for the date-aware "jump to today").
 *
 * No React, no storage, no side-effects — just functions over the data in
 * content/pilgrimage, so it is trivially testable.
 */

import { journeyOf } from '../content/pilgrimage';
import type {
  HajjType,
  Journey,
  PilgrimageKind,
  RiteCounter,
  RiteStage,
  RiteStep,
} from '../content/pilgrimage';

/** A step lifted out of its stage, with its position in the whole journey. */
export type FlatStep = {
  step: RiteStep;
  stage: RiteStage;
  stageIndex: number;
  stepIndexInStage: number;
  /** Global 0-based index across the entire journey. */
  index: number;
  /** Whether this step applies to the selected Ḥajj type (Umrah: always). */
  applies: boolean;
};

/**
 * Does a step apply to the given Ḥajj type? A step with no `hajjTypes` applies
 * to all. Before a type is chosen (null), everything is shown. For ʿUmrah the
 * type is irrelevant, so steps always apply.
 */
export function stepAppliesToType(step: RiteStep, type: HajjType | null): boolean {
  if (!step.hajjTypes || step.hajjTypes.length === 0) return true;
  if (!type) return true;
  return step.hajjTypes.includes(type);
}

/** The total number of steps in a journey. */
export function journeyStepCount(journey: Journey): number {
  return journey.stages.reduce((n, s) => n + s.steps.length, 0);
}

/**
 * Flatten a journey into an ordered list of steps, each tagged with its stage
 * context and whether it applies to `type`. All steps are kept (the UI dims
 * the non-applicable ones rather than hiding them).
 */
export function flattenJourney(journey: Journey, type: HajjType | null = null): FlatStep[] {
  const out: FlatStep[] = [];
  let index = 0;
  journey.stages.forEach((stage, stageIndex) => {
    stage.steps.forEach((step, stepIndexInStage) => {
      out.push({
        step,
        stage,
        stageIndex,
        stepIndexInStage,
        index,
        applies: stepAppliesToType(step, type),
      });
      index += 1;
    });
  });
  return out;
}

/** Convenience: flatten by kind (resolves the journey from content). */
export function flattenKind(kind: PilgrimageKind, type: HajjType | null = null): FlatStep[] {
  return flattenJourney(journeyOf(kind), type);
}

/** Clamp an index into the journey's step range. */
export function clampStepIndex(journey: Journey, index: number): number {
  const max = Math.max(0, journeyStepCount(journey) - 1);
  if (!isFinite(index)) return 0;
  return Math.min(max, Math.max(0, Math.round(index)));
}

/** Fraction 0..1 of completed steps over a total. */
export function journeyProgress(completedCount: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, completedCount / total));
}

/** How many of the given step ids are marked complete. */
export function completedCount(completed: ReadonlySet<string>): number {
  return completed.size;
}

/* ------------------------------------------------------------------ *
 * Per-stage progress (for the timeline rail)
 * ------------------------------------------------------------------ */

export type StageProgress = {
  stage: RiteStage;
  stageIndex: number;
  total: number;
  done: number;
  complete: boolean;
  /** Fraction 0..1 of this stage's steps completed. */
  fraction: number;
};

/** Per-stage completion, given the set of completed step ids. */
export function stageProgress(journey: Journey, completed: ReadonlySet<string>): StageProgress[] {
  return journey.stages.map((stage, stageIndex) => {
    const total = stage.steps.length;
    const done = stage.steps.filter((s) => completed.has(s.id)).length;
    return {
      stage,
      stageIndex,
      total,
      done,
      complete: total > 0 && done >= total,
      fraction: total > 0 ? done / total : 0,
    };
  });
}

/** The global index of the first step of a stage. */
export function firstStepIndexOfStage(journey: Journey, stageIndex: number): number {
  let index = 0;
  for (let i = 0; i < journey.stages.length; i += 1) {
    if (i === stageIndex) return index;
    index += journey.stages[i].steps.length;
  }
  return 0;
}

/** Which stage a global step index belongs to. */
export function stageIndexOfStep(journey: Journey, stepIndex: number): number {
  let index = 0;
  for (let i = 0; i < journey.stages.length; i += 1) {
    const len = journey.stages[i].steps.length;
    if (stepIndex < index + len) return i;
    index += len;
  }
  return Math.max(0, journey.stages.length - 1);
}

/* ------------------------------------------------------------------ *
 * Date-aware mapping
 * ------------------------------------------------------------------ */

/** The stage anchored to a Hijri day (e.g. 9 → ʿArafah), or null. */
export function stageIndexForHijriDay(journey: Journey, hijriDay: number | null): number | null {
  if (hijriDay == null) return null;
  const idx = journey.stages.findIndex((s) => s.hijriDay === hijriDay);
  return idx >= 0 ? idx : null;
}

/** The first step index of the stage for a Hijri day, or null. */
export function stepIndexForHijriDay(journey: Journey, hijriDay: number | null): number | null {
  const stageIndex = stageIndexForHijriDay(journey, hijriDay);
  return stageIndex == null ? null : firstStepIndexOfStage(journey, stageIndex);
}

/* ------------------------------------------------------------------ *
 * Counted rituals (Ṭawāf ×7, Saʿī ×7, Ramī ×7 / ×21)
 * ------------------------------------------------------------------ */

/** Advance a counter by one, clamped to [0, total]. */
export function incrementCount(current: number, total: number): number {
  return Math.min(total, Math.max(0, current + 1));
}

/** Step a counter back by one, clamped to [0, total]. */
export function decrementCount(current: number, total: number): number {
  return Math.min(total, Math.max(0, current - 1));
}

/** Whether a counted ritual has reached its total. */
export function counterComplete(current: number, counter: RiteCounter): boolean {
  return current >= counter.total;
}

/** Remaining units of a counted ritual. */
export function counterRemaining(current: number, counter: RiteCounter): number {
  return Math.max(0, counter.total - current);
}
