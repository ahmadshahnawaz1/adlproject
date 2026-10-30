/**
 * FastingTimesCard — the day's fasting moments at a glance: when to stop eating
 * (Imsāk), when Suhūr ends (Fajr), and when to break (Iftār / Maghrib), with the
 * fast's total length. The moment that matters next is highlighted. Times come
 * from the offline engine; the card only formats them.
 */
import { StyleSheet, Text, View } from 'react-native';
import { MoonStar, Sunrise, Sunset } from 'lucide-react-native';
import { fastDurationMs, type FastPhase, type FastTimes } from '../lib/fasting';
import { formatDuration, formatTime } from '../lib/clock';
import { arabicFont, colors, radius, spacing, typography } from '../theme/tokens';

type Row = {
  key: string;
  label: string;
  arabic: string;
  at: Date;
  icon: React.ReactNode;
  hint: string;
};

export default function FastingTimesCard({
  times,
  timeZone,
  phase,
  showArabic = true,
}: {
  times: FastTimes;
  timeZone: string;
  phase: FastPhase;
  showArabic?: boolean;
}) {
  const rows: Row[] = [
    {
      key: 'imsak',
      label: 'Imsāk',
      arabic: 'الإمساك',
      at: times.imsak,
      icon: <MoonStar size={18} color={colors.mutedForeground} strokeWidth={2.1} />,
      hint: 'Stop eating',
    },
    {
      key: 'suhoor',
      label: 'Suhūr ends · Fajr',
      arabic: 'الفجر',
      at: times.suhoorEnd,
      icon: <Sunrise size={18} color={colors.mutedForeground} strokeWidth={2.1} />,
      hint: 'Fast begins',
    },
    {
      key: 'iftar',
      label: 'Iftār · Maghrib',
      arabic: 'المغرب',
      at: times.iftar,
      icon: <Sunset size={18} color={colors.primary} strokeWidth={2.1} />,
      hint: 'Break the fast',
    },
  ];

  const activeKey = phase === 'fasting' ? 'iftar' : phase === 'preDawn' ? 'suhoor' : null;

  return (
    <View style={styles.card}>
      {rows.map((r, i) => {
        const active = r.key === activeKey;
        return (
          <View
            key={r.key}
            style={[styles.row, i < rows.length - 1 && styles.rowDivider, active && styles.rowActive]}
          >
            <View style={styles.icon}>{r.icon}</View>
            <View style={styles.text}>
              <Text style={[styles.label, active && styles.labelActive]}>{r.label}</Text>
              <Text style={styles.hint}>{r.hint}</Text>
            </View>
            {showArabic ? <Text style={styles.arabic}>{r.arabic}</Text> : null}
            <Text style={[styles.time, active && styles.timeActive]}>{formatTime(r.at, timeZone)}</Text>
          </View>
        );
      })}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Length of fast today</Text>
        <Text style={styles.footerValue}>{formatDuration(fastDurationMs(times))}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowActive: { marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg, backgroundColor: `${colors.primary}0D` },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  label: { ...typography.body, fontSize: 15, fontWeight: '600', color: colors.foreground },
  labelActive: { color: colors.primary },
  hint: { ...typography.caption, fontSize: 11, color: colors.subtleForeground, marginTop: 1 },
  arabic: { fontSize: 15, color: colors.mutedForeground, fontFamily: arabicFont, marginRight: spacing.sm },
  time: { ...typography.body, fontSize: 15, fontWeight: '700', color: colors.foreground, fontVariant: ['tabular-nums'] },
  timeActive: { color: colors.primary },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: { ...typography.caption, color: colors.mutedForeground },
  footerValue: { ...typography.body, fontSize: 14, fontWeight: '700', color: colors.primary },
});
