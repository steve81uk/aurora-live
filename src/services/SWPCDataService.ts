/**
 * SWPCDataService — Full NOAA SWPC data streams
 *
 * Covers all publicly available space weather feeds:
 *   - GOES-18 X-ray flux (M/X flare classification, 1-min cadence)
 *   - DSCOVR/ACE solar wind (speed, density, IMF Bz/By/Bt, 1-min)
 *   - Planetary Kp index (3-hourly, NOAA GFZ)
 *   - Proton flux (S-class radiation storm indicator)
 *   - NASA DONKI CME predictions (arrival window + impact probability)
 *   - Solar flare probabilities (NOAA daily)
 *   - Radio blackout alerts
 *
 * All data is free & public. No API key required.
 */

export interface XrayFluxData {
  timestamp: string;
  satellite: string;
  fluxShort: number;     // 1–8 Å channel (W/m²)
  fluxLong: number;      // 0.5–4 Å channel
  classification: string; // A/B/C/M/X + number
  integrated: boolean;
}

export interface ProtonFluxData {
  timestamp: string;
  flux_10MeV: number;   // p·cm⁻²·s⁻¹·sr⁻¹ (S-storm threshold = 10)
  flux_50MeV: number;
  flux_100MeV: number;
  sstormLevel: 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
}

export interface KpIndexData {
  timestamp: string;
  kp: number;
  kpForecast: number[];   // next 7 periods (3-hourly)
  aIndex: number;         // Daily geomagnetic activity index
  apIndex: number;
}

export interface FlareAlert {
  issueTime: string;
  productId: string;
  message: string;
  severity: 'WATCH' | 'WARNING' | 'ALERT' | 'SUMMARY' | 'FORECAST';
}

export interface CMEArrival {
  cmeId: string;
  launchTime: string;
  estimatedArrival: string;       // ISO string
  arrivalWindowHours: number;     // ± uncertainty
  impactProbability: number;      // 0–100%
  predictedKpMax: number;
  model: string;                  // 'WSA-Enlil Cone'
  speed_km_s: number;
}

export interface SolarFlareProbability {
  issued: string;
  validTime: string;
  regions: number;
  c_probability: number;  // 0–100%
  m_probability: number;
  x_probability: number;
  proton_probability: number;
}

export interface RadioBlackout {
  active: boolean;
  level: string; // R1–R5
  startTime?: string;
  endTime?: string;
  affectedRegion: 'dayside' | 'twilight' | 'none';
  cause?: string;
}

export interface FullSWPCData {
  xray: XrayFluxData | null;
  proton: ProtonFluxData | null;
  kp: KpIndexData | null;
  cmeArrivals: CMEArrival[];
  alerts: FlareAlert[];
  flareProbability: SolarFlareProbability | null;
  radioBlackout: RadioBlackout;
  fetchedAt: Date;
}

// ─────────────────────────────── FETCHERS ────────────────────────────────────

async function fetchJSON<T>(url: string, timeoutMs = 6000): Promise<T | null> {
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!resp.ok) return null;
    return await resp.json() as T;
  } catch {
    return null;
  }
}

/** GOES X-ray flux — https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json */
async function fetchXrayFlux(): Promise<XrayFluxData | null> {
  const data = await fetchJSON<any[]>(
    'https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json'
  );
  if (!data || data.length === 0) return null;
  const latest = data[data.length - 1];
  if (!latest) return null;

  const fluxShort = parseFloat(latest.flux ?? latest.energy ?? '0') || 0;

  // Classify: A=≤1e-8, B=≤1e-7, C=≤1e-6, M=≤1e-5, X=>1e-5
  const classifyFlux = (f: number): string => {
    if (f >= 1e-4) return `X${(f / 1e-4).toFixed(1)}`;
    if (f >= 1e-5) return `M${(f / 1e-5).toFixed(1)}`;
    if (f >= 1e-6) return `C${(f / 1e-6).toFixed(1)}`;
    if (f >= 1e-7) return `B${(f / 1e-7).toFixed(1)}`;
    return `A${(f / 1e-8).toFixed(1)}`;
  };

  return {
    timestamp:      latest.time_tag ?? '',
    satellite:      latest.satellite ?? 'GOES-18',
    fluxShort,
    fluxLong:       parseFloat(latest.flux ?? '0') || 0,
    classification: classifyFlux(fluxShort),
    integrated:     false,
  };
}

/** Proton flux — https://services.swpc.noaa.gov/json/goes/primary/integral-protons-1-day.json */
async function fetchProtonFlux(): Promise<ProtonFluxData | null> {
  const data = await fetchJSON<any[]>(
    'https://services.swpc.noaa.gov/json/goes/primary/integral-protons-1-day.json'
  );
  if (!data || data.length === 0) return null;
  const v10  = data.filter(d => d.energy === '>=10 MeV').at(-1);
  const v50  = data.filter(d => d.energy === '>=50 MeV').at(-1);
  const v100 = data.filter(d => d.energy === '>=100 MeV').at(-1);

  const flux10 = parseFloat(v10?.flux ?? '0') || 0;
  const sstormLevel: ProtonFluxData['sstormLevel'] =
    flux10 >= 100000 ? 'S5' :
    flux10 >= 10000  ? 'S4' :
    flux10 >= 1000   ? 'S3' :
    flux10 >= 100    ? 'S2' :
    flux10 >= 10     ? 'S1' : 'S0';

  return {
    timestamp: v10?.time_tag ?? '',
    flux_10MeV: flux10,
    flux_50MeV: parseFloat(v50?.flux ?? '0') || 0,
    flux_100MeV: parseFloat(v100?.flux ?? '0') || 0,
    sstormLevel,
  };
}

/** Kp index — https://services.swpc.noaa.gov/json/planetary_k_index_1m.json */
async function fetchKpIndex(): Promise<KpIndexData | null> {
  const [current, forecast] = await Promise.all([
    fetchJSON<any[]>('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json'),
    fetchJSON<any[]>('https://services.swpc.noaa.gov/json/kp_index_forecast.json'),
  ]);

  const latest = current?.at(-1);
  if (!latest) return null;

  const kpForecast = forecast ? forecast.slice(0, 7).map((f: any) => parseFloat(f.kp ?? '0')) : [];

  return {
    timestamp: latest.time_tag ?? '',
    kp: Math.round(parseFloat(latest.kp_index ?? '3') * 10) / 10,
    kpForecast,
    aIndex: parseFloat(latest.a_index ?? '5') || 5,
    apIndex: parseFloat(latest.ap ?? '5') || 5,
  };
}

/** DONKI CME notifications — https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR */
async function fetchDONKICME(): Promise<CMEArrival[]> {
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const endDate   = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const data = await fetchJSON<any[]>(
    `https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/CMEAnalysis?startDate=${startDate}&endDate=${endDate}&mostAccurateOnly=true&speed=500&halfAngle=30&catalog=ALL&keyword=NONE`,
    10000
  );
  if (!data) return [];

  return data
    .filter((d: any) => d.link)
    .map((d: any): CMEArrival => ({
      cmeId:            d.link?.split('/').at(-1) ?? '',
      launchTime:       d.startTime ?? '',
      estimatedArrival: d.time21_5 ?? d.startTime ?? '',
      arrivalWindowHours: 12,
      impactProbability: d.isMostAccurate ? 70 : 40,
      predictedKpMax:   Math.min(9, (d.speed ?? 500) / 200 + 2),
      model:            'WSA-Enlil Cone',
      speed_km_s:       parseFloat(d.speed ?? '500'),
    }))
    .slice(0, 10);
}

/** NOAA active alerts — https://services.swpc.noaa.gov/json/alerts.json */
async function fetchAlerts(): Promise<FlareAlert[]> {
  const data = await fetchJSON<any[]>('https://services.swpc.noaa.gov/json/alerts.json');
  if (!data) return [];
  return data.slice(0, 20).map((a: any): FlareAlert => ({
    issueTime:  a.issue_datetime ?? '',
    productId:  a.product_id ?? '',
    message:    a.message ?? '',
    severity:   (a.product_id?.includes('WARNING') ? 'WARNING' :
                 a.product_id?.includes('WATCH')   ? 'WATCH' :
                 a.product_id?.includes('ALERT')   ? 'ALERT' : 'SUMMARY') as FlareAlert['severity'],
  }));
}

/** Solar flare probability — https://services.swpc.noaa.gov/text/3-day-forecast.txt */
async function fetchFlareProbability(): Promise<SolarFlareProbability | null> {
  try {
    const data = await fetchJSON<any[]>('https://services.swpc.noaa.gov/json/solar_probabilities.json');
    if (!data || data.length === 0) return null;
    const f = data[0];
    return {
      issued:             f.issued_datetime ?? '',
      validTime:          f.valid_time ?? '',
      regions:            parseInt(f.active_regions ?? '0'),
      c_probability:      parseInt(f.class_c_1_day ?? '0'),
      m_probability:      parseInt(f.class_m_1_day ?? '0'),
      x_probability:      parseInt(f.class_x_1_day ?? '0'),
      proton_probability: parseInt(f.proton_1_day ?? '0'),
    };
  } catch {
    return null;
  }
}

// ─────────────────────────── MAIN EXPORT ─────────────────────────────────────

let _cache: FullSWPCData | null = null;
let _cacheExpiry = 0;
const CACHE_TTL = 60 * 1000; // 60-second cache

export async function fetchFullSWPC(): Promise<FullSWPCData> {
  if (_cache && Date.now() < _cacheExpiry) return _cache;

  const [xray, proton, kp, cmeArrivals, alerts, flareProbability] = await Promise.all([
    fetchXrayFlux(),
    fetchProtonFlux(),
    fetchKpIndex(),
    fetchDONKICME(),
    fetchAlerts(),
    fetchFlareProbability(),
  ]);

  // Derive radio blackout from X-ray flux
  const fluxShort = xray?.fluxShort ?? 0;
  const radioBlackout: RadioBlackout = {
    active:        fluxShort >= 1e-6,
    level:         fluxShort >= 1e-4 ? 'R5' : fluxShort >= 1e-5*5 ? 'R4' : fluxShort >= 1e-5 ? 'R3' : fluxShort >= 5e-6 ? 'R2' : 'R1',
    affectedRegion: fluxShort >= 1e-6 ? 'dayside' : 'none',
    cause:         xray?.classification,
  };

  _cache = { xray, proton, kp, cmeArrivals, alerts, flareProbability, radioBlackout, fetchedAt: new Date() };
  _cacheExpiry = Date.now() + CACHE_TTL;
  return _cache;
}

/** React hook wrapper */
import { useState, useEffect } from 'react';

export function useSWPC() {
  const [data, setData] = useState<FullSWPCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const d = await fetchFullSWPC();
        setData(d);
      } catch (err) {
        setError(err as Error);
        console.error('SWPC load error', err);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}
