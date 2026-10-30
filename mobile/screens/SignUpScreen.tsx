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
import { Lock, Mail, User } from 'lucide-react-native';
import BrandMark from '../components/BrandMark';
import Button from '../components/ui/Button';
import Divider from '../components/ui/Divider';
import Input from '../components/ui/Input';
import PasswordStrength from '../components/ui/PasswordStrength';
import { AppleIcon, GoogleIcon } from '../components/ui/BrandIcons';
import { isValidEmail } from '../lib/validation';
import { spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

/** SignUpScreen — ridiculously clean, shadcn/ui-inspired account creation. */
export default function SignUpScreen({
  onSignIn,
  onTerms,
  onPrivacy,
  onAuthenticated,
}: {
  onSignIn?: () => void;
  onTerms?: () => void;
  onPrivacy?: () => void;
  onAuthenticated?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailError = useMemo(
    () => (touched && email && !isValidEmail(email) ? 'Enter a valid email address' : undefined),
    [email, touched],
  );

  const canSubmit = name.trim().length > 1 && isValidEmail(email) && password.length >= 8;

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
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Begin your journey with Adl</Text>
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
          <Divider label="or continue with email" />
        </View>

        <View style={styles.form}>
          <Input
            label="Full name"
            placeholder="Aisha Rahman"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            textContentType="name"
            icon={<User size={18} color={colors.mutedForeground} />}
          />
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
            <Input
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              isPassword
              textContentType="newPassword"
              icon={<Lock size={18} color={colors.mutedForeground} />}
            />
            <PasswordStrength value={password} />
          </View>
        </View>

        <Button
          label="Create account"
          onPress={submit}
          loading={loading}
          disabled={!canSubmit}
          style={styles.submit}
        />

        <Text style={styles.terms}>
          By continuing, you agree to Adl&apos;s{' '}
          <Text style={styles.link} onPress={onTerms}>Terms</Text> and{' '}
          <Text style={styles.link} onPress={onPrivacy}>Privacy Policy</Text>.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={onSignIn} hitSlop={8}>
            <Text style={styles.footerLink}>Sign in</Text>
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
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['2xl'],
  },
  brand: { alignItems: 'center', marginTop: spacing['3xl'], marginBottom: spacing.lg },
  header: { marginBottom: spacing.xl, alignItems: 'center' },
  title: { ...typography.display, color: colors.foreground, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    color: colors.mutedForeground,
    marginTop: spacing.sm,
    lineHeight: 21,
    textAlign: 'center',
  },
  social: { gap: spacing.md },
  dividerWrap: { marginVertical: spacing.xl },
  form: { gap: spacing.lg },
  submit: { marginTop: spacing.xl },
  terms: {
    ...typography.caption,
    color: colors.subtleForeground,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 19,
    paddingHorizontal: spacing.md,
  },
  link: { color: colors.mutedForeground, fontWeight: '500' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  footerText: { ...typography.body, color: colors.mutedForeground },
  footerLink: { ...typography.body, color: colors.primary, fontWeight: '600' },
});
