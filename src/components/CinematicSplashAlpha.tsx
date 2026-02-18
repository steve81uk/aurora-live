/**
 * SKÖLL-TRACK Alpha Cinematic Splash Screen
 * Static WolfIcon with CSS Neural-Link animation - ZERO AUDIO on load
 */

import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { WolfIcon } from './WolfIcon';

interface CinematicSplashAlphaProps {
  onComplete: () => void;
}

export function CinematicSplashAlpha({ onComplete }: CinematicSplashAlphaProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleBeginMission = () => {
    // Zoom animation with GSAP - NO AUDIO
    gsap.to('.alpha-splash-container', {
      scale: 3,
      opacity: 0,
      duration: 1.8,
      ease: 'power2.in',
      onComplete
    });
  };

  return (
    <div className="fixed inset-0 z-[999] overflow-hidden alpha-splash-container grid place-items-center">
      
      {/* Deep Space Background with Radial Gradient */}
      <div 
        className="absolute inset-0" 
        style={{
          background: 'radial-gradient(ellipse at center, rgba(10, 25, 47, 1) 0%, rgba(0, 0, 0, 1) 70%)'
        }}
      />

      {/* Star Field */}
      <div className="absolute inset-0">
        {[...Array(200)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              opacity: Math.random() * 0.9 + 0.1,
              boxShadow: `0 0 ${Math.random() * 4 + 2}px rgba(255,255,255,0.8)`
            }}
          />
        ))}
      </div>

      {/* MAIN CONTENT - DEAD CENTER VERTICAL STACK */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        
        {/* Wolf Icon with Neural-Link Pulsing Drop-Shadow */}
        <div 
          className={`relative mb-12 transition-all duration-1500 neural-link-pulse ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
          style={{
            filter: 'drop-shadow(0 0 15px #00ffff)',
            transformOrigin: 'center center'
          }}
        >
          <WolfIcon size={300} className="wolf-icon-static" />
        </div>

        {/* SKÖLL-TRACK Title */}
        <h1 
          className={`text-7xl font-bold tracking-[0.3em] text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-purple-500 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
          style={{ 
            fontFamily: 'Rajdhani, sans-serif', 
            textShadow: '0 0 30px rgba(6, 214, 160, 0.6), 0 0 60px rgba(6, 182, 212, 0.4), 0 0 90px rgba(168, 85, 247, 0.2)' 
          }}
        >
          SKÖLL-TRACK
        </h1>

        {/* Subtitle */}
        <p className="text-cyan-400/80 text-sm tracking-[0.2rem] font-mono text-center mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          ALPHA v3.10 • NEURAL LINK CALIBRATION
        </p>

        {/* Loading Bar */}
        <div className={`w-full max-w-md transition-all duration-1000 delay-300 mt-8 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-center mb-4">
            <p className="text-green-400 font-mono text-xs tracking-wider">
              NEURAL CALIBRATION OPTIMISED
            </p>
            <p className="text-cyan-400/60 font-mono text-[10px] mt-1">
              MAGNETOSPHERE SYNCHRONISATION: 100%
            </p>
          </div>

          <div className="relative h-2 bg-black/60 rounded-full overflow-hidden border border-cyan-500/30">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-green-400 to-purple-500 rounded-full"
              style={{
                animation: 'progressFill 2.5s ease-out forwards',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.8), inset 0 0 10px rgba(0, 255, 255, 0.4)'
              }}
            />
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
            />
          </div>
        </div>

        {/* BEGIN MISSION BUTTON - Cyan Neon Border */}
        <button
          onClick={handleBeginMission}
          className={`
            mt-12 px-12 py-4 
            bg-gradient-to-r from-cyan-600/20 to-purple-600/20 
            border-2 border-cyan-400/50 
            rounded-lg 
            text-cyan-300 font-bold text-lg tracking-[0.2em]
            transition-all duration-300
            hover:border-cyan-300 
            hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]
            hover:scale-105
            ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          BEGIN MISSION
        </button>

        {/* Version Badge */}
        <div className="mt-6 text-white/30 font-mono text-[10px] tracking-wider text-center">
          CAMBRIDGE, UK • 2026
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&family=Inter:wght@400;700&display=swap');

        @keyframes neural-link {
          0%, 100% { 
            filter: drop-shadow(0 0 15px #00ffff); 
          }
          50% { 
            filter: drop-shadow(0 0 30px #00ffff) drop-shadow(0 0 60px #00ff99); 
          }
        }

        .neural-link-pulse {
          animation: neural-link 3s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
