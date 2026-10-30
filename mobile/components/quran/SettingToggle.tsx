/**
 * SettingToggle — one labelled switch row, optionally with a sub-label and an
 * info affordance. Shared by the reader settings sheet so each display layer
 * reads the same way.
 */
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Info } from 'lucide-react-native';
import { colors, fontFamily, spacing } from '../../theme/tokens';

export default function SettingToggle({
  label,
  hint,
  value,
  onValueChange,
  onInfo,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: () => void;
  onInfo?: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {onInfo ? (
            <Pressable
              onPress={onInfo}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`About ${label}`}
            >
              <Info size={15} color={colors.mutedForeground} strokeWidth={2.25} />
            </Pressable>
          ) : null}
        </View>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.border}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: { flex: 1, gap: 2 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  label: { fontFamily, fontSize: 15, color: colors.foreground },
  hint: { fontFamily, fontSize: 12, color: colors.mutedForeground, lineHeight: 17 },
});
