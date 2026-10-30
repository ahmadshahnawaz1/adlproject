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
import { Lock, Mail } from 'lucide-react-native';
import BrandMark from '../components/BrandMark';
import Button from '../components/ui/Button';
import Divider from '../components/ui/Divider';
import Input from '../components/ui/Input';
import { AppleIcon, GoogleIcon } from '../components/ui/BrandIcons';
import { isValidEmail } from '../lib/validation';
import { spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

/** SignInScreen — the shadcn/ui-inspired login, mirroring Sign Up. */
export default function SignInScreen({
  onSignUp,
  onForgot,
  onAuthenticated,
}: {
  onSignUp?: () => void;
  onForgot?: () => void;
  onAuthenticated?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailError = useMemo(
    () => (touched && email && !isValidEmail(email) ? 'Enter a valid email address' : undefined),
    [email, touched],
  );

  const canSubmit = isValidEmail(email) && password.length >= 1;

  const submit = () => {
    setTouched(true);
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAuthenticated?.();
    }, 1400); // placeholder for real auth
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <BrandMark size={46} layout="stack" />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue with Adl</Text>
        </View>

        <View style={styles.social}>
          <Button
            label="Continue with Apple"
            variant="secondary"
            onPress={onAuthenticated}
            icon={<AppleIcon size={18} color={colors.foreground} />}
          />
          <Button
            label="Continue with Google"
            variant="secondary"
            onPress={onAuthenticated}
            icon={<GoogleIcon size={18} />}
          />
        </View>

        <View style={styles.dividerWrap}>
          <Divider label="or sign in with email" />
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
          <View>
            <View style={styles.passwordRow}>
              <Text style={styles.passwordLabel}>Password</Text>
              <Pressable hitSlop={8} onPress={onForgot}>
                <Text style={styles.forgot}>Forgot password?</Text>
              </Pressable>
            </View>
            <Input
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword
              textContentType="password"
              icon={<Lock size={18} color={colors.mutedForeground} />}
            />
          </View>
        </View>

        <Button
          label="Sign in"
          onPress={submit}
          loading={loading}
          disabled={!canSubmit}
          style={styles.submit}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={onSignUp} hitSlop={8}>
            <Text style={styles.footerLink}>Sign up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'] * 2,
    paddingBottom: spacing['2xl'],
  },
  brand: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.lg },
  header: { marginBottom: spacing.xl, alignItems: 'center' },
  title: { ...typography.display, color: colors.foreground, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    color: colors.mutedForeground,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  social: { gap: spacing.md },
  dividerWrap: { marginVertical: spacing.xl },
  form: { gap: spacing.lg },
  passwordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  passwordLabel: { ...typography.label, color: colors.foreground },
  forgot: { ...typography.label, color: colors.primary },
  submit: { marginTop: spacing.xl },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  footerText: { ...typography.body, color: colors.mutedForeground },
  footerLink: { ...typography.body, color: colors.primary, fontWeight: '600' },
});
