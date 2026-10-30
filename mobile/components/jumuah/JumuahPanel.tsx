/**
 * JumuahPanel — the Friday half: when it falls, the window for Sūrat al-Kahf,
 * who it is due upon, and the sunan around attending.
 */
import { StyleSheet, View } from 'react-native';
import { BookOpen, CalendarDays, Sparkles } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { daysUntilJumuah, isKahfWindow, nextJumuah } from '../../lib/jumuah';
import {
  JUMUAH_DALEEL,
  JUMUAH_INTRO,
  JUMUAH_OBLIGATION,
  JUMUAH_SUNAN,
  KHUTBAH_ADAB,
  SAAH_DALEEL,
  SAAH_IJABAH,
} from '../../content/jumuah';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

export default function JumuahPanel({ now }: { now: Date }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const away = daysUntilJumuah(now);
  const friday = nextJumuah(now);
  const kahfOpen = isKahfWindow(now);
  const dateLabel = friday.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <CalendarDays size={26} color={colors.primary} strokeWidth={1.75} />
        </View>
        <AppText style={styles.heroTitle}>
          {away === 0 ? 'Jumuʿah is today' : away === 1 ? 'Jumuʿah is tomorrow' : `Jumuʿah in ${away} days`}
        </AppText>
        <AppText style={styles.heroSub}>{dateLabel}</AppText>
      </View>

      <View style={[styles.card, kahfOpen && styles.cardLive]}>
        <View style={styles.cardHead}>
          <BookOpen size={16} color={kahfOpen ? colors.primary : colors.mutedForeground} strokeWidth={2.25} />
          <AppText style={styles.cardTitle}>Sūrat al-Kahf</AppText>
          {kahfOpen ? <AppText style={styles.live}>open now</AppText> : null}
        </View>
        <AppText style={styles.body}>
          {kahfOpen
            ? 'The window is open — read it before Maghrib today.'
            : 'The window runs from Maghrib on Thursday until Maghrib on Friday.'}
        </AppText>
      </View>

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>What it is</AppText>
        <AppText style={styles.body}>{JUMUAH_INTRO}</AppText>
        <AppText style={styles.body}>{JUMUAH_OBLIGATION}</AppText>
      </View>

      <AppText style={styles.section}>BEFORE YOU GO</AppText>
      {JUMUAH_SUNAN.map((s, i) => (
        <View key={s.id} style={styles.item}>
          <View style={styles.num}>
            <AppText style={styles.numText}>{i + 1}</AppText>
          </View>
          <View style={styles.itemText}>
            <AppText style={styles.itemTitle}>{s.title}</AppText>
            <AppText style={styles.itemDetail}>{s.detail}</AppText>
            {s.source ? <AppText style={styles.ref}>{s.source}</AppText> : null}
          </View>
        </View>
      ))}

      <AppText style={styles.section}>DURING THE KHUṬBAH</AppText>
      {KHUTBAH_ADAB.map((s) => (
        <View key={s.id} style={styles.card}>
          <AppText style={styles.itemTitle}>{s.title}</AppText>
          <AppText style={styles.itemDetail}>{s.detail}</AppText>
          {s.source ? <AppText style={styles.ref}>{s.source}</AppText> : null}
        </View>
      ))}

      <AppText style={styles.section}>THE HOUR OF RESPONSE</AppText>
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Sparkles size={16} color={colors.primary} strokeWidth={2.25} />
          <AppText style={styles.cardTitle}>Sāʿat al-ijābah</AppText>
        </View>
        <AppText style={styles.body}>{SAAH_IJABAH}</AppText>
        <View style={styles.evidence}>
          <AppText style={styles.arabic}>{SAAH_DALEEL.arabic}</AppText>
          <AppText style={styles.itemDetail}>{SAAH_DALEEL.meaning}</AppText>
          <AppText style={styles.ref}>{SAAH_DALEEL.source}</AppText>
        </View>
      </View>

      <AppText style={styles.section}>THE EVIDENCE</AppText>
      {JUMUAH_DALEEL.map((d) => (
        <View key={d.source} style={styles.evidence}>
          {d.arabic ? <AppText style={styles.arabic}>{d.arabic}</AppText> : null}
          <AppText style={styles.itemDetail}>{d.meaning}</AppText>
          <AppText style={styles.ref}>{d.source}</AppText>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { gap: spacing.sm },
    hero: {
      alignItems: 'center',
      gap: spacing.xs,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.lg,
    },
    heroIcon: {
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}1A`,
      marginBottom: spacing.xs,
    },
    heroTitle: { ...typography.title, fontSize: 19, color: colors.foreground },
    heroSub: { fontFamily, fontSize: 13, color: colors.mutedForeground },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.lg,
      gap: spacing.xs,
    },
    cardLive: { borderColor: `${colors.primary}66`, backgroundColor: `${colors.primary}0F` },
    cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    cardTitle: { ...typography.title, fontSize: 16, color: colors.foreground, flex: 1 },
    live: {
      ...typography.caption,
      fontSize: 10,
      color: colors.primary,
      backgroundColor: `${colors.primary}1A`,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: radius.full,
      overflow: 'hidden',
    },
    body: { fontFamily, fontSize: 13, lineHeight: 21, color: colors.mutedForeground },
    section: {
      ...typography.caption,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.primary,
      marginTop: spacing.md,
    },
    item: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', paddingVertical: spacing.sm },
    num: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}1A`,
      marginTop: 1,
    },
    numText: { ...typography.caption, fontSize: 11, fontWeight: '700', color: colors.primary },
    itemText: { flex: 1, gap: 2 },
    itemTitle: { fontFamily, fontSize: 14, fontWeight: '600', color: colors.foreground },
    itemDetail: { fontFamily, fontSize: 13, lineHeight: 20, color: colors.mutedForeground },
    ref: { ...typography.caption, fontSize: 11, color: colors.primary },
    evidence: {
      borderRadius: radius.md,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      backgroundColor: colors.cardElevated,
      padding: spacing.md,
      gap: 4,
      marginTop: spacing.xs,
    },
    arabic: { fontFamily, fontSize: 16, lineHeight: 32, color: colors.foreground, textAlign: 'right' },
  });
