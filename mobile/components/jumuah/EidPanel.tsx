/**
 * EidPanel — the Eid half: when the next one falls, the takbīr, how the prayer
 * is offered, and the sunan particular to each of the two.
 *
 * The number of takbīrs and the ruling on the prayer both differ between the
 * schools, so both are laid out side by side rather than resolved.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Moon, Sunrise } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { haptics } from '../../lib/haptics';
import { formatHijriLong } from '../../lib/hijriCalendar';
import { upcomingEids, type EidKind } from '../../lib/jumuah';
import {
  EID_GREETING,
  EID_INTRO,
  EID_RULING_OPINIONS,
  EID_SUNAN,
  EID_TAKBIR_OPINIONS,
  TAKBIR_TEXT,
  TAKBIR_TIMING,
} from '../../content/jumuah';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

export default function EidPanel({ now }: { now: Date }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const eids = upcomingEids(now);
  const [kind, setKind] = useState<EidKind>(eids[0]?.kind ?? 'fitr');
  const eid = eids.find((e) => e.kind === kind) ?? eids[0];

  const pick = (k: EidKind) => {
    haptics.selection();
    setKind(k);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.switcher}>
        {eids.map((e) => (
          <Pressable
            key={e.kind}
            onPress={() => pick(e.kind)}
            style={[styles.tab, kind === e.kind && styles.tabOn]}
            accessibilityRole="tab"
            accessibilityState={{ selected: kind === e.kind }}
          >
            <AppText style={[styles.tabText, kind === e.kind && styles.tabTextOn]}>{e.label}</AppText>
          </Pressable>
        ))}
      </View>

      {eid ? (
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            {eid.kind === 'fitr' ? (
              <Moon size={26} color={colors.primary} strokeWidth={1.75} />
            ) : (
              <Sunrise size={26} color={colors.primary} strokeWidth={1.75} />
            )}
          </View>
          <AppText style={styles.heroArabic}>{eid.arabic}</AppText>
          <AppText style={styles.heroTitle}>
            {eid.isToday ? 'Today' : eid.daysAway === 1 ? 'Tomorrow' : `In ${eid.daysAway} days`}
          </AppText>
          <AppText style={styles.heroSub}>
            {eid.date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </AppText>
          <AppText style={styles.heroHijri}>{formatHijriLong(eid.hijri)}</AppText>
          <AppText style={styles.heroNote}>
            The night of Eid begins at sunset on{' '}
            {eid.startsEvening.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}.
          </AppText>
        </View>
      ) : null}

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>The prayer</AppText>
        <AppText style={styles.body}>{EID_INTRO}</AppText>
      </View>

      <AppText style={styles.section}>THE TAKBĪR</AppText>
      <View style={styles.takbir}>
        <AppText style={styles.takbirArabic}>{TAKBIR_TEXT.arabic}</AppText>
        <AppText style={styles.translit}>{TAKBIR_TEXT.transliteration}</AppText>
        <AppText style={styles.body}>{TAKBIR_TEXT.meaning}</AppText>
        <AppText style={styles.timing}>{kind === 'fitr' ? TAKBIR_TIMING.fitr : TAKBIR_TIMING.adha}</AppText>
      </View>

      <AppText style={styles.section}>HOW MANY TAKBĪRS</AppText>
      {EID_TAKBIR_OPINIONS.map((o) => (
        <View key={o.position} style={styles.opinion}>
          <View style={styles.opinionHead}>
            <AppText style={styles.opinionTitle}>{o.position}</AppText>
            <AppText style={styles.held}>{o.held}</AppText>
          </View>
          <AppText style={styles.itemDetail}>{o.detail}</AppText>
        </View>
      ))}
      <AppText style={styles.note}>
        Both are practised. Follow your imam — the prayer is valid either way.
      </AppText>

      <AppText style={styles.section}>IS IT OBLIGATORY?</AppText>
      {EID_RULING_OPINIONS.map((o) => (
        <View key={o.position} style={styles.opinion}>
          <View style={styles.opinionHead}>
            <AppText style={styles.opinionTitle}>{o.position}</AppText>
            <AppText style={styles.held}>{o.held}</AppText>
          </View>
          <AppText style={styles.itemDetail}>{o.detail}</AppText>
        </View>
      ))}

      <AppText style={styles.section}>ON THE DAY</AppText>
      {EID_SUNAN[kind].map((s, i) => (
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

      <AppText style={styles.section}>THE GREETING</AppText>
      <View style={styles.takbir}>
        <AppText style={styles.takbirArabic}>{EID_GREETING.arabic}</AppText>
        <AppText style={styles.translit}>{EID_GREETING.transliteration}</AppText>
        <AppText style={styles.body}>{EID_GREETING.meaning}</AppText>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { gap: spacing.sm },
    switcher: {
      flexDirection: 'row',
      gap: spacing.xs,
      padding: 3,
      borderRadius: radius.md,
      backgroundColor: colors.cardElevated,
    },
    tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.sm, minHeight: 40, justifyContent: 'center' },
    tabOn: { backgroundColor: colors.card },
    tabText: { ...typography.label, color: colors.mutedForeground },
    tabTextOn: { color: colors.foreground, fontWeight: '700' },
    hero: {
      alignItems: 'center',
      gap: 3,
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
    heroArabic: { fontFamily, fontSize: 20, lineHeight: 34, color: colors.primary },
    heroTitle: { ...typography.title, fontSize: 19, color: colors.foreground },
    heroSub: { fontFamily, fontSize: 13, color: colors.mutedForeground },
    heroHijri: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },
    heroNote: {
      ...typography.caption,
      fontSize: 11,
      lineHeight: 17,
      color: colors.subtleForeground,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.lg,
      gap: spacing.xs,
    },
    cardTitle: { ...typography.title, fontSize: 16, color: colors.foreground },
    body: { fontFamily, fontSize: 13, lineHeight: 21, color: colors.mutedForeground },
    section: {
      ...typography.caption,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.primary,
      marginTop: spacing.md,
    },
    takbir: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: `${colors.primary}44`,
      backgroundColor: `${colors.primary}0F`,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    takbirArabic: {
      fontFamily,
      fontSize: 19,
      lineHeight: 38,
      color: colors.foreground,
      textAlign: 'center',
    },
    translit: {
      fontFamily,
      fontSize: 13,
      lineHeight: 20,
      color: colors.primary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    timing: {
      ...typography.caption,
      fontSize: 11,
      lineHeight: 18,
      color: colors.subtleForeground,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.sm,
    },
    opinion: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.md,
      gap: 3,
    },
    opinionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
    opinionTitle: { ...typography.title, fontSize: 15, color: colors.foreground, flex: 1 },
    held: { ...typography.caption, fontSize: 11, color: colors.primary },
    note: {
      ...typography.caption,
      fontSize: 11,
      lineHeight: 18,
      color: colors.subtleForeground,
      fontStyle: 'italic',
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
  });
