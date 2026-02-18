/**
 * Targeting HUD - Wolf-Fanged Crosshair Reticle
 * Pulses when target in "Kill Zone" (center 10% of viewport)
 */

import { useEffect, useState } from 'react';

interface TargetingHUDProps {
  isTargetLocked: boolean; // Set to true when a planet is centered
  targetName?: string;
}

export function TargetingHUD({ isTargetLocked, targetName }: TargetingHUDProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (isTargetLocked) {
      setIsPulsing(true);
      
      // Play digital chirp sound
      playTargetChirp();
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    } else {
      setIsPulsing(false);
    }
  }, [isTargetLocked]);

  const playTargetChirp = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[900] flex items-center justify-center">
      
      {/* Crosshair SVG */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        className={`transition-all duration-300 ${isPulsing ? 'scale-110' : 'scale-100'}`}
        style={{
          filter: `drop-shadow(0 0 ${isPulsing ? '20px' : '10px'} rgba(74, 222, 128, 0.8))`
        }}
      >
        <defs>
          <linearGradient id="reticleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* Center Dot */}
        <circle
          cx="60"
          cy="60"
          r="3"
          fill={isPulsing ? '#4ade80' : '#06b6d4'}
          className={isPulsing ? 'animate-ping' : ''}
        />

        {/* Crosshair Lines */}
        <line x1="60" y1="15" x2="60" y2="45" stroke="url(#reticleGradient)" strokeWidth="2" />
        <line x1="60" y1="75" x2="60" y2="105" stroke="url(#reticleGradient)" strokeWidth="2" />
        <line x1="15" y1="60" x2="45" y2="60" stroke="url(#reticleGradient)" strokeWidth="2" />
        <line x1="75" y1="60" x2="105" y2="60" stroke="url(#reticleGradient)" strokeWidth="2" />

        {/* Fanged Corners (Sharp, predator-like) */}
        {/* Top-Left Fang */}
        <path
          d="M 20,20 L 30,20 L 20,30 Z"
          fill="none"
          stroke="url(#reticleGradient)"
          strokeWidth="2"
        />
        
        {/* Top-Right Fang */}
        <path
          d="M 100,20 L 90,20 L 100,30 Z"
          fill="none"
          stroke="url(#reticleGradient)"
          strokeWidth="2"
        />
        
        {/* Bottom-Left Fang */}
        <path
          d="M 20,100 L 30,100 L 20,90 Z"
          fill="none"
          stroke="url(#reticleGradient)"
          strokeWidth="2"
        />
        
        {/* Bottom-Right Fang */}
        <path
          d="M 100,100 L 90,100 L 100,90 Z"
          fill="none"
          stroke="url(#reticleGradient)"
          strokeWidth="2"
        />

        {/* Lock Ring (Only when locked) */}
        {isPulsing && (
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#4ade80"
            strokeWidth="2"
            strokeDasharray="10 5"
            className="animate-spin"
            style={{ animationDuration: '4s' }}
          />
        )}
      </svg>

      {/* Target Name Display */}
      {isTargetLocked && targetName && (
        <div
          className="absolute top-[calc(50%-80px)] left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md border border-green-500 px-4 py-2 rounded text-green-400 font-bold tracking-wider animate-fade-in"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          TARGET LOCKED: {targetName.toUpperCase()}
        </div>
      )}

      {/* Lock Status Indicator */}
      <div className="absolute bottom-[calc(50%+80px)] left-1/2 transform -translate-x-1/2 flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${isPulsing ? 'bg-green-400 animate-pulse' : 'bg-cyan-600/50'}`}
        />
        <span className="text-xs text-cyan-400/70 uppercase tracking-wide">
          {isPulsing ? 'LOCK CONFIRMED' : 'SCANNING...'}
        </span>
      </div>
    </div>
  );
}
