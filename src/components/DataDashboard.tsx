import { Activity, AlertTriangle } from 'lucide-react';
import type { KpIndexData, AuroraVisibility } from '../types/aurora';

interface DataDashboardProps {
  kpData?: KpIndexData;
  visibility?: AuroraVisibility;
}

export function DataDashboard({ kpData, visibility }: DataDashboardProps) {
  const defaultKp = { kpValue: 0, status: 'loading', timestamp: '', id: '' };
  const defaultVisibility = { percentage: 0, quality: 'Unknown', text: 'Loading...' };
  
  const kp = kpData || defaultKp;
  const vis = visibility || defaultVisibility;

  const getKpColor = (value: number) => {
    if (value < 4) return '#00ff00';  // Green
    if (value < 5) return '#ffff00';  // Yellow
    if (value < 6) return '#ff8800';  // Orange
    if (value < 7) return '#ff0040';  // Red
    return '#ff00ff';  // Magenta
  };

  const getActivityLevel = (value: number) => {
    if (value < 4) return 'QUIET';
    if (value < 5) return 'ACTIVE';
    if (value < 6) return 'MINOR-STORM';
    if (value < 7) return 'MODERATE';
    return 'MAJOR-STORM';
  };

  const getThreatLevel = (value: number) => {
    if (value < 4) return 'LOW';
    if (value < 6) return 'MODERATE';
    if (value < 7) return 'HIGH';
    return 'CRITICAL';
  };

  return (
    <div className="bg-gray-950/90 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-black/50 shadow-2xl">
      <div className="grid grid-cols-6 gap-3">
        <div className="col-span-1 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-[9px] text-gray-400 font-mono mb-2 tracking-wider uppercase">KP INDEX</div>
            <div className="text-6xl font-black leading-none text-white drop-shadow-lg" style={{ fontFamily: 'Orbitron, monospace' }}>
              {kp.kpValue.toFixed(1)}
            </div>
            <div className="mt-1 h-1 w-full rounded-full" style={{ backgroundColor: getKpColor(kp.kpValue), boxShadow: `0 0 10px ${getKpColor(kp.kpValue)}` }}></div>
          </div>
        </div>

        <div className="col-span-1 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl p-3 relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-[9px] text-gray-400 font-mono mb-2 tracking-wider uppercase">ACTIVITY</div>
            <div className="text-lg font-black leading-tight text-white" style={{ color: getKpColor(kp.kpValue) }}>
              {getActivityLevel(kp.kpValue)}
            </div>
            <div className="text-[9px] text-gray-500 font-mono mt-1 uppercase">{kp.status}</div>
          </div>
        </div>

        <div className="col-span-1 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-[9px] text-gray-400 font-mono mb-2 tracking-wider uppercase">THREAT</div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="w-4 h-4 text-cyan-400" style={{ color: getKpColor(kp.kpValue) }} />
            </div>
            <div className="text-sm font-black text-white" style={{ color: getKpColor(kp.kpValue) }}>
              {getThreatLevel(kp.kpValue)}
            </div>
          </div>
        </div>

        <div className="col-span-1 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl p-3 relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-[9px] text-gray-400 font-mono mb-2 tracking-wider uppercase">VISIBILITY</div>
            <div className="text-3xl font-black leading-none text-white drop-shadow-lg">
              {vis.percentage}%
            </div>
            <div className="w-full bg-gray-800/60 h-1.5 mt-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all"
                style={{ width: `${vis.percentage}%`, boxShadow: '0 0 8px #06b6d4' }}
              />
            </div>
          </div>
        </div>

        <div className="col-span-1 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl p-3 relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-[9px] text-gray-400 font-mono mb-2 tracking-wider uppercase">QUALITY</div>
            <div className="text-sm font-black leading-tight text-white">
              {vis.quality}
            </div>
            <div className="text-[9px] text-gray-500 font-mono mt-1 line-clamp-2">
              {vis.text}
            </div>
          </div>
        </div>

        <div className="col-span-1 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-[9px] text-gray-400 font-mono mb-2 tracking-wider uppercase">STATUS</div>
            <Activity className="w-5 h-5 mx-auto text-cyan-400 pulse" />
            <div className="text-[9px] text-white font-bold mt-1 uppercase">
              {kp.status}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl p-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">INTENSITY SCALE</div>
            <div className="text-[10px] font-black text-white" style={{ color: getKpColor(kp.kpValue) }}>
              {getActivityLevel(kp.kpValue)}
            </div>
          </div>
          
          <div className="relative h-4 bg-gray-800/60 rounded-full overflow-hidden flex">
            <div 
              className="h-full transition-all duration-500 rounded-full"
              style={{ 
                width: `${(kp.kpValue / 9) * 100}%`,
                background: `linear-gradient(90deg, ${getKpColor(kp.kpValue)}, ${getKpColor(kp.kpValue)}dd)`,
                boxShadow: `0 0 15px ${getKpColor(kp.kpValue)}`
              }}
            />
            
            <div className="absolute inset-0 flex justify-between pointer-events-none px-1">
              <div className="w-px h-full bg-white/20"></div>
              <div className="w-px h-full bg-white/20"></div>
              <div className="w-px h-full bg-white/20"></div>
              <div className="w-px h-full bg-white/20"></div>
              <div className="w-px h-full bg-white/20"></div>
            </div>
          </div>
          
          <div className="flex justify-between mt-2 text-[9px] text-gray-500 font-mono">
            <span>0</span>
            <span>3</span>
            <span>5</span>
            <span>7</span>
            <span>9</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-[9px] font-mono">
        <div className="bg-black/50 border border-white/10 rounded-lg p-2 text-center">
          <span className="text-gray-500">SCAN:</span>
          <span className="text-white ml-1 font-bold">CONTINUOUS</span>
        </div>
        <div className="bg-black/50 border border-white/10 rounded-lg p-2 text-center">
          <span className="text-gray-500">MODE:</span>
          <span className="text-green-400 ml-1 font-bold">REALTIME</span>
        </div>
        <div className="bg-black/50 border border-white/10 rounded-lg p-2 text-center">
          <span className="text-gray-500">LINK:</span>
          <span className="text-cyan-400 ml-1 font-bold pulse">ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
