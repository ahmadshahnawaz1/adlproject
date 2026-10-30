/**
 * ZakatWizard — the calm, guided path through zakat: one group at a time,
 * swipe or tap to move, with the niṣāb gauge updating live above each step.
 * It renders the exact same ZakatSection cards as the worksheet, so the
 * numbers and behaviour are identical — only the pacing changes.
 *
 * Animation is built-in Animated + PanResponder (no native gesture libs), so
 * it runs everywhere, including Expo Go.
 */
import { useMemo, useRef, useState } from 'react';
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
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import type { ZakatField, ZakatGroup, ZakatSettings, ZakatValues } from '../content/zakat/zakat';
import type { ZakatComputation } from '../lib/zakat';
import { formatMoney } from '../lib/zakat';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import ZakatNisabGauge from './ZakatNisabGauge';
import ZakatSection from './ZakatSection';

const { width: SCREEN_W } = Dimensions.get('window');
const SWIPE_DISTANCE = SCREEN_W * 0.26;
const SWIPE_VELOCITY = 0.35;

export default function ZakatWizard({
  groups,
  values,
  settings,
  computation: c,
  onChange,
  onSeeResult,
}: {
  groups: ZakatGroup[];
  values: ZakatValues;
  settings: ZakatSettings;
  computation: ZakatComputation;
  onChange: (key: ZakatField['key'], value: number) => void;
  onSeeResult: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [i, setI] = useState(0);
  const iRef = useRef(i);
  iRef.current = i;
  const total = groups.length;
  const totalRef = useRef(total);
  totalRef.current = total;

  const tx = useRef(new Animated.Value(0)).current;
  const group = groups[Math.min(i, total - 1)];
  const isLast = i >= total - 1;
  const ratio = c.nisab > 0 ? c.netZakatable / c.nisab : c.netZakatable > 0 ? 1 : 0;

  function springBack() {
    Animated.spring(tx, { toValue: 0, damping: 18, stiffness: 160, mass: 0.6, useNativeDriver: true }).start();
  }

  function commit(next: number, dir: number) {
    setI(next);
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

  const onRelease = (dx: number, vx: number) => {
    const passed = Math.abs(dx) > SWIPE_DISTANCE || Math.abs(vx) > SWIPE_VELOCITY;
    if (passed) paginate(dx < 0 ? 1 : -1);
    else springBack();
  };
  const handlersRef = useRef({ onRelease });
  handlersRef.current = { onRelease };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) =>
          Math.abs(g.dx) > 16 && Math.abs(g.dx) > Math.abs(g.dy) * 1.4,
        onPanResponderMove: (_e, g) => tx.setValue(g.dx),
        onPanResponderRelease: (_e, g) => handlersRef.current.onRelease(g.dx, g.vx),
        onPanResponderTerminate: (_e, g) => handlersRef.current.onRelease(g.dx, g.vx),
      }),
    [tx],
  );

  const cardStyle = {
    transform: [{ translateX: tx }],
    opacity: tx.interpolate({
      inputRange: [-SCREEN_W * 0.7, 0, SCREEN_W * 0.7],
      outputRange: [0.2, 1, 0.2],
      extrapolate: 'clamp' as const,
    }),
  };

  const progress = (i + 1) / total;

  return (
    <View style={styles.root}>
      {/* Progress rail */}
      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Step {i + 1} of {total} · {group.title}
        </Text>
      </View>

      {/* Live gauge */}
      <View style={styles.gaugeWrap}>
        <ZakatNisabGauge
          ratio={ratio}
          meetsNisab={c.meetsNisab}
          centerTop={c.meetsNisab ? 'Zakat due' : 'Net wealth'}
          centerMain={formatMoney(c.meetsNisab ? c.zakatDue : c.netZakatable, c.currency)}
          centerSub={
            c.meetsNisab ? 'Above niṣāb' : `${formatMoney(c.shortfallToNisab, c.currency)} to niṣāb`
          }
          size={168}
        />
      </View>

      {/* Step card */}
      <Animated.View style={[styles.card, cardStyle]} {...panResponder.panHandlers}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.cardContent}
          keyboardShouldPersistTaps="handled"
        >
          <ZakatSection
            group={group}
            values={values}
            currency={settings.currency}
            goldPerGram={settings.goldPerGram}
            silverPerGram={settings.silverPerGram}
            onChange={onChange}
            defaultEvidenceOpen={false}
          />
        </ScrollView>
      </Animated.View>

      {/* Footer nav */}
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
          <Pressable onPress={onSeeResult} style={styles.primaryBtn}>
            <Check size={18} color={colors.primaryForeground} strokeWidth={2.5} />
            <Text style={styles.primaryText}>See result</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => paginate(1)} style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Next</Text>
            <ChevronRight size={20} color={colors.primaryForeground} strokeWidth={2.5} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing.lg },
  progressWrap: { gap: 6, marginTop: spacing.sm },
  progressTrack: { height: 6, borderRadius: 999, backgroundColor: colors.cardElevated, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 999, backgroundColor: colors.primary },
  progressText: { ...typography.caption, fontSize: 12, color: colors.subtleForeground, textAlign: 'center' },

  gaugeWrap: { alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.sm },

  card: { flex: 1 },
  cardContent: { paddingBottom: spacing.lg },

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
  navBtnDisabled: { opacity: 0.4 },
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
  primaryText: { ...typography.button, fontWeight: '700', color: colors.primaryForeground },
});
