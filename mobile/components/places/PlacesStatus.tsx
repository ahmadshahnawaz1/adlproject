/**
 * PlacesStatus — the non-list states for the finder: loading, empty, a network
 * error with retry, and an offline note shown above cached results. Theme-aware.
 */
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MapPin, RotateCw, WifiOff } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import type { PlacesStatus as Status } from '../../hooks/usePlacesFinder';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';

/** A thin banner shown above the list when results came from the cache. */
export function OfflineBanner() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.banner}>
      <WifiOff size={14} color={colors.mutedForeground} strokeWidth={2.2} />
      <Text style={styles.bannerText}>Offline — showing the last saved results.</Text>
    </View>
  );
}

/** The full-panel state for loading / error / empty. */
export default function PlacesStatus({
  status,
  onRetry,
}: {
  status: Status;
  onRetry: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  if (status === 'loading') {
    return (
      <View style={styles.panel}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.text}>Finding places nearby…</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.panel}>
        <WifiOff size={26} color={colors.subtleForeground} strokeWidth={1.8} />
        <Text style={styles.text}>Couldn’t reach the map service. Check your connection.</Text>
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <RotateCw size={15} color={colors.primaryForeground} strokeWidth={2.4} />
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  // ready/offline with no results
  return (
    <View style={styles.panel}>
      <MapPin size={26} color={colors.subtleForeground} strokeWidth={1.8} />
      <Text style={styles.text}>Nothing found here yet. Try a wider radius or another filter.</Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    panel: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing['3xl'] },
    text: {
      fontFamily,
      fontSize: 14,
      lineHeight: 20,
      color: colors.mutedForeground,
      textAlign: 'center',
      paddingHorizontal: spacing.xl,
    },
    retry: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    retryText: { ...typography.button, fontSize: 14, color: colors.primaryForeground },
    pressed: { opacity: 0.85 },
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.cardElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bannerText: { fontFamily, fontSize: 12, color: colors.mutedForeground },
  });
