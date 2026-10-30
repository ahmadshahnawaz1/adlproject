/**
 * TahajjudReminderSheet — a calm bottom sheet to arrange a gentle wake for the
 * night prayer. Enable the reminder, choose when it lands (the start of the last
 * third, Islamic midnight, or a chosen span before Fajr), and feel it with a
 * test. Pure controls: all state lives in useTahajjud.
 */
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Check, Minus, Plus, X } from 'lucide-react-native';
import type { TahajjudPrefs } from '../../hooks/useTahajjud';
import {
  BEFORE_FAJR_STEP,
  MAX_BEFORE_FAJR,
  MIN_BEFORE_FAJR,
} from '../../hooks/useTahajjud';
import type { ReminderMode } from '../../lib/nightPrayer';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

type ModeOption = { mode: ReminderMode; title: string; detail: string };

const MODE_OPTIONS: ModeOption[] = [
  {
    mode: 'lastThirdStart',
    title: 'Start of the last third',
    detail: 'When the most beloved standing begins',
  },
  {
    mode: 'islamicMidnight',
    title: 'Islamic midnight',
    detail: 'The midpoint between Maghrib and Fajr',
  },
  {
    mode: 'beforeFajr',
    title: 'Before Fajr',
    detail: 'A chosen span before dawn',
  },
];

export default function TahajjudReminderSheet({
  visible,
  onClose,
  prefs,
  onSetEnabled,
  onSetMode,
  onSetBeforeFajrMinutes,
  reminderPreview,
  onTest,
}: {
  visible: boolean;
  onClose: () => void;
  prefs: TahajjudPrefs;
  onSetEnabled: (value: boolean) => void;
  onSetMode: (mode: ReminderMode) => void;
  onSetBeforeFajrMinutes: (minutes: number) => void;
  reminderPreview?: string;
  onTest?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const minusDisabled = prefs.beforeFajrMinutes <= MIN_BEFORE_FAJR;
  const plusDisabled = prefs.beforeFajrMinutes >= MAX_BEFORE_FAJR;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <Text style={styles.title}>Tahajjud reminder</Text>
            <Pressable onPress={onClose} style={styles.close} hitSlop={8}>
              <X size={16} color={colors.foreground} strokeWidth={2} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            <View style={styles.toggleRow}>
              <View style={styles.toggleText}>
                <Text style={styles.toggleLabel}>Wake me for the night prayer</Text>
                <Text style={styles.toggleSub}>
                  {prefs.reminderEnabled && reminderPreview
                    ? `Tonight at about ${reminderPreview}`
                    : 'A quiet reminder in the depth of night'}
                </Text>
              </View>
              <Switch
                value={prefs.reminderEnabled}
                onValueChange={onSetEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.border}
              />
            </View>

            {prefs.reminderEnabled ? (
              <>
                <Text style={styles.section}>WHEN</Text>
                {MODE_OPTIONS.map((option) => {
                  const selected = prefs.mode === option.mode;
                  return (
                    <Pressable
                      key={option.mode}
                      onPress={() => onSetMode(option.mode)}
                      style={({ pressed }) => [
                        styles.option,
                        selected && styles.optionSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.optionText}>
                        <Text
                          style={[styles.optionTitle, selected && styles.optionTitleSelected]}
                        >
                          {option.title}
                        </Text>
                        <Text style={styles.optionDetail}>{option.detail}</Text>
                      </View>
                      <View style={[styles.radio, selected && styles.radioOn]}>
                        {selected ? (
                          <Check size={13} color={colors.primaryForeground} strokeWidth={3} />
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}

                {prefs.mode === 'beforeFajr' ? (
                  <View style={styles.stepper}>
                    <Text style={styles.stepperLabel}>Minutes before Fajr</Text>
                    <View style={styles.stepperControls}>
                      <Pressable
                        onPress={() =>
                          onSetBeforeFajrMinutes(prefs.beforeFajrMinutes - BEFORE_FAJR_STEP)
                        }
                        disabled={minusDisabled}
                        style={({ pressed }) => [
                          styles.stepBtn,
                          minusDisabled && styles.stepDisabled,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Minus size={16} color={colors.foreground} strokeWidth={2.5} />
                      </Pressable>
                      <Text style={styles.stepValue}>{prefs.beforeFajrMinutes}m</Text>
                      <Pressable
                        onPress={() =>
                          onSetBeforeFajrMinutes(prefs.beforeFajrMinutes + BEFORE_FAJR_STEP)
                        }
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
                ) : null}

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
              Reminders are scheduled on your device for the next few nights and
              renew whenever you open Adl. No connection is ever used.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
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
  section: {
    fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.subtleForeground,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    marginBottom: spacing.sm,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.cardElevated },
  optionText: { flex: 1, gap: 2 },
  optionTitle: { ...typography.body, fontFamily, color: colors.foreground, fontWeight: '500' },
  optionTitleSelected: { color: colors.foreground, fontWeight: '700' },
  optionDetail: { ...typography.caption, fontFamily, color: colors.mutedForeground },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  stepperLabel: { ...typography.body, fontFamily, color: colors.foreground },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBtn: {
    width: 44,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDisabled: { opacity: 0.4 },
  stepValue: {
    ...typography.body,
    fontFamily,
    color: colors.foreground,
    fontWeight: '700',
    minWidth: 48,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  testBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    alignItems: 'center',
  },
  testText: { ...typography.button, fontFamily, color: colors.foreground },
  pressed: { opacity: 0.7 },
  note: {
    ...typography.caption,
    fontFamily,
    color: colors.subtleForeground,
    marginTop: spacing.xl,
    lineHeight: 18,
  },
});
