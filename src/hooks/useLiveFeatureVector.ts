/**
 * useLiveFeatureVector — Bridges DataBridge SpaceState → LSTM FeatureVector
 * Maintains rolling 24-sample buffers, updates every 60 s via useSpaceState.
 */

import { useRef, useEffect, useState } from 'react';
import { useSpaceState } from '../services/DataBridge';
import type { FeatureVector } from '../ml/types';

const WINDOW = 24;

function padOrSlice(arr: number[]): number[] {
  if (arr.length >= WINDOW) return arr.slice(-WINDOW);
  const padVal = arr[0] ?? 0;
  return [...Array(WINDOW - arr.length).fill(padVal), ...arr];
}

export function useLiveFeatureVector(): FeatureVector | null {
  const { spaceState } = useSpaceState();

  const speedBuf    = useRef<number[]>([]);
  const densityBuf  = useRef<number[]>([]);
  const bzBuf       = useRef<number[]>([]);
  const btBuf       = useRef<number[]>([]);
  const kpBuf       = useRef<number[]>([]);
  const newellBuf   = useRef<number[]>([]);
  const alfvenBuf   = useRef<number[]>([]);

  const [vector, setVector] = useState<FeatureVector | null>(null);

  useEffect(() => {
    if (!spaceState) return;

    const sw   = spaceState.solar.solarWind;
    const kp   = spaceState.solar.kpIndex;
    const bt   = sw.bt;
    const bz   = sw.bz;
    const v    = sw.speed;
    const n    = sw.density;

    // Newell coupling: ε = v^(4/3) · Bt^(2/3) · sin^8(θ/2)
    // Simplified: θ = atan2(bt, -bz) → clock angle; sin(θ/2) ≈ sqrt((1 - bz/bt)/2)
    const cosTheta  = bt > 0 ? bz / bt : 0;
    const sinHalf   = Math.sqrt(Math.max(0, (1 - cosTheta) / 2));
    const newell    = Math.pow(v, 4 / 3) * Math.pow(bt, 2 / 3) * Math.pow(sinHalf, 8);

    // Alfvén velocity: va = B / sqrt(μ₀ · ρ); proxy: B / sqrt(n)
    const alfven    = bt > 0 && n > 0 ? (bt * 1e-9) / Math.sqrt(1.257e-6 * n * 1.67e-27 * 1e6) / 1000 : 50;

    speedBuf.current   = [...speedBuf.current,  v].slice(-WINDOW);
    densityBuf.current = [...densityBuf.current, n].slice(-WINDOW);
    bzBuf.current      = [...bzBuf.current,      bz].slice(-WINDOW);
    btBuf.current      = [...btBuf.current,      bt].slice(-WINDOW);
    kpBuf.current      = [...kpBuf.current,      kp].slice(-WINDOW);
    newellBuf.current  = [...newellBuf.current,  newell].slice(-WINDOW);
    alfvenBuf.current  = [...alfvenBuf.current,  alfven].slice(-WINDOW);

    const now = new Date();
    setVector({
      solarWindSpeed:       padOrSlice(speedBuf.current),
      solarWindDensity:     padOrSlice(densityBuf.current),
      magneticFieldBz:      padOrSlice(bzBuf.current),
      magneticFieldBt:      padOrSlice(btBuf.current),
      kpIndex:              padOrSlice(kpBuf.current),
      newellCouplingHistory: padOrSlice(newellBuf.current),
      alfvenVelocityHistory: padOrSlice(alfvenBuf.current),
      syzygyIndex: 0.3,
      jupiterSaturnAngle: 0.5,
      solarRotationPhase: (Date.now() / (27 * 24 * 60 * 60 * 1000)) % 1,
      solarCyclePhase: 0.6,
      timeOfYear: now.getMonth() / 12,
    });
  }, [spaceState]);

  return vector;
}
