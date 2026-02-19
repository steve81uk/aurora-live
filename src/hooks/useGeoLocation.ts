/**
 * useGeoLocation — Browser Geolocation with Cambridge Fallback
 *
 * Requests the user's current position via the Geolocation API.
 * If permission is denied or the API is unavailable, falls back
 * to Cambridge, UK (52.2053° N, 0.1218° E) — home of Systems Architect steve81uk.
 *
 * @author steve81uk
 */

import { useState, useEffect } from 'react';

export interface GeoLocation {
  lat: number;
  lon: number;
  name: string;
  isUserLocation: boolean; // true = real GPS, false = Cambridge fallback
}

export type GeoPermission = 'prompt' | 'granted' | 'denied' | 'unavailable';

export interface UseGeoLocationReturn {
  location: GeoLocation;
  permission: GeoPermission;
  isLoading: boolean;
  /** Re-request permission after a previous denial */
  retry: () => void;
}

const CAMBRIDGE_FALLBACK: GeoLocation = {
  lat: 52.2053,
  lon: 0.1218,
  name: 'Cambridge, UK',
  isUserLocation: false,
};

export function useGeoLocation(): UseGeoLocationReturn {
  const [location, setLocation] = useState<GeoLocation>(CAMBRIDGE_FALLBACK);
  const [permission, setPermission] = useState<GeoPermission>('prompt');
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!navigator?.geolocation) {
      setPermission('unavailable');
      setLocation(CAMBRIDGE_FALLBACK);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          name: 'Your Location',
          isUserLocation: true,
        });
        setPermission('granted');
        setIsLoading(false);
      },
      () => {
        setPermission('denied');
        setLocation(CAMBRIDGE_FALLBACK);
        setIsLoading(false);
      },
      { timeout: 8000, maximumAge: 300_000, enableHighAccuracy: false }
    );
  }, [retryCount]);

  const retry = () => setRetryCount((n) => n + 1);

  return { location, permission, isLoading, retry };
}
