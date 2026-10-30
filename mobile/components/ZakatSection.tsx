/**
 * ZakatSection — one asset/liability group rendered as a card of labelled
 * number fields. Both the worksheet (all sections stacked) and the wizard
 * (one section at a time) render from this, so the inputs always behave and
 * look identical. Gold/silver fields show a live converted value; an evidence
 * toggle reveals the daleel behind the group.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  Wallet,
  Gem,
  TrendingUp,
  Briefcase,
  HandCoins,
  Receipt,
  BookOpen,
  type LucideIcon,
} from 'lucide-react-native';
import { KARAT_PURITY, type ZakatField, type ZakatGroup, type ZakatValues } from '../content/zakat/zakat';
import { formatMoney } from '../lib/zakat';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const ICONS: Record<ZakatGroup['icon'], LucideIcon> = {
  wallet: Wallet,
  gem: Gem,
  'trending-up': TrendingUp,
  briefcase: Briefcase,
  'hand-coins': HandCoins,
  receipt: Receipt,
};

function fieldToCurrency(
  field: ZakatField,
  amount: number,
  goldPerGram: number,
  silverPerGram: number,
): number {
  if (field.kind !== 'grams') return amount;
  if (field.karat) return amount * (KARAT_PURITY[field.karat] ?? 1) * goldPerGram;
  return amount * silverPerGram; // silver grams
}

function NumberField({
  field,
  value,
  currency,
  converted,
  onChange,
}: {
  field: ZakatField;
  value: number;
  currency: string;
  converted: number | null;
  onChange: (n: number) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [text, setText] = useState(value ? String(value) : '');
  const [focused, setFocused] = useState(false);

  const commit = (t: string) => {
    setText(t);
    const n = parseFloat(t.replace(/[^0-9.]/g, ''));
    onChange(isFinite(n) ? n : 0);
  };

  return (
    <View style={styles.field}>
      <View style={styles.fieldText}>
        <Text style={styles.fieldLabel}>{field.label}</Text>
        {field.hint ? <Text style={styles.fieldHint}>{field.hint}</Text> : null}
        {converted != null && value > 0 ? (
          <Text style={styles.converted}>≈ {formatMoney(converted, currency)}</Text>
        ) : null}
      </View>
      <View style={[styles.inputBox, focused && styles.inputBoxFocused]}>
        <Text style={styles.unit}>{field.kind === 'grams' ? 'g' : currency}</Text>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={commit}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="decimal-pad"
          inputMode="decimal"
          placeholder="0"
          placeholderTextColor={colors.subtleForeground}
          selectionColor={colors.primary}
          maxLength={13}
        />
      </View>
    </View>
  );
}

export default function ZakatSection({
  group,
  values,
  currency,
  goldPerGram,
  silverPerGram,
  onChange,
  defaultEvidenceOpen = false,
}: {
  group: ZakatGroup;
  values: ZakatValues;
  currency: string;
  goldPerGram: number;
  silverPerGram: number;
  onChange: (key: ZakatField['key'], value: number) => void;
  defaultEvidenceOpen?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [showEvidence, setShowEvidence] = useState(defaultEvidenceOpen);
  const Icon = ICONS[group.icon];
  const isLiability = group.kind === 'liability';

  return (
    <View style={[styles.card, isLiability && styles.cardLiability]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, isLiability && styles.iconWrapLiability]}>
          <Icon size={18} color={isLiability ? colors.destructive : colors.primary} strokeWidth={2} />
        </View>
        <View style={styles.headText}>
          <Text style={styles.title}>{group.title}</Text>
          <Text style={styles.subtitle}>{group.subtitle}</Text>
        </View>
      </View>

      <View style={styles.fields}>
        {group.fields.map((f) => (
          <NumberField
            key={f.key}
            field={f}
            value={values[f.key]}
            currency={currency}
            converted={f.kind === 'grams' ? fieldToCurrency(f, values[f.key], goldPerGram, silverPerGram) : null}
            onChange={(n) => onChange(f.key, n)}
          />
        ))}
      </View>

      {group.tip ? <Text style={styles.tip}>{group.tip}</Text> : null}

      {group.daleel && group.daleel.length > 0 ? (
        <>
          <Pressable style={styles.evidenceToggle} onPress={() => setShowEvidence((v) => !v)}>
            <BookOpen size={14} color={colors.primary} strokeWidth={2.2} />
            <Text style={styles.evidenceToggleText}>{showEvidence ? 'Hide evidence' : 'Show evidence'}</Text>
          </Pressable>
          {showEvidence ? (
            <View style={styles.evidenceBox}>
              {group.daleel.map((d, idx) => (
                <View key={idx} style={idx > 0 ? styles.daleelDivider : undefined}>
                  <Text style={styles.daleelText}>{d.text}</Text>
                  <Text style={styles.daleelRef}>
                    {d.source === 'quran' ? 'Qurʾān · ' : ''}
                    {d.reference}
                    {d.narrator ? `  ·  ${d.narrator}` : ''}
                    {d.grade ? `  ·  ${d.grade}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
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
  },
  cardLiability: { borderColor: `${colors.destructive}40` },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapLiability: { backgroundColor: `${colors.destructive}1A` },
  headText: { flex: 1 },
  title: { ...typography.title, fontSize: 17, color: colors.foreground },
  subtitle: { ...typography.caption, fontSize: 12, color: colors.mutedForeground, marginTop: 1 },

  fields: { gap: spacing.md },
  field: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  fieldText: { flex: 1 },
  fieldLabel: { ...typography.body, fontSize: 14, color: colors.foreground },
  fieldHint: { ...typography.caption, fontSize: 11, color: colors.subtleForeground, marginTop: 1 },
  converted: { ...typography.caption, fontSize: 11, color: colors.primary, marginTop: 2, fontVariant: ['tabular-nums'] },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 124,
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.input,
    paddingHorizontal: spacing.sm,
  },
  inputBoxFocused: { borderColor: colors.ring, backgroundColor: colors.cardElevated },
  unit: { ...typography.caption, fontSize: 12, color: colors.subtleForeground },
  input: {
    flex: 1,
    height: '100%',
    color: colors.foreground,
    ...typography.body,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },

  tip: {
    ...typography.caption,
    fontSize: 12,
    color: colors.subtleForeground,
    lineHeight: 18,
    marginTop: spacing.md,
  },
  evidenceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  evidenceToggleText: { ...typography.label, color: colors.primary, fontWeight: '600' },
  evidenceBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  daleelDivider: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  daleelText: { ...typography.body, fontSize: 14, color: colors.foreground, lineHeight: 21 },
  daleelRef: { ...typography.caption, fontSize: 12, color: colors.primary, marginTop: 6 },
});
