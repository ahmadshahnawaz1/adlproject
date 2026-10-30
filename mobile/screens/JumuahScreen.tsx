/**
 * JumuahScreen — Jumuʿah and the two Eids (F27).
 *
 * The weekly gathering and the yearly festivals in one place: when each falls,
 * how it is prayed, and the sunan around it. Fully offline.
 */
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { X } from 'lucide-react-native';
import AppText from '../components/ui/AppText';
import JumuahPanel from '../components/jumuah/JumuahPanel';
import EidPanel from '../components/jumuah/EidPanel';
import { haptics } from '../lib/haptics';
import { JUMUAH_DISCLAIMER } from '../content/jumuah';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

type Tab = 'jumuah' | 'eid';

export default function JumuahScreen({ onClose }: { onClose?: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [tab, setTab] = useState<Tab>('jumuah');
  const [now] = useState(() => new Date());

  const pick = (next: Tab) => {
    if (next === tab) return;
    haptics.selection();
    setTab(next);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close">
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <AppText style={styles.headerTitle}>Jumuʿah & Eid</AppText>
          <AppText style={styles.headerSub} numberOfLines={1}>ٱلْجُمُعَة وَٱلْعِيدَان</AppText>
        </View>
        <View style={styles.iconSpacer} />
      </View>

      <View style={styles.tabs}>
        {(['jumuah', 'eid'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => pick(t)}
            style={[styles.tab, tab === t && styles.tabOn]}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
          >
            <AppText style={[styles.tabText, tab === t && styles.tabTextOn]}>
              {t === 'jumuah' ? 'Jumuʿah' : 'Eid'}
            </AppText>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {tab === 'jumuah' ? <JumuahPanel now={now} /> : <EidPanel now={now} />}
        <AppText style={styles.disclaimer}>{JUMUAH_DISCLAIMER}</AppText>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingTop: spacing['3xl'] + spacing.md,
      paddingBottom: spacing.md,
    },
    iconBtn: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconSpacer: { width: 34 },
    headerCenter: { flex: 1, alignItems: 'center', gap: 1 },
    headerTitle: { fontFamily, fontSize: 16, fontWeight: '700', color: colors.foreground },
    headerSub: { fontFamily, fontSize: 11, color: colors.subtleForeground },
    tabs: {
      flexDirection: 'row',
      gap: spacing.xs,
      padding: 3,
      borderRadius: radius.md,
      backgroundColor: colors.cardElevated,
      marginBottom: spacing.md,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      borderRadius: radius.sm,
      minHeight: 40,
    },
    tabOn: { backgroundColor: colors.card },
    tabText: { ...typography.label, color: colors.mutedForeground },
    tabTextOn: { color: colors.foreground, fontWeight: '700' },
    scroll: { paddingBottom: spacing['3xl'], gap: spacing.md },
    disclaimer: {
      fontFamily,
      fontSize: 12,
      lineHeight: 18,
      color: colors.subtleForeground,
      textAlign: 'center',
      marginTop: spacing.lg,
    },
  });
