/**
 * SettingsScreen — the shadcn-inspired settings surface: it pops up over the
 * app as an overlay with a slim category rail on the left and the active
 * category's content on the right. Every category is wired to real state
 * (auth, theme, locale, and per-user settings).
 */
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Text from '../ui/AppText';
import { Accessibility, Bell, Database, Info, Languages, Lock, Palette, ShieldCheck, User, Volume2, X } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { haptics } from '../../lib/haptics';
import { ProfileSection, AccountSection } from './sectionsProfileAccount';
import { AppearanceSection, LanguageRegionSection } from './sectionsAppearanceRegion';
import { NotificationsSection, PrivacySecuritySection } from './sectionsNotificationsPrivacy';
import { AccessibilitySection, SoundHapticsSection, DataStorageSection } from './sectionsAccessSoundData';
import { AboutSection } from './sectionsAbout';

type CategoryId =
  | 'profile' | 'account' | 'appearance' | 'region' | 'notifications'
  | 'privacy' | 'accessibility' | 'sound' | 'data' | 'about';

const CATEGORIES: { id: CategoryId; label: string; Icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', Icon: User },
  { id: 'account', label: 'Account', Icon: ShieldCheck },
  { id: 'appearance', label: 'Display', Icon: Palette },
  { id: 'region', label: 'Language', Icon: Languages },
  { id: 'notifications', label: 'Alerts', Icon: Bell },
  { id: 'privacy', label: 'Privacy', Icon: Lock },
  { id: 'accessibility', label: 'Access', Icon: Accessibility },
  { id: 'sound', label: 'Sound', Icon: Volume2 },
  { id: 'data', label: 'Data', Icon: Database },
  { id: 'about', label: 'About', Icon: Info },
];

export default function SettingsScreen({ onClose, onNavigate }: { onClose: () => void; onNavigate?: (key: string) => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [active, setActive] = useState<CategoryId>('profile');

  const renderContent = () => {
    switch (active) {
      case 'profile': return <ProfileSection />;
      case 'account': return <AccountSection />;
      case 'appearance': return <AppearanceSection />;
      case 'region': return <LanguageRegionSection />;
      case 'notifications': return <NotificationsSection />;
      case 'privacy': return <PrivacySecuritySection />;
      case 'accessibility': return <AccessibilitySection />;
      case 'sound': return <SoundHapticsSection />;
      case 'data': return <DataStorageSection onNavigate={onNavigate} />;
      case 'about': return <AboutSection />;
    }
  };

  const activeLabel = CATEGORIES.find((c) => c.id === active)?.label ?? 'Settings';

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={10} style={styles.iconBtn}>
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSub}>{activeLabel}</Text>
        </View>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.body}>
        <View style={styles.rail}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.railContent}>
            {CATEGORIES.map(({ id, label, Icon }) => {
              const on = id === active;
              return (
                <Pressable key={id} onPress={() => { haptics.selection(); setActive(id); }} style={[styles.railItem, on && styles.railItemActive]}>
                  <Icon size={19} color={on ? colors.primary : colors.mutedForeground} strokeWidth={2} />
                  <Text style={[styles.railLabel, on && { color: colors.primary }]} numberOfLines={1}>{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {renderContent()}
        </ScrollView>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing['3xl'] + spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconBtn: { width: 34, height: 34, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    headerCenter: { flex: 1, alignItems: 'center', gap: 1 },
    headerTitle: { fontFamily, fontSize: 16, fontWeight: '700', color: colors.foreground },
    headerSub: { fontFamily, fontSize: 11, color: colors.subtleForeground },
    body: { flex: 1, flexDirection: 'row' },
    rail: { width: 84, borderRightWidth: 1, borderRightColor: colors.border, backgroundColor: colors.card },
    railContent: { paddingVertical: spacing.md, paddingHorizontal: spacing.sm, gap: spacing.xs },
    railItem: { alignItems: 'center', gap: 4, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: 'transparent' },
    railItemActive: { backgroundColor: `${colors.primary}14`, borderColor: `${colors.primary}44` },
    railLabel: { fontFamily, fontSize: 10.5, fontWeight: '600', color: colors.mutedForeground },
    content: { flex: 1 },
    contentInner: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  });
