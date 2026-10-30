/**
 * ZakatDueReminderSheet — arrange the once-a-year nudge for when a worshipper's
 * wealth completes its lunar year (ḥawl). Enable it, choose how many days ahead
 * to be reminded, preview the exact date, and feel it with a test. Pure
 * controls: all state lives in useZakatReminder. Offline.
 */
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { CalendarClock, Minus, Plus, X } from 'lucide-react-native';

import {
  MAX_DAYS_BEFORE,
  MIN_DAYS_BEFORE,
  DAYS_BEFORE_STEP,
  type ZakatReminderPrefs,
} from '../../hooks/useZakatReminder';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ZakatDueReminderSheet({
  visible,
  onClose,
  prefs,
  dueDateISO,
  reminderDateISO,
  onSetEnabled,
  onSetDaysBefore,
  onTest,
}: {
  visible: boolean;
  onClose: () => void;
  prefs: ZakatReminderPrefs;
  dueDateISO: string | null;
  reminderDateISO: string | null;
  onSetEnabled: (value: boolean) => void;
  onSetDaysBefore: (days: number) => void;
  onTest?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const hasHawl = Boolean(dueDateISO);
  const dueLabel = formatDate(dueDateISO);
  const fireLabel = formatDate(reminderDateISO);
  const minusDisabled = prefs.daysBefore <= MIN_DAYS_BEFORE;
  const plusDisabled = prefs.daysBefore >= MAX_DAYS_BEFORE;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <Text style={styles.title}>Zakāt-due reminder</Text>
            <Pressable onPress={onClose} style={styles.close} hitSlop={8}>
              <X size={16} color={colors.foreground} strokeWidth={2} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {hasHawl ? (
              <View style={styles.dueCard}>
                <CalendarClock size={16} color={colors.primary} strokeWidth={2.2} />
                <View style={styles.dueText}>
                  <Text style={styles.dueLabel}>Your ḥawl completes</Text>
                  <Text style={styles.dueValue}>{dueLabel}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.dueCard}>
                <CalendarClock size={16} color={colors.subtleForeground} strokeWidth={2.2} />
                <View style={styles.dueText}>
                  <Text style={styles.dueLabel}>No holding period set</Text>
                  <Text style={styles.hintValue}>
                    Set your ḥawl start date in Zakat settings to schedule this reminder.
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.toggleRow}>
              <View style={styles.toggleText}>
                <Text style={styles.toggleLabel}>Remind me when zakat is due</Text>
                <Text style={styles.toggleSub}>
                  {prefs.enabled && fireLabel
                    ? `On ${fireLabel}`
                    : 'A single notification each year on your device'}
                </Text>
              </View>
              <Switch
                value={prefs.enabled}
                onValueChange={onSetEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.border}
                disabled={!hasHawl}
              />
            </View>

            {prefs.enabled && hasHawl ? (
              <>
                <View style={styles.stepper}>
                  <Text style={styles.stepperLabel}>Days before the due date</Text>
                  <View style={styles.stepperControls}>
                    <Pressable
                      onPress={() => onSetDaysBefore(prefs.daysBefore - DAYS_BEFORE_STEP)}
                      disabled={minusDisabled}
                      style={({ pressed }) => [
                        styles.stepBtn,
                        minusDisabled && styles.stepDisabled,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Minus size={16} color={colors.foreground} strokeWidth={2.5} />
                    </Pressable>
                    <Text style={styles.stepValue}>
                      {prefs.daysBefore === 0 ? 'On the day' : `${prefs.daysBefore}d`}
                    </Text>
                    <Pressable
                      onPress={() => onSetDaysBefore(prefs.daysBefore + DAYS_BEFORE_STEP)}
                      disabled={plusDisabled}
                      style={({ pressed }) => [
                        styles.stepBtn,
                        plusDisabled && styles.stepDisabled,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Plus size={16} color={colors.foreground} strokeWidth={2.5} />
                    </Pressable>
                  </View>
                </View>

                {onTest ? (
                  <Pressable
                    onPress={onTest}
                    style={({ pressed }) => [styles.testBtn, pressed && styles.pressed]}
                  >
                    <Text style={styles.testText}>Send a test in 5 seconds</Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}

            <Text style={styles.note}>
              The reminder is scheduled on your device and renews whenever you open
              Adl. No connection is ever used.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    maxHeight: '85%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: { ...typography.title, fontFamily, color: colors.foreground },
  close: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardElevated,
  },
  scroll: { paddingTop: spacing.sm, paddingBottom: spacing.lg },
  dueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  dueText: { flex: 1, gap: 2 },
  dueLabel: { ...typography.caption, fontFamily, color: colors.mutedForeground },
  dueValue: { ...typography.body, fontFamily, color: colors.foreground, fontWeight: '700' },
  hintValue: { ...typography.caption, fontFamily, color: colors.subtleForeground, lineHeight: 17 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  toggleText: { flex: 1, gap: 2 },
  toggleLabel: { ...typography.body, fontFamily, color: colors.foreground, fontWeight: '600' },
  toggleSub: { ...typography.caption, fontFamily, color: colors.mutedForeground },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  stepperLabel: { ...typography.body, fontFamily, color: colors.foreground },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
  },
  stepDisabled: { opacity: 0.4 },
  stepValue: {
    minWidth: 78,
    textAlign: 'center',
    ...typography.body,
    fontFamily,
    color: colors.foreground,
    fontWeight: '700',
  },
  testBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
    marginTop: spacing.lg,
  },
  testText: { ...typography.button, fontFamily, color: colors.foreground },
  note: {
    ...typography.caption,
    fontFamily,
    color: colors.subtleForeground,
    lineHeight: 18,
    marginTop: spacing.xl,
  },
  pressed: { opacity: 0.7 },
});
