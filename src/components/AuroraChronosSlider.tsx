/**
 * Award-Winning Aurora Chronos Slider
 * Beautiful time slider with aurora gradient, wolf-head thumb, and magnetic snapping
 */

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface AuroraChronosSliderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  kpValue?: number; // For glow intensity
}

export function AuroraChronosSlider({ currentDate, onDateChange, kpValue = 3 }: AuroraChronosSliderProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  // Calculate timestamp range (±30 days from now)
  const now = new Date();
  const minDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const maxDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const minTimestamp = minDate.getTime();
  const maxTimestamp = maxDate.getTime();
  const currentTimestamp = currentDate.getTime();

  // Calculate position percentage
  const positionPercent = ((currentTimestamp - minTimestamp) / (maxTimestamp - minTimestamp)) * 100;

  // Glow color based on Kp
  const glowColor = kpValue >= 7 ? '#ff0000' : kpValue >= 5 ? '#ff6b00' : kpValue >= 3 ? '#ffaa00' : '#00ff99';
  const glowIntensity = Math.min(kpValue / 9 * 40, 40);

  // v3.8: Handle slider change with GSAP temporal lerp and magnetic snapping
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const timestamp = minTimestamp + (value / 100) * (maxTimestamp - minTimestamp);
    
    // Magnetic snapping to nearest hour
    const date = new Date(timestamp);
    const minutes = date.getMinutes();
    
    // Snap to hour if within 5 minutes
    if (minutes < 5) {
      date.setMinutes(0, 0, 0);
    } else if (minutes > 55) {
      date.setHours(date.getHours() + 1, 0, 0, 0);
    } else {
      date.setSeconds(0, 0);
    }
    
    onDateChange(date);
  };

  return (
    <div className="w-full px-6 py-8">
      {/* Glassmorphism Container */}
      <div
        ref={sliderRef}
        className="relative backdrop-blur-lg bg-black/30 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,255,153,0.2)]"
        style={{
          backdropFilter: 'blur(8px)',
          background: 'linear-gradient(135deg, rgba(0,10,30,0.6), rgba(10,10,46,0.6))'
        }}
      >
        {/* Time Label */}
        <div className="text-center mb-6">
          <div className="text-cyan-400 font-bold text-2xl tracking-widest" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            {currentDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div className="text-cyan-600 text-xs mt-1 uppercase tracking-wide">
            CHRONOS TEMPORAL POSITION
          </div>
        </div>

        {/* Custom Slider */}
        <div className="relative h-12 flex items-center">
          
          {/* Aurora Gradient Track */}
          <div className="absolute inset-0 h-3 rounded-full overflow-hidden">
            <div
              className="absolute inset-0 aurora-flow"
              style={{
                background: 'linear-gradient(90deg, #00ff99 0%, #00d4aa 25%, #0088cc 50%, #0a0a2e 75%, #00ff99 100%)',
                backgroundSize: '200% 100%',
                animation: 'aurora-flow 8s linear infinite'
              }}
            />
            {/* Inner glow */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
              style={{ animation: 'shimmer 3s ease-in-out infinite' }}
            />
          </div>

          {/* Progress Fill */}
          <div
            className="absolute left-0 h-3 rounded-full bg-gradient-to-r from-green-500 to-cyan-500"
            style={{
              width: `${positionPercent}%`,
              boxShadow: `0 0 20px ${glowColor}`
            }}
          />

          {/* HTML Range Input (Invisible, for interaction) */}
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={positionPercent}
            onChange={handleSliderChange}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          {/* Wolf-Head Thumb */}
          <div
            ref={thumbRef}
            className={`absolute w-12 h-12 -mt-3 pointer-events-none transition-transform duration-200 ${isDragging ? 'scale-125' : isHovering ? 'scale-110' : 'scale-100'}`}
            style={{
              left: `calc(${positionPercent}% - 24px)`,
              filter: `drop-shadow(0 0 ${glowIntensity}px ${glowColor})`
            }}
          >
            {/* Wolf Head SVG */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              className="animate-pulse-slow"
            >
              <defs>
                <radialGradient id="wolfGlow">
                  <stop offset="0%" stopColor={glowColor} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Glow Aura */}
              <circle cx="24" cy="24" r="20" fill="url(#wolfGlow)" />

              {/* Low-Poly Wolf Head */}
              <g transform="translate(24, 24) scale(0.4)">
                {/* Skull */}
                <polygon
                  points="-20,-10 -10,-20 10,-20 20,-10 10,0 -10,0"
                  fill="none"
                  stroke={glowColor}
                  strokeWidth="2"
                />
                {/* Muzzle */}
                <polygon
                  points="10,-5 25,-3 25,3 10,5"
                  fill="none"
                  stroke={glowColor}
                  strokeWidth="2"
                />
                {/* Ears */}
                <polygon
                  points="-20,-10 -15,-25 -8,-15"
                  fill="none"
                  stroke={glowColor}
                  strokeWidth="2"
                />
                <polygon
                  points="-5,-20 0,-28 5,-20"
                  fill="none"
                  stroke={glowColor}
                  strokeWidth="2"
                />
                {/* Eye */}
                <circle cx="0" cy="-8" r="2" fill={glowColor} />
              </g>
            </svg>
          </div>
        </div>

        {/* Hour Markers */}
        <div className="flex justify-between mt-4 text-[10px] text-cyan-600/60">
          <span>-30D</span>
          <span>-15D</span>
          <span className="text-cyan-400 font-bold">NOW</span>
          <span>+15D</span>
          <span>+30D</span>
        </div>

        {/* Kp Indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="text-xs text-cyan-500 uppercase tracking-wide">Kp Index:</div>
          <div
            className="px-3 py-1 rounded-full font-bold text-sm"
            style={{
              backgroundColor: `${glowColor}20`,
              color: glowColor,
              border: `1px solid ${glowColor}`
            }}
          >
            {kpValue.toFixed(1)}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes aurora-flow {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
