/**
 * Settings sections — Appearance & Language/Region. Appearance drives
 * ThemeContext (mode / contrast / text size); Language drives LocaleContext.
 * The remaining format prefs persist in per-user settings.
 */
import { View } from 'react-native';
import { Bold, Calendar, CalendarDays, Clock, Hash, Languages, Palette, Sparkles, Type } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useLocale } from '../../i18n/LocaleContext';
import { LOCALES } from '../../i18n';
import { useSettings } from '../../contexts/SettingsContext';
import { SettingsSection, SegmentedRow, SelectRow, StepperRow, ToggleRow } from './primitives';

export function AppearanceSection() {
  const { colors, mode, setMode, highContrast, setHighContrast, textScale, setTextScale } = useTheme();
  const { settings, update } = useSettings();
  const ic = (Icon: typeof Type) => <Icon size={16} color={colors.primary} strokeWidth={2} />;

  return (
    <View>
      <SettingsSection title="Theme">
        <SegmentedRow icon={ic(Palette)} label="Appearance" value={mode} onChange={(v) => setMode(v as 'system' | 'light' | 'dark')}
          options={[{ label: 'System', value: 'system' }, { label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }]} />
        <ToggleRow icon={ic(Sparkles)} label="High contrast" description="Stronger borders and text" value={highContrast} onValueChange={setHighContrast} />
      </SettingsSection>

      <SettingsSection title="Text" footer="Applies across the whole app.">
        <StepperRow icon={ic(Type)} label="Text size" value={Math.round(textScale * 100)} suffix="%" min={85} max={140} step={5} onChange={(v) => setTextScale(v / 100)} />
        <ToggleRow icon={ic(Bold)} label="Bold text" value={settings.appearance.boldText} onValueChange={(v) => update('appearance', { boldText: v })} />
      </SettingsSection>

      <SettingsSection title="Motion">
        <ToggleRow icon={ic(Sparkles)} label="Reduce motion" description="Minimise animations and transitions" value={settings.appearance.reduceMotion} onValueChange={(v) => update('appearance', { reduceMotion: v })} />
      </SettingsSection>
    </View>
  );
}

export function LanguageRegionSection() {
  const { colors } = useTheme();
  const { code, setLocale } = useLocale();
  const { settings, update } = useSettings();
  const r = settings.region;
  const ic = (Icon: typeof Clock) => <Icon size={16} color={colors.primary} strokeWidth={2} />;

  return (
    <View>
      <SettingsSection title="Language">
        <SelectRow icon={ic(Languages)} label="App language" value={code} onChange={setLocale}
          options={LOCALES.map((l) => ({ label: l.nativeLabel === l.label ? l.label : `${l.nativeLabel} · ${l.label}`, value: l.code }))} />
      </SettingsSection>

      <SettingsSection title="Formats">
        <SegmentedRow icon={ic(Clock)} label="Time" value={r.timeFormat} onChange={(v) => update('region', { timeFormat: v as typeof r.timeFormat })}
          options={[{ label: 'System', value: 'system' }, { label: '12-hour', value: '12h' }, { label: '24-hour', value: '24h' }]} />
        <SelectRow icon={ic(Calendar)} label="Date format" value={r.dateFormat} onChange={(v) => update('region', { dateFormat: v as typeof r.dateFormat })}
          options={[{ label: 'Automatic', value: 'system' }, { label: '31/07/2026', value: 'dmy' }, { label: '07/31/2026', value: 'mdy' }, { label: '2026-07-31', value: 'ymd' }]} />
        <SelectRow icon={ic(CalendarDays)} label="First day of week" value={r.firstDayOfWeek} onChange={(v) => update('region', { firstDayOfWeek: v as typeof r.firstDayOfWeek })}
          options={[{ label: 'Automatic', value: 'system' }, { label: 'Saturday', value: 'sat' }, { label: 'Sunday', value: 'sun' }, { label: 'Monday', value: 'mon' }]} />
        <SegmentedRow icon={ic(Hash)} label="Numerals" value={r.numerals} onChange={(v) => update('region', { numerals: v as typeof r.numerals })}
          options={[{ label: '1 2 3', value: 'latin' }, { label: '١ ٢ ٣', value: 'arabic' }]} />
      </SettingsSection>
    </View>
  );
}
