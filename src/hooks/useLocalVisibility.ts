/**
 * useLocalVisibility Hook
 * Fetches real-time weather data for aurora visibility prediction
 * Integrates OpenWeatherMap API for cloud cover and visibility
 */

import { useState, useEffect } from 'react';

interface WeatherData {
  cloudCover: number; // percentage (0-100)
  visibility: number; // meters
  temperature: number; // celsius
  conditions: string; // description
  icon: string; // weather icon code
  sunrise: number; // unix timestamp
  sunset: number; // unix timestamp
}

interface VisibilityResult {
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  verdict: 'CLEAR' | 'PARTLY_CLOUDY' | 'OVERCAST' | 'UNKNOWN';
  canSeeAurora: boolean;
  isDark: boolean;
}

// Mock API key - replace with real OpenWeatherMap key
const OPENWEATHER_API_KEY = 'YOUR_API_KEY_HERE';

export function useLocalVisibility(lat: number, lon: number): VisibilityResult {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setIsLoading(true);
        
        // For now, use mock data since we don't have a real API key
        // In production, uncomment this:
        /*
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );
        
        if (!response.ok) {
          throw new Error('Weather API request failed');
        }
        
        const data = await response.json();
        
        setWeather({
          cloudCover: data.clouds.all,
          visibility: data.visibility,
          temperature: data.main.temp,
          conditions: data.weather[0].description,
          icon: data.weather[0].icon,
          sunrise: data.sys.sunrise,
          sunset: data.sys.sunset
        });
        */

        // Mock data for development
        setWeather({
          cloudCover: Math.random() * 100,
          visibility: 10000 + Math.random() * 10000,
          temperature: -5 + Math.random() * 10,
          conditions: 'clear sky',
          icon: '01n',
          sunrise: Date.now() / 1000 - 43200, // 12 hours ago
          sunset: Date.now() / 1000 - 3600 // 1 hour ago
        });

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setWeather(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
    
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, [lat, lon]);

  // Calculate verdict
  const verdict = !weather 
    ? 'UNKNOWN'
    : weather.cloudCover < 30 
    ? 'CLEAR' 
    : weather.cloudCover < 70 
    ? 'PARTLY_CLOUDY' 
    : 'OVERCAST';

  // Check if it's dark
  const now = Date.now() / 1000;
  const isDark = weather 
    ? (now < weather.sunrise || now > weather.sunset)
    : true; // Assume dark if no data

  // Can see aurora if clear-ish and dark
  const canSeeAurora = verdict === 'CLEAR' && isDark;

  return {
    weather,
    isLoading,
    error,
    verdict,
    canSeeAurora,
    isDark
  };
}
