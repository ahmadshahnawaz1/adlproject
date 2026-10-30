/**
 * TasbihScreen — the digital prayer-beads (subḥa).
 *
 * A calm, single-purpose surface: choose a remembrance from the rail, read the
 * phrase that is being recited, and tap the great gold bead to count. The bead
 * fills as the round completes and rolls gently into the next; the after-ṣalāh
 * tasbīḥ walks you through Subḥānallāh, Alḥamdulillāh, Allāhu akbar and the
 * closing tahlīl. Undo eases a miscount, reset opens a fresh sitting, and the
 * lifetime total quietly remembers every dhikr. All offline; the maths lives in
 * lib/tasbih and the persisted numbers in the hook.
 */
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RotateCcw, Undo2, Vibrate, VibrateOff, X } from 'lucide-react-native';
import useTasbih from '../hooks/useTasbih';
import useDhikrGoals from '../hooks/useDhikrGoals';
import TasbihBead from '../components/TasbihBead';
import TasbihPresetPicker from '../components/TasbihPresetPicker';
import { TASBIH_PRESETS, activePhrase } from '../lib/tasbih';
import { arabicFont, fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

function formatThousands(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function TasbihScreen({ onClose }: { onClose?: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const dhikrGoals = useDhikrGoals();
  const t = useTasbih({ onIncrement: dhikrGoals.recordTasbih });
  const { state, preset } = t;

  const guided = !!preset.phrases;
  const phrase = useMemo(
    () => (preset.phrases ? activePhrase(state.count, preset.phrases) : null),
    [preset.phrases, state.count],
  );

  // The text shown above the bead — the live phrase for a guided set, or the
  // chosen dhikr itself for a single remembrance.
  const arabic = guided ? phrase!.phrase.arabic : preset.arabicTitle;
  const translit = guided ? phrase!.phrase.translit : preset.title;
  const translation = guided ? phrase!.phrase.translation : preset.subtitle;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Tasbīḥ</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{preset.title}</Text>
        </View>
        <Pressable
          onPress={() => t.setVibrate(!state.vibrate)}
          hitSlop={12}
          style={styles.iconBtn}
          accessibilityRole="switch"
          accessibilityState={{ checked: state.vibrate }}
          accessibilityLabel="Haptic feedback"
        >
          {state.vibrate ? (
            <Vibrate size={18} color={colors.primary} strokeWidth={2.25} />
          ) : (
            <VibrateOff size={18} color={colors.subtleForeground} strokeWidth={2.25} />
          )}
        </Pressable>
      </View>

      {!t.ready ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Remembrance rail */}
          <TasbihPresetPicker presets={TASBIH_PRESETS} selectedId={state.presetId} onSelect={t.selectPreset} />

          {/* The phrase being recited */}
          <View style={styles.phraseCard}>
            <Text style={styles.arabic} numberOfLines={2}>{arabic}</Text>
            <Text style={styles.translit}>{translit}</Text>
            <Text style={styles.translation}>{translation}</Text>
            {guided ? (
              <View style={styles.phasePill}>
                <Text style={styles.phaseText}>{`${phrase!.done} / ${phrase!.target}`}</Text>
              </View>
            ) : null}
          </View>

          {/* The bead */}
          <View style={styles.beadWrap}>
            <TasbihBead count={state.count} target={preset.target} rounds={state.rounds} onTap={t.tap} />
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <Pressable
              onPress={t.undo}
              style={({ pressed }) => [styles.ctrlBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Undo one"
            >
              <Undo2 size={16} color={colors.mutedForeground} strokeWidth={2.25} />
              <Text style={styles.ctrlText}>Undo</Text>
            </Pressable>
            <Pressable
              onPress={t.reset}
              style={({ pressed }) => [styles.ctrlBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Reset the sitting"
            >
              <RotateCcw size={16} color={colors.mutedForeground} strokeWidth={2.25} />
              <Text style={styles.ctrlText}>Reset</Text>
            </Pressable>
          </View>

          {/* Cited virtue */}
          {preset.note ? (
            <View style={styles.noteCard}>
              <Text style={styles.noteEyebrow}>Virtue</Text>
              <Text style={styles.noteText}>{preset.note}</Text>
            </View>
          ) : null}

          {/* Lifetime */}
          <Text style={styles.lifetime}>
            Lifetime · {formatThousands(state.lifetime)} dhikr
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'] + spacing.md,
    paddingBottom: spacing.md,
  },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.sm },
  headerTitle: { ...typography.title, color: colors.foreground },
  headerSub: { ...typography.caption, fontSize: 12, color: colors.mutedForeground, marginTop: 1 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingBottom: spacing['3xl'], paddingTop: spacing.xs },
  phraseCard: {
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  arabic: {
    fontFamily: arabicFont,
    fontSize: 32,
    lineHeight: 48,
    color: colors.foreground,
    textAlign: 'center',
  },
  translit: { fontFamily, fontSize: typography.body.fontSize, fontWeight: '600', color: colors.primary, marginTop: spacing.sm },
  translation: { fontFamily, fontSize: typography.caption.fontSize, color: colors.mutedForeground, marginTop: 2, textAlign: 'center' },
  phasePill: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  phaseText: { fontFamily, fontSize: 12, fontWeight: '700', color: colors.mutedForeground, letterSpacing: 0.3 },
  beadWrap: { alignItems: 'center', marginVertical: spacing.lg },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.lg },
  ctrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  pressed: { opacity: 0.85 },
  ctrlText: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '600', color: colors.mutedForeground },
  noteCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.22)',
    backgroundColor: 'rgba(255,214,10,0.06)',
  },
  noteEyebrow: {
    fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  noteText: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.mutedForeground },
  lifetime: {
    fontFamily,
    fontSize: typography.caption.fontSize,
    color: colors.subtleForeground,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
