/**
 * ScanHistory — past scans, kept on the device. Tapping one looks it up again
 * rather than trusting the saved verdict, because recipes change.
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { History, Trash2 } from 'lucide-react-native';
import AppText from '../ui/AppText';
import type { ScanRecord } from '../../hooks/useHalalScanner';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

function when(ts: number): string {
  const days = Math.floor((Date.now() - ts) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export default function ScanHistory({
  history,
  onSelect,
  onClear,
}: {
  history: ScanRecord[];
  onSelect: (barcode: string) => void;
  onClear: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  if (history.length === 0) {
    return (
      <View style={styles.empty}>
        <History size={26} color={colors.subtleForeground} strokeWidth={1.75} />
        <AppText style={styles.emptyText}>Products you scan will be listed here.</AppText>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {history.map((h) => {
        const tone =
          h.verdict === 'prohibited'
            ? colors.destructive
            : h.verdict === 'check'
              ? colors.primary
              : colors.border;
        return (
          <Pressable
            key={h.barcode}
            onPress={() => onSelect(h.barcode)}
            style={styles.row}
            accessibilityRole="button"
            accessibilityLabel={`${h.name}, check again`}
          >
            <View style={styles.text}>
              <AppText style={styles.name}>{h.name}</AppText>
              <AppText style={styles.meta}>
                {h.brand ? `${h.brand} · ` : ''}
                {h.verdict === 'prohibited'
                  ? 'Prohibited ingredient'
                  : h.flagCount > 0
                    ? `${h.flagCount} to check`
                    : 'Nothing flagged'}
                {' · '}
                {when(h.scannedAt)}
              </AppText>
            </View>
            <View style={[styles.dot, { backgroundColor: tone }]} />
          </Pressable>
        );
      })}

      <AppText style={styles.footnote}>
        Tapping one looks it up again — a saved result can go out of date when a recipe changes.
      </AppText>

      <Pressable
        onPress={onClear}
        style={styles.clearBtn}
        accessibilityRole="button"
        accessibilityLabel="Clear scan history"
      >
        <Trash2 size={15} color={colors.mutedForeground} strokeWidth={2.25} />
        <AppText style={styles.clearText}>Clear history</AppText>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { gap: spacing.xs },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      minHeight: 54,
    },
    text: { flex: 1, gap: 2 },
    name: { fontFamily, fontSize: 14, color: colors.foreground },
    meta: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },
    dot: { width: 8, height: 8, borderRadius: 4 },
    empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing['2xl'] },
    emptyText: { fontFamily, fontSize: 13, color: colors.subtleForeground, textAlign: 'center' },
    footnote: {
      ...typography.caption,
      fontSize: 11,
      lineHeight: 18,
      color: colors.subtleForeground,
      paddingTop: spacing.sm,
    },
    clearBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      marginTop: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 46,
    },
    clearText: { ...typography.button, fontSize: 14, color: colors.mutedForeground },
  });
