/**
 * VoluntaryFastsCard — the recommended (nafl) fasts of the year, soonest first:
 * what each is, when it next falls, its virtue, and (on tap) its evidence. A
 * warning is shown when today is a day on which fasting is forbidden, and a
 * single switch arms the evening-before reminders.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { CalendarHeart, ChevronDown, ChevronUp, TriangleAlert } from 'lucide-react-native';
import type { VoluntarySuggestion } from '../lib/fasting';
import type { ForbiddenFast } from '../content/fasting';
import { arabicFont, colors, radius, spacing, typography } from '../theme/tokens';
import DaleelBlock from './DaleelBlock';

function whenLabel(daysAway: number, date: Date, timeZone: string): string {
  if (daysAway <= 0) return 'Today';
  if (daysAway === 1) return 'Tomorrow';
  const d = date.toLocaleDateString('en-US', { timeZone, weekday: 'short', day: 'numeric', month: 'short' });
  return `in ${daysAway} days · ${d}`;
}

export default function VoluntaryFastsCard({
  suggestions,
  timeZone,
  forbidden,
  remindVoluntary,
  onToggleRemind,
  showArabic = true,
}: {
  suggestions: VoluntarySuggestion[];
  timeZone: string;
  forbidden?: ForbiddenFast | null;
  remindVoluntary: boolean;
  onToggleRemind: (v: boolean) => void;
  showArabic?: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const top = suggestions.slice(0, 5);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headLeft}>
          <CalendarHeart size={16} color={colors.primary} strokeWidth={2.2} />
          <Text style={styles.title}>Voluntary fasts</Text>
        </View>
      </View>

      {forbidden ? (
        <View style={styles.warn}>
          <TriangleAlert size={15} color={colors.destructive} strokeWidth={2.3} />
          <Text style={styles.warnText}>
            Fasting is not allowed today — {forbidden.name}. {forbidden.reason}
          </Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {top.map((s) => {
          const open = openId === s.fast.id;
          return (
            <View key={s.fast.id} style={styles.item}>
              <Pressable
                onPress={() => setOpenId(open ? null : s.fast.id)}
                style={({ pressed }) => [styles.itemHead, pressed && styles.pressed]}
              >
                <View style={styles.itemText}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{s.fast.name}</Text>
                    {showArabic ? <Text style={styles.arabic}>{s.fast.arabic}</Text> : null}
                  </View>
                  <Text style={styles.summary}>{s.fast.summary}</Text>
                </View>
                <View style={styles.itemRight}>
                  <Text style={[styles.when, s.daysAway <= 1 && styles.whenSoon]}>
                    {whenLabel(s.daysAway, s.date, timeZone)}
                  </Text>
                  {open ? (
                    <ChevronUp size={14} color={colors.subtleForeground} strokeWidth={2.2} />
                  ) : (
                    <ChevronDown size={14} color={colors.subtleForeground} strokeWidth={2.2} />
                  )}
                </View>
              </Pressable>
              {open ? (
                <View style={styles.detail}>
                  <Text style={styles.virtue}>{s.fast.virtue}</Text>
                  <DaleelBlock daleel={s.fast.daleel} />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <Text style={styles.toggleLabel}>Remind me the night before</Text>
          <Text style={styles.toggleSub}>A nudge to set your intention and prepare suhūr</Text>
        </View>
        <Switch
          value={remindVoluntary}
          onValueChange={onToggleRemind}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.foreground}
        />
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
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.button, color: colors.foreground },

  warn: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: `${colors.destructive}14`,
    borderWidth: 1,
    borderColor: `${colors.destructive}40`,
    marginBottom: spacing.md,
  },
  warnText: { flex: 1, ...typography.caption, fontSize: 12, color: colors.foreground, lineHeight: 18 },

  list: { gap: spacing.sm },
  item: { borderRadius: radius.md, backgroundColor: colors.cardElevated, overflow: 'hidden' },
  itemHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  pressed: { opacity: 0.7 },
  itemText: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  name: { ...typography.body, fontSize: 15, fontWeight: '600', color: colors.foreground },
  arabic: { fontSize: 12, color: colors.mutedForeground, fontFamily: arabicFont },
  summary: { ...typography.caption, fontSize: 12, color: colors.subtleForeground, marginTop: 2, lineHeight: 17 },
  itemRight: { alignItems: 'flex-end', gap: 2 },
  when: { ...typography.caption, fontSize: 11, color: colors.mutedForeground, textAlign: 'right' },
  whenSoon: { color: colors.primary, fontWeight: '700' },
  detail: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  virtue: { ...typography.caption, fontSize: 13, color: colors.mutedForeground, lineHeight: 19 },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toggleText: { flex: 1 },
  toggleLabel: { ...typography.body, fontSize: 14, fontWeight: '600', color: colors.foreground },
  toggleSub: { ...typography.caption, fontSize: 12, color: colors.subtleForeground, marginTop: 1 },
});
