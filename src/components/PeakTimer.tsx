import { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import type { Location } from '../types/aurora';

interface PeakTimerProps {
  location: Location;
}

export function PeakTimer({ location }: PeakTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [magneticMidnight, setMagneticMidnight] = useState<Date | null>(null);

  useEffect(() => {
    const calculateMagneticMidnight = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const longitudeOffset = location.lon / 15;
      let midnight = new Date(today);
      midnight.setHours(0, 0, 0, 0);
      midnight.setHours(midnight.getHours() - longitudeOffset);
      
      if (midnight < now) {
        midnight = new Date(midnight);
        midnight.setDate(midnight.getDate() + 1);
      }
      
      return midnight;
    };

    const updateCountdown = () => {
      const targetMidnight = calculateMagneticMidnight();
      setMagneticMidnight(targetMidnight);
      
      const now = new Date();
      const diff = targetMidnight.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining('00:00:00');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [location]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/30">
        <Target className="w-4 h-4 text-cyan-400" />
        <h3 className="text-[11px] font-black tracking-widest text-cyan-400">PEAK WINDOW</h3>
      </div>

      <div className="border border-cyan-500/20 bg-black/40 p-3 text-center">
        <div className="text-[9px] text-cyan-600 font-mono mb-1 tracking-wider">TIME TO PEAK</div>
        <div className="text-3xl font-black text-green-400 font-mono tracking-wider hud-glow-strong">
          {timeRemaining}
        </div>
        {magneticMidnight && (
          <div className="text-[9px] text-cyan-700 font-mono mt-2">
            TARGET: {magneticMidnight.toLocaleTimeString('en-US', { hour12: false })}
          </div>
        )}
      </div>

      <div className="border border-cyan-500/20 bg-black/30 p-2 text-[8px] text-cyan-600 font-mono text-center">
        PEAK AT MAGNETIC MIDNIGHT
      </div>
    </div>
  );
}
