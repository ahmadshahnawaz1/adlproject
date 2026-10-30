/**
 * Settings sections — Accessibility, Sound & Haptics, and Data & Storage.
 * Haptics is a real global toggle; clear-cache, export, reset and delete perform
 * real work against on-device storage.
 */
import { useEffect, useState } from 'react';
import { Share, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Accessibility, Bold, Cloud, CloudUpload, Database, Download, Eye, HardDrive, MapPin, MessageSquare, RefreshCw, Sparkles, Trash2, Type, Vibrate, Volume2, Wifi } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { SettingsSection, ToggleRow, StepperRow, ValueRow, NavRow, ButtonRow } from './primitives';
import { ConfirmDialog } from './dialogs';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AccessibilitySection() {
  const { colors, textScale, setTextScale, highContrast, setHighContrast } = useTheme();
  const { settings, update } = useSettings();
  const ic = (Icon: typeof Type) => <Icon size={16} color={colors.primary} strokeWidth={2} />;

  return (
    <View>
      <SettingsSection title="Vision">
        <StepperRow icon={ic(Type)} label="Text size" value={Math.round(textScale * 100)} suffix="%" min={85} max={140} step={5} onChange={(v) => setTextScale(v / 100)} />
        <ToggleRow icon={ic(Bold)} label="Bold text" value={settings.appearance.boldText} onValueChange={(v) => update('appearance', { boldText: v })} />
        <ToggleRow icon={ic(Eye)} label="High contrast" value={highContrast} onValueChange={setHighContrast} />
      </SettingsSection>

      <SettingsSection title="Interaction">
        <ToggleRow icon={ic(Accessibility)} label="Larger touch targets" value={settings.accessibility.largerTouchTargets} onValueChange={(v) => update('accessibility', { largerTouchTargets: v })} />
        <ToggleRow icon={ic(Sparkles)} label="Reduce motion" value={settings.appearance.reduceMotion} onValueChange={(v) => update('appearance', { reduceMotion: v })} />
      </SettingsSection>

      <SettingsSection title="Content">
        <ToggleRow icon={ic(MessageSquare)} label="Screen-reader hints" value={settings.accessibility.screenReaderHints} onValueChange={(v) => update('accessibility', { screenReaderHints: v })} />
        <ToggleRow icon={ic(MessageSquare)} label="Captions for audio" value={settings.accessibility.captions} onValueChange={(v) => update('accessibility', { captions: v })} />
      </SettingsSection>
    </View>
  );
}

export function SoundHapticsSection() {
  const { colors } = useTheme();
  const { settings, update } = useSettings();
  const s = settings.sound;
  const ic = (Icon: typeof Volume2) => <Icon size={16} color={colors.primary} strokeWidth={2} />;

  return (
    <View>
      <SettingsSection title="Sound & haptics" footer="Haptic feedback is applied everywhere in the app at once.">
        <ToggleRow icon={ic(Vibrate)} label="Haptic feedback" value={s.haptics} onValueChange={(v) => update('sound', { haptics: v })} />
        <ToggleRow icon={ic(Volume2)} label="In-app sounds" value={s.inAppSounds} onValueChange={(v) => update('sound', { inAppSounds: v })} />
        <ToggleRow icon={ic(Volume2)} label="Keypress sounds" value={s.keySounds} onValueChange={(v) => update('sound', { keySounds: v })} />
      </SettingsSection>
    </View>
  );
}

export function DataStorageSection({ onNavigate }: { onNavigate?: (key: string) => void }) {
  const { colors } = useTheme();
  const { settings, update, reset } = useSettings();
  const { signOut } = useAuth();
  const d = settings.data;
  const [usage, setUsage] = useState<string>('Calculating…');
  const [confirm, setConfirm] = useState<null | 'cache' | 'reset' | 'wipe'>(null);
  const ic = (Icon: typeof Database) => <Icon size={16} color={colors.primary} strokeWidth={2} />;

  const measure = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const entries = await AsyncStorage.multiGet(keys);
      const bytes = entries.reduce((sum, [k, v]) => sum + k.length + (v?.length ?? 0), 0);
      setUsage(formatBytes(bytes));
    } catch {
      setUsage('—');
    }
  };
  useEffect(() => { void measure(); }, []);

  const clearCache = async () => {
    try { await AsyncStorage.removeItem('adl.places.cache.v1'); } catch { /* best-effort */ }
    void measure();
  };

  const exportData = async () => {
    try {
      const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith('adl.') && !k.startsWith('adl.auth.'));
      const entries = await AsyncStorage.multiGet(keys);
      const dump: Record<string, unknown> = {};
      for (const [k, v] of entries) {
        try { dump[k] = v ? JSON.parse(v) : v; } catch { dump[k] = v; }
      }
      await Share.share({ message: JSON.stringify({ exportedAt: new Date().toISOString(), data: dump }, null, 2) });
    } catch { /* user dismissed */ }
  };

  const wipe = async () => {
    try { await AsyncStorage.clear(); } catch { /* best-effort */ }
    void signOut();
  };

  return (
    <View>
      <SettingsSection title="Storage">
        <ValueRow icon={ic(Database)} label="On-device data" value={usage} />
        <NavRow icon={ic(HardDrive)} label="Manage downloads" value="Qurʾān, audio…" onPress={() => onNavigate?.('quran')} />
      </SettingsSection>

      <SettingsSection title="Backup & sync" footer="Sync and cloud backup arrive with the Adl cloud.">
        <ToggleRow icon={ic(Cloud)} label="Cloud sync" value={d.syncEnabled} onValueChange={(v) => update('data', { syncEnabled: v })} />
        <ToggleRow icon={ic(CloudUpload)} label="Auto-backup" value={d.autoBackup} onValueChange={(v) => update('data', { autoBackup: v })} />
        <ToggleRow icon={ic(Wifi)} label="Download over Wi-Fi only" value={d.wifiOnlyDownloads} onValueChange={(v) => update('data', { wifiOnlyDownloads: v })} />
      </SettingsSection>

      <SettingsSection title="Manage">
        <ButtonRow icon={ic(MapPin)} label="Clear location cache" onPress={() => setConfirm('cache')} />
        <ButtonRow icon={ic(Download)} label="Export my data" onPress={exportData} />
        <ButtonRow icon={ic(RefreshCw)} label="Reset all settings" onPress={() => setConfirm('reset')} />
        <ButtonRow icon={<Trash2 size={16} color={colors.destructive} strokeWidth={2} />} label="Delete all local data" danger onPress={() => setConfirm('wipe')} />
      </SettingsSection>

      <ConfirmDialog visible={confirm === 'cache'} title="Clear location cache?" message="Cached nearby-places results will be removed. Your settings and downloads are kept." confirmLabel="Clear" onConfirm={() => { void clearCache(); }} onClose={() => setConfirm(null)} />
      <ConfirmDialog visible={confirm === 'reset'} title="Reset all settings?" message="Every preference returns to its default. Your account and downloads are kept." confirmLabel="Reset" danger onConfirm={() => reset()} onClose={() => setConfirm(null)} />
      <ConfirmDialog visible={confirm === 'wipe'} title="Delete all local data?" message="This erases every account, setting, and download on this device and signs you out. This cannot be undone." confirmLabel="Delete everything" danger onConfirm={() => { void wipe(); }} onClose={() => setConfirm(null)} />
    </View>
  );
}
