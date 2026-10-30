/**
 * NotificationSettingsSheet — where the call to prayer is dressed.
 *
 * A single, beautiful bottom sheet: a master switch, the delivery style
 * (silent / vibrate / chime / full adhan), the muezzin voice, an optional
 * heads-up, per-prayer opt-ins, and — crucially — a live "test" button so the
 * experience can be felt before the next prayer ever arrives.
 */
import { useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {
  X,
  BellRing,
  BellOff,
  Bell,
  Vibrate as VibrateIcon,
  Volume2,
  Check,
  Sparkles,
} from 'lucide-react-native';
import { MUEZZIN_VOICES, type AlertMode } from '../lib/notifications';
import type { NotificationPrefs } from '../hooks/useNotificationPrefs';
import type { PrayerName } from '../lib/prayerTimes';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const makeModeOptions = (colors: ThemeColors): {
  key: AlertMode;
  label: string;
  sub: string;
  icon: (active: boolean) => React.ReactNode;
}[] => {
  const iconTint = makeIconTint(colors);
  return [
    { key: 'silent', label: 'Silent', sub: 'Banner only', icon: (a) => <BellOff size={20} color={iconTint(a)} strokeWidth={2.1} /> },
    { key: 'vibrate', label: 'Vibrate', sub: 'A gentle pulse', icon: (a) => <VibrateIcon size={20} color={iconTint(a)} strokeWidth={2.1} /> },
    { key: 'chime', label: 'Chime', sub: 'System tone', icon: (a) => <Bell size={20} color={iconTint(a)} strokeWidth={2.1} /> },
    { key: 'adhan', label: 'Adhan', sub: 'Full call', icon: (a) => <Volume2 size={20} color={iconTint(a)} strokeWidth={2.1} /> },
  ];
};

const REMINDER_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'Off' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
];

const QAZA_HOURS: number[] = [18, 20, 21, 22, 23];

const PRAYER_ROWS: { key: PrayerName; label: string; arabic: string }[] = [
  { key: 'fajr', label: 'Fajr', arabic: '\u0627\u0644\u0641\u062C\u0631' },
  { key: 'sunrise', label: 'Sunrise', arabic: '\u0627\u0644\u0634\u0631\u0648\u0642' },
  { key: 'dhuhr', label: 'Dhuhr', arabic: '\u0627\u0644\u0638\u0647\u0631' },
  { key: 'asr', label: 'Asr', arabic: '\u0627\u0644\u0639\u0635\u0631' },
  { key: 'maghrib', label: 'Maghrib', arabic: '\u0627\u0644\u0645\u063A\u0631\u0628' },
  { key: 'isha', label: 'Isha', arabic: '\u0627\u0644\u0639\u0634\u0627\u0621' },
];

const makeIconTint = (colors: ThemeColors) => (active: boolean) => {
  return active ? colors.primaryForeground : colors.mutedForeground;
};

export default function NotificationSettingsSheet({
  visible,
  prefs,
  permissionDenied,
  onClose,
  onSetPref,
  onTogglePrayer,
  onSendTest,
}: {
  visible: boolean;
  prefs: NotificationPrefs;
  /** OS permission is denied and cannot be re-prompted from here. */
  permissionDenied: boolean;
  onClose: () => void;
  onSetPref: <K extends keyof NotificationPrefs>(key: K, value: NotificationPrefs[K]) => void;
  onTogglePrayer: (prayer: PrayerName) => void;
  /** Fire a real test alert; resolves true if it was scheduled. */
  onSendTest: () => Promise<boolean>;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const MODE_OPTIONS = makeModeOptions(colors);
  const [testState, setTestState] = useState<'idle' | 'sending' | 'sent' | 'blocked'>('idle');
  const sentTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleTest = async () => {
    if (testState === 'sending') return;
    setTestState('sending');
    const ok = await onSendTest();
    setTestState(ok ? 'sent' : 'blocked');
    clearTimeout(sentTimer.current);
    sentTimer.current = setTimeout(() => setTestState('idle'), 4500);
  };

  const on = prefs.enabled;
  const showVoices = prefs.mode === 'adhan';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
            <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
          </Pressable>
        </View>

        {/* Master switch */}
        <View style={[styles.masterCard, on && styles.masterCardOn]}>
          <View style={styles.masterIcon}>
            <BellRing
              size={20}
              color={on ? colors.primary : colors.mutedForeground}
              strokeWidth={2.25}
            />
          </View>
          <View style={styles.masterText}>
            <Text style={styles.masterLabel}>Call me to prayer</Text>
            <Text style={styles.masterSub}>
              {on ? 'On \u00B7 alerts are scheduled' : 'Off \u00B7 no alerts'}
            </Text>
          </View>
          <Switch
            value={on}
            onValueChange={(v) => onSetPref('enabled', v)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.foreground}
          />
        </View>

        {permissionDenied ? (
          <Text style={styles.warn}>
            Notifications are blocked in your system settings. Enable them for Adl
            there to receive the call to prayer.
          </Text>
        ) : null}

        <ScrollView
          style={[styles.body, !on && styles.bodyDim]}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={on}
          pointerEvents={on ? 'auto' : 'none'}
        >
          {/* Delivery style */}
          <Text style={styles.sectionLabel}>How you're called</Text>
          <View style={styles.modeGrid}>
            {MODE_OPTIONS.map((opt) => {
              const active = prefs.mode === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => onSetPref('mode', opt.key)}
                  style={({ pressed }) => [
                    styles.modeCard,
                    active && styles.modeCardActive,
                    pressed && styles.pressed,
                  ]}
                >
                  {opt.icon(active)}
                  <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.modeSub, active && styles.modeSubActive]}>
                    {opt.sub}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Muezzin voice */}
          {showVoices ? (
            <>
              <Text style={styles.sectionLabel}>Muezzin</Text>
              <View style={styles.list}>
                {MUEZZIN_VOICES.map((v) => {
                  const active = prefs.voiceId === v.id;
                  return (
                    <Pressable
                      key={v.id}
                      onPress={() => onSetPref('voiceId', v.id)}
                      style={({ pressed }) => [
                        styles.row,
                        active && styles.rowActive,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.rowText}>
                        <Text style={styles.rowLabel}>{v.label}</Text>
                        <Text style={styles.rowSub}>{v.origin}</Text>
                      </View>
                      {active ? (
                        <Check size={18} color={colors.primary} strokeWidth={2.5} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.note}>
                Custom adhan audio plays in the installed app. In Expo Go the
                default tone is used — timing and feel are identical.
              </Text>
            </>
          ) : null}

          {/* Heads-up */}
          <Text style={styles.sectionLabel}>Heads-up before</Text>
          <View style={styles.segment}>
            {REMINDER_OPTIONS.map((opt) => {
              const active = prefs.reminderMinutes === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => onSetPref('reminderMinutes', opt.value)}
                  style={({ pressed }) => [
                    styles.segmentButton,
                    active && styles.segmentButtonActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Per-prayer */}
          <Text style={styles.sectionLabel}>Which prayers</Text>
          <View style={styles.list}>
            {PRAYER_ROWS.map((p) => (
              <View key={p.key} style={styles.toggleRow}>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{p.label}</Text>
                  <Text style={styles.rowSub}>{p.arabic}</Text>
                </View>
                <Switch
                  value={prefs.prayers[p.key]}
                  onValueChange={() => onTogglePrayer(p.key)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.foreground}
                />
              </View>
            ))}
          </View>

          {/* Qaza reminder */}
          <Text style={styles.sectionLabel}>Qaza reminder</Text>
          <View style={styles.toggleRow}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Daily make-up nudge</Text>
              <Text style={styles.rowSub}>
                A gentle reminder to log or make up missed prayers
              </Text>
            </View>
            <Switch
              value={prefs.qazaReminder}
              onValueChange={(v) => onSetPref('qazaReminder', v)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.foreground}
            />
          </View>
          {prefs.qazaReminder ? (
            <View style={styles.segment}>
              {QAZA_HOURS.map((h) => {
                const active = prefs.qazaReminderHour === h;
                return (
                  <Pressable
                    key={h}
                    onPress={() => onSetPref('qazaReminderHour', h)}
                    style={({ pressed }) => [
                      styles.segmentButton,
                      active && styles.segmentButtonActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                      {h % 12 === 0 ? 12 : h % 12}
                      {h < 12 ? 'am' : 'pm'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {/* Test */}
          <Pressable
            onPress={handleTest}
            style={({ pressed }) => [
              styles.testButton,
              testState === 'sent' && styles.testButtonSent,
              pressed && styles.pressed,
            ]}
          >
            {testState === 'sent' ? (
              <Check size={18} color={colors.success} strokeWidth={2.5} />
            ) : (
              <Sparkles size={18} color={colors.primaryForeground} strokeWidth={2.25} />
            )}
            <Text
              style={[
                styles.testText,
                testState === 'sent' && styles.testTextSent,
              ]}
            >
              {testState === 'sending'
                ? 'Preparing\u2026'
                : testState === 'sent'
                  ? 'On its way \u2014 lock your phone'
                  : testState === 'blocked'
                    ? 'Allow notifications to test'
                    : 'Send a test adhan'}
            </Text>
          </Pressable>
          <Text style={styles.note}>
            Arrives in about four seconds. Lock or background the app to see,
            hear and feel exactly how the real call lands.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '90%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: { ...typography.title, color: colors.foreground },
  close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  masterCardOn: { borderColor: colors.primary },
  masterIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.card,
  },
  masterText: { flex: 1 },
  masterLabel: { ...typography.button, color: colors.foreground },
  masterSub: { ...typography.caption, color: colors.mutedForeground, marginTop: 1 },

  warn: {
    ...typography.caption,
    color: colors.destructive,
    marginTop: spacing.sm,
    lineHeight: 18,
  },

  body: { marginTop: spacing.xs },
  bodyDim: { opacity: 0.4 },
  bodyContent: { paddingTop: spacing.md, paddingBottom: spacing.lg },

  sectionLabel: {
    ...typography.label,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },

  modeGrid: { flexDirection: 'row', gap: spacing.sm },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  modeCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeLabel: { ...typography.label, color: colors.foreground, marginTop: 2 },
  modeLabelActive: { color: colors.primaryForeground, fontWeight: '700' },
  modeSub: { fontSize: 11, color: colors.subtleForeground, textAlign: 'center' },
  modeSubActive: { color: colors.primaryForeground, opacity: 0.7 },

  list: { gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  rowActive: { borderColor: colors.primary },
  rowText: { flex: 1 },
  rowLabel: { ...typography.button, color: colors.foreground },
  rowSub: { ...typography.caption, color: colors.subtleForeground, marginTop: 1 },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 58,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },

  segment: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  segmentButton: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  segmentButtonActive: { backgroundColor: colors.primary },
  segmentText: { ...typography.label, color: colors.mutedForeground },
  segmentTextActive: { color: colors.primaryForeground, fontWeight: '700' },

  note: {
    ...typography.caption,
    color: colors.subtleForeground,
    marginTop: spacing.sm,
    lineHeight: 18,
  },

  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },
  testButtonSent: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.success,
  },
  testText: { ...typography.button, color: colors.primaryForeground },
  testTextSent: { color: colors.success },

  pressed: { opacity: 0.7 },
});
