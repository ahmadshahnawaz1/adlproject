/**
 * Settings sections — Notifications & Privacy/Security. All values persist in
 * per-user settings; the location row deep-links into the OS settings.
 */
import { Linking, View } from 'react-native';
import { BadgeCheck, Bell, BookOpen, Bug, ChartColumn, Clock, Eye, Flame, Lock, MapPin, Moon, ScanFace, ScrollText, Sparkles, Vibrate, Volume2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';
import { SettingsSection, SelectRow, StepperRow, ToggleRow, NavRow } from './primitives';

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hh = String(Math.floor(i / 2)).padStart(2, '0');
  const mm = i % 2 ? '30' : '00';
  return { label: `${hh}:${mm}`, value: `${hh}:${mm}` };
});

export function NotificationsSection() {
  const { colors } = useTheme();
  const { settings, update } = useSettings();
  const n = settings.notifications;
  const off = !n.enabled;
  const ic = (Icon: typeof Bell) => <Icon size={16} color={colors.primary} strokeWidth={2} />;

  return (
    <View>
      <SettingsSection title="Notifications" footer="Turn everything off with the master switch.">
        <ToggleRow icon={ic(Bell)} label="Allow notifications" value={n.enabled} onValueChange={(v) => update('notifications', { enabled: v })} />
      </SettingsSection>

      <SettingsSection title="What you get">
        <ToggleRow icon={ic(BookOpen)} label="Daily verse" value={n.dailyVerse} disabled={off} onValueChange={(v) => update('notifications', { dailyVerse: v })} />
        <ToggleRow icon={ic(ScrollText)} label="Daily hadith" value={n.dailyHadith} disabled={off} onValueChange={(v) => update('notifications', { dailyHadith: v })} />
        <ToggleRow icon={ic(Flame)} label="Streak reminders" value={n.streakReminders} disabled={off} onValueChange={(v) => update('notifications', { streakReminders: v })} />
        <ToggleRow icon={ic(Bell)} label="Prayer reminders" value={n.prayerReminders} disabled={off} onValueChange={(v) => update('notifications', { prayerReminders: v })} />
        <StepperRow icon={ic(Clock)} label="Pre-adhan reminder" value={n.preAdhanMinutes} suffix=" min" min={0} max={60} step={5} onChange={(v) => update('notifications', { preAdhanMinutes: v })} />
      </SettingsSection>

      <SettingsSection title="Style">
        <ToggleRow icon={ic(Volume2)} label="Sound" value={n.sound} disabled={off} onValueChange={(v) => update('notifications', { sound: v })} />
        <ToggleRow icon={ic(Vibrate)} label="Vibration" value={n.vibration} disabled={off} onValueChange={(v) => update('notifications', { vibration: v })} />
        <ToggleRow icon={ic(Eye)} label="Show preview" value={n.showPreview} disabled={off} onValueChange={(v) => update('notifications', { showPreview: v })} />
        <ToggleRow icon={ic(BadgeCheck)} label="App badges" value={n.badges} disabled={off} onValueChange={(v) => update('notifications', { badges: v })} />
      </SettingsSection>

      <SettingsSection title="Quiet hours">
        <ToggleRow icon={ic(Moon)} label="Quiet hours" description="Silence notifications overnight" value={n.quietHoursEnabled} disabled={off} onValueChange={(v) => update('notifications', { quietHoursEnabled: v })} />
        {n.quietHoursEnabled && !off ? (
          <SelectRow icon={ic(Clock)} label="From" value={n.quietStart} options={TIME_OPTIONS} onChange={(v) => update('notifications', { quietStart: v })} />
        ) : null}
        {n.quietHoursEnabled && !off ? (
          <SelectRow icon={ic(Clock)} label="Until" value={n.quietEnd} options={TIME_OPTIONS} onChange={(v) => update('notifications', { quietEnd: v })} />
        ) : null}
      </SettingsSection>
    </View>
  );
}

export function PrivacySecuritySection() {
  const { colors } = useTheme();
  const { settings, update } = useSettings();
  const p = settings.privacy;
  const ic = (Icon: typeof Lock) => <Icon size={16} color={colors.primary} strokeWidth={2} />;

  return (
    <View>
      <SettingsSection title="App lock" footer="Require authentication each time Adl is opened.">
        <ToggleRow icon={ic(Lock)} label="Require unlock" value={p.appLock} onValueChange={(v) => update('privacy', { appLock: v })} />
        {p.appLock ? (
          <ToggleRow icon={ic(ScanFace)} label="Use biometrics" value={p.biometric} onValueChange={(v) => update('privacy', { biometric: v })} />
        ) : null}
        {p.appLock ? (
          <SelectRow icon={ic(Clock)} label="Auto-lock" value={p.autoLock} onChange={(v) => update('privacy', { autoLock: v as typeof p.autoLock })}
            options={[{ label: 'Immediately', value: 'immediately' }, { label: 'After 1 minute', value: '1m' }, { label: 'After 5 minutes', value: '5m' }, { label: 'After 15 minutes', value: '15m' }, { label: 'After 1 hour', value: '1h' }, { label: 'Never', value: 'never' }]} />
        ) : null}
      </SettingsSection>

      <SettingsSection title="Privacy">
        <ToggleRow icon={ic(Eye)} label="Hide content when switching apps" value={p.hideInAppSwitcher} onValueChange={(v) => update('privacy', { hideInAppSwitcher: v })} />
        <ToggleRow icon={ic(Sparkles)} label="Personalised content" description="Tailor suggestions to your activity" value={p.personalizedContent} onValueChange={(v) => update('privacy', { personalizedContent: v })} />
        <ToggleRow icon={ic(ChartColumn)} label="Share usage analytics" value={p.analytics} onValueChange={(v) => update('privacy', { analytics: v })} />
        <ToggleRow icon={ic(Bug)} label="Send crash reports" value={p.crashReports} onValueChange={(v) => update('privacy', { crashReports: v })} />
      </SettingsSection>

      <SettingsSection title="Permissions">
        <NavRow icon={ic(MapPin)} label="Location" value="System settings" onPress={() => { void Linking.openSettings(); }} />
      </SettingsSection>
    </View>
  );
}
