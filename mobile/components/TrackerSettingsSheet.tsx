/**
 * TrackerSettingsSheet — make the tracker yours.
 *
 * A single bottom sheet mirroring the calculation/notification sheets: choose
 * the stats window and trend range, switch between a lenient or strict streak,
 * set a streak goal to celebrate, and toggle small comforts (Arabic names,
 * haptic feedback). Every change persists instantly through the parent's prefs.
 */
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { X, Target } from 'lucide-react-native';
import {
  STATS_WINDOW_OPTIONS,
  TREND_DAY_OPTIONS,
  STREAK_GOAL_OPTIONS,
  type TrackerPrefs,
} from '../hooks/useTrackerPrefs';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

function windowLabel(days: number): string {
  return days >= 365 ? '1 yr' : `${days}d`;
}

function goalLabel(n: number): string {
  return n === 0 ? 'Off' : `${n}`;
}

export default function TrackerSettingsSheet({
  visible,
  prefs,
  onClose,
  onSetPref,
  onReset,
}: {
  visible: boolean;
  prefs: TrackerPrefs;
  onClose: () => void;
  onSetPref: <K extends keyof TrackerPrefs>(key: K, value: TrackerPrefs[K]) => void;
  onReset: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Tracker</Text>
          <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
            <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Stats window */}
          <Text style={styles.sectionLabel}>Stats window</Text>
          <View style={styles.segment}>
            {STATS_WINDOW_OPTIONS.map((d) => (
              <Seg
                key={d}
                label={windowLabel(d)}
                selected={prefs.statsWindowDays === d}
                onPress={() => onSetPref('statsWindowDays', d)}
              />
            ))}
          </View>
          <Text style={styles.note}>Consistency and congregation count over this trailing window.</Text>

          {/* Trend range */}
          <Text style={styles.sectionLabel}>Trend range</Text>
          <View style={styles.segment}>
            {TREND_DAY_OPTIONS.map((d) => (
              <Seg
                key={d}
                label={`${d}d`}
                selected={prefs.trendDays === d}
                onPress={() => onSetPref('trendDays', d)}
              />
            ))}
          </View>

          {/* Streak goal */}
          <Text style={styles.sectionLabel}>Streak goal</Text>
          <View style={styles.segment}>
            {STREAK_GOAL_OPTIONS.map((n) => (
              <Seg
                key={n}
                label={goalLabel(n)}
                selected={prefs.streakGoal === n}
                onPress={() => onSetPref('streakGoal', n)}
              />
            ))}
          </View>
          {prefs.streakGoal > 0 ? (
            <View style={styles.goalNote}>
              <Target size={14} color={colors.primary} strokeWidth={2.2} />
              <Text style={styles.note}>A progress ring fills as you approach {prefs.streakGoal} days.</Text>
            </View>
          ) : null}

          {/* Strict streak */}
          <View style={styles.toggleRow}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Strict streak</Text>
              <Text style={styles.rowSub}>Only on-time or congregation keeps the run</Text>
            </View>
            <Switch
              value={prefs.strictStreak}
              onValueChange={(v) => onSetPref('strictStreak', v)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.foreground}
            />
          </View>

          {/* Arabic names */}
          <View style={styles.toggleRow}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Arabic names</Text>
              <Text style={styles.rowSub}>Show each prayer's name in Arabic</Text>
            </View>
            <Switch
              value={prefs.showArabic}
              onValueChange={(v) => onSetPref('showArabic', v)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.foreground}
            />
          </View>

          {/* Haptics */}
          <View style={styles.toggleRow}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Haptic feedback</Text>
              <Text style={styles.rowSub}>A soft pulse when you log a prayer</Text>
            </View>
            <Switch
              value={prefs.haptics}
              onValueChange={(v) => onSetPref('haptics', v)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.foreground}
            />
          </View>

          <Pressable
            onPress={onReset}
            style={({ pressed }) => [styles.reset, pressed && styles.resetPressed]}
          >
            <Text style={styles.resetText}>Reset to defaults</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Seg({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.segBtn,
        selected && styles.segBtnActive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.segText, selected && styles.segTextActive]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '88%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: { ...typography.title, color: colors.foreground },
  close: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingBottom: spacing.lg },

  sectionLabel: {
    ...typography.label,
    color: colors.subtleForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  note: { ...typography.caption, color: colors.subtleForeground, lineHeight: 18, marginTop: spacing.sm },
  goalNote: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },

  segment: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
  },
  segBtn: {
    flex: 1,
    paddingVertical: spacing.sm + 1,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  segBtnActive: { backgroundColor: colors.primary },
  segText: { ...typography.label, color: colors.mutedForeground },
  segTextActive: { color: colors.primaryForeground, fontWeight: '700' },
  pressed: { opacity: 0.7 },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowText: { flex: 1, paddingRight: spacing.lg },
  rowLabel: { ...typography.body, fontSize: 15, fontWeight: '600', color: colors.foreground },
  rowSub: { ...typography.caption, color: colors.subtleForeground, marginTop: 2 },

  reset: {
    marginTop: spacing.xl,
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetPressed: { backgroundColor: colors.cardElevated },
  resetText: { ...typography.label, color: colors.mutedForeground },
});
