/**
 * TimeSliderOverlay - Compact time control overlay for 3D scene
 * Overlays on top of SolarSystemScene for historical playback
 */

import { useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, Rewind, Clock } from 'lucide-react';

interface TimeSliderOverlayProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  onJumpToNow: () => void;
  onSkipHours: (hours: number) => void;
  onSkipDays: (days: number) => void;
}

export function TimeSliderOverlay({
  currentDate,
  setCurrentDate,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  onJumpToNow,
  onSkipHours,
  onSkipDays
}: TimeSliderOverlayProps) {
  const [showExpanded, setShowExpanded] = useState(false);

  // Calculate hours from now for slider
  const now = new Date();
  const hoursFromNow = (currentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const maxHoursBack = -72; // 3 days back
  const maxHoursForward = 72; // 3 days forward

  const handleSliderChange = (value: number) => {
    const newDate = new Date(now.getTime() + (value * 60 * 60 * 1000));
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return date.toLocaleString('en-GB', options);
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto">
      {/* Compact View */}
      {!showExpanded ? (
        <button
          onClick={() => setShowExpanded(true)}
          className="obsidian-glass backdrop-blur-xl border-2 border-amber-500/30 rounded-full px-6 py-3 hover:border-amber-400 transition-all shadow-[0_0_30px_rgba(251,191,36,0.3)] flex items-center gap-3"
        >
          <Clock className="w-5 h-5 text-amber-400" />
          <span className="text-cyan-400 font-mono text-sm">{formatDate(currentDate)}</span>
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
        </button>
      ) : (
        /* Extended View */
        <div className="obsidian-glass backdrop-blur-xl border-2 border-amber-500/30 rounded-2xl p-4 shadow-[0_0_40px_rgba(251,191,36,0.4)] w-[800px]">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="text-cyan-400 font-mono text-sm font-bold">TIME NAVIGATOR</span>
            </div>
            <button
              onClick={() => setShowExpanded(false)}
              className="text-cyan-400 hover:text-amber-400 text-xs font-mono"
            >
              MINIMIZE
            </button>
          </div>

          {/* Current Time Display */}
          <div className="text-center mb-4">
            <div className="text-amber-400 font-mono text-2xl font-bold">
              {formatDate(currentDate)}
            </div>
            <div className="text-cyan-400/60 text-xs font-mono mt-1">
              {hoursFromNow > 0 ? `+${hoursFromNow.toFixed(1)}h` : `${hoursFromNow.toFixed(1)}h`} from now
            </div>
          </div>

          {/* Time Slider */}
          <div className="mb-4">
            <input
              type="range"
              min={maxHoursBack}
              max={maxHoursForward}
              step={1}
              value={hoursFromNow}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-cyan-900/30 rounded-lg appearance-none cursor-pointer accent-amber-400"
              style={{
                background: `linear-gradient(to right, 
                  rgba(6, 182, 212, 0.3) 0%, 
                  rgba(251, 191, 36, 0.6) ${((hoursFromNow - maxHoursBack) / (maxHoursForward - maxHoursBack)) * 100}%, 
                  rgba(6, 182, 212, 0.3) ${((hoursFromNow - maxHoursBack) / (maxHoursForward - maxHoursBack)) * 100}%, 
                  rgba(6, 182, 212, 0.3) 100%)`
              }}
            />
            <div className="flex justify-between text-[10px] font-mono text-cyan-400/40 mt-1">
              <span>-72h</span>
              <span>NOW</span>
              <span>+72h</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-2">
            {/* Quick Skip Buttons */}
            <div className="flex gap-1">
              <button
                onClick={() => onSkipDays(-1)}
                className="holo-card px-2 py-2 text-cyan-400 hover:text-amber-400 text-xs"
                title="-1 Day"
              >
                <Rewind className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSkipHours(-6)}
                className="holo-card px-2 py-2 text-cyan-400 hover:text-amber-400 text-xs"
                title="-6 Hours"
              >
                -6h
              </button>
              <button
                onClick={() => onSkipHours(-1)}
                className="holo-card px-2 py-2 text-cyan-400 hover:text-amber-400 text-xs"
                title="-1 Hour"
              >
                -1h
              </button>
            </div>

            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`holo-card px-4 py-2 ${isPlaying ? 'border-green-400 text-green-400' : 'text-cyan-400'} hover:text-amber-400`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            {/* Jump to Now */}
            <button
              onClick={onJumpToNow}
              className="holo-card px-3 py-2 text-amber-400 hover:text-cyan-400 text-xs font-mono"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Quick Skip Forward */}
            <div className="flex gap-1">
              <button
                onClick={() => onSkipHours(1)}
                className="holo-card px-2 py-2 text-cyan-400 hover:text-amber-400 text-xs"
                title="+1 Hour"
              >
                +1h
              </button>
              <button
                onClick={() => onSkipHours(6)}
                className="holo-card px-2 py-2 text-cyan-400 hover:text-amber-400 text-xs"
                title="+6 Hours"
              >
                +6h
              </button>
              <button
                onClick={() => onSkipDays(1)}
                className="holo-card px-2 py-2 text-cyan-400 hover:text-amber-400 text-xs"
                title="+1 Day"
              >
                <FastForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Playback Speed */}
          <div className="mt-3 flex items-center gap-3">
            <span className="text-cyan-400/60 text-xs font-mono">SPEED:</span>
            <div className="flex gap-1">
              {[0.5, 1, 2, 5, 10].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                    playbackSpeed === speed
                      ? 'bg-amber-400/20 text-amber-400 border border-amber-400'
                      : 'text-cyan-400/60 hover:text-cyan-400'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
