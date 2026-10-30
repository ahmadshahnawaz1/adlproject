/**
 * TasbihPresetPicker — the horizontal rail of remembrances. Each chip names a
 * dhikr and its round target (or "free"); the chosen one glows gold. Tapping a
 * chip switches the sitting. Presentational: it renders the presets and reports
 * the selection.
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import type { TasbihPreset } from '../lib/tasbih';

export default function TasbihPresetPicker({
  presets,
  selectedId,
  onSelect,
}: {
  presets: TasbihPreset[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {presets.map((p) => {
        const active = p.id === selectedId;
        return (
          <Pressable
            key={p.id}
            onPress={() => onSelect(p.id)}
            style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${p.title}, ${p.target > 0 ? `to ${p.target}` : 'free count'}`}
          >
            <Text style={[styles.chipTitle, active && styles.chipTitleActive]} numberOfLines={1}>
              {p.title}
            </Text>
            <View style={[styles.badge, active && styles.badgeActive]}>
              <Text style={[styles.badgeText, active && styles.badgeTextActive]}>
                {p.target > 0 ? p.target : '∞'}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  row: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  pressed: { opacity: 0.85 },
  chipTitle: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '600', color: colors.mutedForeground },
  chipTitleActive: { color: colors.primaryForeground },
  badge: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: { backgroundColor: 'rgba(0,0,0,0.18)' },
  badgeText: { fontFamily, fontSize: 11, fontWeight: '700', color: colors.subtleForeground },
  badgeTextActive: { color: colors.primaryForeground },
});
