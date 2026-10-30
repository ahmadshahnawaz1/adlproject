/**
 * SadaqahEntrySheet — record (or amend) a single gift. Enter an amount, pick the
 * kind of charity, optionally tag one of the eight Qurʾānic recipient classes,
 * and add a note. A calm bottom sheet; all persistence happens through the
 * callbacks. Offline.
 */
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Check, Trash2, X } from 'lucide-react-native';

import type { Recipient } from '../../content/zakat/recipients';
import {
  CHARITY_CATEGORIES,
  DEFAULT_CHARITY_CATEGORY,
  type CharityCategory,
  type CharityEntry,
  type CharityInput,
} from '../../lib/charity';
import { colors, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { CATEGORY_ICONS } from './categoryIcons';

export default function SadaqahEntrySheet({
  visible,
  onClose,
  currency,
  recipients,
  initial,
  onSubmit,
  onDelete,
}: {
  visible: boolean;
  onClose: () => void;
  currency: string;
  recipients: Recipient[];
  /** When set, the sheet edits this gift; otherwise it records a new one. */
  initial?: CharityEntry | null;
  onSubmit: (input: CharityInput) => void;
  onDelete?: (id: string) => void;
}) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CharityCategory>(DEFAULT_CHARITY_CATEGORY);
  const [recipientId, setRecipientId] = useState<string | undefined>(undefined);
  const [note, setNote] = useState('');

  // Prefill (or reset) whenever the sheet opens or the edited gift changes.
  useEffect(() => {
    if (!visible) return;
    if (initial) {
      setAmount(String(initial.amount));
      setCategory(initial.category);
      setRecipientId(initial.recipientId);
      setNote(initial.note ?? '');
    } else {
      setAmount('');
      setCategory(DEFAULT_CHARITY_CATEGORY);
      setRecipientId(undefined);
      setNote('');
    }
  }, [visible, initial]);

  const parsed = Number.parseFloat(amount.replace(/,/g, ''));
  const valid = Number.isFinite(parsed) && parsed > 0;
  const editing = Boolean(initial);

  const submit = () => {
    if (!valid) return;
    onSubmit({
      amount: parsed,
      currency,
      category,
      recipientId,
      note,
      ...(initial ? { ts: initial.ts } : {}),
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <Text style={styles.title}>{editing ? 'Edit gift' : 'Log a gift'}</Text>
            <Pressable onPress={onClose} style={styles.close} hitSlop={8}>
              <X size={16} color={colors.foreground} strokeWidth={2} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <Text style={styles.section}>AMOUNT</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currency}>{currency}</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.subtleForeground}
                style={styles.amountInput}
                autoFocus={!editing}
                accessibilityLabel="Gift amount"
              />
            </View>

            <Text style={styles.section}>KIND OF CHARITY</Text>
            <View style={styles.chips}>
              {CHARITY_CATEGORIES.map((c) => {
                const selected = category === c.id;
                const Icon = CATEGORY_ICONS[c.id];
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCategory(c.id)}
                    style={({ pressed }) => [
                      styles.chip,
                      selected && styles.chipOn,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Icon
                      size={13}
                      color={selected ? colors.primaryForeground : colors.mutedForeground}
                      strokeWidth={2.3}
                    />
                    <Text style={[styles.chipText, selected && styles.chipTextOn]}>{c.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.section}>RECIPIENT (OPTIONAL)</Text>
            <View style={styles.chips}>
              <Pressable
                onPress={() => setRecipientId(undefined)}
                style={({ pressed }) => [
                  styles.chip,
                  !recipientId && styles.chipOn,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.chipText, !recipientId && styles.chipTextOn]}>Not specified</Text>
              </Pressable>
              {recipients.map((r) => {
                const selected = recipientId === r.id;
                return (
                  <Pressable
                    key={r.id}
                    onPress={() => setRecipientId(selected ? undefined : r.id)}
                    style={({ pressed }) => [
                      styles.chip,
                      selected && styles.chipOn,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextOn]}>{r.name}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.section}>NOTE (OPTIONAL)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Local masjid · orphan sponsorship"
              placeholderTextColor={colors.subtleForeground}
              style={styles.noteInput}
              multiline
              accessibilityLabel="Gift note"
            />

            <Pressable
              onPress={submit}
              disabled={!valid}
              style={({ pressed }) => [
                styles.saveBtn,
                !valid && styles.saveDisabled,
                pressed && valid && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={editing ? 'Save changes' : 'Save gift'}
            >
              <Check size={16} color={colors.primaryForeground} strokeWidth={2.6} />
              <Text style={styles.saveText}>{editing ? 'Save changes' : 'Save gift'}</Text>
            </Pressable>

            {editing && onDelete ? (
              <Pressable
                onPress={() => {
                  if (initial) onDelete(initial.id);
                  onClose();
                }}
                style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Delete gift"
              >
                <Trash2 size={15} color={colors.destructive} strokeWidth={2.2} />
                <Text style={styles.deleteText}>Delete this gift</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    maxHeight: '85%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: { ...typography.title, fontFamily, color: colors.foreground },
  close: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardElevated,
  },
  scroll: { paddingTop: spacing.sm, paddingBottom: spacing.lg },
  section: {
    fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.subtleForeground,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
  },
  currency: { ...typography.button, color: colors.mutedForeground },
  amountInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 24,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily,
    fontVariant: ['tabular-nums'],
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipText: { ...typography.label, fontFamily, color: colors.mutedForeground },
  chipTextOn: { color: colors.primaryForeground, fontWeight: '700' },
  noteInput: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    color: colors.foreground,
    fontFamily,
    ...typography.body,
    textAlignVertical: 'top',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    marginTop: spacing.xl,
  },
  saveDisabled: { backgroundColor: colors.cardElevated },
  saveText: { ...typography.button, color: colors.primaryForeground },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  deleteText: { ...typography.button, color: colors.destructive },
  pressed: { opacity: 0.7 },
});
