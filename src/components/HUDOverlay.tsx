import { Activity, Wind, Clock } from 'lucide-react';

export function HUDOverlay({ kpValue, windSpeed, currentDate }: any) {
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

  // KPI Colors
  const kpColor = (kpValue || 0) >= 5 ? 'text-red-500' : 'text-cyan-400';

  return (
    <div className="flex flex-col items-end gap-2">
      
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

      {/* 2. LIVE METRICS (Mini) */}
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
      </div>

    </div>
  );
}