/**
 * ScanResult — the product and what was found in it.
 *
 * The clean state is deliberately neutral rather than green: "no flagged
 * ingredients" is not a halal certification, and colour must not imply one.
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { Ban, ChevronRight, CircleAlert, Info, TriangleAlert, WifiOff } from 'lucide-react-native';
import AppText from '../ui/AppText';
import type { Assessment, Flag } from '../../lib/halal/assess';
import type { Product } from '../../lib/halal/openFoodFacts';
import {
  HALAL_DISCLAIMER,
  NO_FLAGS_BODY,
  NO_FLAGS_HEADLINE,
  OFF_ATTRIBUTION,
  STATUS_LABEL,
} from '../../content/halal';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

export default function ScanResult({
  product,
  assessment,
  fromCache,
  onOpenFlag,
}: {
  product: Product;
  assessment: Assessment;
  fromCache: boolean;
  onOpenFlag: (flag: Flag) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { verdict, flags, tokens } = assessment;

  const tone =
    verdict === 'prohibited' ? colors.destructive : verdict === 'check' ? colors.primary : colors.mutedForeground;

  const headline =
    verdict === 'prohibited'
      ? 'Contains a prohibited ingredient'
      : verdict === 'check'
        ? `${flags.filter((f) => f.level === 'check').length} ingredient${flags.filter((f) => f.level === 'check').length === 1 ? '' : 's'} to check`
        : NO_FLAGS_HEADLINE;

  return (
    <View style={styles.wrap}>
      <View style={styles.product}>
        <AppText style={styles.name}>{product.name}</AppText>
        {product.brand ? <AppText style={styles.brand}>{product.brand}</AppText> : null}
        <AppText style={styles.barcode}>{product.barcode}</AppText>
      </View>

      {fromCache ? (
        <View style={styles.cacheRow}>
          <WifiOff size={13} color={colors.subtleForeground} strokeWidth={2.25} />
          <AppText style={styles.cacheText}>
            Saved result — recipes change, so re-check when you have signal.
          </AppText>
        </View>
      ) : null}

      <View style={[styles.verdict, { borderColor: `${tone}55`, backgroundColor: `${tone}12` }]}>
        {verdict === 'prohibited' ? (
          <Ban size={20} color={tone} strokeWidth={2.25} />
        ) : verdict === 'check' ? (
          <TriangleAlert size={20} color={tone} strokeWidth={2.25} />
        ) : (
          <Info size={20} color={tone} strokeWidth={2.25} />
        )}
        <View style={styles.verdictText}>
          <AppText style={[styles.verdictTitle, { color: tone }]}>{headline}</AppText>
          {verdict === 'none' ? <AppText style={styles.verdictBody}>{NO_FLAGS_BODY}</AppText> : null}
        </View>
      </View>

      {assessment.hasAnimal ? (
        <View style={styles.slaughter}>
          <CircleAlert size={14} color={colors.primary} strokeWidth={2.25} />
          <AppText style={styles.slaughterText}>
            This contains an animal ingredient. No ingredients list can tell you how the animal was
            slaughtered — that comes from the certification on the packet.
          </AppText>
        </View>
      ) : null}

      {flags.length > 0 ? (
        <View style={styles.flags}>
          {flags.map((flag) => {
            const flagTone =
              flag.level === 'prohibited'
                ? colors.destructive
                : flag.level === 'check'
                  ? colors.primary
                  : colors.subtleForeground;
            return (
              <Pressable
                key={flag.additive.code}
                onPress={() => onOpenFlag(flag)}
                style={styles.flagRow}
                accessibilityRole="button"
                accessibilityLabel={`${flag.additive.name}, ${STATUS_LABEL[flag.additive.status]}`}
              >
                <View style={[styles.dot, { backgroundColor: flagTone }]} />
                <View style={styles.flagText}>
                  <AppText style={styles.flagName}>{flag.additive.name}</AppText>
                  <AppText style={styles.flagMeta}>
                    {STATUS_LABEL[flag.additive.status]}
                    {flag.level === 'note' && flag.relaxedBy?.length
                      ? ' · eased by your settings'
                      : ''}
                  </AppText>
                  <AppText style={styles.flagFound} numberOfLines={1}>
                    found as “{flag.matched}”
                  </AppText>
                </View>
                <ChevronRight size={16} color={colors.subtleForeground} strokeWidth={2.25} />
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={styles.listCard}>
        <AppText style={styles.listHead}>
          {tokens.length} ingredient{tokens.length === 1 ? '' : 's'} read
        </AppText>
        <AppText style={styles.listBody}>{tokens.map((t) => t.text).join(' · ')}</AppText>
      </View>

      <AppText style={styles.disclaimer}>{HALAL_DISCLAIMER}</AppText>
      <AppText style={styles.attribution}>{OFF_ATTRIBUTION}</AppText>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { gap: spacing.md },
    product: { gap: 2 },
    name: { ...typography.title, fontSize: 18, color: colors.foreground },
    brand: { fontFamily, fontSize: 13, color: colors.mutedForeground },
    barcode: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },
    cacheRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
    cacheText: { flex: 1, ...typography.caption, fontSize: 11, color: colors.subtleForeground },
    verdict: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'flex-start',
      borderWidth: 1,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    verdictText: { flex: 1, gap: 3 },
    verdictTitle: { ...typography.title, fontSize: 16 },
    verdictBody: { fontFamily, fontSize: 13, lineHeight: 20, color: colors.mutedForeground },
    slaughter: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignItems: 'flex-start',
      borderRadius: radius.md,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      backgroundColor: colors.card,
      padding: spacing.md,
    },
    slaughterText: { flex: 1, fontFamily, fontSize: 12, lineHeight: 19, color: colors.mutedForeground },
    flags: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: spacing.md,
    },
    flagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      minHeight: 56,
    },
    dot: { width: 8, height: 8, borderRadius: 4 },
    flagText: { flex: 1, gap: 1 },
    flagName: { fontFamily, fontSize: 14, fontWeight: '600', color: colors.foreground },
    flagMeta: { ...typography.caption, fontSize: 11, color: colors.primary },
    flagFound: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },
    listCard: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.md,
      gap: spacing.xs,
    },
    listHead: {
      ...typography.caption,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.subtleForeground,
    },
    listBody: { fontFamily, fontSize: 12, lineHeight: 19, color: colors.mutedForeground },
    disclaimer: { fontFamily, fontSize: 12, lineHeight: 19, color: colors.subtleForeground },
    attribution: { ...typography.caption, fontSize: 10, color: colors.subtleForeground },
  });
