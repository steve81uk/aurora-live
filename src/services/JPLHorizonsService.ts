/**
 * JPLHorizonsService — On-demand precision ephemeris from NASA JPL Horizons REST API
 *
 * Provides sub-arcsecond planetary positions — same data used by NASA mission planners.
 * API docs: https://ssd-api.jpl.nasa.gov/doc/horizons.html
 *
 * Usage:
 *   const pos = await JPLHorizons.getPosition('499', new Date()); // Mars
 *   // Returns { x, y, z } in AU relative to Solar System Barycentre (SSB)
 */

import * as THREE from 'three';
import * as Astronomy from 'astronomy-engine';

const BASE_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const AU_TO_UNITS = 40; // Three.js scene units per AU

/** JPL Horizons body codes for the 8 planets + Pluto */
export const HORIZONS_IDS: Record<string, string> = {
  Mercury: '199',
  Venus:   '299',
  Earth:   '399',
  Mars:    '499',
  Jupiter: '599',
  Saturn:  '699',
  Uranus:  '799',
  Neptune: '899',
  Pluto:   '999',
  ISS:     '-125544',
};

export interface HorizonsPosition {
  x: number; // AU, heliocentric ecliptic
  y: number;
  z: number;
  vx?: number; // AU/day velocity
  vy?: number;
  vz?: number;
  timestamp: Date;
}

/** Cache: body name → { position, expiry } */
const cache = new Map<string, { position: HorizonsPosition; expiry: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15-minute cache (JPL rate-limits aggressively)

export async function getJPLPosition(bodyName: string, date: Date): Promise<THREE.Vector3> {
  const cacheKey = `${bodyName}_${Math.floor(date.getTime() / CACHE_TTL_MS)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return toThreeVec(cached.position);
  }

  const horizonsId = HORIZONS_IDS[bodyName];
  if (!horizonsId) {
    return fallbackAstronomy(bodyName, date);
  }

  try {
    const startTime = formatJPLTime(date);
    const stopTime  = formatJPLTime(new Date(date.getTime() + 60 * 1000)); // +1 min

    const params = new URLSearchParams({
      format:       'json',
      COMMAND:      `'${horizonsId}'`,
      CENTER:       "'@sun'",         // Heliocentric
      MAKE_EPHEM:   'YES',
      EPHEM_TYPE:   'VECTORS',
      VEC_TABLE:    '2',              // x,y,z + vx,vy,vz
      START_TIME:   `'${startTime}'`,
      STOP_TIME:    `'${stopTime}'`,
      STEP_SIZE:    "'1m'",
      VEC_CORR:     'NONE',
      OUT_UNITS:    'AU-D',
      VEC_LABELS:   'NO',
      VEC_DELTA_T:  'NO',
      CSV_FORMAT:   'YES',
      OBJ_DATA:     'NO',
    });

    const resp = await fetch(`${BASE_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(8000),
    });

    if (!resp.ok) throw new Error(`JPL HTTP ${resp.status}`);
    const json = await resp.json();
    const raw: string = json.result ?? '';

    const position = parseHorizonsVectors(raw, date);
    if (position) {
      cache.set(cacheKey, { position, expiry: Date.now() + CACHE_TTL_MS });
      return toThreeVec(position);
    }
  } catch (err) {
    // JPL unreachable — silently fall back to astronomy-engine (still very good)
    console.debug(`[JPL] ${bodyName} fallback:`, err);
  }

  return fallbackAstronomy(bodyName, date);
}

/** Parse the $$SOE ... $$EOE vector block from the JPL CSV response */
function parseHorizonsVectors(raw: string, date: Date): HorizonsPosition | null {
  const soe = raw.indexOf('$$SOE');
  const eoe = raw.indexOf('$$EOE');
  if (soe < 0 || eoe < 0) return null;

  const block = raw.slice(soe + 5, eoe).trim();
  const lines = block.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return null;

  // Row 1: JD, calendar date, X, Y, Z
  const row = lines[1]?.split(',').map(s => s.trim());
  if (!row || row.length < 5) return null;

  const x  = parseFloat(row[2] ?? '0');
  const y  = parseFloat(row[3] ?? '0');
  const z  = parseFloat(row[4] ?? '0');
  const vx = row[5] ? parseFloat(row[5]) : undefined;
  const vy = row[6] ? parseFloat(row[6]) : undefined;
  const vz = row[7] ? parseFloat(row[7]) : undefined;

  if (isNaN(x) || isNaN(y) || isNaN(z)) return null;
  return { x, y, z, vx, vy, vz, timestamp: date };
}

/** Fallback: use astronomy-engine (already excellent — arcsecond accuracy) */
function fallbackAstronomy(bodyName: string, date: Date): THREE.Vector3 {
  try {
    const bodyMap: Record<string, Astronomy.Body> = {
      Mercury: Astronomy.Body.Mercury,
      Venus:   Astronomy.Body.Venus,
      Earth:   Astronomy.Body.Earth,
      Mars:    Astronomy.Body.Mars,
      Jupiter: Astronomy.Body.Jupiter,
      Saturn:  Astronomy.Body.Saturn,
      Uranus:  Astronomy.Body.Uranus,
      Neptune: Astronomy.Body.Neptune,
    };
    const body = bodyMap[bodyName];
    if (!body) return new THREE.Vector3(0, 0, 0);

    const t = Astronomy.MakeTime(date);
    const vec = Astronomy.HelioVector(body, t);
    return new THREE.Vector3(vec.x * AU_TO_UNITS, vec.z * AU_TO_UNITS, vec.y * AU_TO_UNITS);
  } catch {
    return new THREE.Vector3(0, 0, 0);
  }
}

function toThreeVec(p: HorizonsPosition): THREE.Vector3 {
  // JPL uses ecliptic frame: X=vernal equinox, Y=90° in ecliptic plane, Z=north ecliptic pole
  // Map to Three.js (Y-up): swap Z<->Y
  return new THREE.Vector3(p.x * AU_TO_UNITS, p.z * AU_TO_UNITS, p.y * AU_TO_UNITS);
}

function formatJPLTime(date: Date): string {
  const y  = date.getUTCFullYear();
  const mo = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d  = String(date.getUTCDate()).padStart(2, '0');
  const h  = String(date.getUTCHours()).padStart(2, '0');
  const mi = String(date.getUTCMinutes()).padStart(2, '0');
  return `${y}-${mo}-${d} ${h}:${mi}`;
}
