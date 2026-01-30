import { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Maximize } from 'lucide-react';
import Stats from 'stats.js';

interface TelemetryDeckProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  solarWindSpeed: number;
  kpValue: number;
  focusedBody: string | null;
  onResetView: () => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
}

export default function TelemetryDeck({
  currentDate,
  onDateChange,
  solarWindSpeed,
  kpValue,
  focusedBody,
  onResetView,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed
}: TelemetryDeckProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tickerText, setTickerText] = useState('');
  const [showStats, setShowStats] = useState(false);
  const statsRef = useRef<Stats | null>(null);
  const tickerOffset = useRef(0);

  // Playback effect
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      onDateChange(new Date(currentDate.getTime() + playbackSpeed * 60 * 60 * 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, currentDate, onDateChange]);

  // Solar Heartbeat Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let phase = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Calculate wave parameters based on solar wind and Kp
      const frequency = (solarWindSpeed / 400) * 0.05; // Faster wave with higher speed
      const amplitude = (kpValue / 9) * (height * 0.3); // Higher amplitude with higher Kp
      const baseAmplitude = height * 0.1;

      // Color based on conditions
      let color: string;
      if (kpValue >= 7) {
        color = '#ff0044'; // Red - storm
      } else if (kpValue >= 5) {
        color = '#ff8800'; // Orange - elevated
      } else if (solarWindSpeed > 500) {
        color = '#ffaa00'; // Yellow - fast wind
      } else {
        color = '#00ffaa'; // Cyan - calm
      }

      // Draw sine wave
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;

      for (let x = 0; x < width; x++) {
        const y = height / 2 + 
          (baseAmplitude + amplitude) * Math.sin((x / width) * Math.PI * 4 + phase);
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Update phase for animation
      phase += frequency;
      if (phase > Math.PI * 2) phase = 0;

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [solarWindSpeed, kpValue]);

  // FPS Counter Setup
  useEffect(() => {
    if (showStats && !statsRef.current) {
      const stats = new Stats();
      stats.showPanel(0); // 0: fps, 1: ms, 2: mb
      stats.dom.style.position = 'fixed';
      stats.dom.style.top = '10px';
      stats.dom.style.right = '10px';
      stats.dom.style.left = 'auto';
      stats.dom.style.zIndex = '9999';
      document.body.appendChild(stats.dom);
      statsRef.current = stats;

      const animate = () => {
        stats.begin();
        stats.end();
        requestAnimationFrame(animate);
      };
      animate();
    } else if (!showStats && statsRef.current) {
      document.body.removeChild(statsRef.current.dom);
      statsRef.current = null;
    }
  }, [showStats]);

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Scrolling Ticker
  useEffect(() => {
    const facts = [
      'SYSTEM NOMINAL',
      `SOLAR WIND: ${solarWindSpeed} km/s`,
      `SHIELD STATUS: ${Math.max(0, 100 - kpValue * 10).toFixed(0)}%`,
      `ORBIT: ${focusedBody || 'SOLAR SYSTEM OVERVIEW'}`,
      `KP INDEX: ${kpValue.toFixed(1)}`,
      'POWER GRID: STABLE',
      'SATELLITE NETWORK: OPERATIONAL',
      "DON'T PANIC",
      'AURORA PROBABILITY: CALCULATING...',
      `CME TRANSIT TIME: ${((150000000 / (solarWindSpeed || 400)) / 24).toFixed(1)} days`,
      'MAGNETOSPHERE: INTACT',
      'THE SPICE MUST FLOW',
      'ALL SYSTEMS GREEN',
      `DATE: ${currentDate.toLocaleDateString()}`,
      'MISSION STATUS: ACTIVE'
    ];

    setTickerText(facts.join(' ... ') + ' ... ');

    const interval = setInterval(() => {
      tickerOffset.current += 1;
    }, 50);

    return () => clearInterval(interval);
  }, [solarWindSpeed, kpValue, focusedBody, currentDate]);

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const threeDaysLater = Date.now() + 3 * 24 * 60 * 60 * 1000;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-32 bg-black/20 backdrop-blur-md border-t border-white/10 shadow-lg shadow-purple-500/5 pointer-events-auto">
      <div className="grid grid-cols-3 h-full gap-4 p-4">
        {/* LEFT: Time Controls (LCARS Style) */}
        <div className="flex flex-col justify-center space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDateChange(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))}
              className="p-2 bg-cyan-600/20 hover:bg-cyan-600/40 border-2 border-cyan-400 rounded"
            >
              <SkipBack className="w-5 h-5 text-cyan-300" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 border-2 rounded ${
                isPlaying 
                  ? 'bg-orange-600/20 hover:bg-orange-600/40 border-orange-400' 
                  : 'bg-green-600/20 hover:bg-green-600/40 border-green-400'
              }`}
            >
              {isPlaying ? 
                <Pause className="w-5 h-5 text-orange-300" /> : 
                <Play className="w-5 h-5 text-green-300" />
              }
            </button>
            <button
              onClick={() => onDateChange(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}
              className="p-2 bg-cyan-600/20 hover:bg-cyan-600/40 border-2 border-cyan-400 rounded"
            >
              <SkipForward className="w-5 h-5 text-cyan-300" />
            </button>
            <button
              onClick={() => onDateChange(new Date())}
              className="p-2 bg-purple-600/20 hover:bg-purple-600/40 border-2 border-purple-400 rounded"
            >
              NOW
            </button>
          </div>

          <input
            type="range"
            min={sevenDaysAgo}
            max={threeDaysLater}
            value={currentDate.getTime()}
            onChange={(e) => onDateChange(new Date(parseInt(e.target.value)))}
            className="w-full h-2 bg-cyan-900 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #0891b2 0%, #0891b2 ${
                ((currentDate.getTime() - sevenDaysAgo) / (threeDaysLater - sevenDaysAgo)) * 100
              }%, #1e293b ${
                ((currentDate.getTime() - sevenDaysAgo) / (threeDaysLater - sevenDaysAgo)) * 100
              }%, #1e293b 100%)`
            }}
          />

          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="px-3 py-1 bg-slate-800 border-2 border-cyan-400 rounded text-cyan-300 text-sm font-bold"
          >
            <option value={1}>1x</option>
            <option value={10}>10x</option>
            <option value={100}>100x</option>
            <option value={1000}>1000x</option>
          </select>
        </div>

        {/* CENTER: Solar Heartbeat Visualizer */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-xs font-bold text-cyan-400 mb-1">SOLAR HEARTBEAT</div>
          <canvas
            ref={canvasRef}
            width={400}
            height={80}
            className="border-2 border-cyan-400/30 rounded bg-black/50"
          />
        </div>

        {/* RIGHT: System Status Ticker */}
        <div className="flex flex-col justify-center">
          <div className="text-xs font-bold text-cyan-400 mb-2">SYSTEM STATUS</div>
          <div className="overflow-hidden bg-black/50 border-2 border-cyan-400/30 rounded p-2">
            <div 
              className="whitespace-nowrap text-green-400 font-mono text-sm"
              style={{
                transform: `translateX(-${tickerOffset.current}px)`,
                transition: 'transform 0.05s linear'
              }}
            >
              {tickerText}
            </div>
          </div>
          
          {/* Action Buttons Row */}
          <div className="mt-2 flex items-center gap-2">
            {/* Reset View Button */}
            {focusedBody && (
              <button
                onClick={onResetView}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border-2 border-red-400 rounded text-red-300 font-bold text-sm transition-all hover:scale-105 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                RESET VIEW
              </button>
            )}
            
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 border-2 border-purple-400 rounded text-purple-300 font-bold text-sm transition-all hover:scale-105 active:scale-95"
              title="Toggle Fullscreen (F11)"
            >
              <Maximize className="w-4 h-4" />
              FULLSCREEN
            </button>
            
            {/* FPS Counter Toggle */}
            <button
              onClick={() => setShowStats(!showStats)}
              className={`px-4 py-2 border-2 rounded font-bold text-sm transition-all hover:scale-105 active:scale-95 ${
                showStats 
                  ? 'bg-green-600/30 border-green-400 text-green-300' 
                  : 'bg-cyan-600/20 hover:bg-cyan-600/40 border-cyan-400 text-cyan-300'
              }`}
              title="Toggle FPS Counter"
            >
              {showStats ? '✓ FPS' : 'FPS'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
