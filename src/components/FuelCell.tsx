/**
 * FuelCell Component - Donation Button
 * Ko-fi/Buy Me Coffee styled as fuel cell with wolf-chime audio
 */

import { useState } from 'react';

interface FuelCellProps {
  donationLink?: string; // Ko-fi or Buy Me Coffee URL
}

export function FuelCell({ donationLink = 'https://ko-fi.com/steve81uk' }: FuelCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Play wolf-chime audio on hover
  const playWolfChime = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Metallic "ka-ching" sound
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.value = 800;
    
    osc2.type = 'sine';
    osc2.frequency.value = 1200;
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.3);
    osc2.stop(ctx.currentTime + 0.3);
  };

  // Handle click with animation
  const handleClick = () => {
    setIsClicked(true);
    
    // Open donation link in new tab
    window.open(donationLink, '_blank');
    
    // Play success sound
    playSuccessSound();
    
    // Trigger "Thank You" animation
    setTimeout(() => setIsClicked(false), 2000);
  };

  const playSuccessSound = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Rising triumphant sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  return (
    <>
      {/* Fuel Cell Button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => {
          setIsHovered(true);
          playWolfChime();
        }}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed bottom-6 left-6 z-[1000] pointer-events-auto group transition-all duration-500 ${isHovered ? 'scale-110' : 'scale-100'} ${isClicked ? 'scale-125 rotate-12' : ''}`}
      >
        {/* Fuel Cell Container */}
        <div className="relative w-16 h-32 rounded-lg overflow-hidden backdrop-blur-md bg-black/60 border-2 border-amber-500 shadow-[0_0_30px_rgba(251,191,36,0.5)]">
          
          {/* Amber Liquid Fill (Pulsing Animation) */}
          <div
            className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300 animate-fuel-pulse"
            style={{
              height: '70%',
              boxShadow: '0 -10px 30px rgba(251, 191, 36, 0.8)'
            }}
          />
          
          {/* Bubbles Effect */}
          <div className="absolute inset-0 flex flex-col items-center justify-end gap-2 p-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-amber-200 rounded-full animate-bubble opacity-60"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
            ))}
          </div>

          {/* Glowing Top Cap */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-amber-400 to-transparent" />
          
          {/* Icon - Lightning Bolt */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-amber-300 text-xl">
            ⚡
          </div>
        </div>

        {/* Hover Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 whitespace-nowrap animate-fade-in">
            <div className="backdrop-blur-md bg-white/10 border border-amber-500 px-4 py-2 rounded-lg">
              <div className="text-amber-400 font-bold text-sm tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                REFUEL THE ALPHA
              </div>
              <div className="text-cyan-400 text-xs mt-1">
                SUPPORT STEVE
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-amber-500/50" />
          </div>
        )}
      </button>

      {/* "Thank You" Wolf Howl Animation */}
      {isClicked && (
        <div className="fixed inset-0 z-[999] pointer-events-none flex items-center justify-center animate-fade-in">
          <div className="bg-black/80 backdrop-blur-md border-2 border-amber-500 rounded-lg px-8 py-6 animate-scale-in">
            <div className="text-6xl mb-4 animate-howl">🐺</div>
            <div className="text-amber-400 font-bold text-2xl tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              THANK YOU, ALPHA!
            </div>
            <div className="text-cyan-400 text-sm mt-2">
              The Wolf Pack grows stronger
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fuel-pulse {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.8; transform: translateY(-2px); }
        }

        @keyframes bubble {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-60px) scale(0); opacity: 0; }
        }

        @keyframes howl {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3) rotate(10deg); }
        }

        .animate-fuel-pulse {
          animation: fuel-pulse 2s ease-in-out infinite;
        }

        .animate-bubble {
          animation: bubble 3s ease-in-out infinite;
        }

        .animate-howl {
          animation: howl 1s ease-in-out;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }

        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
