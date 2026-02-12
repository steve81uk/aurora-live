/**
 * React Hook for Live Space Weather Data
 * Provides real-time data with 60-second auto-refresh
 */

import { useState, useEffect, useCallback } from 'react';
import {
  startAutoRefresh,
  stopAutoRefresh,
  subscribe,
  getCurrentData,
  forceRefresh,
  type LiveSpaceWeatherData
} from '../services/liveDataService';

interface UseLiveSpaceWeatherReturn {
  data: LiveSpaceWeatherData | null;
  isLoading: boolean;
  lastUpdate: Date | null;
  dataAge: number; // seconds since last update
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

/**
 * Hook to access live space weather data with auto-refresh
 * Automatically starts 60-second polling on mount and cleans up on unmount
 */
export function useLiveSpaceWeather(): UseLiveSpaceWeatherReturn {
  const [data, setData] = useState<LiveSpaceWeatherData | null>(getCurrentData());
  const [isLoading, setIsLoading] = useState(!getCurrentData());
  const [lastUpdate, setLastUpdate] = useState<Date | null>(getCurrentData()?.timestamp || null);
  const [dataAge, setDataAge] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle data updates
  const handleDataUpdate = useCallback((newData: LiveSpaceWeatherData) => {
    setData(newData);
    setLastUpdate(newData.timestamp);
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  // Manual refresh function
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const newData = await forceRefresh();
      handleDataUpdate(newData);
    } catch (error) {
      console.error('Manual refresh failed:', error);
      setIsRefreshing(false);
    }
  }, [handleDataUpdate]);

  // Start auto-refresh on mount
  useEffect(() => {
    // Subscribe to updates
    const unsubscribe = subscribe(handleDataUpdate);
    
    // Start auto-refresh if not already running
    startAutoRefresh(handleDataUpdate);

    // Cleanup on unmount
    return () => {
      unsubscribe();
      // Note: We don't stop auto-refresh here because other components might use it
      // Auto-refresh is a singleton that runs for the entire app lifetime
    };
  }, [handleDataUpdate]);

  // Update data age every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdate) {
        const age = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
        setDataAge(age);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  return {
    data,
    isLoading,
    lastUpdate,
    dataAge,
    refresh,
    isRefreshing
  };
}
