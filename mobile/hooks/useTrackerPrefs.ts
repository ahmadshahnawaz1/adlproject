/**
 * useTrackerPrefs — the user's prayer-tracking preferences, persisted.
 *
 * Everything about the tracker that a person might reasonably want to shape:
 * how long the stats window and trend chart look back, whether a streak is
 * lenient or strict, the streak goal to celebrate, and small comfort toggles
 * (Arabic names, haptic feedback). Sensible defaults mean a fresh user never
 * has to open settings — but everything is theirs to tune.
 */
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFS_KEY = 'adl.trackerPrefs.v1';

export type TrackerPrefs = {
  /** Trailing window for consistency / congregation stats. */
  statsWindowDays: number;
  /** How many days the trend chart shows. */
  trendDays: number;
  /** Show each prayer's Arabic name beneath its label. */
  showArabic: boolean;
  /** Soft success haptic when a prayer is logged as prayed. */
  haptics: boolean;
  /**
   * Strict streak: a day only counts when every prayer was on time or in
   * congregation (late / made-up days break the run). Off = lenient.
   */
  strictStreak: boolean;
  /** A streak target to celebrate; 0 disables the goal ring. */
  streakGoal: number;
};

export const DEFAULT_TRACKER_PREFS: TrackerPrefs = {
  statsWindowDays: 30,
  trendDays: 14,
  showArabic: true,
  haptics: true,
  strictStreak: false,
  streakGoal: 0,
};

export const STATS_WINDOW_OPTIONS = [30, 60, 90, 365];
export const TREND_DAY_OPTIONS = [7, 14, 30];
export const STREAK_GOAL_OPTIONS = [0, 7, 30, 40, 100];

export type UseTrackerPrefs = {
  prefs: TrackerPrefs;
  ready: boolean;
  setPref: <K extends keyof TrackerPrefs>(key: K, value: TrackerPrefs[K]) => void;
  reset: () => void;
};

export default function useTrackerPrefs(): UseTrackerPrefs {
  const [prefs, setPrefs] = useState<TrackerPrefs>(DEFAULT_TRACKER_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFS_KEY);
        if (alive && raw) {
          setPrefs({ ...DEFAULT_TRACKER_PREFS, ...(JSON.parse(raw) as Partial<TrackerPrefs>) });
        }
      } catch {
        // Fall back to defaults.
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setPref = useCallback(
    <K extends keyof TrackerPrefs>(key: K, value: TrackerPrefs[K]) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setPrefs(DEFAULT_TRACKER_PREFS);
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify(DEFAULT_TRACKER_PREFS)).catch(() => {});
  }, []);

  return { prefs, ready, setPref, reset };
}
