/**
 * Live Space Weather Data Service
 * Provides unified real-time data from multiple NOAA/NASA sources with auto-refresh
 * Implements 60-second polling with error fallbacks and caching
 */

export interface LiveSpaceWeatherData {
  kpIndex: number;
  solarWind: {
    speed: number;      // km/s
    density: number;    // particles/cm³
    temperature: number; // Kelvin
    bz: number;         // nanoTesla (IMF Bz component)
    bt: number;         // nanoTesla (IMF magnitude)
  };
  geomagnetic: {
    stormLevel: string; // 'quiet' | 'active' | 'minor' | 'moderate' | 'strong' | 'severe'
    planetaryA: number; // Planetary A-index
    dstIndex: number;   // Disturbance Storm Time (estimated)
  };
  solar: {
    solarFluxF107: number; // 10.7cm radio flux (SFU)
    sunspotNumber: number;
    xrayFlux: string;      // Class (A, B, C, M, X)
  };
  alerts: Array<{
    id: string;
    type: 'CME' | 'flare' | 'storm' | 'radiation';
    severity: 'watch' | 'warning' | 'alert';
    message: string;
    timestamp: string;
  }>;
  timestamp: Date;
  dataQuality: 'excellent' | 'good' | 'degraded' | 'fallback';
}

// Singleton state for auto-refresh
let refreshInterval: number | null = null;
let currentData: LiveSpaceWeatherData | null = null;
let listeners: Array<(data: LiveSpaceWeatherData) => void> = [];
let isRefreshing = false;

/**
 * Fetch real-time Kp Index from NOAA SWPC
 */
async function fetchKpData(): Promise<{ kp: number; planetaryA: number }> {
  try {
    const response = await fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json');
    if (!response.ok) throw new Error(`KP API failed: ${response.status}`);
    
    const data = await response.json();
    const latest = data[data.length - 1];
    
    return {
      kp: parseFloat(latest.kp_index) || 3,
      planetaryA: parseFloat(latest.a_running) || 10
    };
  } catch (error) {
    console.warn('KP fetch failed:', error);
    return { kp: 3, planetaryA: 10 };
  }
}

/**
 * Fetch real-time Solar Wind data from NOAA
 */
async function fetchSolarWindData() {
  try {
    const response = await fetch('https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json');
    if (!response.ok) throw new Error(`Solar wind API failed: ${response.status}`);
    
    const data = await response.json();
    const latest = data[data.length - 1];
    
    return {
      speed: parseFloat(latest.wind_speed) || 400,
      density: parseFloat(latest.density) || 5,
      temperature: parseFloat(latest.temperature) || 100000,
      bz: parseFloat(latest.bz) || 0,
      bt: parseFloat(latest.bt) || 5
    };
  } catch (error) {
    console.warn('Solar wind fetch failed:', error);
    return { speed: 400, density: 5, temperature: 100000, bz: 0, bt: 5 };
  }
}

/**
 * Fetch Solar Activity data (F10.7, sunspot number, X-ray)
 */
async function fetchSolarActivity() {
  try {
    // F10.7 flux
    const f107Response = await fetch('https://services.swpc.noaa.gov/json/f107_cm_flux.json');
    const f107Data = await f107Response.json();
    const latestF107 = f107Data[f107Data.length - 1];
    
    // X-ray flux
    const xrayResponse = await fetch('https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json');
    const xrayData = await xrayResponse.json();
    const latestXray = xrayData[xrayData.length - 1];
    
    return {
      solarFluxF107: parseFloat(latestF107.flux) || 150,
      sunspotNumber: Math.floor((parseFloat(latestF107.flux) - 63) / 0.88) || 50, // Estimated from F10.7
      xrayFlux: latestXray?.current_class || 'A1.0'
    };
  } catch (error) {
    console.warn('Solar activity fetch failed:', error);
    return { solarFluxF107: 150, sunspotNumber: 50, xrayFlux: 'A1.0' };
  }
}

/**
 * Fetch active space weather alerts
 */
async function fetchAlerts() {
  try {
    const response = await fetch('https://services.swpc.noaa.gov/products/alerts.json');
    if (!response.ok) throw new Error(`Alerts API failed: ${response.status}`);
    
    const data = await response.json();
    
    return data.slice(0, 5).map((alert: any, idx: number) => ({
      id: `alert-${Date.now()}-${idx}`,
      type: categorizeAlert(alert.message),
      severity: determineSeverity(alert.message),
      message: alert.message,
      timestamp: alert.issue_datetime
    }));
  } catch (error) {
    console.warn('Alerts fetch failed:', error);
    return [];
  }
}

function categorizeAlert(message: string): 'CME' | 'flare' | 'storm' | 'radiation' {
  const msg = message.toLowerCase();
  if (msg.includes('cme') || msg.includes('coronal')) return 'CME';
  if (msg.includes('flare') || msg.includes('x-ray')) return 'flare';
  if (msg.includes('geomagnetic') || msg.includes('storm')) return 'storm';
  if (msg.includes('radiation') || msg.includes('proton')) return 'radiation';
  return 'storm';
}

function determineSeverity(message: string): 'watch' | 'warning' | 'alert' {
  const msg = message.toLowerCase();
  if (msg.includes('watch')) return 'watch';
  if (msg.includes('warning')) return 'warning';
  if (msg.includes('alert')) return 'alert';
  return 'watch';
}

function getStormLevel(kp: number): string {
  if (kp < 4) return 'quiet';
  if (kp < 5) return 'active';
  if (kp < 6) return 'minor';
  if (kp < 7) return 'moderate';
  if (kp < 8) return 'strong';
  return 'severe';
}

function estimateDst(kp: number, solarWindSpeed: number, bz: number): number {
  // Rough estimation: DST ≈ -30 * (Kp - 3) - (bz < 0 ? bz * 10 : 0)
  const baseDst = -30 * Math.max(0, kp - 3);
  const bzContribution = bz < 0 ? bz * 10 : 0;
  return Math.max(-500, baseDst + bzContribution);
}

/**
 * Main fetch function - gets all data from multiple sources
 */
export async function fetchLiveSpaceWeather(): Promise<LiveSpaceWeatherData> {
  if (isRefreshing) {
    // Return cached data if refresh already in progress
    return currentData || getFallbackData();
  }
  
  isRefreshing = true;
  let dataQuality: 'excellent' | 'good' | 'degraded' | 'fallback' = 'excellent';
  
  try {
    // Fetch all data sources in parallel
    const [kpData, solarWind, solarActivity, alerts] = await Promise.allSettled([
      fetchKpData(),
      fetchSolarWindData(),
      fetchSolarActivity(),
      fetchAlerts()
    ]);
    
    // Check data quality
    const failedSources = [kpData, solarWind, solarActivity, alerts].filter(
      result => result.status === 'rejected'
    ).length;
    
    if (failedSources === 0) dataQuality = 'excellent';
    else if (failedSources === 1) dataQuality = 'good';
    else if (failedSources === 2) dataQuality = 'degraded';
    else dataQuality = 'fallback';
    
    // Extract successful data or use defaults
    const kp = kpData.status === 'fulfilled' ? kpData.value : { kp: 3, planetaryA: 10 };
    const wind = solarWind.status === 'fulfilled' ? solarWind.value : { speed: 400, density: 5, temperature: 100000, bz: 0, bt: 5 };
    const solar = solarActivity.status === 'fulfilled' ? solarActivity.value : { solarFluxF107: 150, sunspotNumber: 50, xrayFlux: 'A1.0' };
    const alertsList = alerts.status === 'fulfilled' ? alerts.value : [];
    
    const newData: LiveSpaceWeatherData = {
      kpIndex: kp.kp,
      solarWind: wind,
      geomagnetic: {
        stormLevel: getStormLevel(kp.kp),
        planetaryA: kp.planetaryA,
        dstIndex: estimateDst(kp.kp, wind.speed, wind.bz)
      },
      solar: solar,
      alerts: alertsList,
      timestamp: new Date(),
      dataQuality
    };
    
    currentData = newData;
    isRefreshing = false;
    
    // Notify all listeners
    notifyListeners(newData);
    
    return newData;
    
  } catch (error) {
    console.error('Critical error fetching space weather:', error);
    isRefreshing = false;
    const fallback = getFallbackData();
    currentData = fallback;
    notifyListeners(fallback);
    return fallback;
  }
}

function getFallbackData(): LiveSpaceWeatherData {
  return {
    kpIndex: 3,
    solarWind: { speed: 400, density: 5, temperature: 100000, bz: 0, bt: 5 },
    geomagnetic: { stormLevel: 'quiet', planetaryA: 10, dstIndex: 0 },
    solar: { solarFluxF107: 150, sunspotNumber: 50, xrayFlux: 'A1.0' },
    alerts: [],
    timestamp: new Date(),
    dataQuality: 'fallback'
  };
}

/**
 * Start auto-refresh with 60-second interval
 */
export function startAutoRefresh(callback?: (data: LiveSpaceWeatherData) => void): void {
  // Stop any existing interval
  stopAutoRefresh();
  
  if (callback) {
    listeners.push(callback);
  }
  
  // Initial fetch
  fetchLiveSpaceWeather();
  
  // Set up 60-second polling
  refreshInterval = setInterval(() => {
    fetchLiveSpaceWeather();
  }, 60000); // 60 seconds
  
  console.log('🛰️ Live data auto-refresh started (60s interval)');
}

/**
 * Stop auto-refresh
 */
export function stopAutoRefresh(): void {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('⏹️ Live data auto-refresh stopped');
  }
}

/**
 * Subscribe to data updates
 */
export function subscribe(callback: (data: LiveSpaceWeatherData) => void): () => void {
  listeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    listeners = listeners.filter(cb => cb !== callback);
  };
}

/**
 * Get current cached data (synchronous)
 */
export function getCurrentData(): LiveSpaceWeatherData | null {
  return currentData;
}

/**
 * Force immediate refresh
 */
export async function forceRefresh(): Promise<LiveSpaceWeatherData> {
  return fetchLiveSpaceWeather();
}

// Notify all listeners
function notifyListeners(data: LiveSpaceWeatherData): void {
  listeners.forEach(callback => {
    try {
      callback(data);
    } catch (error) {
      console.error('Listener error:', error);
    }
  });
}

// Clean up on module unload (browser only)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
  });
}
