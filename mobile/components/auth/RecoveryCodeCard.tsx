/**
 * RecoveryCodeCard — shows a recovery code and presses on the user to save it.
 *
 * This is the only time the code is ever visible; it is stored only as a
 * digest, so it cannot be shown again.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Check, Copy, KeyRound } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { haptics } from '../../lib/haptics';
import { formatRecoveryCode } from '../../lib/auth/recovery';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

export default function RecoveryCodeCard({ code }: { code: string }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [copied, setCopied] = useState(false);
  const formatted = formatRecoveryCode(code);

  const copy = async () => {
    await Clipboard.setStringAsync(formatted);
    haptics.success();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <KeyRound size={16} color={colors.primary} strokeWidth={2.25} />
        <AppText style={styles.title}>Your recovery code</AppText>
      </View>

      <AppText style={styles.code} selectable>
        {formatted}
      </AppText>

      <Pressable
        onPress={() => {
          void copy();
        }}
        style={styles.copyBtn}
        accessibilityRole="button"
        accessibilityLabel="Copy recovery code"
      >
        {copied ? (
          <Check size={15} color={colors.primary} strokeWidth={2.5} />
        ) : (
          <Copy size={15} color={colors.primary} strokeWidth={2.25} />
        )}
        <AppText style={styles.copyText}>{copied ? 'Copied' : 'Copy'}</AppText>
      </Pressable>

      <AppText style={styles.warning}>
        Write this down somewhere safe. It is shown once and never again, and it is the only way
        back into your account if you forget your password. Adl has no server that can reset it for
        you.
      </AppText>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: `${colors.primary}55`,
      backgroundColor: `${colors.primary}0F`,
      padding: spacing.lg,
      gap: spacing.md,
    },
    head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    title: { ...typography.title, fontSize: 15, color: colors.foreground },
    code: {
      fontFamily,
      fontSize: 17,
      letterSpacing: 1.5,
      lineHeight: 28,
      color: colors.foreground,
      textAlign: 'center',
      paddingVertical: spacing.sm,
    },
    copyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: `${colors.primary}55`,
      minHeight: 44,
    },
    copyText: { ...typography.button, fontSize: 14, color: colors.primary },
    warning: { fontFamily, fontSize: 12, lineHeight: 19, color: colors.mutedForeground },
  });
