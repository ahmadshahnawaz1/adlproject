import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Mail, MailCheck } from 'lucide-react-native';
import BrandMark from '../components/BrandMark';
import Button from '../components/ui/Button';
import BackButton from '../components/ui/BackButton';
import Input from '../components/ui/Input';
import { isValidEmail } from '../lib/validation';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

/**
 * ForgotPasswordScreen — a calm, beautiful recovery flow.
 * Two states: request the link, then a graceful "check your inbox" confirmation.
 */
export default function ForgotPasswordScreen({
  onBack,
}: {
  onBack?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const emailError = useMemo(
    () => (touched && email && !isValidEmail(email) ? 'Enter a valid email address' : undefined),
    [email, touched],
  );

  const canSubmit = isValidEmail(email);

  const submit = () => {
    setTouched(true);
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1400); // placeholder for real request
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <BackButton onPress={onBack} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <BrandMark size={46} layout="stack" />
        </View>

        {sent ? (
          <SentState email={email} onResend={() => setSent(false)} onBack={onBack} />
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Reset your password</Text>
              <Text style={styles.subtitle}>
                Enter the email tied to your account and we&apos;ll send a secure link to set a new
                password.
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
                autoCapitalize="none"
                error={emailError}
                icon={<Mail size={18} color={colors.mutedForeground} />}
              />
            </View>

            <Button
              label="Send reset link"
              onPress={submit}
              loading={loading}
              disabled={!canSubmit}
              style={styles.submit}
            />

            <Pressable onPress={onBack} hitSlop={8} style={styles.remember}>
              <Text style={styles.rememberText}>Remembered it? </Text>
              <Text style={styles.rememberLink}>Back to sign in</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SentState({
  email,
  onResend,
  onBack,
}: {
  email: string;
  onResend: () => void;
  onBack?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.sent}>
      <View style={styles.sentIcon}>
        <MailCheck size={30} color={colors.primary} />
      </View>
      <Text style={styles.title}>Check your inbox</Text>
      <Text style={styles.subtitle}>
        We sent a password reset link to{'\n'}
        <Text style={styles.email}>{email}</Text>
      </Text>
      <Text style={styles.hint}>
        The link expires in 30 minutes. If you don&apos;t see it, check your spam folder.
      </Text>

      <Button label="Back to sign in" onPress={onBack} style={styles.submit} />

      <Pressable onPress={onResend} hitSlop={8} style={styles.remember}>
        <Text style={styles.rememberText}>Didn&apos;t get it? </Text>
        <Text style={styles.rememberLink}>Resend</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  topBar: {
    paddingTop: spacing['3xl'] + spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  brand: { alignItems: 'center', marginBottom: spacing['2xl'] },
  header: { marginBottom: spacing.xl, alignItems: 'center' },
  title: { ...typography.display, color: colors.foreground, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    color: colors.mutedForeground,
    marginTop: spacing.sm,
    lineHeight: 22,
    textAlign: 'center',
  },
  form: { gap: spacing.lg },
  submit: { marginTop: spacing.xl, alignSelf: 'stretch' },
  remember: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  rememberText: { ...typography.body, color: colors.mutedForeground },
  rememberLink: { ...typography.body, color: colors.primary, fontWeight: '600' },
  sent: { alignItems: 'center' },
  sentIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  email: { color: colors.foreground, fontWeight: '600' },
  hint: {
    ...typography.caption,
    color: colors.subtleForeground,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 19,
    paddingHorizontal: spacing.md,
  },
});
