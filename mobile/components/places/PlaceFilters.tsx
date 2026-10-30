/**
 * PlaceFilters — the kind chips (All / Mosques / Halal) and the search radius
 * selector for the Mosque & Halal finder. Theme-aware.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import type { PlaceFilter } from '../../lib/places';
import { RADIUS_OPTIONS } from '../../hooks/usePlacesFinder';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';

const FILTERS: { key: PlaceFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'mosque', label: 'Mosques' },
  { key: 'halal', label: 'Halal' },
];

function radiusLabel(m: number): string {
  return m < 1000 ? `${m} m` : `${m / 1000} km`;
}

export default function PlaceFilters({
  filter,
  onFilter,
  radiusMeters,
  onRadius,
}: {
  filter: PlaceFilter;
  onFilter: (f: PlaceFilter) => void;
  radiusMeters: number;
  onRadius: (m: number) => void;
}) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => onFilter(f.key)}
              style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.row}>
        {RADIUS_OPTIONS.map((m) => {
          const active = radiusMeters === m;
          return (
            <Pressable
              key={m}
              onPress={() => onRadius(m)}
              style={({ pressed }) => [styles.radiusChip, active && styles.radiusActive, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Within ${radiusLabel(m)}`}
            >
              <Text style={[styles.radiusText, active && styles.radiusTextActive]}>{radiusLabel(m)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { gap: spacing.sm },
    row: { flexDirection: 'row', gap: spacing.sm },
    chip: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    chipActive: { borderColor: colors.primary, backgroundColor: colors.cardElevated },
    pressed: { opacity: 0.85 },
    chipText: { ...typography.button, fontSize: 13, color: colors.mutedForeground },
    chipTextActive: { color: colors.foreground },
    radiusChip: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 6,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    radiusActive: { borderColor: `${colors.primary}88`, backgroundColor: `${colors.primary}14` },
    radiusText: { fontFamily, fontSize: 12, fontWeight: '600', color: colors.subtleForeground },
    radiusTextActive: { color: colors.primary },
  });
