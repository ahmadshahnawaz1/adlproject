/**
 * components/settings/primitives — the shared, themed building blocks for the
 * settings screen: section cards and the various row controls (toggle, select,
 * segmented, stepper, nav, value, button) plus the profile avatar.
 */
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';
import Text from '../ui/AppText';
import { Check, ChevronRight, X } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { haptics } from '../../lib/haptics';
import { initialsOf } from '../../lib/auth/validation';

export type Option = { label: string; value: string };

export function Avatar({ name, color, size = 64 }: { name: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily, fontSize: size * 0.36, fontWeight: '700', color: '#fff' }}>{initialsOf(name)}</Text>
    </View>
  );
}

export function SettingsSection({ title, footer, children }: { title?: string; footer?: string; children: React.ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.sectionWrap}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.card}>
        {items.map((child, i) => (
          <View key={i}>
            {i > 0 ? <View style={styles.divider} /> : null}
            {child}
          </View>
        ))}
      </View>
      {footer ? <Text style={styles.sectionFooter}>{footer}</Text> : null}
    </View>
  );
}

function RowIcon({ icon }: { icon?: React.ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  if (!icon) return null;
  return <View style={styles.rowIcon}>{icon}</View>;
}

export function ToggleRow({ icon, label, description, value, onValueChange, disabled }: {
  icon?: React.ReactNode; label: string; description?: string; value: boolean; onValueChange: (v: boolean) => void; disabled?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <RowIcon icon={icon} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description ? <Text style={styles.rowDesc}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={(v) => { haptics.selection(); onValueChange(v); }}
        disabled={disabled}
        accessibilityLabel={label}
        accessibilityHint={description}
        trackColor={{ false: colors.input, true: colors.primary }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.input}
      />
    </View>
  );
}

export function NavRow({ icon, label, value, onPress, danger }: {
  icon?: React.ReactNode; label: string; value?: string; onPress: () => void; danger?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => { haptics.selection(); onPress(); }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityValue={value ? { text: value } : undefined}
    >
      <RowIcon icon={icon} />
      <Text style={[styles.rowLabel, styles.rowFlex, danger && { color: colors.destructive }]}>{label}</Text>
      {value ? <Text style={styles.rowValue} numberOfLines={1}>{value}</Text> : null}
      <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
    </Pressable>
  );
}

export function ValueRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}, ${value}`}>
      <RowIcon icon={icon} />
      <Text style={[styles.rowLabel, styles.rowFlex]}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function ButtonRow({ icon, label, onPress, danger }: { icon?: React.ReactNode; label: string; onPress: () => void; danger?: boolean }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => { haptics.selection(); onPress(); }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <RowIcon icon={icon} />
      <Text style={[styles.rowLabel, styles.rowFlex, styles.rowAction, danger && { color: colors.destructive }]}>{label}</Text>
    </Pressable>
  );
}

export function StepperRow({ icon, label, value, suffix, onChange, min = 0, max = 120, step = 5 }: {
  icon?: React.ReactNode; label: string; value: number; suffix?: string; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  const styles = useThemedStyles(makeStyles);
  const set = (v: number) => { const n = Math.max(min, Math.min(max, v)); if (n !== value) { haptics.selection(); onChange(n); } };
  return (
    <View style={styles.row}>
      <RowIcon icon={icon} />
      <Text style={[styles.rowLabel, styles.rowFlex]}>{label}</Text>
      <View
        style={styles.stepper}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ text: `${value}${suffix ?? ''}` }}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'increment') set(value + step);
          if (e.nativeEvent.actionName === 'decrement') set(value - step);
        }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      >
        <Pressable
          style={styles.stepBtn}
          onPress={() => set(value - step)}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
        >
          <Text style={styles.stepSign}>–</Text>
        </Pressable>
        <Text style={styles.stepValue}>{value}{suffix ?? ''}</Text>
        <Pressable
          style={styles.stepBtn}
          onPress={() => set(value + step)}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
        >
          <Text style={styles.stepSign}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function SegmentedRow({ icon, label, value, options, onChange }: {
  icon?: React.ReactNode; label: string; value: string; options: Option[]; onChange: (v: string) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.segRow}>
      <View style={styles.segTop}>
        <RowIcon icon={icon} />
        <Text style={[styles.rowLabel, styles.rowFlex]}>{label}</Text>
      </View>
      <View style={styles.segment} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <Pressable
              key={o.value}
              style={[styles.segItem, active && styles.segItemActive]}
              onPress={() => { haptics.selection(); onChange(o.value); }}
              accessibilityRole="radio"
              accessibilityLabel={o.label}
              accessibilityState={{ selected: active, checked: active }}
            >
              <Text style={[styles.segText, active && { color: colors.primaryForeground }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function SelectRow({ icon, label, value, options, onChange, description }: {
  icon?: React.ReactNode; label: string; value: string; options: Option[]; onChange: (v: string) => void; description?: string;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        onPress={() => { haptics.selection(); setOpen(true); }}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: current?.label ?? '' }}
        accessibilityHint={description}
      >
        <RowIcon icon={icon} />
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{label}</Text>
          {description ? <Text style={styles.rowDesc}>{description}</Text> : null}
        </View>
        <Text style={styles.rowValue} numberOfLines={1}>{current?.label ?? ''}</Text>
        <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.pickerRoot}>
          <Pressable style={styles.pickerBackdrop} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Close" />
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHandle} />
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{label}</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12} style={styles.pickerClose} accessibilityRole="button" accessibilityLabel="Close">
                <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
              </Pressable>
            </View>
            {options.map((o) => {
              const active = o.value === value;
              return (
                <Pressable
                  key={o.value}
                  style={({ pressed }) => [styles.pickerItem, pressed && styles.rowPressed]}
                  onPress={() => { haptics.selection(); onChange(o.value); setOpen(false); }}
                  accessibilityRole="radio"
                  accessibilityLabel={o.label}
                  accessibilityState={{ selected: active, checked: active }}
                >
                  <Text style={[styles.pickerItemText, active && { color: colors.primary, fontWeight: '700' }]}>{o.label}</Text>
                  {active ? <Check size={17} color={colors.primary} strokeWidth={2.5} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    sectionWrap: { marginBottom: spacing.xl },
    sectionTitle: { ...typography.caption, fontSize: 11, fontWeight: '700', color: colors.subtleForeground, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: spacing.sm, marginLeft: 2 },
    card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    sectionFooter: { fontFamily, fontSize: 12, lineHeight: 17, color: colors.subtleForeground, marginTop: spacing.sm, marginLeft: 2 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 52 },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 52, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    rowPressed: { backgroundColor: colors.cardElevated },
    rowDisabled: { opacity: 0.5 },
    rowIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.cardElevated, alignItems: 'center', justifyContent: 'center' },
    rowText: { flex: 1, minWidth: 0 },
    rowFlex: { flex: 1 },
    rowLabel: { fontFamily, fontSize: 15, color: colors.foreground },
    rowAction: { color: colors.primary, fontWeight: '600' },
    rowDesc: { fontFamily, fontSize: 12, lineHeight: 16, color: colors.subtleForeground, marginTop: 1 },
    rowValue: { fontFamily, fontSize: 14, color: colors.mutedForeground, maxWidth: 150 },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    stepBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.cardElevated, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    stepSign: { fontFamily, fontSize: 18, color: colors.foreground, lineHeight: 20 },
    stepValue: { fontFamily, fontSize: 15, fontWeight: '600', color: colors.foreground, minWidth: 44, textAlign: 'center' },
    segRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
    segTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    segment: { flexDirection: 'row', backgroundColor: colors.input, borderRadius: radius.md, padding: 3, gap: 3 },
    segItem: { flex: 1, paddingVertical: 7, borderRadius: radius.sm, alignItems: 'center' },
    segItemActive: { backgroundColor: colors.primary },
    segText: { fontFamily, fontSize: 13, fontWeight: '600', color: colors.mutedForeground },
    pickerRoot: { flex: 1, justifyContent: 'flex-end' },
    pickerBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
    pickerSheet: { maxHeight: '80%', backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    pickerHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
    pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
    pickerTitle: { ...typography.title, fontSize: 17, color: colors.foreground },
    pickerClose: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
    pickerItemText: { fontFamily, fontSize: 15, color: colors.foreground },
  });
