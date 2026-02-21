/**
 * SpaceMetricsService — Derived space weather metrics and classifiers
 *
 * Implements peer-reviewed formulas and heuristic classifiers:
 *   • Dst index reconstruction (Burton / O'Brien-McPherron)
 *   • Multiple solar wind coupling functions (Newell, Borovsky, Vasyliunas)
 *   • Geomagnetic storm morphology classifier (sudden vs gradual)
 *   • Simple cross-correlation lag calculator (L1→Kp)
 *
 * These functions are used by DataBridge and research views.
 */

export type StormMorphology = 'SC' | 'GR' | 'UNK';

export interface SolarWindSample {
  timestamp: number; // ms UTC
  speed: number;     // km/s
  density: number;   // p/cm3
  bz: number;        // nT (southward positive as -BZ)
  bt: number;        // nT
}

// ----- Coupling functions ----------------------------------------------------
export function newellCoupling(sw: SolarWindSample): number {
  const { speed: v, bt, bz } = sw;
  const cosTheta = bt > 0 ? bz / bt : 0;
  const sinHalf = Math.sqrt(Math.max(0, (1 - cosTheta) / 2));
  return Math.pow(v, 4 / 3) * Math.pow(bt, 2 / 3) * Math.pow(sinHalf, 8);
}

export function borovskyCoupling(sw: SolarWindSample): number {
  // Borovsky et al. 2008: ε_B = V * B_T^2 * sin^4(θ/2)
  const { speed: v, bt, bz } = sw;
  const cosTheta = bt > 0 ? bz / bt : 0;
  const sinHalf = Math.sqrt(Math.max(0, (1 - cosTheta) / 2));
  return v * bt * bt * Math.pow(sinHalf, 4);
}

export function vasyliunasCoupling(sw: SolarWindSample): number {
  // Vasyliunas et al. 1982 simple form: Φ ∝ v * B_T^2
  const { speed: v, bt } = sw;
  return v * bt * bt;
}

// ----- Dst reconstruction ----------------------------------------------------
// Implements a simple Burton et al. (1975) model with adjustable parameters.
export interface DstParams {
  alpha?: number;  // nT/(mV/m) per hour
  v0?: number;     // threshold (mV/m)
  tau?: number;    // decay time constant (hours)
}

export function estimateDst(
  sw: SolarWindSample,
  prevDst: number,
  dtHours: number = 1,
  params: DstParams = {},
): number {
  const { alpha = 0.7, v0 = 0.49, tau = 7 } = params;
  // convert to mV/m: VBs ≈ V(km/s) * Bz(nT) * 1e-3
  const v = sw.speed;
  const bzNeg = Math.max(-sw.bz, 0);
  const vBs = (v * bzNeg) * 1e-3;
  const Q = Math.max(0, alpha * (vBs - v0));
  return prevDst + dtHours * (Q - prevDst / tau);
}

// ----- Storm morphology classifier ------------------------------------------
export function classifyMorphology(history: SolarWindSample[]): StormMorphology {
  if (history.length < 3) return 'UNK';

  // sudden commencement: large positive jump in speed or density
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const dv = last.speed - prev.speed;
  const dc = last.density - prev.density;
  if (dv > 200 || dc > 10) return 'SC';

  // gradual: prolonged southward Bz
  const avgBz = history.reduce((a, s) => a + s.bz, 0) / history.length;
  if (avgBz < -5) return 'GR';

  return 'UNK';
}

// ----- Cross-correlation lag --------------------------------------------------
// Returns estimated lag (ms) between two equally spaced time series
export function estimateLag(seriesA: number[], seriesB: number[]): number {
  const n = Math.min(seriesA.length, seriesB.length);
  let bestLag = 0;
  let bestCorr = -Infinity;
  for (let lag = -n + 1; lag < n; lag++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const j = i + lag;
      if (j < 0 || j >= n) continue;
      sum += seriesA[i] * seriesB[j];
    }
    if (sum > bestCorr) {
      bestCorr = sum;
      bestLag = lag;
    }
  }
  // assuming samples 1 per minute, return milliseconds
  return bestLag * 60_000;
}

// ----- Event Coherence Index --------------------------------------------------
// Composite score 0–100 combining X-ray flux, Kp, proton flux, and solar wind
export function coherenceIndex(
  sw: SolarWindSample,
  kp: number,
  xrayFlux: number,    // W/m²
  protonFlux: number,  // pfu
): number {
  // normalize each component to 0-1
  const normKp = Math.min(1, kp / 9);
  const normXray = Math.min(1, Math.log10(xrayFlux + 1e-9) + 9) / 4; // 1e-9→0,1e-5→1
  const normProton = Math.min(1, protonFlux / 10000);
  const normWind = Math.min(1, sw.speed / 1000);
  const mix = (normKp * 0.4 + normXray * 0.2 + normProton * 0.2 + normWind * 0.2);
  return Math.round(mix * 100);
}
