import { Play, Pause, Rewind, FastForward, Calendar } from 'lucide-react';

// CRITICAL: Must be 'export function', NOT 'export default function'
export function TelemetryDeck({ data, currentDate, setDate }: any) {
  const kp = data?.kpIndex?.kpValue || 0;
  const wind = data?.solarWind?.speed || 0;
  const density = data?.solarWind?.density || 0;
  
  const dateStr = currentDate ? currentDate.toLocaleDateString() : '--';
  const timeStr = currentDate ? currentDate.toLocaleTimeString() : '--';

  return (
    <div className="flex flex-col gap-4 text-cyan-400 font-mono text-xs p-4 bg-black/60 rounded-xl border border-cyan-900/30 backdrop-blur-md">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-gray-500 mb-1">KP INDEX</div>
          <div className={`text-xl font-bold ${kp > 5 ? "text-red-500" : "text-cyan-300"}`}>{kp.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">SOLAR WIND</div>
          <div className="text-xl font-bold text-yellow-400">{wind.toFixed(0)} <span className="text-xs">km/s</span></div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">DENSITY</div>
          <div className="text-xl font-bold text-green-400">{density.toFixed(1)} <span className="text-xs">p/cm³</span></div>
        </div>
      </div>

      {/* Time Controls */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
             <div className="text-white font-bold leading-none">{dateStr}</div>
             <div className="text-[10px] text-gray-500 leading-none mt-1">{timeStr}</div>
          </div>
        </div>
        <div className="flex gap-2 text-cyan-300">
           <Rewind className="w-4 h-4 cursor-pointer hover:text-white" />
           <Pause className="w-4 h-4 cursor-pointer hover:text-white" />
           <FastForward className="w-4 h-4 cursor-pointer hover:text-white" />
        </div>
      </div>
    </div>
  );
}