/**
 * Solar Apex Timer Component
 * Countdown to Solar Maximum (July 2026)
 * Updates in real-time with SSN-based fury gauge
 */

import { useState, useEffect } from 'react';
import { Zap, TrendingUp } from 'lucide-react';

export function SolarApexTimer() {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Solar Maximum target: July 2026 (estimated)
  const TARGET_DATE = new Date('2026-07-01T00:00:00Z').getTime();

  // Mock SSN (Sunspot Number) - in production, fetch from NOAA
  const currentSSN = 150 + Math.random() * 50; // Typical range during maximum
  const maxSSN = 200; // Peak estimate

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const difference = TARGET_DATE - now;

      if (difference > 0) {
        setTimeRemaining({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Wolf-chime on 100-day milestones
  useEffect(() => {
    if (timeRemaining.days % 100 === 0 && timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds === 0) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 1200;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  }, [timeRemaining]);

  // Fury gauge intensity based on SSN
  const furyLevel = (currentSSN / maxSSN) * 100;
  const furyColor = furyLevel > 80 ? 'from-red-600 to-orange-600' : furyLevel > 50 ? 'from-orange-600 to-yellow-600' : 'from-yellow-600 to-green-600';

  return (
    <div className="backdrop-blur-lg bg-black/40 border-2 border-red-500/50 rounded-lg p-4 min-w-[320px] shadow-[0_0_40px_rgba(239,68,68,0.4)]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-red-500/30">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-red-400 animate-pulse" />
          <div className="text-red-400 font-bold text-lg font-mono">SOLAR APEX</div>
        </div>
        <TrendingUp className="w-5 h-5 text-amber-400" />
      </div>

      {/* Countdown */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-red-400 font-mono">{timeRemaining.days}</div>
          <div className="text-xs text-red-600 font-mono">DAYS</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-400 font-mono">{timeRemaining.hours.toString().padStart(2, '0')}</div>
          <div className="text-xs text-orange-600 font-mono">HRS</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-400 font-mono">{timeRemaining.minutes.toString().padStart(2, '0')}</div>
          <div className="text-xs text-yellow-600 font-mono">MIN</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-amber-400 font-mono">{timeRemaining.seconds.toString().padStart(2, '0')}</div>
          <div className="text-xs text-amber-600 font-mono">SEC</div>
        </div>
      </div>

      {/* Target Date */}
      <div className="text-center mb-4 py-2 bg-red-500/10 rounded border border-red-500/30">
        <div className="text-red-400 font-mono text-xs">TARGET: JULY 2026</div>
        <div className="text-red-600 font-mono text-[10px]">SOLAR CYCLE 25 MAXIMUM</div>
      </div>

      {/* Fury Gauge */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-amber-400 text-xs font-mono uppercase">Solar Fury</div>
          <div className="text-red-400 font-bold font-mono text-sm">
            SSN {currentSSN.toFixed(0)}
          </div>
        </div>
        <div className="relative w-full h-3 bg-black/50 rounded-full overflow-hidden border border-red-500/30">
          <div
            className={`h-full bg-gradient-to-r ${furyColor} transition-all duration-1000`}
            style={{ width: `${furyLevel}%` }}
          />
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
              animation: 'shimmer 2s infinite'
            }}
          />
        </div>
        <div className="text-center mt-1 text-[10px] text-red-600 font-mono">
          {furyLevel > 80 ? 'EXTREME ACTIVITY' : furyLevel > 50 ? 'HIGH ACTIVITY' : 'MODERATE ACTIVITY'}
        </div>
      </div>

      {/* Progress Message */}
      <div className="text-center p-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded border border-red-500/50">
        <div className="text-red-400 font-bold text-sm font-mono mb-1">
          THE WOLF HUNTS AT MAXIMUM
        </div>
        <div className="text-red-600 text-xs font-mono">
          Peak aurora activity approaching 🐺
        </div>
      </div>

      {/* Milestone Indicator */}
      {timeRemaining.days % 100 < 10 && (
        <div className="mt-3 text-center text-xs text-amber-400 font-mono animate-pulse">
          🎯 {100 - (timeRemaining.days % 100)} days to next 100-day milestone
        </div>
      )}

      {/* CSS */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
