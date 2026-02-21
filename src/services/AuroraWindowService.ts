/**
 * AuroraWindowService — Predictive aurora visibility windows per city
 *
 * Uses the predicted Kp array from SWPCDataService + LSTM forecast and the
 * city's geomagnetic latitude to derive:
 *  - Minimum Kp threshold for visibility
 *  - Next window: "in 4h 22m" (or "NOW" if currently active)
 *  - Duration estimate and confidence %
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface City {
  name: string;
  lat: number;   // geographic latitude (°N)
  lon: number;   // geographic longitude (°E)
  tz?: string;   // IANA timezone (optional display)
}

export interface AuroraWindow {
  city: City;
  /** Minimum Kp required for this city to see aurora */
  kpThreshold: number;
  /** Whether aurora is currently visible */
  activeNow: boolean;
  /** Seconds until next window (-ve means currently active) */
  nextWindowSec: number | null;
  /** Estimated duration of next/current window (seconds) */
  durationSec: number | null;
  /** Confidence 0–1 */
  confidence: number;
  /** Human-readable label e.g. "in 4h 22m" | "NOW" | "None forecast" */
  label: string;
  /** Kp value expected during the window */
  peakKp: number;
}

export interface KpForecastPoint {
  /** ISO timestamp */
  time: string;
  kp: number;
  confidence?: number;   // 0–1
}

// ── Geomagnetic latitude approximation ───────────────────────────────────────
// Uses simplified dipole offset (~79°N 71°W geomagnetic pole)
const GEO_POLE_LAT = 80.65; // °N
const GEO_POLE_LON = -72.68; // °E

function toRad(deg: number) { return (deg * Math.PI) / 180; }
function toDeg(rad: number) { return (rad * 180) / Math.PI; }

function geoToMagLat(lat: number, lon: number): number {
  const φ  = toRad(lat);
  const λ  = toRad(lon);
  const φp = toRad(GEO_POLE_LAT);
  const λp = toRad(GEO_POLE_LON);

  const sinMag =
    Math.sin(φp) * Math.sin(φ) +
    Math.cos(φp) * Math.cos(φ) * Math.cos(λ - λp);
  return toDeg(Math.asin(sinMag));
}

// ── Kp threshold from geomagnetic latitude ────────────────────────────────────
// Published NOAA table (geomag lat 65+°→Kp 0, 55°→3, 50°→4, 40°→5, …)
const KP_THRESHOLD_TABLE: [number, number][] = [
  [65, 0],
  [60, 1],
  [55, 3],
  [50, 4],
  [45, 5],
  [40, 6],
  [35, 7],
  [28, 8],
  [0,  9],
];

function kpThresholdForMagLat(magLat: number): number {
  const absLat = Math.abs(magLat);
  for (const [lat, kp] of KP_THRESHOLD_TABLE) {
    if (absLat >= lat) return kp;
  }
  return 9; // equatorial — essentially impossible
}

// ── Human readable countdown ──────────────────────────────────────────────────
function fmtCountdown(seconds: number): string {
  if (seconds <= 0) return 'NOW';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 48) return `in ${Math.round(h / 24)}d`;
  if (h > 0)  return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

// ── Core calculation ──────────────────────────────────────────────────────────

export function getCityAuroraWindows(
  cities: City[],
  kpForecast: KpForecastPoint[],
): AuroraWindow[] {
  const nowMs = Date.now();

  return cities.map((city) => {
    const magLat     = geoToMagLat(city.lat, city.lon);
    const kpThreshold = kpThresholdForMagLat(magLat);

    // Find the first forecast point where Kp ≥ threshold
    let nextWindowSec: number | null = null;
    let durationSec:   number | null = null;
    let peakKp = 0;
    let confidence = 0;
    let activeNow = false;

    let windowStart: number | null = null;
    let windowKpSum = 0;
    let windowPoints = 0;
    let windowConfSum = 0;

    for (let i = 0; i < kpForecast.length; i++) {
      const pt      = kpForecast[i];
      const ptMs    = new Date(pt.time).getTime();
      const excites = pt.kp >= kpThreshold;

      if (excites) {
        if (windowStart === null) windowStart = ptMs;
        windowKpSum     += pt.kp;
        windowConfSum   += pt.confidence ?? 0.7;
        windowPoints++;
        if (pt.kp > peakKp) peakKp = pt.kp;

        // Check if currently active
        if (ptMs <= nowMs) activeNow = true;

        // Look ahead — find next point to estimate step
        const nextPtMs = kpForecast[i + 1]
          ? new Date(kpForecast[i + 1].time).getTime()
          : ptMs + 3600_000;

        durationSec = durationSec === null
          ? (nextPtMs - ptMs) / 1000
          : durationSec + (nextPtMs - ptMs) / 1000;
      } else {
        if (windowStart !== null && nextWindowSec === null) {
          // Found a complete window — stop after first
          break;
        }
      }

      if (!excites && windowStart === null && nextWindowSec === null) {
        // Still searching for the window start
      }
    }

    // Compute time-to-window
    if (activeNow) {
      nextWindowSec = 0;
    } else if (windowStart !== null) {
      nextWindowSec = Math.max(0, (windowStart - nowMs) / 1000);
    }

    confidence = windowPoints > 0 ? windowConfSum / windowPoints : 0;

    let label: string;
    if (activeNow) {
      label = 'NOW';
    } else if (nextWindowSec !== null) {
      label = fmtCountdown(nextWindowSec);
    } else {
      label = 'None forecast';
    }

    return {
      city,
      kpThreshold,
      activeNow,
      nextWindowSec,
      durationSec,
      confidence,
      label,
      peakKp,
    } satisfies AuroraWindow;
  });
}

// ── Well-known city list ──────────────────────────────────────────────────────

export const AURORA_CITIES: City[] = [
  { name: 'Tromsø',          lat: 69.65,  lon: 18.95,  tz: 'Europe/Oslo' },
  { name: 'Reykjavik',       lat: 64.13,  lon: -21.93, tz: 'Atlantic/Reykjavik' },
  { name: 'Fairbanks',       lat: 64.84,  lon: -147.72,tz: 'America/Anchorage' },
  { name: 'Yellowknife',     lat: 62.45,  lon: -114.37,tz: 'America/Yellowknife' },
  { name: 'Rovaniemi',       lat: 66.50,  lon: 25.73,  tz: 'Europe/Helsinki' },
  { name: 'Murmansk',        lat: 68.97,  lon: 33.07,  tz: 'Europe/Moscow' },
  { name: 'Anchorage',       lat: 61.22,  lon: -149.90,tz: 'America/Anchorage' },
  { name: 'Whitehorse',      lat: 60.72,  lon: -135.05,tz: 'America/Whitehorse' },
  { name: 'Kiruna',          lat: 67.85,  lon: 20.23,  tz: 'Europe/Stockholm' },
  { name: 'Helsinki',        lat: 60.17,  lon: 24.94,  tz: 'Europe/Helsinki' },
  { name: 'Oslo',            lat: 59.91,  lon: 10.75,  tz: 'Europe/Oslo' },
  { name: 'Stockholm',       lat: 59.33,  lon: 18.07,  tz: 'Europe/Stockholm' },
  { name: 'Edinburgh',       lat: 55.95,  lon: -3.19,  tz: 'Europe/London' },
  { name: 'Copenhagen',      lat: 55.68,  lon: 12.57,  tz: 'Europe/Copenhagen' },
  { name: 'Inverness',       lat: 57.48,  lon: -4.22,  tz: 'Europe/London' },
  { name: 'Calgary',         lat: 51.05,  lon: -114.07,tz: 'America/Edmonton' },
  { name: 'Winnipeg',        lat: 49.90,  lon: -97.14, tz: 'America/Winnipeg' },
  { name: 'Berlin',          lat: 52.52,  lon: 13.40,  tz: 'Europe/Berlin' },
  { name: 'London',          lat: 51.51,  lon: -0.13,  tz: 'Europe/London' },
  { name: 'Amsterdam',       lat: 52.37,  lon: 4.90,   tz: 'Europe/Amsterdam' },
  { name: 'Dublin',          lat: 53.33,  lon: -6.25,  tz: 'Europe/Dublin' },
  { name: 'Seattle',         lat: 47.61,  lon: -122.33,tz: 'America/Los_Angeles' },
  { name: 'Minneapolis',     lat: 44.98,  lon: -93.27, tz: 'America/Chicago' },
  { name: 'Chicago',         lat: 41.88,  lon: -87.63, tz: 'America/Chicago' },
  { name: 'New York',        lat: 40.71,  lon: -74.01, tz: 'America/New_York' },
  { name: 'Nuuk',            lat: 64.18,  lon: -51.74, tz: 'America/Nuuk' },
  { name: 'Dunedin',         lat: -45.87, lon: 170.50, tz: 'Pacific/Auckland' },
  { name: 'Hobart',          lat: -42.88, lon: 147.33, tz: 'Australia/Hobart' },
  { name: 'Ushuaia',         lat: -54.80, lon: -68.30, tz: 'America/Argentina/Ushuaia' },
  { name: 'Queenstown',      lat: -45.03, lon: 168.66, tz: 'Pacific/Auckland' },
];

// ── React hook ────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useSWPC } from './SWPCDataService';

export function useAuroraWindows(cities: City[] = AURORA_CITIES): AuroraWindow[] {
  const swpc = useSWPC();
  const [windows, setWindows] = useState<AuroraWindow[]>([]);

  useEffect(() => {
    if (!swpc || !swpc.data) return;

    // Build KpForecastPoint array from the 7-period 3h forecast
    const now = Date.now();
    const kpf = swpc.data.kp?.kpForecast ?? [];
    const forecast: KpForecastPoint[] = kpf.map((kp: number, i: number) => ({
      time: new Date(now + i * 3 * 3600_000).toISOString(),
      kp,
      confidence: 0.85 - i * 0.08, // confidence degrades over time
    }));

    setWindows(getCityAuroraWindows(cities, forecast));
  }, [swpc, cities]);

  return windows;
}
