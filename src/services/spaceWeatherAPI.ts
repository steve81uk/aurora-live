/**
 * API Service Layer for Space Weather Data
 * Integrates multiple free APIs with caching and error handling
 */

// NOAA Space Weather Prediction Center API endpoints
export const NOAA_API = {
  // Real-time data (1-minute resolution)
  PLASMA_1MIN: 'https://services.swpc.noaa.gov/json/rtsw/rtsw_plasma_1m.json',
  MAG_1MIN: 'https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json',
  
  // Forecasts
  FORECAST_3DAY: 'https://services.swpc.noaa.gov/products/3-day-forecast.json',
  KP_INDEX: 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',
  
  // Aurora oval
  OVATION_AURORA: 'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json',
  
  // Solar data
  SOLAR_REGIONS: 'https://services.swpc.noaa.gov/json/solar_regions.json',
  XRAY_FLARES: 'https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json',
};

// NASA DONKI (Database Of Notifications, Knowledge, Information)
export const NASA_DONKI_API = {
  BASE_URL: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get',
  
  // Event types
  CME: (startDate: string, endDate: string) => 
    `${NASA_DONKI_API.BASE_URL}/CME?startDate=${startDate}&endDate=${endDate}`,
  
  FLARE: (startDate: string, endDate: string) => 
    `${NASA_DONKI_API.BASE_URL}/FLR?startDate=${startDate}&endDate=${endDate}`,
  
  STORM: (startDate: string, endDate: string) => 
    `${NASA_DONKI_API.BASE_URL}/GST?startDate=${startDate}&endDate=${endDate}`,
  
  SEP: (startDate: string, endDate: string) => 
    `${NASA_DONKI_API.BASE_URL}/SEP?startDate=${startDate}&endDate=${endDate}`,
};

// NASA SDO (Solar Dynamics Observatory) - Live Sun Images
export const NASA_SDO_API = {
  BASE_URL: 'https://sdo.gsfc.nasa.gov/assets/img/latest',
  
  getImage: (wavelength: '0193' | '0304' | '0171' | 'HMIB', size: 1024 | 2048 | 4096 = 1024) => 
    `${NASA_SDO_API.BASE_URL}/latest_${size}_${wavelength}.jpg`,
};

// ISS Tracking
export const ISS_API = {
  POSITION: 'https://api.wheretheiss.at/v1/satellites/25544',
  PASSES: (lat: number, lon: number, alt: number = 0) => 
    `https://api.wheretheiss.at/v1/satellites/25544/passes?lat=${lat}&lon=${lon}&altitude=${alt}`,
};

// Interface definitions
export interface NOAAPlasmaData {
  time_tag: string;
  density: number;
  speed: number;
  temperature: number;
}

export interface NOAAMagData {
  time_tag: string;
  bx_gsm: number;
  by_gsm: number;
  bz_gsm: number;
  bt: number;
  phi_gsm: number;
  theta_gsm: number;
}

export interface DONKIEvent {
  activityID: string;
  startTime: string;
  linkedEvents?: Array<{ activityID: string }>;
  instruments?: Array<{ displayName: string }>;
  cmeAnalyses?: Array<{
    speed: number;
    type: string;
    isMostAccurate: boolean;
    levelOfData: number;
  }>;
}

export interface CMEEvent extends DONKIEvent {
  cmeAnalyses: Array<{
    speed: number;
    latitude: number;
    longitude: number;
    halfAngle: number;
    time21_5: string;
    type: string;
    isMostAccurate: boolean;
    levelOfData: number;
  }>;
}

export interface FlareEvent extends DONKIEvent {
  classType: string; // X, M, C, B, A
  sourceLocation: string;
  activeRegionNum: number;
  linkedEvents: Array<{ activityID: string }>;
}

export interface StormEvent extends DONKIEvent {
  gstID: string;
  startTime: string;
  allKpIndex: Array<{
    observedTime: string;
    kpIndex: number;
    source: string;
  }>;
}

/**
 * Fetch NOAA real-time plasma data
 */
export async function fetchNOAAPlasma(): Promise<NOAAPlasmaData[]> {
  try {
    const response = await fetch(NOAA_API.PLASMA_1MIN);
    if (!response.ok) throw new Error(`NOAA Plasma API: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch NOAA plasma data:', error);
    throw error;
  }
}

/**
 * Fetch NOAA real-time magnetic field data
 */
export async function fetchNOAAMagField(): Promise<NOAAMagData[]> {
  try {
    const response = await fetch(NOAA_API.MAG_1MIN);
    if (!response.ok) throw new Error(`NOAA Mag API: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch NOAA mag data:', error);
    throw error;
  }
}

/**
 * Fetch NASA DONKI CME events
 */
export async function fetchDONKICMEs(daysBack: number = 7): Promise<CMEEvent[]> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    const response = await fetch(NASA_DONKI_API.CME(startStr, endStr));
    if (!response.ok) throw new Error(`DONKI CME API: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch DONKI CMEs:', error);
    return [];
  }
}

/**
 * Fetch NASA DONKI Solar Flare events
 */
export async function fetchDONKIFlares(daysBack: number = 7): Promise<FlareEvent[]> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    const response = await fetch(NASA_DONKI_API.FLARE(startStr, endStr));
    if (!response.ok) throw new Error(`DONKI Flare API: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch DONKI flares:', error);
    return [];
  }
}

/**
 * Fetch NASA DONKI Geomagnetic Storm events
 */
export async function fetchDONKIStorms(daysBack: number = 30): Promise<StormEvent[]> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    const response = await fetch(NASA_DONKI_API.STORM(startStr, endStr));
    if (!response.ok) throw new Error(`DONKI Storm API: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch DONKI storms:', error);
    return [];
  }
}

/**
 * Fetch ISS current position
 */
export async function fetchISSPosition(): Promise<{
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
  timestamp: number;
}> {
  try {
    const response = await fetch(ISS_API.POSITION);
    if (!response.ok) throw new Error(`ISS API: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch ISS position:', error);
    throw error;
  }
}

/**
 * Cache manager for API responses
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlMinutes: number = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const apiCache = new APICache();

/**
 * Cached fetch wrapper with exponential backoff
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMinutes: number = 5,
  maxRetries: number = 3
): Promise<T> {
  // Check cache first
  const cached = apiCache.get<T>(key);
  if (cached) {
    console.log(`✅ Cache HIT: ${key}`);
    return cached;
  }

  // Fetch with retry logic
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const data = await fetcher();
      apiCache.set(key, data, ttlMinutes);
      console.log(`✅ API SUCCESS: ${key}`);
      return data;
    } catch (error) {
      lastError = error as Error;
      const delayMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      console.warn(`⚠️ API RETRY ${attempt + 1}/${maxRetries}: ${key} (waiting ${delayMs}ms)`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.error(`❌ API FAILED after ${maxRetries} attempts: ${key}`, lastError);
  throw lastError;
}
