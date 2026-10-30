/**
 * PrayerStatusPill — one tappable prayer in the tracker.
 *
 * Shows the prayer's name + Arabic and a circular status badge. Tapping cycles
 * the status; whenever it lands on a "prayed" state the badge springs with a
 * satisfying pop and a soft success haptic. A long-press clears it back to
 * unlogged. Pure presentation — the parent owns the log state.
 */
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, X, Clock, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { isPrayed, type PrayerStatus, type ObligatoryName } from '../lib/prayerLog';
import { radius, spacing, typography, arabicFont } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const makeMeta = (colors: ThemeColors): Record<PrayerStatus, { label: string; color: string; tint: string }> => ({
  none: { label: 'Tap to log', color: colors.subtleForeground, tint: colors.cardElevated },
  jamaah: { label: "Jama\u02bbah", color: colors.primary, tint: `${colors.primary}24` },
  ontime: { label: 'On time', color: colors.success, tint: `${colors.success}22` },
  late: { label: 'Late', color: '#F59E0B', tint: '#F59E0B22' },
  qaza: { label: 'Made up (qaza)', color: '#60A5FA', tint: '#60A5FA22' },
  missed: { label: 'Missed', color: colors.destructive, tint: `${colors.destructive}22` },
});

function Badge({ status, color }: { status: PrayerStatus; color: string }) {
  const styles = useThemedStyles(makeStyles);
  if (status === 'jamaah') return <Users size={18} color={color} strokeWidth={2.6} />;
  if (status === 'ontime') return <Check size={20} color={color} strokeWidth={3} />;
  if (status === 'late') return <Clock size={17} color={color} strokeWidth={2.6} />;
  if (status === 'qaza') return <Check size={18} color={color} strokeWidth={2.6} />;
  if (status === 'missed') return <X size={18} color={color} strokeWidth={3} />;
  return <View style={styles.emptyDot} />;
}

export default function PrayerStatusPill({
  prayer,
  arabic,
  status,
  onCycle,
  onClear,
  haptics = true,
}: {
  prayer: ObligatoryName;
  arabic: string;
  status: PrayerStatus;
  onCycle: (p: ObligatoryName) => void;
  onClear: (p: ObligatoryName) => void;
  haptics?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const META = makeMeta(colors);
  const meta = META[status];
  const pop = useRef(new Animated.Value(1)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const prevPrayed = useRef(isPrayed(status));

  // Pop + ring bloom only when transitioning INTO a fulfilled state.
  useEffect(() => {
    const nowPrayed = isPrayed(status);
    if (nowPrayed && !prevPrayed.current) {
      if (haptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      pop.setValue(0.6);
      ring.setValue(0);
      Animated.parallel([
        Animated.spring(pop, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
        Animated.timing(ring, { toValue: 1, duration: 520, useNativeDriver: true }),
      ]).start();
    }
    prevPrayed.current = nowPrayed;
  }, [status, pop, ring, haptics]);

  const label = prayer.charAt(0).toUpperCase() + prayer.slice(1);
  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.9] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.5, 0] });

  return (
    <Pressable
      onPress={() => onCycle(prayer)}
      onLongPress={() => onClear(prayer)}
      delayLongPress={320}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.left}>
        <Text style={styles.name}>{label}</Text>
        {arabic ? <Text style={styles.arabic}>{arabic}</Text> : null}
      </View>

      <View style={styles.right}>
        <Text style={[styles.status, { color: meta.color }]}>{meta.label}</Text>
        <View style={styles.badgeWrap}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ring,
              { borderColor: meta.color, opacity: ringOpacity, transform: [{ scale: ringScale }] },
            ]}
          />
          <Animated.View
            style={[
              styles.badge,
              { backgroundColor: meta.tint, transform: [{ scale: pop }] },
            ]}
          >
            <Badge status={status} color={meta.color} />
          </Animated.View>
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  rowPressed: { backgroundColor: colors.cardElevated },
  left: { gap: 2 },
  name: { ...typography.title, fontSize: 17, color: colors.foreground },
  arabic: { fontSize: 13, color: colors.mutedForeground, fontFamily: arabicFont },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  status: { ...typography.label },
  badgeWrap: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 2,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDot: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.subtleForeground,
  },
});
