import type { KpIndexData, SolarWind, ForecastData } from '../types/aurora';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const MOCK_KP_DATA: KpIndexData = {
  id: 'mock-kp',
  timestamp: new Date().toISOString(),
  kpValue: 4.6,
  status: 'unsettled'
};

const MOCK_SOLAR_WIND: SolarWind = {
  speed: 450,
  density: 5.0,
  bz: -3.5
};

const MOCK_FORECAST_DATA: ForecastData = {
  current: {
    id: 'mock-kp-current',
    timestamp: new Date().toISOString(),
    kpValue: 4.6,
    status: 'unsettled'
  },
  prediction: Array.from({ length: 8 }, (_, idx) => ({
    id: `mock-kp-pred-${idx}`,
    timestamp: new Date(Date.now() + idx * 3 * 60 * 60 * 1000).toISOString(),
    kpValue: 4.6 + (Math.random() - 0.5) * 2,
    status: getKpStatus(4.6 + (Math.random() - 0.5) * 2)
  }))
};

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function fetchKpIndex(): Promise<KpIndexData> {
  const cacheKey = 'kp-index';
  const cached = getCached<KpIndexData>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Kp index: ${response.status} ${response.statusText}`);
    }

    const rawData = await response.json();
    
    if (!Array.isArray(rawData) || rawData.length < 2) {
      throw new Error('Invalid Kp index data format');
    }

    const latestEntry = rawData[rawData.length - 1];
    
    const kpData: KpIndexData = {
      id: `kp-${Date.now()}`,
      timestamp: latestEntry[0],
      kpValue: parseFloat(latestEntry[1]),
      status: getKpStatus(parseFloat(latestEntry[1]))
    };

    if (typeof kpData.kpValue !== 'number' || isNaN(kpData.kpValue)) {
      throw new Error('Invalid Kp value');
    }

    setCache(cacheKey, kpData);
    return kpData;
  } catch (error) {
    console.warn('API failed, using mock Kp data:', error instanceof Error ? error.message : 'Unknown error');
    return MOCK_KP_DATA;
  }
}

export async function fetchSolarWind(): Promise<SolarWind> {
  const cacheKey = 'solar-wind';
  const cached = getCached<SolarWind>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch('https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch solar wind: ${response.status} ${response.statusText}`);
    }

    const rawData = await response.json();
    
    if (!Array.isArray(rawData) || rawData.length < 2) {
      throw new Error('Invalid solar wind data format');
    }

    const latestEntry = rawData[rawData.length - 1];
    
    const solarWind: SolarWind = {
      speed: parseFloat(latestEntry[6]) || 0,
      density: parseFloat(latestEntry[7]) || 0,
      bz: parseFloat(latestEntry[3]) || 0
    };

    if (typeof solarWind.speed !== 'number' || typeof solarWind.density !== 'number' || typeof solarWind.bz !== 'number') {
      throw new Error('Invalid solar wind values');
    }

    setCache(cacheKey, solarWind);
    return solarWind;
  } catch (error) {
    console.warn('API failed, using mock solar wind data:', error instanceof Error ? error.message : 'Unknown error');
    return MOCK_SOLAR_WIND;
  }
}

export async function fetchAuroraForecast(): Promise<ForecastData> {
  const cacheKey = 'aurora-forecast';
  const cached = getCached<ForecastData>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch aurora forecast: ${response.status} ${response.statusText}`);
    }

    const rawData = await response.json();
    
    if (!Array.isArray(rawData) || rawData.length < 2) {
      throw new Error('Invalid forecast data format');
    }

    const dataEntries = rawData.slice(1);
    const current = dataEntries[dataEntries.length - 1];
    
    const forecastData: ForecastData = {
      current: {
        id: `kp-current-${Date.now()}`,
        timestamp: current[0],
        kpValue: parseFloat(current[1]),
        status: getKpStatus(parseFloat(current[1]))
      },
      prediction: dataEntries.slice(-8).map((entry, idx) => ({
        id: `kp-pred-${idx}`,
        timestamp: entry[0],
        kpValue: parseFloat(entry[1]),
        status: getKpStatus(parseFloat(entry[1]))
      }))
    };

    setCache(cacheKey, forecastData);
    return forecastData;
  } catch (error) {
    console.warn('API failed, using mock forecast data:', error instanceof Error ? error.message : 'Unknown error');
    return MOCK_FORECAST_DATA;
  }
}

function getKpStatus(kpValue: number): string {
  if (kpValue < 4) return 'quiet';
  if (kpValue < 5) return 'unsettled';
  if (kpValue < 6) return 'active';
  if (kpValue < 7) return 'minor storm';
  if (kpValue < 8) return 'moderate storm';
  if (kpValue < 9) return 'strong storm';
  return 'severe storm';
}
