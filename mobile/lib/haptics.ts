/**
 * lib/haptics — a tiny global wrapper over expo-haptics gated by a user setting.
 *
 * Call sites use `haptics.selection()` etc. instead of importing expo-haptics
 * directly, so the "Haptic feedback" toggle in Settings turns them all off at
 * once. The flag is set by the SettingsProvider when settings load or change.
 */
import * as Haptics from 'expo-haptics';

let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

export function hapticsEnabled(): boolean {
  return enabled;
}

export const haptics = {
  selection() {
    if (enabled) void Haptics.selectionAsync();
  },
  impact(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
    if (enabled) void Haptics.impactAsync(style);
  },
  success() {
    if (enabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  warning() {
    if (enabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
};
