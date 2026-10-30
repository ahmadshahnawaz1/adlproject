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
import { useT } from '../i18n/LocaleContext';
import { spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

/** SignInScreen — the shadcn/ui-inspired login, mirroring Sign Up. */
export default function SignInScreen({
  onSignUp,
  onForgot,
  onSubmit,
  onApple,
}: {
  onSignUp?: () => void;
  onForgot?: () => void;
  onSubmit?: (email: string, password: string) => Promise<string | null>;
  onApple?: () => Promise<string | null>;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emailError = useMemo(
    () => (touched && email && !isValidEmail(email) ? t('auth.email.invalid') : undefined),
    [email, touched, t],
  );

  const canSubmit = isValidEmail(email) && password.length >= 1;

  const submit = async () => {
    setTouched(true);
    if (!canSubmit) return;
    setFormError(null);
    setLoading(true);
    const error = await onSubmit?.(email, password);
    setLoading(false);
    if (error) setFormError(error);
  };

  const continueWithApple = async () => {
    if (appleLoading) return;
    setFormError(null);
    setAppleLoading(true);
    try {
      const error = await onApple?.();
      if (error) setFormError(error);
    } catch {
      setFormError(t('auth.error.generic'));
    } finally {
      setAppleLoading(false);
    }
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
          <Text style={styles.title}>{t('auth.signIn.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.signIn.subtitle')}</Text>
        </View>

        <View style={styles.social}>
          <Button
            label={t('auth.social.apple')}
            variant="secondary"
            loading={appleLoading}
            onPress={() => { void continueWithApple(); }}
            icon={<AppleIcon size={18} color={colors.foreground} />}
          />
          <Button
            label={t('auth.social.google')}
            variant="secondary"
            onPress={() => setFormError(t('auth.social.unavailable'))}
            icon={<GoogleIcon size={18} />}
          />
        </View>

        <View style={styles.dividerWrap}>
          <Divider label={t('auth.signIn.divider')} />
        </View>

        <View style={styles.form}>
          <Input
            label={t('auth.email.label')}
            placeholder={t('auth.email.placeholder')}
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
              <Text style={styles.passwordLabel}>{t('auth.password.label')}</Text>
              <Pressable hitSlop={8} onPress={onForgot}>
                <Text style={styles.forgot}>{t('auth.password.forgot')}</Text>
              </Pressable>
            </View>
            <Input
              placeholder={t('auth.password.placeholder')}
              value={password}
              onChangeText={setPassword}
              isPassword
              textContentType="password"
              icon={<Lock size={18} color={colors.mutedForeground} />}
            />
          </View>
        </View>

        {formError ? (
          <Text style={{ color: colors.destructive, textAlign: 'center', marginTop: spacing.md, fontSize: 13 }}>{formError}</Text>
        ) : null}

        <Button
          label={t('auth.signIn.submit')}
          onPress={submit}
          loading={loading}
          disabled={!canSubmit}
          style={styles.submit}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.signIn.noAccount')}</Text>
          <Pressable onPress={onSignUp} hitSlop={8}>
            <Text style={styles.footerLink}>{t('auth.signIn.signUpLink')}</Text>
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
