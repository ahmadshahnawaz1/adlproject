/**
 * RiteStepCard — the heart of the guided journey. It renders one rite in full:
 * its animated scene, its rank (rukn / wājib / sunnah), a short framing, the
 * ordered checklist of actions, its supplications, its evidence, the madhhab-
 * and gender-scoped notes, the common mistakes and the virtues. A counted rite
 * (ṭawāf, saʿy, ramy) shows its tactile counter.
 *
 * Two modes:
 *  - Learn    everything is open to read and scrub through freely;
 *  - Perform  the step is a checklist — actions are ticked, counters tapped,
 *             and "Mark complete" gates moving on.
 *
 * Steps that do not apply to the chosen Ḥajj type are dimmed and flagged, but
 * remain visible (the user asked for every variation inline).
 */
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Dua as FastingDua } from '../content/fasting';
import type { Daleel, Gender, Madhhab, RiteStep } from '../content/pilgrimage';
import type { MadhhabPref } from '../hooks/usePilgrimagePrefs';
import { arabicFont, colors, fontFamily, radius, spacing, typography } from '../theme/tokens';
import DaleelBlock from './DaleelBlock';
import DuaCard from './DuaCard';
import JamaratView from './JamaratView';
import RiteScene from './RiteScene';
import SaiTrack from './SaiTrack';
import TawafRing from './TawafRing';

const RANK_LABEL: Record<RiteStep['rank'], string> = {
  rukn: 'Pillar (rukn)',
  wajib: 'Obligation (wājib)',
  sunnah: 'Sunnah',
};

function rankTone(rank: RiteStep['rank']): { bg: string; fg: string } {
  switch (rank) {
    case 'rukn':
      return { bg: 'rgba(255,214,10,0.12)', fg: colors.primary };
    case 'wajib':
      return { bg: 'rgba(161,161,170,0.12)', fg: colors.mutedForeground };
    default:
      return { bg: 'rgba(113,113,122,0.12)', fg: colors.subtleForeground };
  }
}

function noteApplies(note: { madhhab?: Madhhab[]; gender?: Gender }, madhhab: MadhhabPref, gender: Gender): boolean {
  if (note.gender && note.gender !== gender) return false;
  if (note.madhhab && note.madhhab.length > 0 && madhhab !== 'all' && !note.madhhab.includes(madhhab)) return false;
  return true;
}

export default function RiteStepCard({
  step,
  mode,
  showArabic,
  haptics,
  tiltEnabled,
  madhhab,
  gender,
  applies = true,
  notApplyReason,
  completedCount,
  isComplete,
  onToggleComplete,
  onTapCounter,
  onResetCounter,
  activeSiteId,
}: {
  step: RiteStep;
  mode: 'learn' | 'perform';
  showArabic: boolean;
  haptics: boolean;
  tiltEnabled: boolean;
  madhhab: MadhhabPref;
  gender: Gender;
  applies?: boolean;
  notApplyReason?: string;
  /** Current counter value for this step (0 when no counter). */
  completedCount: number;
  isComplete: boolean;
  onToggleComplete: () => void;
  onTapCounter: () => void;
  onResetCounter: () => void;
  activeSiteId?: string | null;
}) {
  const tone = rankTone(step.rank);
  const notes = useMemo(
    () => (step.notes ?? []).filter((n) => noteApplies(n, madhhab, gender)),
    [step.notes, madhhab, gender],
  );

  const buzz = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (haptics) Haptics.impactAsync(style).catch(() => {});
  };

  const handleCounterTap = () => {
    buzz(Haptics.ImpactFeedbackStyle.Medium);
    onTapCounter();
  };

  const handleComplete = () => {
    buzz(Haptics.ImpactFeedbackStyle.Light);
    onToggleComplete();
  };

  return (
    <View style={[styles.wrap, !applies && styles.dimmed]}>
      {/* scene */}
      <View style={styles.scene}>
        <RiteScene scene={step.scene} tiltEnabled={tiltEnabled && applies} activeSiteId={activeSiteId} />
        {step.locationLabel ? (
          <View style={styles.locationChip}>
            <Text style={styles.locationText}>{step.locationLabel}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        {/* rank + not-applicable flag */}
        <View style={styles.tagRow}>
          <View style={[styles.rankChip, { backgroundColor: tone.bg }]}>
            <Text style={[styles.rankText, { color: tone.fg }]}>{RANK_LABEL[step.rank]}</Text>
          </View>
          {!applies ? (
            <View style={styles.skipChip}>
              <Text style={styles.skipText}>{notApplyReason ?? 'Not for your type'}</Text>
            </View>
          ) : null}
        </View>

        {/* title */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{step.title}</Text>
          {showArabic && step.arabicTitle ? <Text style={styles.arabic}>{step.arabicTitle}</Text> : null}
        </View>
        <Text style={styles.summary}>{step.summary}</Text>

        {/* counter (ṭawāf / saʿy / ramy) */}
        {step.counter ? (
          <View style={styles.counterBlock}>
            {step.counter.kind === 'tawaf' ? (
              <TawafRing count={completedCount} total={step.counter.total} onTap={handleCounterTap} caption={`Tap to count each ${step.counter.unitLabel}`} />
            ) : step.counter.kind === 'sai' ? (
              <SaiTrack count={completedCount} total={step.counter.total} onTap={handleCounterTap} caption={`Tap to count each ${step.counter.unitLabel}`} />
            ) : (
              <JamaratView count={completedCount} total={step.counter.total} onTap={handleCounterTap} caption={`${completedCount} of ${step.counter.total} ${step.counter.unitLabelPlural}`} />
            )}
            <Pressable onPress={onResetCounter} hitSlop={8} style={styles.resetBtn}>
              <Text style={styles.resetText}>Reset count</Text>
            </Pressable>
          </View>
        ) : null}

        {/* actions checklist */}
        {step.actions.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What to do</Text>
            {step.actions.map((a, i) => (
              <View key={a.id} style={styles.action}>
                <View style={styles.actionIndex}>
                  <Text style={styles.actionIndexText}>{i + 1}</Text>
                </View>
                <View style={styles.actionTextWrap}>
                  <Text style={styles.actionText}>{a.text}</Text>
                  {a.detail ? <Text style={styles.actionDetail}>{a.detail}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* supplications */}
        {step.duas && step.duas.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Supplications</Text>
            <View style={{ gap: spacing.md }}>
              {step.duas.map((d) => (
                <DuaCard key={d.id} dua={d as unknown as FastingDua} showArabic={showArabic} />
              ))}
            </View>
          </View>
        ) : null}

        {/* notes (madhhab / gender) */}
        {notes.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Points of difference</Text>
            <View style={{ gap: spacing.sm }}>
              {notes.map((n) => (
                <View key={n.id} style={styles.note}>
                  <Text style={styles.noteText}>{n.text}</Text>
                  {n.daleel ? (
                    <View style={styles.noteDaleel}>
                      <DaleelBlock daleel={n.daleel} />
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* evidence */}
        {step.daleel && step.daleel.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evidence</Text>
            <View style={{ gap: spacing.sm }}>
              {step.daleel.map((d: Daleel, i) => (
                <DaleelBlock key={i} daleel={d} />
              ))}
            </View>
          </View>
        ) : null}

        {/* mistakes */}
        {step.mistakes && step.mistakes.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Common mistakes</Text>
            {step.mistakes.map((m, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletDestructive}>•</Text>
                <Text style={styles.bulletText}>{m}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* virtues */}
        {step.virtues && step.virtues.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Virtue</Text>
            {step.virtues.map((v, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletPrimary}>✦</Text>
                <Text style={styles.bulletText}>{v}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* perform-mode completion */}
        {mode === 'perform' && applies ? (
          <Pressable
            onPress={handleComplete}
            style={[styles.completeBtn, isComplete && styles.completeBtnDone]}
            accessibilityRole="button"
            accessibilityLabel={isComplete ? 'Mark as not done' : 'Mark this step complete'}
          >
            <Text style={[styles.completeText, isComplete && styles.completeTextDone]}>
              {isComplete ? '✓  Completed' : 'Mark complete'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  dimmed: { opacity: 0.62 },
  scene: { position: 'relative' },
  locationChip: { position: 'absolute', left: spacing.md, bottom: spacing.md, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  locationText: { fontFamily, fontSize: typography.caption.fontSize, color: colors.foreground },
  body: { padding: spacing.lg, gap: spacing.md },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  rankChip: { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 4 },
  rankText: { fontFamily, fontSize: typography.caption.fontSize, fontWeight: '600' },
  skipChip: { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 4, backgroundColor: 'rgba(239,68,68,0.1)' },
  skipText: { fontFamily, fontSize: typography.caption.fontSize, fontWeight: '600', color: colors.destructive },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.md },
  title: { flex: 1, fontFamily, fontSize: typography.title.fontSize, fontWeight: '700', color: colors.foreground, letterSpacing: typography.title.letterSpacing },
  arabic: { fontFamily: arabicFont, fontSize: 19, color: colors.primary, writingDirection: 'rtl' },
  summary: { fontFamily, fontSize: typography.body.fontSize, lineHeight: 22, color: colors.mutedForeground, marginTop: -spacing.xs },
  counterBlock: { alignItems: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  resetBtn: { paddingVertical: 4, paddingHorizontal: spacing.md },
  resetText: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground },
  section: { gap: spacing.sm },
  sectionTitle: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '600', color: colors.subtleForeground, textTransform: 'uppercase', letterSpacing: 0.5 },
  action: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  actionIndex: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.cardElevated, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  actionIndexText: { fontFamily, fontSize: 12, fontWeight: '700', color: colors.mutedForeground },
  actionTextWrap: { flex: 1, gap: 2 },
  actionText: { fontFamily, fontSize: typography.body.fontSize, lineHeight: 22, color: colors.foreground },
  actionDetail: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 19, color: colors.subtleForeground },
  note: { backgroundColor: colors.cardElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  noteText: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.mutedForeground },
  noteDaleel: { marginTop: 2 },
  bulletRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  bulletDestructive: { fontFamily, fontSize: typography.body.fontSize, color: colors.destructive, lineHeight: 22 },
  bulletPrimary: { fontFamily, fontSize: typography.caption.fontSize, color: colors.primary, lineHeight: 22 },
  bulletText: { flex: 1, fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.mutedForeground },
  completeBtn: { marginTop: spacing.sm, height: 50, borderRadius: radius.lg, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  completeBtnDone: { backgroundColor: 'rgba(34,197,94,0.14)', borderWidth: 1, borderColor: colors.success },
  completeText: { fontFamily, fontSize: typography.button.fontSize, fontWeight: '700', color: colors.primaryForeground },
  completeTextDone: { color: colors.success },
});
