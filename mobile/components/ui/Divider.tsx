import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../../theme/tokens';
import { useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

/** Divider — a thin rule with optional centered label ("or continue with"). */
export default function Divider({ label }: { label?: string }) {
  const styles = useThemedStyles(makeStyles);
  if (!label) return <View style={styles.line} />;
  return (
    <View style={styles.row}>
      <View style={styles.flexLine} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.flexLine} />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  line: { height: 1, backgroundColor: colors.border, width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  flexLine: { flex: 1, height: 1, backgroundColor: colors.border },
  label: {
    ...typography.caption,
    color: colors.subtleForeground,
    marginHorizontal: spacing.md,
  },
});
