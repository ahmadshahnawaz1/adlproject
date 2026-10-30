/**
 * components/settings/dialogs — cross-platform modal dialogs for the settings
 * screen: edit a single field, change password, and confirm a destructive
 * action. Themed; work identically on iOS and Android.
 */
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Text from '../ui/AppText';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';

type SubmitResult = Promise<string | null> | string | null;

export function EditFieldDialog({ visible, title, initialValue, placeholder, secure, keyboardType, autoCapitalize, multiline, onSubmit, onClose }: {
  visible: boolean;
  title: string;
  initialValue: string;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  multiline?: boolean;
  onSubmit: (value: string) => SubmitResult;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) { setValue(initialValue); setError(null); setBusy(false); }
  }, [visible, initialValue]);

  const submit = async () => {
    setBusy(true);
    const res = await onSubmit(value);
    setBusy(false);
    if (res) { setError(res); return; }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={[styles.input, multiline && styles.inputMultiline]}
            value={value}
            onChangeText={(t) => { setValue(t); setError(null); }}
            placeholder={placeholder}
            placeholderTextColor={colors.subtleForeground}
            secureTextEntry={secure}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            multiline={multiline}
            autoFocus
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.ghost]} onPress={onClose}><Text style={styles.ghostText}>Cancel</Text></Pressable>
            <Pressable style={[styles.btn, styles.primary, busy && styles.busy]} onPress={submit} disabled={busy}>
              <Text style={styles.primaryText}>{busy ? 'Saving…' : 'Save'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function ChangePasswordDialog({ visible, onSubmit, onClose }: {
  visible: boolean;
  onSubmit: (current: string, next: string) => Promise<string | null>;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) { setCurrent(''); setNext(''); setConfirm(''); setError(null); setBusy(false); }
  }, [visible]);

  const submit = async () => {
    if (next.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (next !== confirm) { setError('New passwords do not match.'); return; }
    setBusy(true);
    const res = await onSubmit(current, next);
    setBusy(false);
    if (res) { setError(res); return; }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.dialog}>
          <Text style={styles.title}>Change password</Text>
          <TextInput style={styles.input} value={current} onChangeText={(t) => { setCurrent(t); setError(null); }} placeholder="Current password" placeholderTextColor={colors.subtleForeground} secureTextEntry autoFocus />
          <TextInput style={styles.input} value={next} onChangeText={(t) => { setNext(t); setError(null); }} placeholder="New password" placeholderTextColor={colors.subtleForeground} secureTextEntry />
          <TextInput style={styles.input} value={confirm} onChangeText={(t) => { setConfirm(t); setError(null); }} placeholder="Confirm new password" placeholderTextColor={colors.subtleForeground} secureTextEntry />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.ghost]} onPress={onClose}><Text style={styles.ghostText}>Cancel</Text></Pressable>
            <Pressable style={[styles.btn, styles.primary, busy && styles.busy]} onPress={submit} disabled={busy}>
              <Text style={styles.primaryText}>{busy ? 'Updating…' : 'Update'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function ConfirmDialog({ visible, title, message, confirmLabel = 'Confirm', danger, onConfirm, onClose }: {
  visible: boolean; title: string; message: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void; onClose: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.ghost]} onPress={onClose}><Text style={styles.ghostText}>Cancel</Text></Pressable>
            <Pressable style={[styles.btn, danger ? styles.danger : styles.primary]} onPress={() => { onConfirm(); onClose(); }}>
              <Text style={danger ? styles.dangerText : styles.primaryText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
    dialog: { width: '100%', maxWidth: 380, backgroundColor: colors.background, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
    title: { ...typography.title, fontSize: 17, color: colors.foreground },
    message: { fontFamily, fontSize: 14, lineHeight: 20, color: colors.mutedForeground },
    input: { fontFamily, fontSize: 15, color: colors.foreground, backgroundColor: colors.input, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, height: 46 },
    inputMultiline: { height: 96, paddingTop: spacing.sm, textAlignVertical: 'top' },
    error: { fontFamily, fontSize: 13, color: colors.destructive },
    row: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end', marginTop: spacing.xs },
    btn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.md, minWidth: 96, justifyContent: 'center' },
    ghost: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    ghostText: { ...typography.button, color: colors.foreground },
    primary: { backgroundColor: colors.primary },
    primaryText: { ...typography.button, color: colors.primaryForeground },
    busy: { opacity: 0.7 },
    danger: { backgroundColor: colors.destructive },
    dangerText: { ...typography.button, color: colors.white },
  });
