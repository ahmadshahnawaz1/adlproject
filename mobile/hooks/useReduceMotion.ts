/**
 * useReduceMotion — true when animations should be minimized, honoring either
 * the in-app Appearance setting or the operating system's Reduce Motion switch.
 * Continuous/looping animations should hold a static state when this is on.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useSettingsOptional } from '../contexts/SettingsContext';

export default function useReduceMotion(): boolean {
  const { settings } = useSettingsOptional();
  const [osReduce, setOsReduce] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (alive) setOsReduce(v);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setOsReduce);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  return settings.appearance.reduceMotion || osReduce;
}
