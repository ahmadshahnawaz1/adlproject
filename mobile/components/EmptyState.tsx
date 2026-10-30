/**
 * EmptyState — a warm, consistent placeholder for screens with nothing yet.
 *
 * A soft icon medallion, a short title and an encouraging line — used so a
 * first-run user is welcomed rather than shown a wall of zeros.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography } from '../theme/tokens';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function EmptyState({
  icon,
  title,
  message,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      <View style={styles.medallion}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  medallion: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { ...typography.title, fontSize: 18, color: colors.foreground, textAlign: 'center' },
  message: {
    ...typography.body,
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  actions: { marginTop: spacing.lg, alignSelf: 'stretch' },
});
