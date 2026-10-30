/**
 * JourneyRunner — the engine room of an open journey. It flattens the chosen
 * journey, places the pilgrim at their saved step, and renders: a Learn/Perform
 * switch, the stage timeline, the current rite (with its scene, checklist,
 * duʿās, evidence and counters), the special cards that enrich certain steps
 * (choosing the Ḥajj type, the iḥrām guide, the Talbiyah, the ʿArafah day), a
 * pinned navigator that gently gates progress in Perform mode, and — once every
 * rite is done — a quiet word of acceptance. The surrounding wisdom (virtues,
 * manners, mistakes) sits at the foot of the scroll.
 */
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Journey, PilgrimageKind } from '../content/pilgrimage';
import {
  flattenJourney,
  stageIndexOfStep,
  stageProgress,
} from '../lib/pilgrimage';
import type { UsePilgrimageJourney } from '../hooks/usePilgrimageJourney';
import type { PilgrimagePrefs } from '../hooks/usePilgrimagePrefs';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import ArafahCard from '../components/ArafahCard';
import HajjTypeCard from '../components/HajjTypeCard';
import IhramGuideCard from '../components/IhramGuideCard';
import PilgrimageNotesCard from '../components/PilgrimageNotesCard';
import RiteStepCard from '../components/RiteStepCard';
import StageTimeline from '../components/StageTimeline';
import StepNavigator from '../components/StepNavigator';
import TalbiyahCard from '../components/TalbiyahCard';

/** Which enrichment cards augment which step ids. */
const AUGMENT: Record<string, ('ihram' | 'talbiyah' | 'arafah' | 'hajjType')[]> = {
  'prepare-ihram': ['ihram'],
  'niyyah-talbiyah': ['talbiyah'],
  'ihram-hajj': ['ihram', 'talbiyah'],
  'choose-type': ['hajjType'],
  wuquf: ['arafah'],
};

export default function JourneyRunner({
  kind,
  journey,
  j,
  prefs,
  now = new Date(),
}: {
  kind: PilgrimageKind;
  journey: Journey;
  j: UsePilgrimageJourney;
  prefs: PilgrimagePrefs;
  now?: Date;
}) {
  const styles = useThemedStyles(makeStyles);
  const state = j.state;
  const type = state?.type ?? null;
  const mode = state?.mode ?? 'learn';
  const stepIndex = state?.stepIndex ?? 0;

  const flat = useMemo(() => flattenJourney(journey, type), [journey, type]);
  const current = flat[Math.min(stepIndex, flat.length - 1)] ?? flat[0];
  const step = current.step;

  const completed = useMemo(() => new Set(state?.completed ?? []), [state?.completed]);
  const activeStageIndex = stageIndexOfStep(journey, current.index);

  const stages = useMemo(() => stageProgress(journey, completed), [journey, completed]);
  const stage = stages[activeStageIndex];

  // Cross-fade the rite when the step changes, and scroll back to the top.
  const scrollRef = useRef<ScrollView>(null);
  const fade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  }, [current.index, fade]);

  // Counter + completion bookkeeping for this step.
  const countValue = j.count(step.id);
  const stepDone = (id: string, total?: number): boolean => {
    if (total != null) return j.count(id) >= total;
    return completed.has(id);
  };
  const thisDone = step.counter ? countValue >= step.counter.total : completed.has(step.id);

  // Perform-mode gating.
  let canAdvance = true;
  let blockedHint: string | undefined;
  if (mode === 'perform' && current.applies) {
    if (step.counter) {
      canAdvance = countValue >= step.counter.total;
      blockedHint = `Complete all ${step.counter.total} ${step.counter.unitLabelPlural} to continue`;
    } else if (step.rank === 'rukn' || step.rank === 'wajib') {
      canAdvance = completed.has(step.id);
      blockedHint = 'Mark this step complete to continue';
    }
  }

  // Whole-journey completion (Perform mode).
  const appliedSteps = useMemo(() => flat.filter((f) => f.applies), [flat]);
  const allDone = useMemo(
    () => mode === 'perform' && appliedSteps.length > 0 && appliedSteps.every((f) => stepDone(f.step.id, f.step.counter?.total)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, appliedSteps, state?.completed, state?.counts],
  );

  const setMode = (m: 'learn' | 'perform') => {
    if (prefs.haptics) Haptics.selectionAsync().catch(() => {});
    j.setMode(m);
  };

  const handleNext = () => {
    if (mode === 'perform' && current.applies && !step.counter && !completed.has(step.id)) {
      // Tapping Done on the final step also records it.
      if (!j.hasNext) j.markComplete(step.id);
    }
    if (j.hasNext) j.next();
  };

  const augments = AUGMENT[step.id] ?? [];

  return (
    <View style={styles.root}>
      {/* Mode switch */}
      <View style={styles.modeRow}>
        <View style={styles.modeSwitch}>
          <ModeBtn label="Learn" active={mode === 'learn'} onPress={() => setMode('learn')} />
          <ModeBtn label="Perform" active={mode === 'perform'} onPress={() => setMode('perform')} />
        </View>
      </View>

      {/* Timeline */}
      <StageTimeline
        journey={journey}
        completed={completed}
        activeStageIndex={activeStageIndex}
        onJumpToStage={(i) => {
          if (prefs.haptics) Haptics.selectionAsync().catch(() => {});
          j.goToStep(firstIndexOfStage(flat, i));
        }}
      />

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Stage header */}
        {stage ? (
          <View style={styles.stageHead}>
            <View style={styles.stageHeadRow}>
              <Text style={styles.stageTitle}>{stage.stage.title}</Text>
              {stage.stage.hijriDay ? (
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>{stage.stage.hijriDay} Dhū al-Ḥijjah</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.stageCaption}>{stage.stage.caption}</Text>
          </View>
        ) : null}

        {allDone ? (
          <View style={styles.celebrate}>
            <Text style={styles.celebrateTitle}>May Allah accept your {journey.title}</Text>
            <Text style={styles.celebrateText}>
              Every rite is complete. Taqabbal Allāhu minnā wa minkum — and may it be a Ḥajj mabrūr, with no reward but Paradise.
            </Text>
          </View>
        ) : null}

        <Animated.View style={{ opacity: fade, gap: spacing.lg }}>
          {/* Hajj-type chooser sits above its step */}
          {augments.includes('hajjType') ? (
            <HajjTypeCard selected={type} haptics={prefs.haptics} onSelect={j.setType} />
          ) : null}

          <RiteStepCard
            step={step}
            mode={mode}
            showArabic={prefs.showArabic}
            haptics={prefs.haptics}
            tiltEnabled={prefs.tiltParallax}
            madhhab={prefs.madhhab}
            gender={prefs.gender}
            applies={current.applies}
            notApplyReason={notApplyReason(type)}
            completedCount={countValue}
            isComplete={thisDone}
            onToggleComplete={() => {
              if (prefs.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              j.toggleComplete(step.id);
            }}
            onTapCounter={() => {
              if (prefs.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              if (step.counter) j.tapCounter(step.id, step.counter.total);
            }}
            onResetCounter={() => j.resetCounter(step.id)}
            activeSiteId={step.siteId ?? null}
          />

          {/* Enrichment cards below the step */}
          {augments.includes('ihram') ? (
            <Augment title="The guide to iḥrām">
              <IhramGuideCard gender={prefs.gender} />
            </Augment>
          ) : null}
          {augments.includes('talbiyah') ? (
            <Augment title="The Talbiyah">
              <TalbiyahCard showArabic={prefs.showArabic} />
            </Augment>
          ) : null}
          {augments.includes('arafah') ? (
            <Augment title="The Day of ʿArafah">
              <ArafahCard showArabic={prefs.showArabic} now={now} />
            </Augment>
          ) : null}
        </Animated.View>

        {/* Surrounding wisdom */}
        <View style={styles.notes}>
          <PilgrimageNotesCard haptics={prefs.haptics} />
        </View>
      </ScrollView>

      {/* Pinned navigator */}
      <View style={styles.navBar}>
        <StepNavigator
          index={current.index}
          total={flat.length}
          hasPrev={j.hasPrev}
          hasNext={j.hasNext}
          canAdvance={canAdvance}
          blockedHint={blockedHint}
          haptics={prefs.haptics}
          onPrev={j.prev}
          onNext={handleNext}
        />
      </View>
    </View>
  );
}

function notApplyReason(type: string | null): string {
  return type ? `Not for ${typeLabel(type)}` : 'Not for your type';
}
function typeLabel(type: string): string {
  return type === 'tamattu' ? 'Tamattuʿ' : type === 'qiran' ? 'Qirān' : type === 'ifrad' ? 'Ifrād' : type;
}

function firstIndexOfStage(flat: { index: number; stageIndex: number }[], stageIndex: number): number {
  const f = flat.find((x) => x.stageIndex === stageIndex);
  return f ? f.index : 0;
}

function ModeBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable onPress={onPress} style={[styles.modeBtn, active && styles.modeBtnActive]} accessibilityRole="tab" accessibilityState={{ selected: active }}>
      <Text style={[styles.modeText, active && styles.modeTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Augment({ title, children }: { title: string; children: React.ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.augment}>
      <Text style={styles.augmentTitle}>{title}</Text>
      {children}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1 },
  modeRow: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  modeSwitch: { flexDirection: 'row', backgroundColor: colors.input, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 3, gap: 3 },
  modeBtn: { flex: 1, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  modeBtnActive: { backgroundColor: colors.primary },
  modeText: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '600', color: colors.mutedForeground },
  modeTextActive: { color: colors.primaryForeground, fontWeight: '700' },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing['3xl'], gap: spacing.lg },
  stageHead: { gap: 4 },
  stageHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  stageTitle: { flex: 1, fontFamily, fontSize: typography.title.fontSize, fontWeight: '700', color: colors.foreground, letterSpacing: typography.title.letterSpacing },
  dayBadge: { backgroundColor: 'rgba(255,214,10,0.12)', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 4 },
  dayBadgeText: { fontFamily, fontSize: typography.caption.fontSize, fontWeight: '700', color: colors.primary },
  stageCaption: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.mutedForeground },
  celebrate: { backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.success, padding: spacing.lg, gap: spacing.sm },
  celebrateTitle: { fontFamily, fontSize: typography.title.fontSize, fontWeight: '700', color: colors.success },
  celebrateText: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 21, color: colors.mutedForeground },
  augment: { gap: spacing.md },
  augmentTitle: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  notes: { marginTop: spacing.sm },
  navBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
});
