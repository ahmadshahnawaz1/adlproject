/**
 * FastingSettingsSheet — tune the fasting & Ramadan hub.
 *
 * A bottom sheet mirroring the other settings sheets: set the Imsāk buffer and
 * Suhūr reminder lead, arm or silence each reminder, pick the fidyah currency
 * and rate, toggle small comforts (Arabic, haptics), send a test notification,
 * and — in development only — preview the full Ramadan view off-season.
 */
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { BellRing, Minus, Plus, X } from 'lucide-react-native';
import {
  CURRENCY_OPTIONS,
  IMSAK_OPTIONS,
  SUHUR_LEAD_OPTIONS,
  type FastingPrefs,
  type FastingReminderToggles,
} from '../hooks/useFastingPrefs';
import { ensurePermissions } from '../lib/notifications';
import { configureFastingNotifications, sendTestFastingNotification } from '../lib/fastingNotifications';
import { colors, radius, spacing, typography } from '../theme/tokens';

const PREVIEW_DAYS = [1, 10, 15, 21, 27];

const REMINDER_ROWS: { key: keyof FastingReminderToggles; label: string; sub: string }[] = [
  { key: 'suhur', label: 'Suhūr ending', sub: 'A nudge before the pre-dawn meal closes' },
  { key: 'imsak', label: 'Imsāk', sub: 'When the cautious buffer begins' },
  { key: 'iftar', label: 'Iftār', sub: 'The moment the fast may be broken' },
  { key: 'taraweeh', label: 'Tarāwīḥ', sub: 'After ʿIshāʾ in Ramadan' },
  { key: 'qadr', label: 'Laylatul-Qadr', sub: 'The odd nights of the last ten' },
  { key: 'voluntary', label: 'Voluntary fasts', sub: 'The night before a recommended fast' },
];

function imsakLabel(n: number): string {
  return n === 0 ? 'Off' : `${n}m`;
}

export default function FastingSettingsSheet({
  visible,
  prefs,
  onClose,
  onSetPref,
  onSetReminder,
  onReset,
}: {
  visible: boolean;
  prefs: FastingPrefs;
  onClose: () => void;
  onSetPref: <K extends keyof FastingPrefs>(key: K, value: FastingPrefs[K]) => void;
  onSetReminder: (key: keyof FastingReminderToggles, value: boolean) => void;
  onReset: () => void;
}) {
  const [testMsg, setTestMsg] = useState<string | null>(null);

  async function handleRemindersOn(v: boolean) {
    onSetPref('remindersOn', v);
    if (v) {
      const ok = await ensurePermissions();
      if (ok) await configureFastingNotifications();
      else setTestMsg('Enable notifications in system settings to receive reminders.');
    }
  }

  async function handleTest() {
    const ok = await ensurePermissions();
    if (!ok) {
      setTestMsg('Notifications are blocked. Enable them in system settings.');
      return;
    }
    await configureFastingNotifications();
    await sendTestFastingNotification(3);
    setTestMsg('A test reminder will arrive in a few seconds.');
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Fasting</Text>
          <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
            <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Imsāk buffer */}
          <Text style={styles.sectionLabel}>Imsāk buffer</Text>
          <View style={styles.segment}>
            {IMSAK_OPTIONS.map((n) => (
              <Seg key={n} label={imsakLabel(n)} selected={prefs.imsakMinutes === n} onPress={() => onSetPref('imsakMinutes', n)} />
            ))}
          </View>
          <Text style={styles.note}>A cautious pause before Fajr to stop eating and drinking.</Text>

          {/* Suhūr lead */}
          <Text style={styles.sectionLabel}>Suhūr reminder lead</Text>
          <View style={styles.segment}>
            {SUHUR_LEAD_OPTIONS.map((n) => (
              <Seg key={n} label={`${n}m`} selected={prefs.suhurLeadMinutes === n} onPress={() => onSetPref('suhurLeadMinutes', n)} />
            ))}
          </View>
          <Text style={styles.note}>How long before Suhūr ends to wake you.</Text>

          {/* Reminders master */}
          <View style={styles.toggleRow}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Reminders</Text>
              <Text style={styles.rowSub}>Scheduled alerts for the times below</Text>
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

          {/* Fidyah currency */}
          <Text style={styles.sectionLabel}>Fidyah currency</Text>
          <View style={styles.segment}>
            {CURRENCY_OPTIONS.map((c) => (
              <Seg key={c} label={c} selected={prefs.fidyahCurrency === c} onPress={() => onSetPref('fidyahCurrency', c)} />
            ))}
          </View>

          {/* Fidyah rate */}
          <View style={styles.toggleRow}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Fidyah per day</Text>
              <Text style={styles.rowSub}>Cost to feed one needy person for a day</Text>
            </View>
            <View style={styles.stepper}>
              <Pressable
                onPress={() => onSetPref('fidyahPerDay', Math.max(0, prefs.fidyahPerDay - 1))}
                hitSlop={8}
                disabled={prefs.fidyahPerDay === 0}
                style={({ pressed }) => [styles.ctrl, prefs.fidyahPerDay === 0 && styles.ctrlDisabled, pressed && prefs.fidyahPerDay > 0 && styles.pressed]}
              >
                <Minus size={15} color={prefs.fidyahPerDay === 0 ? colors.subtleForeground : colors.foreground} strokeWidth={2.6} />
              </Pressable>
              <Text style={styles.stepVal}>
                {prefs.fidyahCurrency}
                {prefs.fidyahPerDay}
              </Text>
              <Pressable
                onPress={() => onSetPref('fidyahPerDay', prefs.fidyahPerDay + 1)}
                hitSlop={8}
                style={({ pressed }) => [styles.ctrl, pressed && styles.pressed]}
              >
                <Plus size={15} color={colors.primary} strokeWidth={2.6} />
              </Pressable>
            </View>
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
              <Text style={styles.rowSub}>A soft pulse when you log a fast</Text>
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
                  <Text style={styles.rowLabel}>Preview Ramadan</Text>
                  <Text style={styles.rowSub}>Developer only · force the Ramadan view</Text>
                </View>
                <Switch
                  value={prefs.previewRamadan}
                  onValueChange={(v) => onSetPref('previewRamadan', v)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.foreground}
                />
              </View>
              {prefs.previewRamadan ? (
                <View style={styles.segment}>
                  {PREVIEW_DAYS.map((d) => (
                    <Seg key={d} label={`${d}`} selected={prefs.previewDay === d} onPress={() => onSetPref('previewDay', d)} />
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
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.segBtn, selected && styles.segBtnActive, pressed && styles.pressed]}>
      <Text style={[styles.segText, selected && styles.segTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
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
  segBtn: { flex: 1, paddingVertical: spacing.sm + 1, borderRadius: radius.sm, alignItems: 'center' },
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

  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  ctrl: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlDisabled: { opacity: 0.4 },
  stepVal: { minWidth: 44, textAlign: 'center', fontSize: 16, fontWeight: '800', color: colors.foreground, fontVariant: ['tabular-nums'] },

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
