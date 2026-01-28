import { useState, useEffect, useCallback } from 'react';
import { fetchKpIndex, fetchSolarWind, fetchAuroraForecast } from '../services/noaa';
import { getAuroraVisibility } from '../utils/visibility';
import type { Location, KpIndexData, SolarWind, ForecastData, AuroraVisibility } from '../types/aurora';

interface AuroraData {
  kpIndex: KpIndexData | null;
  solarWind: SolarWind | null;
  forecast: ForecastData | null;
}

interface UseAuroraDataReturn {
  data: AuroraData;
  loading: boolean;
  error: string | null;
  visibility: AuroraVisibility | null;
  refetch: () => Promise<void>;
}

const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

export function useAuroraData(location: Location): UseAuroraDataReturn {
  const [data, setData] = useState<AuroraData>({
    kpIndex: null,
    solarWind: null,
    forecast: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<AuroraVisibility | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [kpIndex, solarWind, forecast] = await Promise.all([
        fetchKpIndex(),
        fetchSolarWind(),
        fetchAuroraForecast()
      ]);

      // Update data state
      setData({
        kpIndex,
        solarWind,
        forecast
      });

      // Calculate visibility for the current location
      const vis = getAuroraVisibility(kpIndex.kpValue, location.magneticLat);
      setVisibility(vis);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch aurora data';
      setError(errorMessage);
      console.error('Aurora data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [location]);

  // Fetch data on mount and when location changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up automatic refresh every 15 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    visibility,
    refetch: fetchData
  };
}
