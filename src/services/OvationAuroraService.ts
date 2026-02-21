/**
 * OvationAuroraService — NOAA OVATION Prime 2013 Aurora Nowcast
 * Fetches the 512×512 geographic aurora probability map (5-minute cadence)
 * and renders it as a THREE.js CanvasTexture on the Earth aurora shell.
 *
 * Data source: https://services.swpc.noaa.gov/json/ovation_aurora_latest.json
 * Format: [[longitude, latitude, aurora_probability_0_to_100], ...]
 */

export interface OvationEntry {
  lon: number; // 0–360
  lat: number; // -90 to 90
  aurora: number; // 0–100 probability
}

export interface OvationDataset {
  forecastTime: string;
  entries: OvationEntry[];
  texture?: HTMLCanvasElement;
}

export async function fetchOvationAurora(): Promise<OvationDataset | null> {
  try {
    const resp = await fetch(
      'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json',
      { cache: 'no-store' }
    );
    if (!resp.ok) throw new Error(`OVATION HTTP ${resp.status}`);
    const json = await resp.json();

    const forecastTime: string = json['Forecast Time'] ?? '';
    // Data is array of [lon, lat, aurora] or object with coordinates
    const rawCoords: [number, number, number][] = json['coordinates'] ?? json['data'] ?? [];

    const entries: OvationEntry[] = rawCoords.map(([lon, lat, aurora]) => ({ lon, lat, aurora }));

    const texture = buildOvationCanvas(entries);
    return { forecastTime, entries, texture };
  } catch (err) {
    console.warn('[OVATION] fetch failed:', err);
    return null;
  }
}

/**
 * Build a 512×256 canvas texture from OVATION probability data.
 * Longitude 0–360 → X axis (0–512), Latitude -90–90 → Y axis (0–256)
 */
export function buildOvationCanvas(entries: OvationEntry[]): HTMLCanvasElement {
  const W = 512, H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.clearRect(0, 0, W, H);

  const imageData = ctx.createImageData(W, H);
  const data = imageData.data;

  for (const { lon, lat, aurora } of entries) {
    if (aurora <= 0) continue;

    // Map lon 0–360 → x 0–511, lat -90–90 → y 0–255 (north pole at top)
    const x = Math.round((lon / 360) * (W - 1));
    const y = Math.round(((90 - lat) / 180) * (H - 1));

    if (x < 0 || x >= W || y < 0 || y >= H) continue;

    const idx = (y * W + x) * 4;
    const pct = Math.min(1, aurora / 100);

    // HSL aurora colour: green at low intensity → cyan/white at high
    // R/G/B tuned to look like real SDO/NOAA aurora imagery
    const r = Math.round(pct > 0.6 ? (pct - 0.6) * 2.5 * 255 : 0);
    const g = Math.round(Math.min(1, pct * 1.4) * 255);
    const b = Math.round(pct > 0.4 ? (pct - 0.4) * 1.5 * 200 : 0);
    const a = Math.round(Math.min(0.9, pct * 1.3) * 255);

    // Write brighter pixel if existing pixel is dimmer (accumulate on overlap)
    if ((data[idx + 3] ?? 0) < a) {
      data[idx]     = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = a;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Blur for smoother oval
  ctx.filter = 'blur(2px)';
  const tmp = document.createElement('canvas');
  tmp.width = W; tmp.height = H;
  const tctx = tmp.getContext('2d')!;
  tctx.filter = 'blur(3px)';
  tctx.drawImage(canvas, 0, 0);

  return tmp;
}

/**
 * Get max aurora probability from a dataset (for peak-alert logic)
 */
export function getOvationPeak(dataset: OvationDataset): number {
  return dataset.entries.reduce((max, e) => Math.max(max, e.aurora), 0);
}

/**
 * Get aurora probability at a specific lat/lon (nearest-neighbour lookup)
 */
export function getAuroraAtLocation(dataset: OvationDataset, lat: number, lon: number): number {
  const normalLon = ((lon % 360) + 360) % 360;
  let best = 0, bestDist = Infinity;

  for (const entry of dataset.entries) {
    const dLat = entry.lat - lat;
    const dLon = entry.lon - normalLon;
    const dist = dLat * dLat + dLon * dLon;
    if (dist < bestDist) {
      bestDist = dist;
      best = entry.aurora;
    }
  }
  return best;
}
