/**
 * usePlacesFinder — the state behind the Mosque & Halal finder (F15).
 *
 * Takes the device (or manually pinned) location from useLocation, searches the
 * Overpass API for nearby mosques and halal food, and exposes the results with
 * a clear status. On a network failure it falls back to the last cached result
 * and reports 'offline'. Searches are debounced and cancellable to stay within
 * the public API's fair-use limits.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import useLocation from './useLocation';
import { cacheKey, fetchNearbyPlaces, loadCachedPlaces } from '../lib/placesFetch';
import type { Place, PlaceFilter } from '../lib/places';

export type PlacesStatus = 'idle' | 'loading' | 'ready' | 'error' | 'offline';

/** Radius options offered in the UI, in metres. */
export const RADIUS_OPTIONS = [1000, 3000, 5000, 10000] as const;
export const DEFAULT_RADIUS = 3000;

export default function usePlacesFinder() {
  const loc = useLocation();
  const [filter, setFilter] = useState<PlaceFilter>('all');
  const [radiusMeters, setRadius] = useState<number>(DEFAULT_RADIUS);
  const [places, setPlaces] = useState<Place[]>([]);
  const [status, setStatus] = useState<PlacesStatus>('idle');
  const [fromCache, setFromCache] = useState(false);

  const center = loc.location.coords;
  const key = cacheKey(center, radiusMeters, filter);

  const abortRef = useRef<AbortController | null>(null);
  const reqIdRef = useRef(0);

  const run = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++reqIdRef.current;

    setStatus('loading');
    setFromCache(false);
    try {
      const result = await fetchNearbyPlaces(center, radiusMeters, filter, controller.signal);
      if (reqId !== reqIdRef.current) return; // superseded
      setPlaces(result);
      setStatus('ready');
    } catch {
      if (reqId !== reqIdRef.current || controller.signal.aborted) return;
      // Network failed — fall back to any cached result for this search.
      const cached = await loadCachedPlaces(center, radiusMeters, filter);
      if (reqId !== reqIdRef.current) return;
      if (cached && cached.length > 0) {
        setPlaces(cached);
        setFromCache(true);
        setStatus('offline');
      } else {
        setPlaces([]);
        setStatus('error');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.latitude, center.longitude, radiusMeters, filter]);

  // Debounced auto-search whenever the search key changes.
  useEffect(() => {
    const timer = setTimeout(run, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Cancel any in-flight request on unmount.
  useEffect(() => () => abortRef.current?.abort(), []);

  return {
    /** The resolved search location (for the header + city picker). */
    location: loc.location,
    locationStatus: loc.status,
    refreshing: loc.refreshing,
    useGps: loc.useGps,
    setCity: loc.setCity,
    filter,
    setFilter,
    radiusMeters,
    setRadius,
    places,
    status,
    /** True when the shown results came from the offline cache. */
    fromCache,
    /** Re-run the current search. */
    search: run,
  };
}
