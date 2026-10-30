/**
 * WuduScreen — the guided, evidence-cited ablution.
 *
 * One calm step at a time, in the order the Prophet ﷺ performed it. Each step
 * shows animated water-fill art, its name in English, Arabic and
 * transliteration, a clear instruction, how many times to perform it, whether
 * it is obligatory (farḍ) or perfecting Sunnah, and — one tap away — the daleel
 * that backs it. Swipe or tap to move; a progress rail marks how far you are.
 *
 * Two modes: the complete Sunnah method, or just the four Qurʾānic essentials
 * for when time is short.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, X, BookOpen, Info, Check } from 'lucide-react-native';
import WuduStepArt from '../components/WuduStepArt';
import WuduInfoSheet from '../components/WuduInfoSheet';
import { WUDU_STEPS, FARD_IDS, type WuduStep } from '../content/wudu/wudu';
import { radius, spacing, typography, arabicFont } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const { width: SCREEN_W } = Dimensions.get('window');
const SWIPE_DISTANCE = SCREEN_W * 0.26;
// PanResponder reports velocity in px/ms, so this is a much smaller number
// than a per-second threshold would be.
const SWIPE_VELOCITY = 0.35;

type Mode = 'complete' | 'essentials';

export default function WuduScreen({ onClose }: { onClose?: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [mode, setMode] = useState<Mode>('complete');
  const steps = useMemo<WuduStep[]>(
    () => (mode === 'complete' ? WUDU_STEPS : WUDU_STEPS.filter((s) => FARD_IDS.includes(s.id))),
    [mode],
  );

  const [i, setI] = useState(0);
  const [showEvidence, setShowEvidence] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const iRef = useRef(i);
  iRef.current = i;

  const tx = useRef(new Animated.Value(0)).current;
  const total = steps.length;
  const totalRef = useRef(total);
  totalRef.current = total;
  const step = steps[Math.min(i, total - 1)];
  const isLast = i >= total - 1;

  // Keep the index valid when the mode (and so the list) changes.
  useEffect(() => {
    setI(0);
    setShowEvidence(false);
    tx.setValue(0);
  }, [mode, tx]);

  function springBack() {
    Animated.spring(tx, {
      toValue: 0,
      damping: 18,
      stiffness: 160,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  }

  function commit(next: number, dir: number) {
    setI(next);
    setShowEvidence(false);
    // Drop in from the opposite edge, then settle to centre.
    tx.setValue(dir * SCREEN_W);
    Animated.timing(tx, {
      toValue: 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }

  function paginate(dir: number) {
    const next = iRef.current + dir;
    if (next < 0 || next >= totalRef.current) {
      springBack();
      return;
    }
    Haptics.selectionAsync().catch(() => {});
    Animated.timing(tx, {
      toValue: -dir * SCREEN_W,
      duration: 190,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) commit(next, dir);
    });
  }

  function finish() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onClose?.();
  }

  // PanResponder reads the latest handlers through a ref so the responder
  // itself can stay stable for the component's lifetime.
  const onRelease = (dx: number, vx: number) => {
    const passed = Math.abs(dx) > SWIPE_DISTANCE || Math.abs(vx) > SWIPE_VELOCITY;
    if (passed) {
      paginate(dx < 0 ? 1 : -1);
    } else {
      springBack();
    }
  };
  const handlersRef = useRef({ onRelease });
  handlersRef.current = { onRelease };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy) * 1.3,
      onPanResponderMove: (_e, g) => tx.setValue(g.dx),
      onPanResponderRelease: (_e, g) => handlersRef.current.onRelease(g.dx, g.vx),
      onPanResponderTerminate: (_e, g) => handlersRef.current.onRelease(g.dx, g.vx),
    }),
  ).current;

  const cardStyle = {
    transform: [
      { translateX: tx },
      {
        scale: tx.interpolate({
          inputRange: [-SCREEN_W, 0, SCREEN_W],
          outputRange: [0.92, 1, 0.92],
          extrapolate: 'clamp' as const,
        }),
      },
    ],
    opacity: tx.interpolate({
      inputRange: [-SCREEN_W * 0.7, 0, SCREEN_W * 0.7],
      outputRange: [0.15, 1, 0.15],
      extrapolate: 'clamp' as const,
    }),
  };

  const fard = step.category === 'fard';
  const progress = (i + 1) / total;

  return (
    <View style={styles.root}>
      {/* Header: close, progress, info */}
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {i + 1} of {total}
          </Text>
        </View>
        <Pressable onPress={() => setInfoOpen(true)} hitSlop={12} style={styles.iconBtn}>
          <Info size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
      </View>

      {/* Mode toggle */}
      <View style={styles.segment}>
        {(['complete', 'essentials'] as Mode[]).map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            style={[styles.segBtn, mode === m && styles.segBtnActive]}
          >
            <Text style={[styles.segText, mode === m && styles.segTextActive]}>
              {m === 'complete' ? 'Complete · Sunnah' : 'Essentials · Farḍ'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* The step card */}
      <Animated.View style={[styles.card, cardStyle]} {...panResponder.panHandlers}>
        <View style={styles.artWrap}>
            <WuduStepArt art={step.art} size={184} />
            {step.times > 0 ? (
              <View style={styles.countChip}>
                <Text style={styles.countText}>×{step.times}</Text>
              </View>
            ) : null}
          </View>

          <View style={[styles.tag, fard ? styles.tagFard : styles.tagSunnah]}>
            <Text style={[styles.tagText, fard ? styles.tagTextFard : styles.tagTextSunnah]}>
              {fard ? 'Obligatory · Farḍ' : 'Sunnah'}
            </Text>
          </View>

          <Text style={styles.stepName}>{step.name}</Text>
          <Text style={styles.stepArabic}>{step.arabic}</Text>
          <Text style={styles.stepTranslit}>{step.transliteration}</Text>

          <Text style={styles.instruction}>{step.instruction}</Text>
          {step.tip ? <Text style={styles.tip}>{step.tip}</Text> : null}

          {/* Evidence reveal */}
          <Pressable style={styles.evidenceToggle} onPress={() => setShowEvidence((v) => !v)}>
            <BookOpen size={15} color={colors.primary} strokeWidth={2.2} />
            <Text style={styles.evidenceToggleText}>
              {showEvidence ? 'Hide evidence' : 'Show evidence'}
            </Text>
          </Pressable>

          {showEvidence ? (
            <View style={styles.evidenceBox}>
              {step.daleel.map((d, idx) => (
                <View key={idx} style={idx > 0 ? styles.daleelDivider : undefined}>
                  <Text style={styles.daleelText}>{d.text}</Text>
                  <Text style={styles.daleelRef}>
                    {d.source === 'quran' ? 'Qurʾān · ' : ''}
                    {d.reference}
                    {d.narrator ? `  ·  ${d.narrator}` : ''}
                    {d.grade ? `  ·  ${d.grade}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
      </Animated.View>

      {/* Footer navigation */}
      <View style={styles.footer}>
        <Pressable
          onPress={() => paginate(-1)}
          disabled={i === 0}
          style={[styles.navBtn, i === 0 && styles.navBtnDisabled]}
        >
          <ChevronLeft size={20} color={i === 0 ? colors.subtleForeground : colors.foreground} strokeWidth={2.25} />
          <Text style={[styles.navText, i === 0 && styles.navTextDisabled]}>Back</Text>
        </Pressable>

        {isLast ? (
          <Pressable onPress={finish} style={styles.primaryBtn}>
            <Check size={18} color={colors.primaryForeground} strokeWidth={2.5} />
            <Text style={styles.primaryText}>I'm ready to pray</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => paginate(1)} style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Next</Text>
            <ChevronRight size={20} color={colors.primaryForeground} strokeWidth={2.5} />
          </Pressable>
        )}
      </View>

      <WuduInfoSheet visible={infoOpen} onClose={() => setInfoOpen(false)} />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing['3xl'] + spacing.md,
    paddingBottom: spacing.lg,
  },
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
  progressWrap: { flex: 1, gap: 6 },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.cardElevated,
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 999, backgroundColor: colors.primary },
  progressText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.subtleForeground,
    textAlign: 'center',
  },

  segment: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  segBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  segBtnActive: { backgroundColor: colors.primary },
  segText: { ...typography.label, color: colors.mutedForeground },
  segTextActive: { color: colors.primaryForeground, fontWeight: '700' },

  card: { flex: 1, alignItems: 'center' },
  artWrap: { marginTop: spacing.sm, marginBottom: spacing.md, alignItems: 'center', justifyContent: 'center' },
  countChip: {
    position: 'absolute',
    right: -4,
    top: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  countText: { ...typography.button, fontSize: 14, color: colors.primaryForeground, fontWeight: '800' },

  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  tagFard: { backgroundColor: `${colors.primary}1A`, borderColor: `${colors.primary}55` },
  tagSunnah: { backgroundColor: colors.cardElevated, borderColor: colors.border },
  tagText: { ...typography.label, fontSize: 12, letterSpacing: 0.4 },
  tagTextFard: { color: colors.primary, fontWeight: '700' },
  tagTextSunnah: { color: colors.mutedForeground },

  stepName: { ...typography.title, color: colors.foreground, textAlign: 'center' },
  stepArabic: {
    fontFamily: arabicFont,
    fontSize: 26,
    color: colors.foreground,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  stepTranslit: {
    ...typography.caption,
    color: colors.subtleForeground,
    fontStyle: 'italic',
    marginTop: 2,
    textAlign: 'center',
  },
  instruction: {
    ...typography.body,
    color: colors.mutedForeground,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  tip: {
    ...typography.caption,
    fontSize: 12,
    color: colors.subtleForeground,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  evidenceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  evidenceToggleText: { ...typography.label, color: colors.primary, fontWeight: '600' },
  evidenceBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
    alignSelf: 'stretch',
  },
  daleelDivider: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  daleelText: { ...typography.body, fontSize: 14, color: colors.foreground, lineHeight: 21 },
  daleelRef: { ...typography.caption, fontSize: 12, color: colors.primary, marginTop: 6 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  navBtnDisabled: { opacity: 0.5 },
  navText: { ...typography.button, color: colors.foreground },
  navTextDisabled: { color: colors.subtleForeground },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  primaryText: { ...typography.button, fontSize: 16, color: colors.primaryForeground, fontWeight: '700' },
});
