/**
 * HeimdallHUD — NASA-grade Space Weather Tactical Display
 * Real-time solar wind telemetry, IMF Bz, geomagnetic storm status
 */

import { useEffect, useRef } from 'react';
import { useSpaceState } from '../services/DataBridge';
import { useSWPC } from '../services/SWPCDataService';
import { coherenceIndex } from '../services/SpaceMetricsService';
import { BzGauge } from './BzGauge';
import { RadiationBadge } from './RadiationBadge';

// ── KP GAUGE (SVG arc 0–9) ──────────────────────────────────────────────────
function KpArc({ kp }: { kp: number }) {
  const clamped = Math.min(9, Math.max(0, kp));
  const pct = clamped / 9;
  const R = 42, cx = 52, cy = 52;
  const startAngle = -210, sweep = 240;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const arcX = (a: number) => cx + R * Math.cos(toRad(a));
  const arcY = (a: number) => cy + R * Math.sin(toRad(a));
  const endA = startAngle + sweep * pct;
  const large = sweep * pct > 180 ? 1 : 0;

  const kpColor =
    kp < 3 ? '#22d3ee' :
    kp < 5 ? '#facc15' :
    kp < 7 ? '#f97316' : '#ef4444';

  const ticks = Array.from({ length: 10 }, (_, i) => {
    const a = startAngle + (sweep * i) / 9;
    const outer = R + 6;
    const inner = R - 2;
    return {
      x1: cx + outer * Math.cos(toRad(a)),
      y1: cy + outer * Math.sin(toRad(a)),
      x2: cx + inner * Math.cos(toRad(a)),
      y2: cy + inner * Math.sin(toRad(a)),
    };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={104} height={80} viewBox="0 0 104 104">
        {/* Track */}
        <path
          d={`M ${arcX(startAngle)} ${arcY(startAngle)} A ${R} ${R} 0 1 1 ${arcX(startAngle + sweep)} ${arcY(startAngle + sweep)}`}
          fill="none" stroke="#1f2937" strokeWidth={6} strokeLinecap="round"
        />
        {/* Fill */}
        {pct > 0 && (
          <path
            d={`M ${arcX(startAngle)} ${arcY(startAngle)} A ${R} ${R} 0 ${large} 1 ${arcX(endA)} ${arcY(endA)}`}
            fill="none" stroke={kpColor} strokeWidth={6} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${kpColor})` }}
          />
        )}
        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke="#374151" strokeWidth={1.5} />
        ))}
        {/* Centre label */}
        <text x={cx} y={cy - 2} textAnchor="middle" fill={kpColor}
          fontSize={18} fontWeight="bold" fontFamily="monospace">
          {clamped.toFixed(1)}
        </text>
        <text x={cx} y={cy + 13} textAnchor="middle" fill="#6b7280"
          fontSize={9} fontFamily="monospace">
          KP INDEX
        </text>
      </svg>
    </div>
  );
}

// ── IMF Bz COMPASS ──────────────────────────────────────────────────────────
function BzCompass({ bz }: { bz: number }) {
  const angle = Math.min(90, Math.max(-90, bz)) * 3;
  const color = bz < -5 ? '#ef4444' : bz < 0 ? '#f97316' : '#22d3ee';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">IMF Bz</div>
      <div className="relative w-8 h-8">
        <svg width={32} height={32} viewBox="-16 -16 32 32">
          <circle r={14} fill="none" stroke="#1f2937" strokeWidth={1.5} />
          <line x1={0} y1={-10} x2={0} y2={10} stroke="#374151" strokeWidth={1} />
          <line x1={-10} y1={0} x2={10} y2={0} stroke="#374151" strokeWidth={1} />
          <line
            x1={0} y1={3} x2={0} y2={-11}
            stroke={color} strokeWidth={2.5} strokeLinecap="round"
            transform={`rotate(${angle})`}
            style={{ filter: `drop-shadow(0 0 3px ${color})` }}
          />
          <circle r={2} fill={color} />
        </svg>
      </div>
      <div style={{ color }} className="text-[11px] font-mono font-bold">
        {bz > 0 ? '+' : ''}{bz.toFixed(1)} nT
      </div>
    </div>
  );
}

// ── STORM BADGE ──────────────────────────────────────────────────────────────
function StormBadge({ kp }: { kp: number }) {
  const level = kp < 3 ? { label: 'QUIET', cls: 'text-cyan-400 border-cyan-500/30', ring: '#22d3ee' } :
                kp < 4 ? { label: 'ACTIVE', cls: 'text-green-400 border-green-500/30', ring: '#4ade80' } :
                kp < 5 ? { label: 'G1 MINOR', cls: 'text-yellow-400 border-yellow-500/30', ring: '#facc15' } :
                kp < 6 ? { label: 'G2 MODERATE', cls: 'text-orange-400 border-orange-500/30', ring: '#fb923c' } :
                kp < 7 ? { label: 'G3 STRONG', cls: 'text-red-400 border-red-500/30', ring: '#f87171' } :
                kp < 8 ? { label: 'G4 SEVERE', cls: 'text-red-500 border-red-600/40', ring: '#ef4444' } :
                         { label: 'G5 EXTREME', cls: 'text-red-600 border-red-700/50', ring: '#dc2626' };

  return (
    <div className={`px-3 py-1 rounded-full border font-mono text-[10px] uppercase tracking-widest ${level.cls}
      ${kp >= 5 ? 'animate-pulse' : ''}`}
      style={{ boxShadow: `0 0 8px ${level.ring}40` }}>
      {level.label}
    </div>
  );
}

// ── WIND BARS ────────────────────────────────────────────────────────────────
function WindBar({ label, value, max, unit, color }: { label: string; value: number; max: number; unit: string; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[9px] font-mono">
        <span className="text-gray-500 uppercase tracking-widest">{label}</span>
        <span style={{ color }} className="font-bold">{value.toFixed(1)} {unit}</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})`, boxShadow: `0 0 6px ${color}60` }}
        />
      </div>
    </div>
  );
}

// ── SCAN-LINE CANVAS ─────────────────────────────────────────────────────────
function ScanLine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let y = 0;
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const grad = ctx.createLinearGradient(0, y - 10, 0, y + 10);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, 'rgba(6,182,212,0.08)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, y - 10, canvas.width, 20);
      y = (y + 0.8) % canvas.height;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} width={320} height={400} className="absolute inset-0 pointer-events-none opacity-40 rounded-xl" />;
}

// ── MAIN HUD ─────────────────────────────────────────────────────────────────
export function HeimdallHUD() {
  const { spaceState } = useSpaceState();

  const kp     = spaceState?.solar?.kpIndex || 3;
  const bz     = spaceState?.solar?.solarWind?.bz || 0;
  const speed  = spaceState?.solar?.solarWind?.speed || 420;
  const density = spaceState?.solar?.solarWind?.density || 6;
  const bt     = spaceState?.solar?.solarWind?.bt || 5;
  const { data: swpc } = useSWPC();
  const xray   = swpc?.xray?.classification || spaceState?.solar?.xrayFlux || 'B1.0';
  const protonLevel = swpc?.proton?.sstormLevel || 'S0';
  const mlConf = spaceState?.ml?.confidence || 0;
  const nextKp = spaceState?.ml?.predictedKp?.[0] || kp;
  const dstEstimate = spaceState?.derived?.dstEstimate;
  const morphology = spaceState?.derived?.stormMorphology;
  const newellVal = spaceState?.derived?.coupling?.newell;
  const lagMs = spaceState?.derived?.lagMs;
  const gicRisk = spaceState?.derived?.gicRisk ?? 0;
  const coherence = coherenceIndex(
    { timestamp: Date.now(), speed, density, bz, bt },
    kp,
    parseFloat((swpc?.xray?.classification?.replace(/[A-Z]/g,'') || '0')), // rough
    swpc?.proton?.flux_10MeV || 0
  );

  return (
    <div className="relative p-4 space-y-3 rounded-xl overflow-hidden select-none">
      <ScanLine />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-[0.3em]">HEIMDALL PROTOCOL</div>
        <StormBadge kp={kp} />
      </div>

      {/* KP + Bz row */}
      <div className="flex items-center justify-around gap-2">
        <KpArc kp={kp} />
        <div className="flex flex-col items-center gap-3">
          <BzCompass bz={bz} />
          <BzGauge />
          <div className="text-center">
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">NEXT KP</div>
            <div className={`text-lg font-bold font-mono ${nextKp > kp ? 'text-orange-400' : 'text-cyan-400'}`}>
              {nextKp.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Solar Wind bars */}
      <div className="space-y-2">
        <WindBar label="Wind Speed" value={speed} max={900} unit="km/s" color="#22d3ee" />
        <WindBar label="Density"    value={density} max={30} unit="p/cc" color="#a78bfa" />
        <WindBar label="Bt Magnitude" value={bt}   max={40} unit="nT"   color="#34d399" />
      </div>

      {/* Newell coupling proxy */}
      <div className="space-y-0.5">
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-gray-500 uppercase tracking-widest">Newell Coupling ε</span>
          <span className="text-purple-400 font-bold">
            {(speed * Math.pow(bt, 2/3) * Math.pow(Math.max(0, -bz / (bt || 1)), 8/3) * 1e-3).toFixed(1)} kWb/s
          </span>
        </div>
      </div>

      {/* X-ray + ML row */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-cyan-500/10">
        <div className="text-center">
          <div className="text-[9px] font-mono text-gray-500 uppercase">X-Ray</div>
          <div className={`text-sm font-bold font-mono mt-0.5 ${xray.startsWith('X') ? 'text-red-400' : xray.startsWith('M') ? 'text-orange-400' : 'text-green-400'}`}>
            {xray}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[9px] font-mono text-gray-500 uppercase">Proton</div>
          <div className="mt-0.5">
            <RadiationBadge level={protonLevel} />
          </div>
        </div>
        <div className="text-center">
          <div className="text-[9px] font-mono text-gray-500 uppercase">ML Conf</div>
          <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">
            {(mlConf * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Derived metrics strip */}
      <div className="flex items-center justify-between pt-1 border-t border-cyan-500/10 text-[8px] font-mono text-gray-400">
        {dstEstimate !== undefined && (
          <span>DST ≈ {dstEstimate.toFixed(0)} nT</span>
        )}
        {morphology && (
          <span className="uppercase">Morph: {morphology}</span>
        )}
        {lagMs !== undefined && (
          <span>Lag {Math.round(lagMs/60000)}m</span>
        )}
        {gicRisk > 0 && (
          <span className="text-red-400">GIC {Math.round(gicRisk*100)}%</span>
        )}
        <span className="text-green-400">Bifröst {coherence}%</span>
        <span className="flex-1"></span>
        {/* Original data source strip */}
        <span className="text-gray-600 uppercase tracking-widest">NOAA DSCOVR · GOES-18</span>
        <span className="text-cyan-700 animate-pulse">● LIVE</span>
      </div>
    </div>
  );
}

// re-export helper widgets for external use
export { KpArc, BzCompass, StormBadge, WindBar };
