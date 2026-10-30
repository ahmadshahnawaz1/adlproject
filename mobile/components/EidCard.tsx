/**
 * EidCard — the close of the month: a gentle countdown to Eid al-Fiṭr, a
 * reminder that Zakat al-Fiṭr is due before the Eid prayer (with a shortcut to
 * the calculator), and the takbīr recited from the night before until the
 * prayer. Shown as Ramadan nears its end.
 */
import { StyleSheet, Text, View } from 'react-native';
import { Gift } from 'lucide-react-native';
import { EID_TAKBIR } from '../content/fasting';
import { arabicFont, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import Button from './ui/Button';
import DaleelBlock from './DaleelBlock';

function countdownLine(days: number | null): { big: string; sub: string } {
  if (days == null) return { big: 'Eid al-Fiṭr', sub: 'The festival that follows the month' };
  if (days <= 0) return { big: 'Eid Mubārak!', sub: 'May Allah accept your fasting and worship' };
  if (days === 1) return { big: 'Tomorrow', sub: 'Eid al-Fiṭr · عيد الفطر' };
  return { big: `${days} days`, sub: 'until Eid al-Fiṭr · عيد الفطر' };
}

export default function EidCard({
  daysToEid,
  onOpenZakat,
  showArabic = true,
}: {
  daysToEid: number | null;
  onOpenZakat?: () => void;
  showArabic?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const c = countdownLine(daysToEid);
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Gift size={16} color={colors.primary} strokeWidth={2.2} />
        <Text style={styles.kicker}>Eid al-Fiṭr</Text>
      </View>

      <Text style={styles.big}>{c.big}</Text>
      <Text style={styles.sub}>{c.sub}</Text>

      <View style={styles.fitr}>
        <Text style={styles.fitrTitle}>Zakat al-Fiṭr</Text>
        <Text style={styles.fitrBody}>
          A small charity due on every person before the Eid prayer, purifying the fast and feeding
          the needy. Pay it in good time.
        </Text>
        {onOpenZakat ? (
          <Button label="Open Zakat calculator" variant="outline" onPress={onOpenZakat} style={styles.fitrBtn} />
        ) : null}
      </View>

      <View style={styles.dua}>
        <Text style={styles.duaTitle}>{EID_TAKBIR.title}</Text>
        {showArabic ? <Text style={styles.arabic}>{EID_TAKBIR.arabic}</Text> : null}
        <Text style={styles.translit}>{EID_TAKBIR.transliteration}</Text>
        <Text style={styles.translation}>{EID_TAKBIR.translation}</Text>
        {EID_TAKBIR.daleel ? (
          <View style={styles.daleel}>
            <DaleelBlock daleel={EID_TAKBIR.daleel} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.lg,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  kicker: {
    ...typography.label,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  big: { ...typography.display, fontSize: 26, color: colors.foreground },
  sub: { ...typography.body, fontSize: 14, color: colors.mutedForeground, marginTop: 2 },

  fitr: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fitrTitle: { ...typography.button, fontSize: 14, color: colors.foreground },
  fitrBody: { ...typography.caption, fontSize: 13, color: colors.mutedForeground, lineHeight: 19, marginTop: 4 },
  fitrBtn: { marginTop: spacing.md, height: 44 },

  dua: { marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  duaTitle: { ...typography.button, fontSize: 14, color: colors.foreground, marginBottom: spacing.sm },
  arabic: {
    fontSize: 21,
    lineHeight: 40,
    color: colors.foreground,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: arabicFont,
    marginBottom: spacing.sm,
  },
  translit: { ...typography.body, fontSize: 14, fontStyle: 'italic', color: colors.primary, lineHeight: 21, marginBottom: 4 },
  translation: { ...typography.body, fontSize: 14, color: colors.mutedForeground, lineHeight: 21 },
  daleel: { marginTop: spacing.md },
});
