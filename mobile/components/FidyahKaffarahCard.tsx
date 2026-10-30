/**
 * FidyahKaffarahCard — the two expiations, calculated. Fidyah feeds a needy
 * person for each fast one is permanently unable to keep; kaffārah is the grave
 * expiation for deliberately breaking a fast without excuse (sixty consecutive
 * fasts, or feeding sixty). Each is shown with its evidence. Rates come from
 * settings; the figures are guidance, not a fatwa.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Minus, Plus, Utensils } from 'lucide-react-native';
import { DALEEL_FIDYAH, DALEEL_KAFFARAH } from '../content/fasting';
import { KAFFARAH, fidyahTotal, kaffarahFeedTotal } from '../lib/fastingLedger';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import DaleelBlock from './DaleelBlock';

function money(currency: string, n: number): string {
  return `${currency}${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

export default function FidyahKaffarahCard({
  perDay,
  currency,
}: {
  perDay: number;
  currency: string;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [days, setDays] = useState(0);
  const fidyah = fidyahTotal(days, perDay);
  const kaffarahFeed = kaffarahFeedTotal(perDay);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Utensils size={16} color={colors.primary} strokeWidth={2.2} />
        <Text style={styles.title}>Fidyah & Kaffārah</Text>
      </View>

      {/* Fidyah */}
      <Text style={styles.section}>Fidyah · feeding</Text>
      <Text style={styles.note}>
        For one unable to fast permanently (the elderly or chronically ill): feed a needy person for
        each day, at {money(currency, perDay)} per day.
      </Text>

      <View style={styles.stepper}>
        <Text style={styles.stepperLabel}>Days to pay for</Text>
        <View style={styles.controls}>
          <Pressable
            onPress={() => setDays((d) => Math.max(0, d - 1))}
            hitSlop={8}
            disabled={days === 0}
            style={({ pressed }) => [styles.ctrl, days === 0 && styles.ctrlDisabled, pressed && days > 0 && styles.ctrlPressed]}
            accessibilityRole="button"
            accessibilityLabel="One fewer day"
          >
            <Minus size={16} color={days === 0 ? colors.subtleForeground : colors.foreground} strokeWidth={2.6} />
          </Pressable>
          <View style={styles.countWrap}>
            <Text style={styles.count}>{days}</Text>
          </View>
          <Pressable
            onPress={() => setDays((d) => d + 1)}
            hitSlop={8}
            style={({ pressed }) => [styles.ctrl, pressed && styles.ctrlPressed]}
            accessibilityRole="button"
            accessibilityLabel="One more day"
          >
            <Plus size={16} color={colors.primary} strokeWidth={2.6} />
          </Pressable>
        </View>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>
          {days} × {money(currency, perDay)}
        </Text>
        <Text style={styles.totalValue}>{money(currency, fidyah)}</Text>
      </View>

      <View style={styles.daleel}>
        <DaleelBlock daleel={DALEEL_FIDYAH} />
      </View>

      {/* Kaffārah */}
      <View style={styles.divider} />
      <Text style={styles.section}>Kaffārah · expiation</Text>
      <Text style={styles.note}>
        For deliberately breaking a Ramadan fast without a valid excuse — one of, in order:
      </Text>
      <View style={styles.options}>
        <View style={styles.option}>
          <Text style={styles.optionNum}>1</Text>
          <Text style={styles.optionText}>Fast {KAFFARAH.consecutiveFasts} consecutive days</Text>
        </View>
        <View style={styles.option}>
          <Text style={styles.optionNum}>2</Text>
          <Text style={styles.optionText}>
            Feed {KAFFARAH.feedPeople} needy people · {money(currency, kaffarahFeed)}
          </Text>
        </View>
      </View>

      <View style={styles.daleel}>
        <DaleelBlock daleel={DALEEL_KAFFARAH} />
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
  title: { ...typography.button, color: colors.foreground },

  section: {
    ...typography.label,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  note: { ...typography.caption, fontSize: 13, color: colors.mutedForeground, lineHeight: 19, marginBottom: spacing.md },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
  },
  stepperLabel: { ...typography.body, fontSize: 15, fontWeight: '600', color: colors.foreground },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  ctrl: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlDisabled: { opacity: 0.4 },
  ctrlPressed: { backgroundColor: colors.border },
  countWrap: { minWidth: 30, alignItems: 'center' },
  count: { fontSize: 17, fontWeight: '800', color: colors.foreground, fontVariant: ['tabular-nums'] },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  totalLabel: { ...typography.caption, fontSize: 13, color: colors.mutedForeground, fontVariant: ['tabular-nums'] },
  totalValue: { ...typography.title, fontSize: 20, color: colors.primary, fontVariant: ['tabular-nums'] },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  options: { gap: spacing.sm, marginBottom: spacing.md },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  optionNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
    lineHeight: 21,
    fontSize: 12,
    fontWeight: '800',
    color: colors.mutedForeground,
  },
  optionText: { flex: 1, ...typography.body, fontSize: 14, color: colors.foreground },
  daleel: { marginTop: spacing.xs },
});
