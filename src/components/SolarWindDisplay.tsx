import { Wind } from 'lucide-react';
import type { SolarWind } from '../types/aurora';

interface SolarWindDisplayProps {
  solarWind?: SolarWind;
}

export function SolarWindDisplay({ solarWind }: SolarWindDisplayProps) {
  const defaultData: SolarWind = { speed: 0, density: 0, bz: 0 };
  const data = solarWind || defaultData;

  const getSpeedStatus = (speed: number) => {
    if (speed < 400) return { text: 'SLOW', color: '#00ffff' };
    if (speed < 600) return { text: 'NORMAL', color: '#00ff00' };
    if (speed < 800) return { text: 'FAST', color: '#ffff00' };
    return { text: 'EXTREME', color: '#ff0000' };
  };

  const getDensityStatus = (density: number) => {
    if (density < 5) return { text: 'LOW', color: '#00ffff' };
    if (density < 15) return { text: 'NORMAL', color: '#00ff00' };
    if (density < 25) return { text: 'HIGH', color: '#ffff00' };
    return { text: 'EXTREME', color: '#ff0000' };
  };

  const getBzStatus = (bz: number) => {
    if (bz >= 0) return { text: 'NORTH', color: '#00ffff' };
    if (bz > -5) return { text: 'SOUTH', color: '#ffff00' };
    return { text: 'STRONG-S', color: '#ff0000' };
  };

  const speedStatus = getSpeedStatus(data.speed);
  const densityStatus = getDensityStatus(data.density);
  const bzStatus = getBzStatus(data.bz);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/30">
        <Wind className="w-4 h-4 text-cyan-400" />
        <h3 className="text-[11px] font-black tracking-widest text-cyan-400">SOLAR WIND</h3>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Speed */}
        <div className="border border-cyan-500/20 bg-black/40 p-2">
          <div className="text-[9px] text-cyan-600 font-mono mb-1 tracking-wider">SPEED</div>
          <div className="text-xl font-black font-mono leading-none mb-1 hud-glow" style={{ color: speedStatus.color }}>
            {data.speed.toFixed(0)}
          </div>
          <div className="text-[8px] text-cyan-700 font-mono">km/s</div>
          <div className="w-full bg-black/60 h-1 mt-1">
            <div 
              className="h-full transition-all"
              style={{ 
                width: `${Math.min((data.speed / 1000) * 100, 100)}%`,
                backgroundColor: speedStatus.color
              }}
            />
          </div>
          <div className="text-[8px] font-bold mt-1" style={{ color: speedStatus.color }}>
            {speedStatus.text}
          </div>
        </div>

        {/* Density */}
        <div className="border border-cyan-500/20 bg-black/40 p-2">
          <div className="text-[9px] text-cyan-600 font-mono mb-1 tracking-wider">DENSITY</div>
          <div className="text-xl font-black font-mono leading-none mb-1 hud-glow" style={{ color: densityStatus.color }}>
            {data.density.toFixed(1)}
          </div>
          <div className="text-[8px] text-cyan-700 font-mono">p/cm³</div>
          <div className="w-full bg-black/60 h-1 mt-1">
            <div 
              className="h-full transition-all"
              style={{ 
                width: `${Math.min((data.density / 30) * 100, 100)}%`,
                backgroundColor: densityStatus.color
              }}
            />
          </div>
          <div className="text-[8px] font-bold mt-1" style={{ color: densityStatus.color }}>
            {densityStatus.text}
          </div>
        </div>

        {/* Bz */}
        <div className="border border-cyan-500/20 bg-black/40 p-2">
          <div className="text-[9px] text-cyan-600 font-mono mb-1 tracking-wider">Bz</div>
          <div className="text-xl font-black font-mono leading-none mb-1 hud-glow" style={{ color: bzStatus.color }}>
            {data.bz >= 0 ? '+' : ''}{data.bz.toFixed(1)}
          </div>
          <div className="text-[8px] text-cyan-700 font-mono">nT</div>
          <div className="w-full bg-black/60 h-1 mt-1">
            <div 
              className="h-full transition-all"
              style={{ 
                width: `${Math.min(Math.abs(data.bz / 20) * 100, 100)}%`,
                backgroundColor: bzStatus.color
              }}
            />
          </div>
          <div className="text-[8px] font-bold mt-1" style={{ color: bzStatus.color }}>
            {bzStatus.text}
          </div>
        </div>
      </div>

      <div className="border border-cyan-500/20 bg-black/30 p-2 text-[8px] text-cyan-600 font-mono text-center">
        SOUTHWARD Bz ENHANCES AURORA
      </div>
    </div>
  );
}
