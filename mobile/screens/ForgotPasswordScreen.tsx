/**
 * ForgotPasswordScreen — recovery using the code issued at sign-up.
 *
 * Adl keeps accounts on the device, so there is no server to email a reset
 * link. The recovery code is the only way back in, and this screen says so
 * plainly rather than pretending a message is on its way.
 */
import React, { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { KeyRound, Mail, ShieldCheck, TriangleAlert } from 'lucide-react-native';
import BrandMark from '../components/BrandMark';
import Button from '../components/ui/Button';
import BackButton from '../components/ui/BackButton';
import Input from '../components/ui/Input';
import RecoveryCodeCard from '../components/auth/RecoveryCodeCard';
import { isValidEmail } from '../lib/validation';
import { isWellFormedRecoveryCode } from '../lib/auth/recovery';
import { resetPasswordWithCode } from '../lib/auth/store';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function ForgotPasswordScreen({ onBack }: { onBack?: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCode, setNewCode] = useState<string | null>(null);
  const submitting = useRef(false);

  const emailError = useMemo(
    () => (touched && email && !isValidEmail(email) ? 'Enter a valid email address' : undefined),
    [email, touched],
  );

  const codeError = useMemo(
    () =>
      touched && code && !isWellFormedRecoveryCode(code)
        ? 'That does not look like a recovery code'
        : undefined,
    [code, touched],
  );

  const canSubmit =
    isValidEmail(email) && isWellFormedRecoveryCode(code) && password.length >= 8 && !loading;

  const submit = async () => {
    setTouched(true);
    if (!canSubmit || submitting.current) return;
    submitting.current = true;
    setError(null);
    setLoading(true);
    try {
      const result = await resetPasswordWithCode(email, code, password);
      if (result.ok) {
        setCode('');
        setPassword('');
        setNewCode(result.recoveryCode);
      } else {
        setError(result.error);
      }
    } catch {
      setError('Could not save the new password securely. Please try again.');
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <BackButton onPress={loading ? undefined : onBack} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <BrandMark size={40} layout="stack" />
        </View>

        {newCode ? (
          <>
            <View style={styles.header}>
              <View style={styles.doneIcon}>
                <ShieldCheck size={26} color={colors.primary} strokeWidth={1.75} />
              </View>
              <Text style={styles.title}>Password changed</Text>
              <Text style={styles.subtitle}>
                Your old recovery code has been used up. Here is the new one — save it now.
              </Text>
            </View>
            <RecoveryCodeCard code={newCode} />
            <Button label="Back to sign in" onPress={onBack} style={styles.submit} />
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Reset your password</Text>
              <Text style={styles.subtitle}>
                Adl keeps your account on this device, so there is no reset email to send. Enter the
                recovery code you saved when you signed up.
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                onBlur={() => setTouched(true)}
                keyboardType="email-address"
                textContentType="emailAddress"
                error={emailError}
                icon={<Mail size={18} color={colors.mutedForeground} />}
              />
              <Input
                label="Recovery code"
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                value={code}
                onChangeText={setCode}
                onBlur={() => setTouched(true)}
                autoCapitalize="characters"
                autoCorrect={false}
                error={codeError}
                icon={<KeyRound size={18} color={colors.mutedForeground} />}
              />
              <Input
                label="New password"
                placeholder="At least 8 characters"
                value={password}
                onChangeText={setPassword}
                isPassword
                textContentType="newPassword"
              />
            </View>

            {error ? (
              <View style={styles.error}>
                <TriangleAlert size={15} color={colors.destructive} strokeWidth={2.25} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              label="Reset password"
              onPress={() => {
                void submit();
              }}
              loading={loading}
              disabled={!canSubmit}
              style={styles.submit}
            />

            <Text style={styles.note}>
              Adl cannot reset a local password without its recovery code. Accounts created before
              recovery codes were available cannot use this reset. A code does not restore data
              after reinstalling the app or moving to another phone.
            </Text>

            <Pressable onPress={onBack} disabled={loading} hitSlop={8} style={styles.backLink}>
              <Text style={styles.backLinkText}>Back to sign in</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    topBar: { paddingTop: spacing['3xl'] + spacing.md, paddingHorizontal: spacing.lg },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing['2xl'],
    },
    brand: { alignItems: 'center', marginBottom: spacing.xl },
    header: { marginBottom: spacing.xl, alignItems: 'center', gap: spacing.sm },
    doneIcon: {
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}1A`,
    },
    title: { ...typography.display, fontSize: 24, color: colors.foreground, textAlign: 'center' },
    subtitle: {
      ...typography.body,
      fontSize: 14,
      lineHeight: 21,
      color: colors.mutedForeground,
      textAlign: 'center',
    },
    form: { gap: spacing.lg },
    error: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: `${colors.destructive}55`,
      backgroundColor: `${colors.destructive}0F`,
    },
    errorText: { flex: 1, ...typography.body, fontSize: 13, color: colors.destructive },
    submit: { marginTop: spacing.xl },
    note: {
      ...typography.caption,
      fontSize: 12,
      lineHeight: 19,
      color: colors.subtleForeground,
      textAlign: 'center',
      marginTop: spacing.xl,
    },
    backLink: { alignSelf: 'center', marginTop: spacing.lg, padding: spacing.sm },
    backLinkText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  });
