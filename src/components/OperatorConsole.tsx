/**
 * OperatorConsole — Full-screen "Watch Officer" view
 *
 * Provides a locked-down dashboard focused on alerts, globe, and predictive windows.
 * Activated via the "O" key, dark/sans-serif MI5 aesthetic.
 */

import { useEffect, useState } from 'react';
import { useSpaceState } from '../services/DataBridge';
import { useSWPC } from '../services/SWPCDataService';
import type { CMEArrival } from '../services/SWPCDataService';
import type { AlertStack } from '../services/AlertClassificationService';
import { buildAlertStack } from '../services/AlertClassificationService';
import type { AuroraWindow } from '../services/AuroraWindowService';
import { useAuroraWindows } from '../services/AuroraWindowService';
import Globe3D from './Globe3D';
import { KpArc, BzCompass, StormBadge, WindBar } from './HeimdallHUD';

export default function OperatorConsole() {
  const { spaceState } = useSpaceState();
  const { data: swpcData } = useSWPC();
  const [visible, setVisible] = useState(true);

  // toggle visibility on 'O' key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'o' || e.key === 'O') {
        setVisible(v => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!visible) return null;

  // build alert stack from latest space state
  // helper to convert GOES-style string to W/m² value
  const parseXray = (s: string): number => {
    const m = s.match(/^([A-Za-z]+)(\d+\.?\d*)/);
    if (!m) return 0;
    const letter = m[1].charAt(0).toUpperCase();
    const mag = parseFloat(m[2]);
    let base = 0;
    switch (letter) {
      case 'X': base = 1e-5; break;
      case 'M': base = 1e-6; break;
      case 'C': base = 1e-7; break;
      case 'B': base = 1e-8; break;
      case 'A': base = 1e-9; break;
    }
    return base * mag;
  };

  const alertInput = {
    kp: swpcData?.kp?.kp ?? spaceState?.solar.kpIndex ?? 0,
    kpForecast: swpcData?.kp?.kpForecast,
    xrayFlux: swpcData?.xray?.fluxShort ?? 0,
    protonFlux10MeV: swpcData?.proton?.flux_10MeV ?? 0,
    radioBlackoutActive: swpcData?.radioBlackout?.active ?? false,
    cmeArrivals: swpcData?.cmeArrivals,
    anomalyActive: spaceState?.ml.anomalyDetected,
    bzNT: spaceState?.solar.solarWind.bz,
  };
  const alerts: AlertStack = buildAlertStack(alertInput);

  const windows: AuroraWindow[] = useAuroraWindows();

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden z-50">
      {/* faint grid background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative flex h-full">
        {/* Left alert column */}
        <div className="w-1/4 p-4 overflow-y-auto border-r border-gray-700">
          <h2 className="text-xl font-mono uppercase mb-4">Alert Stack</h2>
          <ul className="space-y-2">
            {alerts.events.map(ev => (
              <li
                key={ev.id}
                className="p-2 bg-gray-800/40 rounded flex items-start gap-2"
                style={{ boxShadow: `0 0 6px ${ev.color}88` }}
              >
                <span className="text-2xl leading-none">{ev.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-sm" style={{ color: ev.color }}>
                    {ev.title}
                  </div>
                  <div className="text-xs text-gray-400">{ev.description}</div>
                  {ev.countdown !== undefined && (
                    <div className="text-[10px] text-gray-300">
                      {ev.countdown > 0 ? `T-minus ${ev.countdown}s` : 'Now'}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Center globe & gauges */}
        <div className="flex-1 p-4 flex flex-col items-center justify-center">
          <div className="w-full h-2/3">
            <Globe3D
              kpValue={spaceState?.solar.kpIndex ?? 0}
              solarWindSpeed={spaceState?.solar.solarWind.speed ?? 0}
            />
          </div>
          <div className="mt-4 flex gap-6">
            <KpArc kp={spaceState?.solar.kpIndex ?? 0} />
            <BzCompass bz={spaceState?.solar.solarWind.bz ?? 0} />
            <StormBadge kp={spaceState?.solar.kpIndex ?? 0} />
          </div>
        </div>

        {/* Right CME & city windows */}
        <div className="w-1/4 p-4 overflow-y-auto border-l border-gray-700">
          <h2 className="text-xl font-mono uppercase mb-4">CME / Aurora</h2>
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase mb-2">CME Arrivals</h3>
            <ul className="text-xs space-y-1">
              {swpcData?.cmeArrivals?.map((cme: CMEArrival) => (
                <li key={cme.cmeId}>
                  {new Date(cme.estimatedArrival).toUTCString()} –
                  Kp{cme.predictedKpMax.toFixed(1)} – {cme.impactProbability}%
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase mb-2">City Windows</h3>
            <ul className="text-xs space-y-1">
              {windows.map(w => (
                <li key={w.city.name}>
                  {w.city.name}: {w.label} (Kp≥{w.kpThreshold})
                  {w.confidence ? ` ${Math.round(w.confidence * 100)}%` : ''}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
