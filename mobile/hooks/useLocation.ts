/**
 * useLocation — the live, resolved place for prayer times.
 *
 * Strategy for instant + accurate + resilient:
 *   1. Show the cached location immediately (offline-friendly cold start).
 *   2. Silently fetch a fresh high-accuracy GPS fix and upgrade — unless the
 *      user has chosen a manual city (their override always wins).
 *   3. Re-check the device timezone whenever the app returns to the foreground,
 *      so travel across timezones recomputes correctly.
 *
 * The hook never throws: GPS denial or failure simply keeps the best location
 * we already have (cache, then Makkah).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  DEFAULT_LOCATION,
  fetchGpsLocation,
  getDeviceTimeZone,
  loadCachedLocation,
  resolveCity,
  type City,
  type ResolvedLocation,
} from '../lib/location';

export type LocationStatus = 'loading' | 'ready' | 'denied' | 'error';

export type UseLocation = {
  location: ResolvedLocation;
  status: LocationStatus;
  /** True while a GPS fix is being fetched in the background. */
  refreshing: boolean;
  /** Re-request GPS (clears any manual override). */
  useGps: () => Promise<void>;
  /** Pin to a manually chosen city (override GPS). */
  setCity: (city: City) => Promise<void>;
};

export default function useLocation(): UseLocation {
  const [location, setLocation] = useState<ResolvedLocation>(DEFAULT_LOCATION);
  const [status, setStatus] = useState<LocationStatus>('loading');
  const [refreshing, setRefreshing] = useState(false);
  // When the user pins a city, GPS must not silently override it.
  const manualRef = useRef(false);

  const runGps = useCallback(async () => {
    setRefreshing(true);
    const result = await fetchGpsLocation();
    setRefreshing(false);
    if (result.ok) {
      manualRef.current = false;
      setLocation(result.location);
      setStatus('ready');
    } else {
      setStatus(result.reason === 'denied' ? 'denied' : 'error');
    }
  }, []);

  // Cold start: cache first (instant), then upgrade with a live GPS fix.
  useEffect(() => {
    let alive = true;
    (async () => {
      const cached = await loadCachedLocation();
      if (alive && cached) {
        manualRef.current = cached.source === 'manual';
        setLocation(cached);
        setStatus('ready');
      }
      // Only chase GPS if the user hasn't pinned a city.
      if (!manualRef.current) {
        const result = await fetchGpsLocation();
        if (!alive) return;
        if (result.ok && !manualRef.current) {
          setLocation(result.location);
          setStatus('ready');
        } else if (!cached) {
          setStatus(result.ok ? 'ready' : result.reason === 'denied' ? 'denied' : 'error');
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Recompute the timezone when returning to the foreground (e.g. after travel).
  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next !== 'active') return;
      setLocation((prev) => {
        // A manual city keeps its own canonical timezone.
        if (prev.source === 'manual') return prev;
        const tz = getDeviceTimeZone();
        return tz === prev.timeZone ? prev : { ...prev, timeZone: tz };
      });
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

  const setCity = useCallback(async (city: City) => {
    manualRef.current = true;
    const resolved = await resolveCity(city);
    setLocation(resolved);
    setStatus('ready');
  }, []);

  return { location, status, refreshing, useGps: runGps, setCity };
}
