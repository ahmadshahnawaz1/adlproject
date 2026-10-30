/**
 * FastingNotesCard — the quiet fiqh: the sunan that complete the fast, the
 * common mistakes to avoid, and a short disclaimer that this is guidance, not a
 * fatwa. Content-driven from content/fasting; no state.
 */
import { StyleSheet, Text, View } from 'react-native';
import { CircleCheck, CircleAlert, Info } from 'lucide-react-native';
import { FASTING_DISCLAIMER, FASTING_MISTAKES, FASTING_SUNAN } from '../content/fasting';
import { colors, radius, spacing, typography } from '../theme/tokens';

export default function FastingNotesCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.section}>Sunan of the fast</Text>
      <View style={styles.list}>
        {FASTING_SUNAN.map((n) => (
          <View key={n.title} style={styles.row}>
            <CircleCheck size={15} color={colors.success} strokeWidth={2.3} style={styles.icon} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{n.title}</Text>
              <Text style={styles.rowBody}>{n.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.divider} />
      <Text style={styles.section}>Common mistakes</Text>
      <View style={styles.list}>
        {FASTING_MISTAKES.map((n) => (
          <View key={n.title} style={styles.row}>
            <CircleAlert size={15} color={colors.destructive} strokeWidth={2.3} style={styles.icon} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{n.title}</Text>
              <Text style={styles.rowBody}>{n.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.disclaimer}>
        <Info size={14} color={colors.subtleForeground} strokeWidth={2.2} style={styles.icon} />
        <Text style={styles.disclaimerText}>{FASTING_DISCLAIMER}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.lg,
  },
  section: {
    ...typography.label,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  list: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm },
  icon: { marginTop: 2 },
  rowText: { flex: 1 },
  rowTitle: { ...typography.body, fontSize: 14, fontWeight: '600', color: colors.foreground },
  rowBody: { ...typography.caption, fontSize: 13, color: colors.mutedForeground, lineHeight: 19, marginTop: 2 },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },

  disclaimer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  disclaimerText: { flex: 1, ...typography.caption, fontSize: 12, color: colors.subtleForeground, lineHeight: 18, fontStyle: 'italic' },
});
