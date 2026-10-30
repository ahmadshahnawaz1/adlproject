import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography } from '../../theme/tokens';
import { useTheme, type ThemeColors } from '../../theme/ThemeContext';

/** Scores a password 0–4 and returns a label + color. */
export function scorePassword(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const makeMeta = (colors: ThemeColors) => [
  { label: '', color: colors.border },
  { label: 'Weak', color: colors.destructive },
  { label: 'Fair', color: '#F59E0B' },
  { label: 'Good', color: '#EAB308' },
  { label: 'Strong', color: colors.success },
];

/** PasswordStrength — a 4-segment meter with a status label. */
export default function PasswordStrength({ value }: { value: string }) {
  const { colors } = useTheme();
  if (!value) return null;
  const score = scorePassword(value);
  const meta = makeMeta(colors)[score];

  return (
    <View style={styles.wrapper}>
      <View style={styles.bars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.bar,
              { backgroundColor: i <= score ? meta.color : colors.border },
            ]}
          />
        ))}
      </View>
      {meta.label ? (
        <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  bars: { flexDirection: 'row', flex: 1, gap: spacing.xs },
  bar: { flex: 1, height: 4, borderRadius: radius.full },
  label: { ...typography.caption, marginLeft: spacing.md, minWidth: 48, textAlign: 'right' },
});
