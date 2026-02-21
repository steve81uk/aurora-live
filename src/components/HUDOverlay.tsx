import { Activity, Wind, Clock, Zap, AlertTriangle } from 'lucide-react';
import { getAuroraEquatorwardBoundary } from '../utils/visibility';

// Geomagnetic storm level (NOAA G-scale)
function getStormLevel(kp: number): { label: string; color: string } | null {
  if (kp >= 9) return { label: 'G5 EXTREME', color: 'text-red-400' };
  if (kp >= 8) return { label: 'G4 SEVERE', color: 'text-red-500' };
  if (kp >= 7) return { label: 'G3 STRONG', color: 'text-orange-400' };
  if (kp >= 6) return { label: 'G2 MODERATE', color: 'text-yellow-400' };
  if (kp >= 5) return { label: 'G1 MINOR', color: 'text-yellow-300' };
  return null;
}

export function HUDOverlay({ kpValue, windSpeed, bz, currentDate }: any) {
  // Safe Date Handling: Use prop or fallback to now
  const safeDate = currentDate ? new Date(currentDate) : new Date();
  
  // Format Time
  const timeString = safeDate.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  const dateString = safeDate.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const kp = kpValue || 0;
  const bzVal = bz !== undefined ? bz : 0;
  
  // KPI Colors
  const kpColor = kp >= 5 ? 'text-red-500' : 'text-cyan-400';
  const bzColor = bzVal < -10 ? 'text-red-400' : bzVal < 0 ? 'text-orange-400' : 'text-green-400';
  const stormLevel = getStormLevel(kp);
  const auroraLat = getAuroraEquatorwardBoundary(kp);

  return (
    <div className="flex flex-col items-end gap-2">
      
      {/* GEOMAGNETIC STORM ALERT */}
      {stormLevel && (
        <div className={`flex items-center gap-2 bg-black/80 border border-red-500/60 px-3 py-1 rounded backdrop-blur-md animate-pulse`}>
          <AlertTriangle className="w-3 h-3 text-red-400" />
          <span className={`text-xs font-bold font-mono ${stormLevel.color}`}>{stormLevel.label} STORM</span>
        </div>
      )}

      {/* 1. CLOCK MODULE */}
      <div className="bg-black/80 border-l-2 border-cyan-500 px-4 py-2 rounded backdrop-blur-md shadow-[0_0_15px_rgba(0,255,255,0.1)]">
        <div className="flex items-center justify-end gap-2 text-xs text-cyan-500 font-mono mb-1">
          <Clock className="w-3 h-3" />
          <span>SYSTEM TIME</span>
        </div>
        <div className="text-2xl font-bold text-white tracking-widest font-mono leading-none">
          {timeString}
        </div>
        <div className="text-xs text-gray-400 text-right font-mono mt-1">
          {dateString.toUpperCase()}
        </div>
      </div>

      {/* 2. LIVE METRICS */}
      <div className="flex gap-2">
        {/* KP Index */}
        <div className="bg-black/60 backdrop-blur-sm border border-white/10 px-3 py-1 rounded flex items-center gap-2">
          <Activity className={`w-3 h-3 ${kpColor}`} />
          <div className="flex flex-col items-end">
             <span className="text-[9px] text-gray-500 font-mono leading-none">KP INDEX</span>
             <span className={`text-sm font-bold leading-none ${kpColor}`}>
               {kpValue !== undefined ? kpValue.toFixed(1) : '--'}
             </span>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="bg-black/60 backdrop-blur-sm border border-white/10 px-3 py-1 rounded flex items-center gap-2">
          <Wind className="w-3 h-3 text-yellow-400" />
          <div className="flex flex-col items-end">
             <span className="text-[9px] text-gray-500 font-mono leading-none">SOLAR WIND</span>
             <span className="text-sm font-bold text-yellow-400 leading-none">
               {windSpeed !== undefined ? Math.round(windSpeed) : '--'} <span className="text-[9px]">km/s</span>
             </span>
          </div>
        </div>

        {/* IMF Bz */}
        <div className="bg-black/60 backdrop-blur-sm border border-white/10 px-3 py-1 rounded flex items-center gap-2">
          <Zap className={`w-3 h-3 ${bzColor}`} />
          <div className="flex flex-col items-end">
             <span className="text-[9px] text-gray-500 font-mono leading-none">IMF Bz</span>
             <span className={`text-sm font-bold leading-none ${bzColor}`}>
               {bz !== undefined ? (bzVal > 0 ? '+' : '') + bzVal.toFixed(1) : '--'} <span className="text-[9px]">nT</span>
             </span>
          </div>
        </div>
      </div>

      {/* 3. AURORA OVAL BOUNDARY */}
      <div className="bg-black/60 backdrop-blur-sm border border-white/10 px-3 py-1 rounded text-right">
        <span className="text-[9px] text-gray-500 font-mono">AURORA OVAL BOUNDARY</span>
        <div className="text-xs font-bold text-green-400 font-mono">{'>'}{auroraLat.toFixed(1)}° GEOMAGNETIC LAT</div>
      </div>

    </div>
  );
}