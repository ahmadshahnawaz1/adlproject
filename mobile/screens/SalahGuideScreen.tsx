/**
 * SalahGuideScreen — the guided, evidence-cited prayer, posture by posture.
 *
 * Pick a prayer (Fajr through ʿIshāʾ, Witr, or the funeral prayer) and the
 * engine lays it out as an ordered run of steps: the opening takbīr, every
 * standing with its recitation, the bowing, the risings, the prostrations, the
 * sittings, the tashahhud and the salām — read aloud only where the prayer is
 * audible, with the qunūt woven into Witr. One calm posture fills the screen at
 * a time: its cinematic scene, its rank, what is said within it (Arabic,
 * transliteration, translation) and — one tap away — its evidence. Swipe or tap
 * to move; a rakʿah rail and a progress bar mark how far you are.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, X, Info, Check } from 'lucide-react-native';
import PrayerPicker from '../components/PrayerPicker';
import RakahProgressRail from '../components/RakahProgressRail';
import SalahStepCard from '../components/SalahStepCard';
import SalahInfoSheet from '../components/SalahInfoSheet';
import {
  DEFAULT_PRAYER_ID,
  PRAYERS,
  getPrayerSteps,
  prayerById,
  rakahNumbers,
} from '../lib/salah';
import type { PrayerId } from '../content/salah';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const { width: SCREEN_W } = Dimensions.get('window');
const SWIPE_DISTANCE = SCREEN_W * 0.26;
// PanResponder reports velocity in px/ms, so this is a much smaller number
// than a per-second threshold would be.
const SWIPE_VELOCITY = 0.35;

export default function SalahGuideScreen({ onClose }: { onClose?: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [prayerId, setPrayerId] = useState<PrayerId>(DEFAULT_PRAYER_ID);
  const steps = useMemo(() => getPrayerSteps(prayerId), [prayerId]);
  const rakahs = useMemo(() => rakahNumbers(steps), [steps]);
  const prayer = prayerById(prayerId) ?? prayerById(DEFAULT_PRAYER_ID)!;

  const [i, setI] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);
  const iRef = useRef(i);
  iRef.current = i;

  const tx = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const total = steps.length;
  const totalRef = useRef(total);
  totalRef.current = total;
  const step = steps[Math.min(i, total - 1)];
  const isLast = i >= total - 1;

  // Reset to the first step whenever the chosen prayer (and so the list) changes.
  useEffect(() => {
    setI(0);
    tx.setValue(0);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [prayerId, tx]);

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
    scrollRef.current?.scrollTo({ y: 0, animated: false });
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

  const progress = (i + 1) / total;
  const railTitle =
    prayer.kind === 'janazah'
      ? 'Funeral prayer'
      : step.rakah > 0
        ? `Rakʿah ${step.rakah} of ${step.totalRakahs}`
        : prayer.name;

  return (
    <View style={styles.root}>
      {/* Header: close · title · info */}
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>How to Pray</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {prayer.name} · {prayer.transliteration}
          </Text>
        </View>
        <Pressable onPress={() => setInfoOpen(true)} hitSlop={12} style={styles.iconBtn}>
          <Info size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
      </View>

      {/* Prayer chooser (full-bleed) */}
      <View style={styles.pickerWrap}>
        <PrayerPicker prayers={PRAYERS} selectedId={prayerId} onSelect={setPrayerId} />
      </View>

      {/* Overall step progress */}
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {i + 1} of {total}
        </Text>
      </View>

      {/* The step card (swipeable, scrollable) */}
      <Animated.View style={[styles.cardWrap, cardStyle]} {...panResponder.panHandlers}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <RakahProgressRail
            rakahs={rakahs}
            currentRakah={step.rakah}
            title={railTitle}
            rightLabel={step.name}
          />
          <View style={{ height: spacing.md }} />
          <SalahStepCard key={step.key} step={step} showArabic tiltEnabled />
        </ScrollView>
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
            <Text style={styles.primaryText}>Complete</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => paginate(1)} style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Next</Text>
            <ChevronRight size={20} color={colors.primaryForeground} strokeWidth={2.5} />
          </Pressable>
        )}
      </View>

      <SalahInfoSheet visible={infoOpen} onClose={() => setInfoOpen(false)} />
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
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  headerTitle: { fontFamily, fontSize: 17, fontWeight: '700', color: colors.foreground },
  headerSub: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground },

  pickerWrap: { marginHorizontal: -spacing.lg, marginBottom: spacing.md },

  progressRow: { gap: 6, marginBottom: spacing.md },
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

  cardWrap: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl },

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
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  primaryText: { ...typography.button, color: colors.primaryForeground, fontWeight: '700' },
});
