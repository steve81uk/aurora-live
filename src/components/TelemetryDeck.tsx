import { Play, Pause, Rewind, FastForward, Calendar, SkipBack, SkipForward } from 'lucide-react';
import { getAuroraEquatorwardBoundary } from '../utils/visibility';

// Solar wind dynamic pressure: P_dyn = 1.67e-6 * n * v^2 (nPa)
function calcDynPressure(density: number, speed: number): number {
  return 1.67e-6 * density * speed * speed;
}

// CRITICAL: Must be 'export function', NOT 'export default function'
export function TelemetryDeck({ 
  data, 
  currentDate, 
  setDate, 
  isPlaying, 
  setIsPlaying, 
  playbackSpeed, 
  onJumpToNow,
  onSkipHours,
  onSkipDays
}: any) {
  const kp = data?.kpIndex?.kpValue || 0;
  const wind = data?.solarWind?.speed || 0;
  const density = data?.solarWind?.density || 0;
  
  const dateStr = currentDate ? currentDate.toLocaleDateString() : '--';
  const timeStr = currentDate ? currentDate.toLocaleTimeString() : '--';
  
  const now = new Date();
  const isRealTime = Math.abs(currentDate.getTime() - now.getTime()) < 5000; // Within 5 seconds

  return (
    <div className="flex flex-col gap-4 text-cyan-400 font-mono text-xs p-4 bg-black/60 rounded-xl border border-cyan-900/30 backdrop-blur-md">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-5 gap-4 text-center">
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
        <div>
          <div className="text-gray-500 mb-1">DYN PRESSURE</div>
          <div className="text-xl font-bold text-orange-400">{calcDynPressure(density, wind).toFixed(2)} <span className="text-xs">nPa</span></div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">AURORA ZONE</div>
          <div className="text-xl font-bold text-purple-400">{'>'}{getAuroraEquatorwardBoundary(kp).toFixed(0)}<span className="text-xs">°</span></div>
        </div>
      </div>

      {/* Time Controls */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3 gap-4">
        {/* Date/Time Display */}
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
             <div className="text-white font-bold leading-none">{dateStr}</div>
             <div className="text-[10px] text-gray-500 leading-none mt-1">{timeStr}</div>
             {!isRealTime && <div className="text-[9px] text-orange-400 mt-1">TIME TRAVEL MODE</div>}
          </div>
        </div>
        
        {/* Playback Controls */}
        <div className="flex gap-2 items-center">
          {/* Jump Back 24h */}
          <span title="Jump back 24 hours">
          <SkipBack 
            className="w-4 h-4 cursor-pointer hover:text-white transition-colors" 
            onClick={() => onSkipDays(-1)}
          />
          </span>
          
          {/* Rewind 1h */}
          <span title="Rewind 1 hour">
          <Rewind 
            className="w-4 h-4 cursor-pointer hover:text-white transition-colors" 
            onClick={() => onSkipHours(-1)}
          />
          </span>
          
          {/* Play/Pause */}
          {isPlaying ? (
            <span title="Pause simulation">
            <Pause 
              className="w-5 h-5 cursor-pointer hover:text-white transition-colors text-cyan-400" 
              onClick={() => setIsPlaying(false)}
            />
            </span>
          ) : (
            <span title="Resume simulation">
            <Play 
              className="w-5 h-5 cursor-pointer hover:text-white transition-colors text-green-400" 
              onClick={() => setIsPlaying(true)}
            />
            </span>
          )}
          
          {/* Fast Forward 1h */}
          <span title="Fast forward 1 hour">
          <FastForward 
            className="w-4 h-4 cursor-pointer hover:text-white transition-colors" 
            onClick={() => onSkipHours(1)}
          />
          </span>
          
          {/* Jump Forward 24h */}
          <span title="Jump forward 24 hours">
          <SkipForward 
            className="w-4 h-4 cursor-pointer hover:text-white transition-colors" 
            onClick={() => onSkipDays(1)}
          />
          </span>
          
          {/* Divider */}
          <div className="w-px h-4 bg-white/20 mx-1" />
          
          {/* Jump to Now */}
          <button 
            className={`text-[10px] px-2 py-1 rounded transition-colors ${
              isRealTime 
                ? 'bg-green-900/50 text-green-400 cursor-default' 
                : 'bg-cyan-900/50 text-cyan-400 hover:bg-cyan-800 cursor-pointer'
            }`}
            onClick={onJumpToNow}
            disabled={isRealTime}
            title="Jump to current time"
          >
            {isRealTime ? '● LIVE' : 'NOW'}
          </button>
          
          {/* Speed Indicator */}
          <div className="text-[10px] text-gray-500">
            {playbackSpeed === 0 ? 'PAUSED' : `${playbackSpeed}x`}
          </div>
        </div>
      </div>
      
      {/* Date/Time Picker */}
      <div className="border-t border-white/10 pt-3">
        <div className="flex gap-2 items-center">
          <label className="text-[10px] text-gray-400">JUMP TO:</label>
          <input 
            type="datetime-local"
            value={currentDate.toISOString().slice(0, 16)}
            onChange={(e) => setDate(new Date(e.target.value))}
            className="bg-black/50 border border-cyan-900/50 rounded px-2 py-1 text-[10px] text-cyan-400 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>
    </div>
  );
}