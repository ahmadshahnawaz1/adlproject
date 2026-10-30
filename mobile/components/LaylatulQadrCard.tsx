/**
 * LaylatulQadrCard — the search for the Night of Decree in the last ten. The
 * emphasised odd nights are shown as chips with tonight highlighted, alongside
 * the duʿā ʿĀʾishah was taught and the evidence for seeking it. Shown only in
 * the last ten days of Ramadan.
 */
import { StyleSheet, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { DALEEL_QADR, DALEEL_QADR_SEEK, FASTING_DUAS, ODD_NIGHTS } from '../content/fasting';
import type { RamadanInfo } from '../lib/fasting';
import { arabicFont, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import DaleelBlock from './DaleelBlock';

const QADR_DUA = FASTING_DUAS.find((d) => d.id === 'qadr');

export default function LaylatulQadrCard({
  info,
  showArabic = true,
}: {
  info: RamadanInfo;
  showArabic?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Star size={16} color={colors.primary} strokeWidth={2.2} fill={colors.primary} />
        <Text style={styles.kicker}>Laylatul-Qadr · ليلة القدر</Text>
      </View>

      <Text style={styles.lead}>{DALEEL_QADR.text}</Text>

      <View style={styles.nights}>
        {ODD_NIGHTS.map((n) => {
          const tonight = info.day === n;
          return (
            <View key={n} style={[styles.night, tonight && styles.nightOn]}>
              <Text style={[styles.nightText, tonight && styles.nightTextOn]}>{n}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.note}>
        The emphasised odd nights — each begins at sunset the evening before. Seek it in prayer,
        Qurʾān and duʿā.
      </Text>

      {QADR_DUA ? (
        <View style={styles.dua}>
          {showArabic ? <Text style={styles.arabic}>{QADR_DUA.arabic}</Text> : null}
          <Text style={styles.translit}>{QADR_DUA.transliteration}</Text>
          <Text style={styles.translation}>{QADR_DUA.translation}</Text>
        </View>
      ) : null}

      <View style={styles.daleel}>
        <DaleelBlock daleel={DALEEL_QADR_SEEK} />
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.primary}55`,
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
  lead: { ...typography.body, fontSize: 15, fontWeight: '600', color: colors.foreground, lineHeight: 22, marginBottom: spacing.lg },

  nights: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  night: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nightOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  nightText: { fontSize: 16, fontWeight: '800', color: colors.mutedForeground, fontVariant: ['tabular-nums'] },
  nightTextOn: { color: colors.primaryForeground },
  note: { ...typography.caption, fontSize: 12, color: colors.subtleForeground, lineHeight: 18 },

  dua: { marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  arabic: {
    fontSize: 22,
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
