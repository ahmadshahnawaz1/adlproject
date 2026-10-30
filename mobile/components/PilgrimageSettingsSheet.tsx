/**
 * PilgrimageSettingsSheet — tune the Ḥajj & ʿUmrah hub.
 *
 * A bottom sheet mirroring the other settings sheets: emphasise a school of
 * law (or all), set the pilgrim's gender for the gender-specific rulings,
 * toggle the cinematic tilt-parallax depth and the small comforts (Arabic,
 * haptics), arm or silence each seasonal reminder, send a test notification,
 * and — in development only — preview the Ḥajj days off-season.
 */
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { BellRing, X } from 'lucide-react-native';
import {
  GENDER_OPTIONS,
  MADHHAB_OPTIONS,
  PREVIEW_HAJJ_DAYS,
  type PilgrimagePrefs,
  type PilgrimageReminderToggles,
} from '../hooks/usePilgrimagePrefs';
import { ensurePermissions } from '../lib/notifications';
import {
  configurePilgrimageNotifications,
  sendTestPilgrimageNotification,
} from '../lib/pilgrimageNotifications';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const REMINDER_ROWS: { key: keyof PilgrimageReminderToggles; label: string; sub: string }[] = [
  { key: 'dhulHijjah', label: 'The blessed ten', sub: 'As the first ten of Dhū al-Ḥijjah begin' },
  { key: 'arafah', label: 'Day of ʿArafah', sub: 'On the eve — its fast and duʿāʾ' },
  { key: 'hajj', label: 'Ḥajj countdown', sub: 'As the season of Ḥajj approaches' },
];

export default function PilgrimageSettingsSheet({
  visible,
  prefs,
  onClose,
  onSetPref,
  onSetReminder,
  onReset,
}: {
  visible: boolean;
  prefs: PilgrimagePrefs;
  onClose: () => void;
  onSetPref: <K extends keyof PilgrimagePrefs>(key: K, value: PilgrimagePrefs[K]) => void;
  onSetReminder: (key: keyof PilgrimageReminderToggles, value: boolean) => void;
  onReset: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [testMsg, setTestMsg] = useState<string | null>(null);

  async function handleRemindersOn(v: boolean) {
    onSetPref('remindersOn', v);
    if (v) {
      const ok = await ensurePermissions();
      if (ok) await configurePilgrimageNotifications();
      else setTestMsg('Enable notifications in system settings to receive reminders.');
    }
  }

  async function handleTest() {
    const ok = await ensurePermissions();
    if (!ok) {
      setTestMsg('Notifications are blocked. Enable them in system settings.');
      return;
    }
    await configurePilgrimageNotifications();
    await sendTestPilgrimageNotification(3);
    setTestMsg('A test reminder will arrive in a few seconds.');
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Ḥajj & ʿUmrah</Text>
          <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
            <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* School of law */}
          <Text style={styles.sectionLabel}>School of law</Text>
          <View style={styles.segmentWrap}>
            {MADHHAB_OPTIONS.map((m) => (
              <Seg key={m.value} label={m.label} selected={prefs.madhhab === m.value} onPress={() => onSetPref('madhhab', m.value)} />
            ))}
          </View>
          <Text style={styles.note}>Whose notes to emphasise where the schools differ. “All” shows every view.</Text>

          {/* Gender */}
          <Text style={styles.sectionLabel}>Pilgrim</Text>
          <View style={styles.segment}>
            {GENDER_OPTIONS.map((g) => (
              <Seg key={g.value} label={g.label} selected={prefs.gender === g.value} onPress={() => onSetPref('gender', g.value)} />
            ))}
          </View>
          <Text style={styles.note}>For the gender-specific rulings of iḥrām, raml and ḥalq.</Text>

          {/* Reminders master */}
          <View style={styles.toggleRow}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Reminders</Text>
              <Text style={styles.rowSub}>Seasonal alerts for the days below</Text>
            </View>
            <Switch
              value={prefs.remindersOn}
              onValueChange={handleRemindersOn}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.foreground}
            />
          </View>

          {prefs.remindersOn ? (
            <View style={styles.subList}>
              {REMINDER_ROWS.map((r) => (
                <View key={r.key} style={styles.subRow}>
                  <View style={styles.rowText}>
                    <Text style={styles.subLabel}>{r.label}</Text>
                    <Text style={styles.rowSub}>{r.sub}</Text>
                  </View>
                  <Switch
                    value={prefs.reminders[r.key]}
                    onValueChange={(v) => onSetReminder(r.key, v)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.foreground}
                  />
                </View>
              ))}

              <Pressable onPress={handleTest} style={({ pressed }) => [styles.testBtn, pressed && styles.pressed]}>
                <BellRing size={15} color={colors.primary} strokeWidth={2.3} />
                <Text style={styles.testText}>Send a test reminder</Text>
              </Pressable>
              {testMsg ? <Text style={styles.note}>{testMsg}</Text> : null}
            </View>
          ) : null}

          {/* Tilt parallax */}
          <View style={styles.toggleRow}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Cinematic depth</Text>
              <Text style={styles.rowSub}>Tilt-parallax “4D” motion on the scenes</Text>
            </View>
            <Switch
              value={prefs.tiltParallax}
              onValueChange={(v) => onSetPref('tiltParallax', v)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.foreground}
            />
          </View>

          {/* Arabic */}
          <View style={styles.toggleRow}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Arabic</Text>
              <Text style={styles.rowSub}>Show Arabic beside labels and duʿās</Text>
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
              <Text style={styles.rowSub}>A soft pulse on each ritual count</Text>
            </View>
            <Switch
              value={prefs.haptics}
              onValueChange={(v) => onSetPref('haptics', v)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.foreground}
            />
          </View>

          {/* Dev preview */}
          {__DEV__ ? (
            <>
              <View style={styles.toggleRow}>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>Preview Ḥajj season</Text>
                  <Text style={styles.rowSub}>Developer only · force the date-aware view</Text>
                </View>
                <Switch
                  value={prefs.previewHajj}
                  onValueChange={(v) => onSetPref('previewHajj', v)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.foreground}
                />
              </View>
              {prefs.previewHajj ? (
                <View style={styles.segment}>
                  {PREVIEW_HAJJ_DAYS.map((d) => (
                    <Seg key={d} label={`${d}`} selected={prefs.previewHijriDay === d} onPress={() => onSetPref('previewHijriDay', d)} />
                  ))}
                </View>
              ) : null}
            </>
          ) : null}

          <Pressable onPress={onReset} style={({ pressed }) => [styles.reset, pressed && styles.resetPressed]}>
            <Text style={styles.resetText}>Reset to defaults</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Seg({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.segBtn, selected && styles.segBtnActive, pressed && styles.pressed]}>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  title: { ...typography.title, color: colors.foreground },
  close: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
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

  segment: { flexDirection: 'row', gap: spacing.sm, padding: 4, borderRadius: radius.md, backgroundColor: colors.cardElevated },
  segmentWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: 4, borderRadius: radius.md, backgroundColor: colors.cardElevated },
  segBtn: { flexGrow: 1, minWidth: 60, paddingVertical: spacing.sm + 1, paddingHorizontal: spacing.sm, borderRadius: radius.sm, alignItems: 'center' },
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

  subList: {
    marginTop: spacing.md,
    paddingLeft: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    gap: spacing.xs,
  },
  subRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  subLabel: { ...typography.body, fontSize: 14, fontWeight: '600', color: colors.foreground },

  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${colors.primary}66`,
    backgroundColor: `${colors.primary}14`,
  },
  testText: { ...typography.button, fontSize: 14, color: colors.primary },

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
