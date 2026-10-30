/**
 * useAppLock — biometric / device-passcode gate for the app.
 *
 * Honors the Privacy settings: locks once at launch when App Lock is on, and
 * re-locks after returning from the background once the chosen Auto-Lock delay
 * has elapsed. Unlocking uses Face ID / Touch ID with device-passcode fallback.
 * Native (expo-local-authentication) — not imported by tests.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSettings } from '../contexts/SettingsContext';
import type { AutoLock } from '../lib/settings/types';

const AUTO_LOCK_MS: Record<AutoLock, number> = {
  immediately: 0,
  '1m': 60_000,
  '5m': 300_000,
  '15m': 900_000,
  '1h': 3_600_000,
  never: Number.POSITIVE_INFINITY,
};

export default function useAppLock(active: boolean) {
  const { settings, ready } = useSettings();
  const enabled = active && settings.privacy.appLock;
  const autoLock = settings.privacy.autoLock;

  const [locked, setLocked] = useState(false);
  const didInitial = useRef(false);
  const backgroundedAt = useRef<number | null>(null);
  const authenticating = useRef(false);

  // Lock once at launch when App Lock is on (after settings have loaded).
  useEffect(() => {
    if (!active) {
      didInitial.current = false;
      setLocked(false);
      return;
    }
    if (enabled && ready && !didInitial.current) {
      didInitial.current = true;
      setLocked(true);
    }
  }, [active, enabled, ready]);

  // Re-lock when returning from the background past the Auto-Lock delay.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        if (backgroundedAt.current == null) backgroundedAt.current = Date.now();
        return;
      }
      const since = backgroundedAt.current;
      backgroundedAt.current = null;
      if (!enabled || since == null) return;
      if (Date.now() - since >= AUTO_LOCK_MS[autoLock]) setLocked(true);
    });
    return () => sub.remove();
  }, [enabled, autoLock]);

  const unlock = useCallback(async (): Promise<boolean> => {
    if (authenticating.current) return false;
    authenticating.current = true;
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) {
        // No biometric/passcode available — don't trap the user out of their app.
        setLocked(false);
        return true;
      }
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Adl',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
      });
      if (res.success) setLocked(false);
      return res.success;
    } catch {
      return false;
    } finally {
      authenticating.current = false;
    }
  }, []);

  return { locked: enabled && locked, unlock };
}
