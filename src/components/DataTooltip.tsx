/**
 * DataTooltip Component
 * Shows raw space weather data when hovering over metrics
 */

import { useState, useEffect } from 'react';

interface DataTooltipProps {
  kpValue: number;
  bzValue: number;
  solarWindSpeed: number;
  density: number;
  visible: boolean;
  position: { x: number; y: number };
}

export function DataTooltip({
  kpValue,
  bzValue,
  solarWindSpeed,
  density,
  visible,
  position
}: DataTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [visible]);

  if (!visible) return null;

  // Calculate resilience percentage based on actual data
  // Formula: Higher Kp and negative Bz reduce resilience
  const calculateResilience = () => {
    let score = 100;
    
    // Kp penalty (0-9 scale, each point above 3 reduces by 10%)
    if (kpValue > 3) {
      score -= (kpValue - 3) * 10;
    }
    
    // Bz penalty (negative Bz is dangerous for aurora storms)
    if (bzValue < 0) {
      score -= Math.abs(bzValue) * 2; // Each -1 nT reduces by 2%
    }
    
    // Solar wind speed bonus/penalty
    if (solarWindSpeed > 500) {
      score -= (solarWindSpeed - 500) / 10; // Fast wind reduces resilience
    }
    
    // Density impact
    if (density > 10) {
      score -= (density - 10) * 2;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const resilience = calculateResilience();
  
  // Status determination
  const getStatus = () => {
    if (resilience >= 80) return { text: 'STABLE', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (resilience >= 60) return { text: 'CAUTION', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (resilience >= 40) return { text: 'STRESSED', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { text: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const status = getStatus();

  return (
    <div
      className={`fixed z-[999] pointer-events-none transition-all duration-200 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -120%)'
      }}
    >
      <div className="backdrop-blur-xl bg-black/90 border-2 border-cyan-500/50 rounded-lg shadow-[0_0_40px_rgba(6,182,212,0.6)] p-4 min-w-[280px]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-500/30">
          <div className="text-cyan-400 font-bold text-sm font-mono">TELEMETRY DATA</div>
          <div className={`text-xs font-mono ${status.color} ${status.bg} px-2 py-1 rounded`}>
            {status.text}
          </div>
        </div>

        {/* Resilience Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-400 font-mono text-xs">GRID RESILIENCE</span>
            <span className={`font-bold font-mono ${status.color}`}>
              {resilience.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${resilience >= 60 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
              style={{ width: `${resilience}%` }}
            />
          </div>
        </div>

        {/* Raw Data Grid */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Kp Index */}
          <div className="backdrop-blur-lg bg-cyan-500/10 border border-cyan-500/30 rounded p-2">
            <div className="text-cyan-600 text-[10px] font-mono uppercase mb-1">Kp Index</div>
            <div className={`text-lg font-bold font-mono ${kpValue > 5 ? 'text-red-400' : kpValue > 3 ? 'text-yellow-400' : 'text-green-400'}`}>
              {kpValue.toFixed(1)}
            </div>
            <div className="text-cyan-600 text-[9px] mt-1">
              {kpValue >= 5 ? 'STORM' : kpValue >= 4 ? 'ACTIVE' : 'QUIET'}
            </div>
          </div>

          {/* Bz Component */}
          <div className="backdrop-blur-lg bg-purple-500/10 border border-purple-500/30 rounded p-2">
            <div className="text-purple-400 text-[10px] font-mono uppercase mb-1">Bz Field</div>
            <div className={`text-lg font-bold font-mono ${bzValue < -5 ? 'text-red-400' : bzValue < 0 ? 'text-yellow-400' : 'text-green-400'}`}>
              {bzValue.toFixed(1)}
              <span className="text-xs ml-1">nT</span>
            </div>
            <div className="text-purple-400 text-[9px] mt-1">
              {bzValue < 0 ? 'SOUTH ⬇️' : 'NORTH ⬆️'}
            </div>
          </div>

          {/* Solar Wind Speed */}
          <div className="backdrop-blur-lg bg-orange-500/10 border border-orange-500/30 rounded p-2">
            <div className="text-orange-400 text-[10px] font-mono uppercase mb-1">Wind Speed</div>
            <div className={`text-lg font-bold font-mono ${solarWindSpeed > 600 ? 'text-red-400' : solarWindSpeed > 500 ? 'text-yellow-400' : 'text-green-400'}`}>
              {solarWindSpeed.toFixed(0)}
              <span className="text-xs ml-1">km/s</span>
            </div>
            <div className="text-orange-400 text-[9px] mt-1">
              {solarWindSpeed > 500 ? 'HIGH SPEED' : 'NOMINAL'}
            </div>
          </div>

          {/* Density */}
          <div className="backdrop-blur-lg bg-blue-500/10 border border-blue-500/30 rounded p-2">
            <div className="text-blue-400 text-[10px] font-mono uppercase mb-1">Density</div>
            <div className={`text-lg font-bold font-mono ${density > 15 ? 'text-red-400' : density > 10 ? 'text-yellow-400' : 'text-green-400'}`}>
              {density.toFixed(1)}
              <span className="text-xs ml-1">p/cm³</span>
            </div>
            <div className="text-blue-400 text-[9px] mt-1">
              {density > 10 ? 'ELEVATED' : 'NORMAL'}
            </div>
          </div>
        </div>

        {/* Formula Info */}
        <div className="mt-3 pt-3 border-t border-cyan-500/20">
          <div className="text-cyan-600 text-[9px] font-mono text-center">
            Resilience = f(Kp, Bz, Speed, Density)
          </div>
        </div>

        {/* Arrow pointer */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-cyan-500/50" />
        </div>
      </div>
    </div>
  );
}
