/**
 * SKÖLL-TRACK DataBridge v3.10.2 (Hardened)
 * Primary X-ray Stream Fix + ML Data Array Support
 */

export interface SpaceState {
  solarWind: { speed: number; density: number; temperature: number; };
  magneticField: { bt: number; bz: number; by: number; bx: number; };
  indices: { kpIndex: number; dstIndex: number; };
  xray: { flux: number; fluxClass: string; };
  fatigue: { psi: number; stressLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'; gic: number; };
  // Gen-2 ML Support: Store history for time-series forecasting
  history?: Partial<SpaceState>[]; 
  timestamp: Date;
}

export function calculateInfrastructureFatigue(state: Partial<SpaceState>): {
  psi: number;
  stressLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  gic: number;
} {
  const V_sw = state.solarWind?.speed ?? 400;
  const B_t = state.magneticField?.bt ?? 5;
  const density = state.solarWind?.density ?? 5;
  const bz = state.magneticField?.bz ?? 0;
  const kp = state.indices?.kpIndex ?? 2;

  const mu_0 = 1.2566370614e-6;
  const m_p = 1.6726219e-27;
  const k_coupling = 0.05;
  
  const B_tesla = B_t * 1e-9;
  const rho = density * 1e6 * m_p;
  
  const denom = Math.sqrt(mu_0 * rho);
  const v_A = denom === 0 ? 1 : B_tesla / denom;
  
  const GIC = Math.max(0, (kp * 10) + (bz < 0 ? Math.abs(bz) * 2 : 0));
  const theta = bz < 0 ? Math.PI : 0;
  const P_newell = Math.pow(V_sw * 1000, 4/3) * Math.pow(B_tesla * 1e9, 2/3) * Math.pow(Math.sin(theta/2), 8);
  
  const sigma_P = 10;
  const dJ_dt = P_newell * 0.001;
  const psi = (dJ_dt / (Math.max(1, v_A) * sigma_P)) - (k_coupling * GIC);
  
  let stressLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (psi >= 1.0) stressLevel = 'CRITICAL';
  else if (psi >= 0.5) stressLevel = 'HIGH';
  else if (psi >= 0.1) stressLevel = 'MODERATE';
  
  return { psi: Math.max(0, psi), stressLevel, gic: GIC };
}

export async function fetchSpaceState(): Promise<SpaceState> {
  try {
    const [noaaRes, xrayRes] = await Promise.allSettled([
      fetch('https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json').then(r => r.json()),
      // FIXED: Moved to primary stream to resolve 404
      fetch('https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json').then(r => r.json())
    ]);

    const noaa = noaaRes.status === 'fulfilled' ? noaaRes.value : {};
    const xrayRaw = xrayRes.status === 'fulfilled' ? xrayRes.value : [];
    
    const latestXray = xrayRaw[xrayRaw.length - 1] || { flux: 1e-8 };
    const flux = parseFloat(latestXray.flux);
    let fluxClass = 'A';
    if (flux >= 1e-4) fluxClass = 'X';
    else if (flux >= 1e-5) fluxClass = 'M';

    const state: Partial<SpaceState> = {
      solarWind: { 
        speed: parseFloat(noaa.WindSpeed) || 400, 
        density: parseFloat(noaa.Density) || 5, 
        temperature: parseFloat(noaa.Temperature) || 100000 
      },
      magneticField: { bt: parseFloat(noaa.Bt) || 5, bz: parseFloat(noaa.Bz) || 0, by: 0, bx: 0 },
      indices: { kpIndex: parseFloat(noaa.KpIndex) || 2, dstIndex: 0 },
      xray: { flux, fluxClass },
      timestamp: new Date()
    };

    return {
      ...state,
      fatigue: calculateInfrastructureFatigue(state),
    } as SpaceState;
  } catch (e) {
    return getFallbackState();
  }
}

function getFallbackState(): SpaceState {
  const fallback: Partial<SpaceState> = {
    solarWind: { speed: 400, density: 5, temperature: 100000 },
    magneticField: { bt: 5, bz: 0, by: 0, bx: 0 },
    indices: { kpIndex: 2, dstIndex: 0 },
    xray: { flux: 1e-8, fluxClass: 'A' },
    timestamp: new Date()
  };
  return { ...fallback, fatigue: calculateInfrastructureFatigue(fallback) } as SpaceState;
}

export function subscribeToSpaceState(callback: (state: SpaceState) => void): () => void {
  fetchSpaceState().then(callback);
  const interval = setInterval(() => fetchSpaceState().then(callback), 60000);
  return () => clearInterval(interval);
}