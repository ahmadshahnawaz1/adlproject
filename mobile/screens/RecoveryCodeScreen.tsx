/**
 * RecoveryCodeScreen — shown once, immediately after an account is created.
 *
 * The user cannot get past this without acknowledging that the code is the only
 * way back into their account, because after this screen it is unrecoverable.
 */
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import AppText from '../components/ui/AppText';
import BrandMark from '../components/BrandMark';
import Button from '../components/ui/Button';
import RecoveryCodeCard from '../components/auth/RecoveryCodeCard';
import { haptics } from '../lib/haptics';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function RecoveryCodeScreen({ code, onDone }: { code: string; onDone: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.brand}>
          <BrandMark size={40} layout="stack" />
        </View>

        <View style={styles.header}>
          <AppText style={styles.title}>Save your recovery code</AppText>
          <AppText style={styles.subtitle}>
            Your account lives on this device alone. If you forget your password, this code is the
            only way back in.
          </AppText>
        </View>

        <RecoveryCodeCard code={code} />

        <Pressable
          onPress={() => {
            haptics.selection();
            setConfirmed((v) => !v);
          }}
          style={styles.confirmRow}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: confirmed }}
          accessibilityLabel="I have saved my recovery code"
        >
          <View style={[styles.box, confirmed && styles.boxOn]}>
            {confirmed ? (
              <Check size={14} color={colors.primaryForeground} strokeWidth={3} />
            ) : null}
          </View>
          <AppText style={styles.confirmText}>I have written this down somewhere safe.</AppText>
        </Pressable>

        <Button label="Continue" onPress={onDone} disabled={!confirmed} style={styles.submit} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing['3xl'],
    },
    brand: { alignItems: 'center', marginBottom: spacing.xl },
    header: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
    title: { ...typography.display, fontSize: 24, color: colors.foreground, textAlign: 'center' },
    subtitle: {
      ...typography.body,
      fontSize: 14,
      lineHeight: 21,
      color: colors.mutedForeground,
      textAlign: 'center',
    },
    confirmRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.xl,
      minHeight: 44,
    },
    box: {
      width: 22,
      height: 22,
      borderRadius: radius.sm,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    boxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
    confirmText: { flex: 1, ...typography.body, fontSize: 14, color: colors.foreground },
    submit: { marginTop: spacing.xl },
  });
