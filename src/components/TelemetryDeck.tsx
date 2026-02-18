import { Play, Pause, Rewind, FastForward, Calendar, SkipBack, SkipForward } from 'lucide-react';
import { DataExportButton } from './DataExportButton';

// CRITICAL: Must be 'export function', NOT 'export default function'
export function TelemetryDeck({ 
  data, 
  currentDate, 
  setDate, 
  isPlaying, 
  setIsPlaying, 
  playbackSpeed, 
  setPlaybackSpeed,
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
    <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-auto obsidian-glass backdrop-blur-lg border-t border-cyan-500/20 p-3">
      
      {/* Export Button */}
      <div className="absolute top-3 right-3">
        <DataExportButton
          data={{
            currentDate: currentDate?.toISOString(),
            kpIndex: kp,
            solarWind: wind,
            density,
            isRealTime,
            playbackSpeed
          }}
          filename="telemetry-deck"
          label="TELEMETRY"
        />
      </div>

      {/* Metrics Row */}
      <div className="flex gap-4 mb-3 overflow-x-auto">
        <div className="metric-panel px-4 py-2">
          <div className="text-xs text-cyan-400/70 font-mono tracking-wider">KP INDEX</div>
          <div className={`text-lg font-bold ${kp > 5 ? "text-red-500 neon-red" : "text-amber-400 neon-amber"}`}>{kp.toFixed(1)}</div>
        </div>
        <div className="metric-panel px-4 py-2">
          <div className="text-xs text-cyan-400/70 font-mono tracking-wider">SOLAR WIND</div>
          <div className="text-lg font-bold text-amber-400 neon-amber">{wind.toFixed(0)} <span className="text-xs">km/s</span></div>
        </div>
        <div className="metric-panel px-4 py-2 hidden md:block">
          <div className="text-xs text-cyan-400/70 font-mono tracking-wider">DENSITY</div>
          <div className="text-lg font-bold text-amber-400 neon-amber">{density.toFixed(1)} <span className="text-xs">p/cm³</span></div>
        </div>
      </div>

      {/* Time Controls */}
      <div className="flex items-center justify-between border-t border-cyan-500/20 pt-3 gap-4">
        {/* Date/Time Display */}
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-cyan-400/70" />
          <div>
             <div className="text-amber-400 font-bold leading-none font-mono">{dateStr}</div>
             <div className="text-[10px] text-cyan-400/70 leading-none mt-1">{timeStr}</div>
             {!isRealTime && <div className="text-[9px] text-amber-400 mt-1">TIME TRAVEL MODE</div>}
          </div>
        </div>
        
        {/* Playback Controls */}
        <div className="flex gap-2 items-center">
          {/* Jump Back 24h */}
          <SkipBack 
            className="w-4 h-4 cursor-pointer hover:text-amber-400 transition-colors text-cyan-400/70 hidden md:block" 
            onClick={() => onSkipDays(-1)}
          />
          
          {/* Rewind 1h */}
          <Rewind 
            className="w-4 h-4 cursor-pointer hover:text-amber-400 transition-colors text-cyan-400/70" 
            onClick={() => onSkipHours(-1)}
          />
          
          {/* Play/Pause */}
          {isPlaying ? (
            <Pause 
              className="w-5 h-5 cursor-pointer hover:text-amber-400 transition-colors text-cyan-400" 
              onClick={() => setIsPlaying(false)}
            />
          ) : (
            <Play 
              className="w-5 h-5 cursor-pointer hover:text-amber-400 transition-colors text-green-400" 
              onClick={() => setIsPlaying(true)}
            />
          )}
          
          {/* Fast Forward 1h */}
          <FastForward 
            className="w-4 h-4 cursor-pointer hover:text-amber-400 transition-colors text-cyan-400/70" 
            onClick={() => onSkipHours(1)}
          />
          
          {/* Jump Forward 24h */}
          <SkipForward 
            className="w-4 h-4 cursor-pointer hover:text-amber-400 transition-colors text-cyan-400/70 hidden md:block" 
            onClick={() => onSkipDays(1)}
          />
          
          {/* Divider */}
          <div className="w-px h-4 bg-cyan-500/20 mx-1" />
          
          {/* Jump to Now */}
          <button 
            className={`text-[10px] px-2 py-1 rounded transition-colors font-mono ${
              isRealTime 
                ? 'bg-green-500/20 text-green-400 cursor-default' 
                : 'bg-cyan-500/20 text-cyan-400 hover:bg-amber-500/20 hover:text-amber-400 cursor-pointer'
            }`}
            onClick={onJumpToNow}
            disabled={isRealTime}
            title="Jump to current time"
          >
            {isRealTime ? '● LIVE' : 'NOW'}
          </button>
          
          {/* Speed Indicator */}
          <div className="text-[10px] text-cyan-400/70 font-mono hidden md:block">
            {playbackSpeed === 0 ? 'PAUSED' : `${playbackSpeed}x`}
          </div>
        </div>
      </div>
      
      {/* Date/Time Picker */}
      <div className="border-t border-cyan-500/20 pt-3 hidden md:block">
        <div className="flex gap-2 items-center">
          <label className="text-[10px] text-cyan-400/70 font-mono tracking-wider">JUMP TO:</label>
          <input 
            type="datetime-local"
            value={currentDate.toISOString().slice(0, 16)}
            onChange={(e) => setDate(new Date(e.target.value))}
            className="bg-black/50 border border-cyan-500/20 rounded px-2 py-1 text-[10px] text-cyan-400 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>
      </div>
    </div>
  );
}