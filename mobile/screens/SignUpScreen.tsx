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
import { splitTemplate } from '../lib/template';
import { useT } from '../i18n/LocaleContext';
import { spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

/** SignUpScreen — ridiculously clean, shadcn/ui-inspired account creation. */
export default function SignUpScreen({
  onSignIn,
  onTerms,
  onPrivacy,
  onSubmit,
}: {
  onSignIn?: () => void;
  onTerms?: () => void;
  onPrivacy?: () => void;
  onSubmit?: (name: string, email: string, password: string) => Promise<string | null>;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const t = useT();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emailError = useMemo(
    () => (touched && email && !isValidEmail(email) ? t('auth.email.invalid') : undefined),
    [email, touched, t],
  );

  const canSubmit = name.trim().length > 1 && isValidEmail(email) && password.length >= 8;

  const submit = async () => {
    setTouched(true);
    if (!canSubmit) return;
    setFormError(null);
    setLoading(true);
    const error = await onSubmit?.(name, email, password);
    setLoading(false);
    if (error) setFormError(error);
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
          <Text style={styles.title}>{t('auth.signUp.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.signUp.subtitle')}</Text>
        </View>

        <View style={styles.social}>
          <Button
            label={t('auth.social.apple')}
            variant="secondary"
            onPress={() => setFormError('Social sign-in needs the Adl cloud — use your email for now.')}
            icon={<AppleIcon size={18} color={colors.foreground} />}
          />
          <Button
            label={t('auth.social.google')}
            variant="secondary"
            onPress={() => setFormError('Social sign-in needs the Adl cloud — use your email for now.')}
            icon={<GoogleIcon size={18} />}
          />
        </View>

        <View style={styles.dividerWrap}>
          <Divider label={t('auth.signUp.divider')} />
        </View>

        <View style={styles.form}>
          <Input
            label={t('auth.name.label')}
            placeholder={t('auth.name.placeholder')}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            textContentType="name"
            icon={<User size={18} color={colors.mutedForeground} />}
          />
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
            <Input
              label={t('auth.password.label')}
              placeholder={t('auth.password.newPlaceholder')}
              value={password}
              onChangeText={setPassword}
              isPassword
              textContentType="newPassword"
              icon={<Lock size={18} color={colors.mutedForeground} />}
            />
            <PasswordStrength value={password} />
          </View>
        </View>

        {formError ? (
          <Text style={{ color: colors.destructive, textAlign: 'center', marginTop: spacing.md, fontSize: 13 }}>{formError}</Text>
        ) : null}

        <Button
          label={t('auth.signUp.submit')}
          onPress={submit}
          loading={loading}
          disabled={!canSubmit}
          style={styles.submit}
        />

        <Text style={styles.terms}>
          {splitTemplate(t('auth.terms.agree'), ['terms', 'privacy']).map((part, i) =>
            part.kind === 'text' ? (
              <Text key={i}>{part.value}</Text>
            ) : (
              <Text
                key={i}
                style={styles.link}
                onPress={part.name === 'terms' ? onTerms : onPrivacy}
              >
                {part.name === 'terms' ? t('auth.terms.terms') : t('auth.terms.privacy')}
              </Text>
            ),
          )}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.signUp.hasAccount')}</Text>
          <Pressable onPress={onSignIn} hitSlop={8}>
            <Text style={styles.footerLink}>{t('auth.signUp.signInLink')}</Text>
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
