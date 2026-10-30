/**
 * AISettingsSheet — configure ADL AI (F19): pick a provider and model, store the
 * API key securely (with a live "test key"), toggle corpus grounding, and set
 * the response temperature. The stored key is never displayed back.
 */
import { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Check, KeyRound, X } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { PROVIDERS } from '../../lib/ai/providers';
import { streamChat } from '../../lib/ai/stream';
import { AI_DISCLAIMER } from '../../content/ai/systemPrompt';
import type { UseAISettings } from '../../hooks/useAISettings';

const TEMPS: { label: string; value: number }[] = [
  { label: 'Precise', value: 0.2 },
  { label: 'Balanced', value: 0.4 },
  { label: 'Creative', value: 0.8 },
];

export default function AISettingsSheet({
  visible,
  onClose,
  settings,
}: {
  visible: boolean;
  onClose: () => void;
  settings: UseAISettings;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [draftKey, setDraftKey] = useState('');
  const [test, setTest] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');

  const saveKey = async () => {
    if (!draftKey.trim()) return;
    await settings.saveKey(draftKey.trim());
    setDraftKey('');
    setTest('idle');
  };

  const testKey = async () => {
    const key = draftKey.trim() || (await settings.readKey());
    if (!key) return;
    setTest('testing');
    const controller = new AbortController();
    let ok = false;
    await streamChat(
      {
        providerId: settings.providerId,
        model: settings.model,
        key,
        messages: [{ role: 'user', content: 'Reply with the single word: OK' }],
        temperature: 0,
        signal: controller.signal,
      },
      {
        onDelta: () => {
          if (!ok) { ok = true; setTest('ok'); controller.abort(); }
        },
        onDone: () => setTest((s) => (s === 'testing' ? 'ok' : s)),
        onError: () => setTest('fail'),
      },
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>AI settings</Text>
            <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
              <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Provider */}
            <Text style={styles.label}>Provider</Text>
            <View style={styles.chips}>
              {PROVIDERS.map((p) => {
                const active = p.id === settings.providerId;
                return (
                  <Pressable key={p.id} onPress={() => settings.setProviderId(p.id)} style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{p.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* API key */}
            <Text style={styles.label}>API key</Text>
            {settings.keyPresent ? (
              <View style={styles.savedRow}>
                <Check size={14} color={colors.success} strokeWidth={2.6} />
                <Text style={styles.savedText}>A key is saved for {settings.provider.label}.</Text>
                <Pressable onPress={() => settings.saveKey('')} hitSlop={8}>
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            ) : null}
            <View style={styles.keyRow}>
              <KeyRound size={16} color={colors.subtleForeground} strokeWidth={2} />
              <TextInput
                style={styles.keyInput}
                value={draftKey}
                onChangeText={setDraftKey}
                placeholder={settings.provider.keyHint}
                placeholderTextColor={colors.subtleForeground}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={styles.keyActions}>
              <Pressable onPress={saveKey} disabled={!draftKey.trim()} style={[styles.saveBtn, !draftKey.trim() && styles.disabled]}>
                <Text style={styles.saveText}>Save key</Text>
              </Pressable>
              <Pressable onPress={testKey} style={styles.testBtn}>
                <Text style={styles.testText}>
                  {test === 'testing' ? 'Testing…' : test === 'ok' ? '✓ Working' : test === 'fail' ? '✗ Failed' : 'Test key'}
                </Text>
              </Pressable>
            </View>
            <Pressable onPress={() => Linking.openURL(settings.provider.keyUrl)}>
              <Text style={styles.getKey}>Get a {settings.provider.label} key →</Text>
            </Pressable>

            {/* Model */}
            <Text style={styles.label}>Model</Text>
            <View style={styles.chips}>
              {settings.provider.models.map((m) => {
                const active = m.id === settings.model;
                return (
                  <Pressable key={m.id} onPress={() => settings.setModel(m.id)} style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{m.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Temperature */}
            <Text style={styles.label}>Response style</Text>
            <View style={styles.chips}>
              {TEMPS.map((t) => {
                const active = Math.abs(settings.temperature - t.value) < 0.05;
                return (
                  <Pressable key={t.label} onPress={() => settings.setTemperature(t.value)} style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Grounding */}
            <View style={styles.switchRow}>
              <View style={styles.switchText}>
                <Text style={styles.switchTitle}>Ground in the app’s sources</Text>
                <Text style={styles.switchSub}>Answers draw on the Qurʾān, hadith & lessons, with citations.</Text>
              </View>
              <Switch
                value={settings.grounding}
                onValueChange={settings.setGrounding}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.border}
              />
            </View>

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>{AI_DISCLAIMER}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: { maxHeight: '90%', backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
    title: { ...typography.title, fontSize: 18, color: colors.foreground },
    close: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    content: { paddingBottom: spacing.lg, gap: spacing.sm },
    label: { ...typography.button, fontSize: 12, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: spacing.md },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    chip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    chipActive: { borderColor: colors.primary, backgroundColor: colors.cardElevated },
    chipText: { ...typography.label, color: colors.mutedForeground },
    chipTextActive: { color: colors.foreground },
    savedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    savedText: { flex: 1, fontFamily, fontSize: 13, color: colors.mutedForeground },
    removeText: { ...typography.caption, fontSize: 12, fontWeight: '700', color: colors.destructive },
    keyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, height: 46, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.input },
    keyInput: { flex: 1, fontFamily, fontSize: typography.body.fontSize, color: colors.foreground, paddingVertical: 0 },
    keyActions: { flexDirection: 'row', gap: spacing.sm },
    saveBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary },
    disabled: { opacity: 0.4 },
    saveText: { ...typography.button, fontSize: 14, color: colors.primaryForeground },
    testBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    testText: { ...typography.button, fontSize: 14, color: colors.foreground },
    getKey: { ...typography.caption, fontSize: 12, fontWeight: '600', color: colors.primary, marginTop: 2 },
    switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, marginTop: spacing.md },
    switchText: { flex: 1, gap: 2 },
    switchTitle: { ...typography.button, fontSize: 14, color: colors.foreground },
    switchSub: { fontFamily, fontSize: 12, lineHeight: 17, color: colors.subtleForeground },
    disclaimer: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.cardElevated, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md },
    disclaimerText: { fontFamily, fontSize: 12, lineHeight: 18, color: colors.subtleForeground },
  });
