/**
 * useGeoLocation — Browser Geolocation with Cambridge Fallback & localStorage Persistence
 *
 * Requests the user's current position via the Geolocation API.
 * Saves the resolved location to localStorage so it survives page refresh.
 * If permission is denied or the API is unavailable, falls back to
 * Cambridge, UK (52.2053° N, 0.1218° E) — home of Systems Architect steve81uk.
 *
 * @author steve81uk
 */

import { useState, useEffect } from 'react';

export interface GeoLocation {
  lat: number;
  lon: number;
  name: string;
  isUserLocation: boolean; // true = real GPS or manual pin, false = Cambridge fallback
}

export type GeoPermission = 'prompt' | 'granted' | 'denied' | 'unavailable';

export interface UseGeoLocationReturn {
  location: GeoLocation;
  permission: GeoPermission;
  isLoading: boolean;
  /** Re-request GPS permission (e.g. after a prior denial) */
  retry: () => void;
  /** Manually pin a location and persist it to localStorage */
  setManualLocation: (loc: GeoLocation) => void;
  /** Clear the manual pin and revert to GPS / Cambridge fallback */
  clearManualLocation: () => void;
}

const LS_KEY = 'skoll_home_station_v2';

const CAMBRIDGE_FALLBACK: GeoLocation = {
  lat: 52.2053,
  lon: 0.1218,
  name: 'Cambridge, UK',
  isUserLocation: false,
};

/** Read a saved location from localStorage (null if absent or corrupt) */
function loadSaved(): GeoLocation | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GeoLocation;
    // Basic sanity check
    if (typeof parsed.lat === 'number' && typeof parsed.lon === 'number') return parsed;
  } catch (_) {}
  return null;
}

export function useGeoLocation(): UseGeoLocationReturn {
  // Initialise from localStorage so the UI never flickers to Cambridge on reload
  const [location, setLocation] = useState<GeoLocation>(() => loadSaved() ?? CAMBRIDGE_FALLBACK);
  const [permission, setPermission] = useState<GeoPermission>('prompt');
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!navigator?.geolocation) {
      setPermission('unavailable');
      // Keep whatever localStorage has (or Cambridge)
      if (!loadSaved()) setLocation(CAMBRIDGE_FALLBACK);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const resolved: GeoLocation = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          name: 'Your Location',
          isUserLocation: true,
        };
        setLocation(resolved);
        setPermission('granted');
        setIsLoading(false);
        // Persist GPS fix to localStorage
        localStorage.setItem(LS_KEY, JSON.stringify(resolved));
      },
      () => {
        setPermission('denied');
        // Fall back to saved or Cambridge — do NOT overwrite a valid saved pin
        if (!loadSaved()) {
          setLocation(CAMBRIDGE_FALLBACK);
        }
        setIsLoading(false);
      },
      { timeout: 8000, maximumAge: 300_000, enableHighAccuracy: false }
    );
  }, [retryCount]);

  const retry = () => setRetryCount((n) => n + 1);

  const setManualLocation = (loc: GeoLocation) => {
    const pinned: GeoLocation = { ...loc, isUserLocation: true };
    localStorage.setItem(LS_KEY, JSON.stringify(pinned));
    setLocation(pinned);
    setPermission('granted');
  };

  const clearManualLocation = () => {
    localStorage.removeItem(LS_KEY);
    setLocation(CAMBRIDGE_FALLBACK);
    setPermission('denied');
    // Re-attempt GPS
    setRetryCount((n) => n + 1);
  };

  return { location, permission, isLoading, retry, setManualLocation, clearManualLocation };
}
