/**
 * Tests for the pure settings defaults + merge.
 */
import { DEFAULT_SETTINGS, mergeSettings } from '../lib/settings/defaults';

describe('mergeSettings', () => {
  it('returns a full copy of the defaults for null', () => {
    expect(mergeSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it('overrides only the provided fields, keeping the rest', () => {
    const merged = mergeSettings({ sound: { haptics: false }, notifications: { dailyHadith: true } });
    expect(merged.sound.haptics).toBe(false);
    expect(merged.sound.inAppSounds).toBe(DEFAULT_SETTINGS.sound.inAppSounds);
    expect(merged.notifications.dailyHadith).toBe(true);
    expect(merged.notifications.enabled).toBe(DEFAULT_SETTINGS.notifications.enabled);
  });

  it('fills in categories missing from an older blob', () => {
    const merged = mergeSettings({ profile: { city: 'Madīnah' } });
    expect(merged.profile.city).toBe('Madīnah');
    expect(merged.privacy).toEqual(DEFAULT_SETTINGS.privacy);
    expect(merged.data).toEqual(DEFAULT_SETTINGS.data);
  });
});
