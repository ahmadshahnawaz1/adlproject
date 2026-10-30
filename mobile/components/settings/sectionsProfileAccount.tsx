/**
 * Settings sections — Profile & Account. Self-contained: they read the auth and
 * settings contexts directly. Name/email edits go through the auth backend;
 * extended profile fields persist in per-user settings.
 */
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import Text from '../ui/AppText';
import { AtSign, Cake, Building2, Globe, LogOut, KeyRound, Mail, MapPin, ShieldCheck, Trash2, User, FileText, Smartphone, Apple, BadgeCheck } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { fontFamily, spacing, typography } from '../../theme/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { isValidEmail } from '../../lib/validation';
import { Avatar, SettingsSection, NavRow, SelectRow, ButtonRow, ValueRow } from './primitives';
import { EditFieldDialog, ChangePasswordDialog, ConfirmDialog } from './dialogs';

type Edit = { title: string; value: string; multiline?: boolean; keyboardType?: 'default' | 'email-address'; autoCapitalize?: 'none' | 'words' | 'sentences'; submit: (v: string) => Promise<string | null> | string | null } | null;

export function ProfileSection() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user, updateProfile } = useAuth();
  const { settings, update } = useSettings();
  const [edit, setEdit] = useState<Edit>(null);
  if (!user) return null;
  const p = settings.profile;
  const ic = (Icon: typeof User) => <Icon size={16} color={colors.primary} strokeWidth={2} />;

  return (
    <View>
      <View style={styles.hero}>
        <Avatar name={user.name} color={user.avatarColor} size={76} />
        <Text style={styles.heroName}>{user.name}</Text>
        <Text style={styles.heroEmail}>{user.email}</Text>
      </View>

      <SettingsSection title="Profile">
        <NavRow icon={ic(User)} label="Name" value={user.name} onPress={() => setEdit({
          title: 'Your name', value: user.name, autoCapitalize: 'words',
          submit: async (v) => { if (v.trim().length < 2) return 'Enter your name'; const r = await updateProfile({ name: v.trim() }); return r.ok ? null : (r.error ?? 'Could not save'); },
        })} />
        <NavRow icon={ic(Mail)} label="Email" value={user.email} onPress={() => setEdit({
          title: 'Email address', value: user.email, keyboardType: 'email-address', autoCapitalize: 'none',
          submit: async (v) => { if (!isValidEmail(v)) return 'Enter a valid email address'; const r = await updateProfile({ email: v }); return r.ok ? null : (r.error ?? 'Could not save'); },
        })} />
        <NavRow icon={ic(AtSign)} label="Username" value={p.username || 'Add'} onPress={() => setEdit({
          title: 'Username', value: p.username, autoCapitalize: 'none',
          submit: (v) => { update('profile', { username: v.trim() }); return null; },
        })} />
        <NavRow icon={ic(FileText)} label="Bio" value={p.bio ? 'Edit' : 'Add'} onPress={() => setEdit({
          title: 'Bio', value: p.bio, multiline: true, autoCapitalize: 'sentences',
          submit: (v) => { update('profile', { bio: v }); return null; },
        })} />
      </SettingsSection>

      <SettingsSection title="Details">
        <SelectRow icon={ic(User)} label="Gender" value={p.gender} onChange={(v) => update('profile', { gender: v as typeof p.gender })}
          options={[{ label: 'Prefer not to say', value: 'unspecified' }, { label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]} />
        <NavRow icon={ic(Cake)} label="Date of birth" value={p.dob || 'Add'} onPress={() => setEdit({
          title: 'Date of birth (YYYY-MM-DD)', value: p.dob, autoCapitalize: 'none',
          submit: (v) => { update('profile', { dob: v.trim() }); return null; },
        })} />
        <NavRow icon={ic(Globe)} label="Country" value={p.country || 'Add'} onPress={() => setEdit({
          title: 'Country', value: p.country, autoCapitalize: 'words',
          submit: (v) => { update('profile', { country: v.trim() }); return null; },
        })} />
        <NavRow icon={ic(Building2)} label="City" value={p.city || 'Add'} onPress={() => setEdit({
          title: 'City', value: p.city, autoCapitalize: 'words',
          submit: (v) => { update('profile', { city: v.trim() }); return null; },
        })} />
        <ValueRow icon={ic(MapPin)} label="Time zone" value={p.timezone === 'auto' ? 'Automatic' : p.timezone} />
      </SettingsSection>

      <EditFieldDialog
        visible={!!edit}
        title={edit?.title ?? ''}
        initialValue={edit?.value ?? ''}
        multiline={edit?.multiline}
        keyboardType={edit?.keyboardType}
        autoCapitalize={edit?.autoCapitalize}
        onSubmit={(v) => (edit ? edit.submit(v) : null)}
        onClose={() => setEdit(null)}
      />
    </View>
  );
}

export function AccountSection() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user, signOut, changePassword, deleteAccount } = useAuth();
  const [pwOpen, setPwOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | 'signout' | 'delete' | 'apple' | 'google' | '2fa'>(null);
  if (!user) return null;
  const ic = (Icon: typeof User) => <Icon size={16} color={colors.primary} strokeWidth={2} />;

  return (
    <View>
      <SettingsSection title="Sign-in & security">
        <NavRow icon={ic(KeyRound)} label="Change password" onPress={() => setPwOpen(true)} />
        <NavRow icon={ic(ShieldCheck)} label="Two-factor authentication" value="Off" onPress={() => setConfirm('2fa')} />
        <ValueRow icon={ic(Smartphone)} label="Active sessions" value="This device" />
      </SettingsSection>

      <SettingsSection title="Connected accounts" footer="Linking accounts syncs your data across devices — available with the Adl cloud.">
        <NavRow icon={ic(Apple)} label="Apple" value="Not connected" onPress={() => setConfirm('apple')} />
        <NavRow icon={ic(BadgeCheck)} label="Google" value="Not connected" onPress={() => setConfirm('google')} />
      </SettingsSection>

      <SettingsSection title="Account" footer={`Signed in since ${new Date(user.createdAt).toLocaleDateString()}.`}>
        <ButtonRow icon={<LogOut size={16} color={colors.primary} strokeWidth={2} />} label="Sign out" onPress={() => setConfirm('signout')} />
        <ButtonRow icon={<Trash2 size={16} color={colors.destructive} strokeWidth={2} />} label="Delete account" danger onPress={() => setConfirm('delete')} />
      </SettingsSection>

      <ChangePasswordDialog visible={pwOpen} onSubmit={async (c, n) => { const r = await changePassword(c, n); return r.ok ? null : (r.error ?? 'Could not change password'); }} onClose={() => setPwOpen(false)} />

      <ConfirmDialog visible={confirm === 'signout'} title="Sign out?" message="You can sign back in anytime with your email and password." confirmLabel="Sign out" onConfirm={() => { void signOut(); }} onClose={() => setConfirm(null)} />
      <ConfirmDialog visible={confirm === 'delete'} title="Delete account?" message="This permanently removes your account and all of its data on this device. This cannot be undone." confirmLabel="Delete" danger onConfirm={() => { void deleteAccount(); }} onClose={() => setConfirm(null)} />
      <ConfirmDialog visible={confirm === 'apple' || confirm === 'google' || confirm === '2fa'} title="Coming soon" message="This requires the Adl cloud backend, which isn’t enabled in this build yet." confirmLabel="Got it" onConfirm={() => {}} onClose={() => setConfirm(null)} />

      <View style={styles.spacer} />
      <Text style={styles.legal} onPress={() => Linking.openURL('mailto:support@adl.app')}>Need help? Contact support</Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    hero: { alignItems: 'center', gap: 6, paddingVertical: spacing.lg, marginBottom: spacing.md },
    heroName: { ...typography.title, fontSize: 20, color: colors.foreground, marginTop: spacing.sm },
    heroEmail: { fontFamily, fontSize: 14, color: colors.mutedForeground },
    spacer: { height: spacing.sm },
    legal: { fontFamily, fontSize: 13, color: colors.primary, textAlign: 'center', paddingVertical: spacing.sm },
  });
