/**
 * ZakatResult — the payoff screen. A gauge shows wealth against niṣāb, the
 * calculation is broken down line by line, the ḥawl is reported, the eight
 * Qurʾānic recipients are shown so paying connects to giving, and the whole
 * summary can be shared as text. Reads entirely from the pure computation.
 */
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Share2, PencilLine, CalendarClock, Users, Info } from 'lucide-react-native';
import type { ZakatComputation, HawlStatus } from '../lib/zakat';
import { formatMoney } from '../lib/zakat';
import type { ZakatSettings } from '../content/zakat/zakat';
import { ZAKAT_DISCLAIMER } from '../content/zakat/zakat';
import { ASNAF, ASNAF_AYAH } from '../content/zakat/recipients';
import { radius, spacing, typography, arabicFont } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import ZakatNisabGauge from './ZakatNisabGauge';

function Row({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && styles.rowLabelStrong]}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          strong && styles.rowValueStrong,
          accent && { color: colors.primary },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default function ZakatResult({
  computation: c,
  settings,
  hawl,
  onEdit,
  slot,
}: {
  computation: ZakatComputation;
  settings: ZakatSettings;
  hawl: HawlStatus;
  onEdit: () => void;
  slot?: ReactNode;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const ratio = c.nisab > 0 ? c.netZakatable / c.nisab : c.netZakatable > 0 ? 1 : 0;

  const share = () => {
    const lines = [
      'My Zakat — calculated with Adl',
      '',
      `Net zakatable wealth: ${formatMoney(c.netZakatable, c.currency)}`,
      `Niṣāb (${c.nisabStandard}): ${formatMoney(c.nisab, c.currency)}`,
      c.meetsNisab
        ? `Zakat due (${(c.rate * 100).toFixed(c.rate === 0.025 ? 1 : 4)}%): ${formatMoney(c.zakatDue, c.currency)}`
        : `Below niṣāb — no zakat due (short by ${formatMoney(c.shortfallToNisab, c.currency)})`,
      '',
      'Educational estimate, not a fatwa. Verify with a qualified scholar.',
    ];
    Share.share({ message: lines.join('\n') }).catch(() => {});
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {/* Gauge */}
      <View style={styles.gaugeWrap}>
        <ZakatNisabGauge
          ratio={ratio}
          meetsNisab={c.meetsNisab}
          centerTop={c.meetsNisab ? 'Zakat due' : 'Below niṣāb'}
          centerMain={c.meetsNisab ? formatMoney(c.zakatDue, c.currency) : formatMoney(0, c.currency)}
          centerSub={
            c.meetsNisab
              ? `${(c.rate * 100).toFixed(c.rate === 0.025 ? 1 : 4)}% of ${formatMoney(c.netZakatable, c.currency)}`
              : `${formatMoney(c.shortfallToNisab, c.currency)} to reach niṣāb`
          }
        />
      </View>

      {/* Breakdown */}
      <View style={styles.card}>
        {c.assetLines.length > 0 ? (
          <>
            <Text style={styles.cardLabel}>Zakatable assets</Text>
            {c.assetLines.map((l) => (
              <Row key={l.key} label={l.label} value={formatMoney(l.amount, c.currency)} />
            ))}
            <Row label="Total assets" value={formatMoney(c.grossAssets, c.currency)} strong />
          </>
        ) : (
          <Text style={styles.empty}>Enter your assets to see the breakdown.</Text>
        )}

        {c.liabilityLines.length > 0 ? (
          <>
            <View style={styles.divider} />
            <Text style={styles.cardLabel}>Deductions</Text>
            {c.liabilityLines.map((l) => (
              <Row key={l.key} label={l.label} value={`− ${formatMoney(l.amount, c.currency)}`} />
            ))}
          </>
        ) : null}

        <View style={styles.divider} />
        <Row label="Net zakatable" value={formatMoney(c.netZakatable, c.currency)} strong />
        <Row label={`Niṣāb (${c.nisabStandard})`} value={formatMoney(c.nisab, c.currency)} />
        <View style={styles.divider} />
        <Row
          label={c.meetsNisab ? 'Zakat due' : 'No zakat due'}
          value={formatMoney(c.zakatDue, c.currency)}
          strong
          accent={c.meetsNisab}
        />
      </View>

      {/* Ḥawl */}
      <View style={styles.infoCard}>
        <CalendarClock size={18} color={colors.primary} strokeWidth={2.2} />
        <Text style={styles.infoText}>
          {hawl.started
            ? hawl.complete
              ? 'A full lunar year has passed over your wealth — your zakat is due now.'
              : `${hawl.daysRemaining} days remain in your zakat year. Pay once a lunar year completes over wealth above niṣāb.`
            : 'Set your zakat date in settings so the app can track when a lunar year completes.'}
        </Text>
      </View>

      {/* Giving (host-injected: the ṣadaqah & zakat log) */}
      {slot}

      {/* Recipients */}
      <View style={styles.sectionHead}>
        <Users size={16} color={colors.mutedForeground} strokeWidth={2.2} />
        <Text style={styles.sectionTitle}>Where your zakat can go</Text>
      </View>
      <Text style={styles.ayah}>{ASNAF_AYAH.text}</Text>
      <Text style={styles.ayahRef}>Qurʾān · {ASNAF_AYAH.reference}</Text>
      <View style={styles.asnafGrid}>
        {ASNAF.map((r) => (
          <View key={r.id} style={styles.asnaf}>
            <Text style={styles.asnafArabic}>{r.arabic}</Text>
            <Text style={styles.asnafName}>{r.name}</Text>
            <Text style={styles.asnafDesc}>{r.description}</Text>
          </View>
        ))}
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Info size={14} color={colors.subtleForeground} strokeWidth={2.2} />
        <Text style={styles.disclaimerText}>{ZAKAT_DISCLAIMER}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Text onPress={onEdit} style={styles.editBtn} accessibilityRole="button">
          <PencilLine size={16} color={colors.foreground} strokeWidth={2.2} />{'  '}Edit worksheet
        </Text>
        <Text onPress={share} style={styles.shareBtn} accessibilityRole="button">
          <Share2 size={16} color={colors.primaryForeground} strokeWidth={2.5} />{'  '}Share summary
        </Text>
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] },
  gaugeWrap: { alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.lg },

  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  cardLabel: {
    ...typography.label,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.subtleForeground,
    marginBottom: spacing.sm,
  },
  empty: { ...typography.body, color: colors.mutedForeground, textAlign: 'center', paddingVertical: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
  rowLabel: { ...typography.body, fontSize: 14, color: colors.mutedForeground, flex: 1 },
  rowLabelStrong: { color: colors.foreground, fontWeight: '600' },
  rowValue: { ...typography.body, fontSize: 14, color: colors.foreground, fontVariant: ['tabular-nums'] },
  rowValueStrong: { ...typography.button, fontSize: 16, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.primary}33`,
    backgroundColor: `${colors.primary}0D`,
  },
  infoText: { ...typography.caption, color: colors.foreground, flex: 1, lineHeight: 19 },

  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl },
  sectionTitle: { ...typography.title, fontSize: 17, color: colors.foreground },
  ayah: { ...typography.body, fontSize: 14, color: colors.mutedForeground, lineHeight: 22, marginTop: spacing.md },
  ayahRef: { ...typography.caption, fontSize: 12, color: colors.primary, marginTop: spacing.xs },

  asnafGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.lg },
  asnaf: {
    width: '47%',
    flexGrow: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  asnafArabic: { fontFamily: arabicFont, fontSize: 18, color: colors.foreground },
  asnafName: { ...typography.body, fontSize: 14, fontWeight: '600', color: colors.foreground, marginTop: 4 },
  asnafDesc: { ...typography.caption, fontSize: 11, color: colors.subtleForeground, lineHeight: 16, marginTop: 2 },

  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
  },
  disclaimerText: { ...typography.caption, fontSize: 12, color: colors.subtleForeground, flex: 1, lineHeight: 18 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xl },
  editBtn: {
    flex: 1,
    ...typography.button,
    color: colors.foreground,
    textAlign: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  shareBtn: {
    flex: 1,
    ...typography.button,
    fontWeight: '700',
    color: colors.primaryForeground,
    textAlign: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
});
