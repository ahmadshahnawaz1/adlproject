import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Check, X, ShieldCheck, Mountain, Minus, Plus, RotateCcw } from 'lucide-react-native';
import {
  OFFICIAL_SOURCES,
  SOURCE_ORDER,
  type OfficialSource,
  type OfficialSourceId,
} from '../lib/officialSources';
import type { HighLatitudeRuleKey, MadhabKey, PrayerName } from '../lib/prayerTimes';
import type { PrayerPrefs } from '../hooks/usePrayerPrefs';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const MADHAB_OPTIONS: { key: MadhabKey | 'auto'; label: string }[] = [
  { key: 'auto', label: 'Automatic' },
  { key: 'Standard', label: 'Standard' },
  { key: 'Hanafi', label: 'Hanafi' },
];

const HIGH_LAT_OPTIONS: { key: HighLatitudeRuleKey; label: string; sub: string }[] = [
  { key: 'MiddleOfTheNight', label: 'Middle of the night', sub: 'Fajr & Isha split the night evenly' },
  { key: 'SeventhOfTheNight', label: 'Seventh of the night', sub: 'Closer to the true twilight' },
  { key: 'TwilightAngle', label: 'Twilight angle', sub: 'Angle-based (Diyanet-style)' },
];

const TUNE_PRAYERS: { key: PrayerName; label: string; arabic: string }[] = [
  { key: 'fajr', label: 'Fajr', arabic: '\u0627\u0644\u0641\u062C\u0631' },
  { key: 'sunrise', label: 'Sunrise', arabic: '\u0627\u0644\u0634\u0631\u0648\u0642' },
  { key: 'dhuhr', label: 'Dhuhr', arabic: '\u0627\u0644\u0638\u0647\u0631' },
  { key: 'asr', label: 'Asr', arabic: '\u0627\u0644\u0639\u0635\u0631' },
  { key: 'maghrib', label: 'Maghrib', arabic: '\u0627\u0644\u0645\u063A\u0631\u0628' },
  { key: 'isha', label: 'Isha', arabic: '\u0627\u0644\u0639\u0634\u0627\u0621' },
];

/**
 * PrayerSettingsSheet — where the calculation is made trustworthy.
 *
 * Section 1 (this commit): the official source overlay. "Automatic" snaps to
 * the recognised authority for the user's country; or pin any body explicitly.
 * The authority actually in effect is always shown, so the user knows exactly
 * whose times they're seeing.
 */
export default function PrayerSettingsSheet({
  visible,
  prefs,
  activeSource,
  autoSource,
  elevation,
  elevationMinutes,
  onClose,
  onSetPref,
  onSetAdjustment,
  onResetAdjustments,
}: {
  visible: boolean;
  prefs: PrayerPrefs;
  /** The source currently driving the times (resolved auto or pinned). */
  activeSource: OfficialSource;
  /** What "Automatic" would resolve to for the current country. */
  autoSource: OfficialSource;
  /** Observer elevation in metres for the current location (if known). */
  elevation?: number;
  /** Minutes the elevation correction shifts sunrise/Maghrib. */
  elevationMinutes: number;
  onClose: () => void;
  onSetPref: <K extends keyof PrayerPrefs>(key: K, value: PrayerPrefs[K]) => void;
  onSetAdjustment: (prayer: PrayerName, minutes: number) => void;
  onResetAdjustments: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const hasAdjustments = Object.values(prefs.adjustments).some((v) => v);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Calculation</Text>
          <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
            <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
          </Pressable>
        </View>

        <View style={styles.activeCard}>
          <ShieldCheck size={18} color={colors.primary} strokeWidth={2.25} />
          <View style={styles.activeText}>
            <Text style={styles.activeLabel}>{activeSource.authority}</Text>
            <Text style={styles.activeHint}>
              {activeSource.region} · in effect
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Official source</Text>

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          <SourceRow
            label="Automatic"
            sub={`Follow my country · ${autoSource.label}`}
            selected={prefs.sourceId === 'auto'}
            onPress={() => onSetPref('sourceId', 'auto')}
          />
          {SOURCE_ORDER.map((id: OfficialSourceId) => {
            const s = OFFICIAL_SOURCES[id];
            return (
              <SourceRow
                key={id}
                label={s.label}
                sub={`${s.authority} · ${s.region}`}
                selected={prefs.sourceId === id}
                onPress={() => onSetPref('sourceId', id)}
              />
            );
          })}

          <Text style={styles.sectionLabel}>Asr school</Text>
          <View style={styles.segment}>
            {MADHAB_OPTIONS.map((opt) => (
              <SegmentButton
                key={opt.key}
                label={opt.label}
                selected={prefs.madhab === opt.key}
                onPress={() => onSetPref('madhab', opt.key)}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>Elevation</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Mountain size={18} color={colors.primary} strokeWidth={2.25} />
              <View style={styles.toggleText}>
                <Text style={styles.rowLabel}>Adjust for altitude</Text>
                <Text style={styles.rowSub}>
                  {typeof elevation === 'number' && elevation > 0
                    ? `${elevation} m · ${
                        prefs.useElevation && elevationMinutes > 0
                          ? `sunrise −${elevationMinutes} / Maghrib +${elevationMinutes} min`
                          : 'no shift at this height'
                      }`
                    : 'Elevation unknown for this place'}
                </Text>
              </View>
            </View>
            <Switch
              value={prefs.useElevation}
              onValueChange={(v) => onSetPref('useElevation', v)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.foreground}
            />
          </View>

          <Text style={styles.sectionLabel}>High-latitude rule</Text>
          <Text style={styles.sectionHint}>
            Near the poles the sun may never reach the twilight angle. Choose how
            Fajr and Isha are estimated on those nights.
          </Text>
          <View style={styles.listContent}>
            {HIGH_LAT_OPTIONS.map((opt) => (
              <SourceRow
                key={opt.key}
                label={opt.label}
                sub={opt.sub}
                selected={prefs.highLatitudeRule === opt.key}
                onPress={() => onSetPref('highLatitudeRule', opt.key)}
              />
            ))}
          </View>

          <View style={styles.tuneHeader}>
            <Text style={styles.sectionLabelInline}>Fine-tune</Text>
            {hasAdjustments ? (
              <Pressable
                onPress={onResetAdjustments}
                hitSlop={10}
                style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
              >
                <RotateCcw size={13} color={colors.mutedForeground} strokeWidth={2.25} />
                <Text style={styles.resetText}>Reset</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.sectionHint}>
            Nudge any prayer to match your local mosque's posted time, up to
            ±60 minutes.
          </Text>
          <View style={styles.tuneList}>
            {TUNE_PRAYERS.map((p) => (
              <Stepper
                key={p.key}
                label={p.label}
                arabic={p.arabic}
                value={prefs.adjustments[p.key] ?? 0}
                onChange={(v) => onSetAdjustment(p.key, v)}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function SourceRow({
  label,
  sub,
  selected,
  onPress,
}: {
  label: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowSelected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      {selected ? <Check size={18} color={colors.primary} strokeWidth={2.5} /> : null}
    </Pressable>
  );
}

function SegmentButton({
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
        styles.segmentButton,
        selected && styles.segmentButtonActive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Stepper({
  label,
  arabic,
  value,
  onChange,
}: {
  label: string;
  arabic: string;
  value: number;
  onChange: (next: number) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const active = value !== 0;
  const sign = value > 0 ? '+' : '';
  return (
    <View style={[styles.stepRow, active && styles.stepRowActive]}>
      <View style={styles.stepLeft}>
        <Text style={styles.stepLabel}>{label}</Text>
        <Text style={styles.stepArabic}>{arabic}</Text>
      </View>
      <View style={styles.stepControls}>
        <Pressable
          onPress={() => onChange(value - 1)}
          hitSlop={8}
          style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
        >
          <Minus size={16} color={colors.foreground} strokeWidth={2.5} />
        </Pressable>
        <View style={styles.stepValueWrap}>
          <Text style={[styles.stepValue, active && styles.stepValueActive]}>
            {active ? `${sign}${value}` : '0'}
          </Text>
          <Text style={styles.stepUnit}>min</Text>
        </View>
        <Pressable
          onPress={() => onChange(value + 1)}
          hitSlop={8}
          style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
        >
          <Plus size={16} color={colors.foreground} strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '86%',
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
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  activeText: { flex: 1 },
  activeLabel: { ...typography.button, color: colors.foreground },
  activeHint: { ...typography.caption, color: colors.mutedForeground, marginTop: 1 },
  sectionLabel: {
    ...typography.label,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.subtleForeground,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  sectionLabelInline: {
    ...typography.label,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tuneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetText: { ...typography.caption, color: colors.mutedForeground },
  tuneList: { gap: spacing.xs },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  stepRowActive: { borderColor: colors.primary },
  stepLeft: { flex: 1 },
  stepLabel: { ...typography.button, color: colors.foreground },
  stepArabic: { ...typography.caption, color: colors.subtleForeground, marginTop: 1 },
  stepControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  stepButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  stepValueWrap: {
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.mutedForeground,
    fontVariant: ['tabular-nums'],
  },
  stepValueActive: { color: colors.primary },
  stepUnit: { ...typography.caption, color: colors.subtleForeground, marginTop: -2 },
  list: { flexGrow: 0 },
  listContent: { gap: spacing.xs },
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
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  segmentButtonActive: { backgroundColor: colors.primary },
  segmentText: { ...typography.label, color: colors.mutedForeground },
  segmentTextActive: { color: colors.primaryForeground, fontWeight: '700' },
  toggleRow: {
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
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    paddingRight: spacing.md,
  },
  toggleText: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  rowSelected: { borderColor: colors.primary },
  rowText: { flex: 1, paddingRight: spacing.md },
  rowLabel: { ...typography.button, color: colors.foreground },
  rowSub: { ...typography.caption, color: colors.subtleForeground, marginTop: 1 },
  pressed: { opacity: 0.6 },
});
