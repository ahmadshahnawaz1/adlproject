/**
 * LockScreen — the privacy gate shown when App Lock is on. Auto-presents the
 * biometric / passcode prompt on mount; a tap re-tries if it was dismissed.
 */
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from './ui/AppText';
import { ScanFace } from 'lucide-react-native';
import BrandMark from './BrandMark';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  useEffect(() => {
    onUnlock();
  }, [onUnlock]);

  return (
    <View style={styles.root}>
      <BrandMark size={64} layout="stack" />
      <View style={styles.iconWrap}>
        <ScanFace size={26} color={colors.primary} strokeWidth={2} />
      </View>
      <Text style={styles.title}>Adl is locked</Text>
      <Text style={styles.sub}>Unlock with Face ID, Touch ID, or your device passcode.</Text>
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        onPress={onUnlock}
        accessibilityRole="button"
        accessibilityLabel="Unlock Adl"
      >
        <ScanFace size={18} color={colors.primaryForeground} strokeWidth={2.2} />
        <Text style={styles.btnText}>Unlock</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
    iconWrap: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: `${colors.primary}1A`, marginTop: spacing.md },
    title: { ...typography.title, fontSize: 22, color: colors.foreground, textAlign: 'center' },
    sub: { fontFamily, fontSize: 14, lineHeight: 21, color: colors.mutedForeground, textAlign: 'center', maxWidth: 300 },
    btn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, marginTop: spacing.sm },
    btnText: { ...typography.button, color: colors.primaryForeground },
    pressed: { opacity: 0.85 },
  });
