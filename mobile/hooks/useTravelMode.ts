/**
 * useTravelMode — the persisted travel state (F24).
 *
 * Holds the home point the user sets, their distance threshold, and a manual
 * override, and resolves them against the current location into a travel state.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';
import useLocation from './useLocation';
import {
  DEFAULT_THRESHOLD_KM,
  clampThreshold,
  travelStatus,
  type TravelOverride,
  type TravelStatus,
} from '../lib/travel';
import type { LatLng } from '../lib/places';

const STORE_KEY = 'adl.travel.v1';

type TravelPrefs = {
  home: LatLng | null;
  homeLabel: string;
  thresholdKm: number;
  override: TravelOverride;
};

function fresh(): TravelPrefs {
  return { home: null, homeLabel: '', thresholdKm: DEFAULT_THRESHOLD_KM, override: 'auto' };
}

export type UseTravelMode = {
  ready: boolean;
  prefs: TravelPrefs;
  status: TravelStatus;
  /** The device's current position, when known. */
  current: LatLng | null;
  currentLabel: string;
  setHome: (coords: LatLng, label: string) => void;
  clearHome: () => void;
  setThreshold: (km: number) => void;
  setOverride: (o: TravelOverride) => void;
};

export default function useTravelMode(): UseTravelMode {
  const { location } = useLocation();
  const [prefs, setPrefs] = useState<TravelPrefs>(fresh);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<TravelPrefs>;
          setPrefs({
            home: parsed.home ?? null,
            homeLabel: parsed.homeLabel ?? '',
            thresholdKm: clampThreshold(parsed.thresholdKm ?? DEFAULT_THRESHOLD_KM),
            override:
              parsed.override === 'on' || parsed.override === 'off' ? parsed.override : 'auto',
          });
        }
      } catch {
        // fall back to defaults
      }
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const write = useCallback((next: TravelPrefs) => {
    AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => {});
    return next;
  }, []);

  const setHome = useCallback(
    (coords: LatLng, label: string) =>
      setPrefs((prev) => write({ ...prev, home: coords, homeLabel: label })),
    [write],
  );

  const clearHome = useCallback(
    () => setPrefs((prev) => write({ ...prev, home: null, homeLabel: '' })),
    [write],
  );

  const setThreshold = useCallback(
    (km: number) => setPrefs((prev) => write({ ...prev, thresholdKm: clampThreshold(km) })),
    [write],
  );

  const setOverride = useCallback(
    (override: TravelOverride) => setPrefs((prev) => write({ ...prev, override })),
    [write],
  );

  const current = location?.coords ?? null;

  const status = useMemo(
    () =>
      travelStatus({
        home: prefs.home,
        current,
        thresholdKm: prefs.thresholdKm,
        override: prefs.override,
      }),
    [prefs.home, prefs.thresholdKm, prefs.override, current],
  );

  return {
    ready,
    prefs,
    status,
    current,
    currentLabel: location?.label ?? '',
    setHome,
    clearHome,
    setThreshold,
    setOverride,
  };
}
