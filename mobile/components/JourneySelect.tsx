/**
 * JourneySelect — the threshold of the hub: two cinematic cards, ʿUmrah and
 * Ḥajj, each crowned with a live Kaʿbah scene that drifts with the tilt of the
 * hand. Choosing a card opens its guided journey. Counts of stages and pillars
 * are read straight from the content so the cards never drift out of step.
 */
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Journey, PilgrimageKind } from '../content/pilgrimage';
import { JOURNEYS } from '../content/pilgrimage';
import { journeyStepCount } from '../lib/pilgrimage';
import { fontFamily, radius, spacing, typography, arabicFont } from '../theme/tokens';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import KaabaScene from './KaabaScene';
import { useTilt } from './ParallaxScene';

function rukn(journey: Journey): number {
  let n = 0;
  for (const stage of journey.stages) for (const s of stage.steps) if (s.rank === 'rukn') n++;
  return n;
}

function JourneyCard({ journey, tiltEnabled, onPick }: { journey: Journey; tiltEnabled: boolean; onPick: () => void }) {
  const styles = useThemedStyles(makeStyles);
  const tilt = useTilt(tiltEnabled);
  const stages = journey.stages.length;
  const steps = journeyStepCount(journey);
  const pillars = rukn(journey);

  return (
    <Pressable onPress={onPick} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} accessibilityRole="button" accessibilityLabel={`Begin ${journey.title}`}>
      <View style={styles.scene}>
        <KaabaScene tilt={tilt} height={168} />
        <View style={styles.sceneFade} pointerEvents="none" />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{journey.title}</Text>
          <Text style={styles.arabic}>{journey.arabicTitle}</Text>
        </View>
        <Text style={styles.tagline}>{journey.tagline}</Text>
        <View style={styles.metaRow}>
          <Meta value={`${stages}`} label="stages" />
          <View style={styles.dot} />
          <Meta value={`${steps}`} label="steps" />
          <View style={styles.dot} />
          <Meta value={`${pillars}`} label={pillars === 1 ? 'pillar' : 'pillars'} />
          <View style={styles.dot} />
          <Meta value={journey.durationLabel} label="" />
        </View>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>Begin</Text>
          <Text style={styles.ctaArrow}>→</Text>
        </View>
      </View>
    </Pressable>
  );
}

function Meta({ value, label }: { value: string; label: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.meta}>
      <Text style={styles.metaValue}>{value}</Text>
      {label ? <Text style={styles.metaLabel}>{label}</Text> : null}
    </View>
  );
}

export default function JourneySelect({
  tiltEnabled = true,
  onSelect,
}: {
  tiltEnabled?: boolean;
  onSelect: (kind: PilgrimageKind) => void;
}) {
  const styles = useThemedStyles(makeStyles);
  const journeys = useMemo(() => JOURNEYS, []);
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.kicker}>Choose your journey</Text>
      <Text style={styles.lede}>
        A step-by-step companion through the rites — every act in its order, with its evidence, its supplications, and the mistakes to avoid.
      </Text>
      {journeys.map((j) => (
        <JourneyCard key={j.kind} journey={j} tiltEnabled={tiltEnabled} onPick={() => onSelect(j.kind)} />
      ))}
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.lg },
  kicker: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '600', color: colors.primary, letterSpacing: 0.5, textTransform: 'uppercase' },
  lede: { fontFamily, fontSize: typography.body.fontSize, lineHeight: 22, color: colors.mutedForeground, marginTop: -spacing.sm },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  cardPressed: { opacity: 0.94, borderColor: colors.borderFocus },
  scene: { position: 'relative' },
  sceneFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 40, backgroundColor: colors.card, opacity: 0.0 },
  body: { padding: spacing.lg, gap: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { fontFamily, fontSize: typography.title.fontSize, fontWeight: '700', color: colors.foreground, letterSpacing: typography.title.letterSpacing },
  arabic: { fontFamily: arabicFont, fontSize: 20, color: colors.primary, writingDirection: 'rtl' },
  tagline: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.mutedForeground },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  meta: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  metaValue: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '700', color: colors.foreground },
  metaLabel: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.border },
  cta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  ctaText: { fontFamily, fontSize: typography.button.fontSize, fontWeight: '600', color: colors.primary },
  ctaArrow: { fontFamily, fontSize: typography.button.fontSize, color: colors.primary },
});
