/**
 * ExoPhysicsPanel — Universal Aurora Simulation Engine
 * Scales Earth solar wind data to all planets using inverse-square law + magnetic field factors
 */

import { useSpaceState } from '../services/DataBridge';

interface PlanetData {
  name: string;
  symbol: string;
  orbitAU: number;
  magField: number;     // Relative to Earth (Earth = 1.0)
  hasAtmosphere: boolean;
  emission: string;     // Primary auroral emission species
  color: string;
}

const PLANETS_PHYSICS: PlanetData[] = [
  { name: 'Mercury', symbol: '☿', orbitAU: 0.39, magField: 0.006,   hasAtmosphere: false, emission: 'Na/K',    color: '#b5b5b5' },
  { name: 'Venus',   symbol: '♀', orbitAU: 0.72, magField: 0.00001, hasAtmosphere: true,  emission: 'CO₂/O',   color: '#e8cda0' },
  { name: 'Earth',   symbol: '♁', orbitAU: 1.00, magField: 1.0,     hasAtmosphere: true,  emission: 'O/N₂',    color: '#22d3ee' },
  { name: 'Mars',    symbol: '♂', orbitAU: 1.52, magField: 0.0,     hasAtmosphere: true,  emission: 'CO₂/N₂',  color: '#f87171' },
  { name: 'Jupiter', symbol: '♃', orbitAU: 5.20, magField: 19000,   hasAtmosphere: true,  emission: 'H₂/H₃⁺', color: '#f59e0b' },
  { name: 'Saturn',  symbol: '♄', orbitAU: 9.58, magField: 600,     hasAtmosphere: true,  emission: 'H₂/H',    color: '#fcd34d' },
  { name: 'Uranus',  symbol: '⛢', orbitAU: 19.2, magField: 47,      hasAtmosphere: true,  emission: 'H₂',      color: '#67e8f9' },
  { name: 'Neptune', symbol: '♆', orbitAU: 30.1, magField: 27,      hasAtmosphere: true,  emission: 'H/N',     color: '#818cf8' },
];

function calcAuroraMetrics(p: PlanetData, earthKp: number, solarWindSpeed: number) {
  // Solar wind pressure scales as 1/r²
  const pressureScale = 1 / (p.orbitAU * p.orbitAU);

  // Local Kp-equivalent using magnetic field factor (log scale)
  const localKp = p.magField > 0
    ? earthKp * pressureScale * Math.log10(1 + p.magField)
    : earthKp * pressureScale * 0.05; // induced / neutral atmosphere

  // Aurora probability (logistic curve)
  const prob = Math.min(99, Math.round(1 / (1 + Math.exp(-(localKp - 3))) * 100));

  // Intensity % (0–100)
  const intensity = Math.min(100, Math.round(pressureScale * earthKp * (p.magField > 0 ? Math.log10(1 + p.magField) * 10 : 5)));

  // Auroral latitude equivalent
  const auroralLat = p.magField > 0
    ? Math.max(0, 90 - 10 * Math.log10(1 + earthKp * p.magField / 1000))
    : 0;

  // Scaled local wind speed  
  const localWind = solarWindSpeed * Math.sqrt(pressureScale);

  return { localKp: Math.min(99, localKp), prob, intensity, auroralLat, localWind };
}

export function ExoPhysicsPanel() {
  const { spaceState } = useSpaceState();
  const earthKp = spaceState?.solar?.kpIndex || 3;
  const speed   = spaceState?.solar?.solarWind?.speed || 420;

  return (
    <div className="space-y-2 p-1">
      <div className="text-[9px] font-mono text-purple-400 uppercase tracking-[0.3em] pb-1">
        EXO-PHYSICS ENGINE · SOLAR SYSTEM
      </div>

      {PLANETS_PHYSICS.map(planet => {
        const { localKp, prob, intensity } = calcAuroraMetrics(planet, earthKp, speed);
        const isEarth = planet.name === 'Earth';

        return (
          <div
            key={planet.name}
            className="rounded-lg border p-2 space-y-1.5 transition-colors"
            style={{
              background: isEarth ? `${planet.color}08` : 'rgba(0,0,0,0.3)',
              borderColor: `${planet.color}${isEarth ? '40' : '20'}`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span style={{ color: planet.color }} className="text-sm">{planet.symbol}</span>
                <span className="text-[11px] font-mono font-bold" style={{ color: planet.color }}>
                  {planet.name}
                </span>
                <span className="text-[8px] font-mono text-gray-600">{planet.orbitAU} AU</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-mono text-gray-500">{planet.emission}</span>
                <span
                  className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border"
                  style={{ color: planet.color, borderColor: `${planet.color}40` }}
                >
                  Kp* {localKp.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Aurora probability bar */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[8px] font-mono text-gray-500">
                <span>Aurora Probability</span>
                <span style={{ color: planet.color }} className="font-bold">{prob}%</span>
              </div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${prob}%`,
                    background: `linear-gradient(90deg, ${planet.color}60, ${planet.color})`,
                    boxShadow: `0 0 4px ${planet.color}60`,
                    transition: 'width 1s ease'
                  }}
                />
              </div>
            </div>

            {/* Intensity */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[8px] font-mono text-gray-500">
                <span>Intensity</span>
                <span className="text-gray-400">{intensity}%</span>
              </div>
              <div className="h-0.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${intensity}%`, background: planet.color, transition: 'width 1s ease' }}
                />
              </div>
            </div>
          </div>
        );
      })}

      <div className="text-[8px] font-mono text-gray-700 text-center pt-1">
        Inverse-square wind model · Magnetic field scaling
      </div>
    </div>
  );
}
