/**
 * SKÖLL-TRACK Wolf Head Splash Screen
 * Side profile of wolf with aurora glow
 */

import { useEffect, useState } from 'react';
import gsap from 'gsap';

interface WolfSplashProps {
  onComplete: () => void;
}

export function WolfSplash({ onComplete }: WolfSplashProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBeginMission = () => {
    // Zoom animation
    gsap.to('.splash-container', {
      scale: 3,
      opacity: 0,
      duration: 1.5,
      ease: 'power2.in',
      onComplete
    });
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center overflow-hidden splash-container">
      
      {/* Animated Aurora Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-green-500/10 via-cyan-500/5 to-transparent animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-70" />
      </div>

      {/* Twinkling Stars */}
      <div className="absolute inset-0">
        {[...Array(150)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Wolf Head SVG - Side Profile */}
        <svg
          width="400"
          height="400"
          viewBox="0 0 400 400"
          className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
        >
          {/* Glow/Aura */}
          <defs>
            <radialGradient id="auroraGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </radialGradient>
            
            <linearGradient id="wolfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06D6A0" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* Animated aurora stroke */}
            <linearGradient id="auroraStroke">
              <stop offset="0%" stopColor="#10b981">
                <animate attributeName="stop-color" values="#10b981;#06b6d4;#a855f7;#10b981" dur="4s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#a855f7">
                <animate attributeName="stop-color" values="#a855f7;#10b981;#06b6d4;#a855f7" dur="4s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>

          {/* Aurora Glow Background */}
          <circle cx="200" cy="200" r="180" fill="url(#auroraGlow)" opacity="0.5">
            <animate attributeName="r" values="180;200;180" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Wolf Head Silhouette - Side Profile (Facing Right) */}
          <g transform="translate(100, 100)">
            
            {/* Head/Snout */}
            <path
              d="M 50,150 
                 Q 30,140 20,120 
                 Q 15,100 20,80 
                 Q 25,60 35,50 
                 L 50,40
                 Q 60,35 70,40
                 L 90,55
                 Q 100,65 110,80
                 Q 115,95 115,110
                 L 115,130
                 Q 110,145 100,155
                 L 85,165
                 Q 70,170 50,165
                 Z"
              fill="none"
              stroke="url(#auroraStroke)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />

            {/* Ear (Pointed Triangle) */}
            <path
              d="M 105,60 L 125,20 L 115,55 Z"
              fill="none"
              stroke="url(#auroraStroke)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Snout Detail */}
            <path
              d="M 20,120 Q 10,115 5,110"
              fill="none"
              stroke="url(#auroraStroke)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Jaw Line */}
            <path
              d="M 50,165 Q 30,155 20,140"
              fill="none"
              stroke="url(#auroraStroke)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Eye (Glowing) */}
            <circle cx="70" cy="80" r="6" fill="#06D6A0" opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.4;0.9" dur="3s" repeatCount="indefinite" />
            </circle>
            
            {/* Eye Glow */}
            <circle cx="70" cy="80" r="10" fill="#06D6A0" opacity="0.3">
              <animate attributeName="r" values="10;15;10" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
            </circle>

            {/* Neck Fur Lines */}
            <path d="M 100,155 L 105,175" stroke="url(#auroraStroke)" strokeWidth="2" opacity="0.7" />
            <path d="M 90,160 L 92,180" stroke="url(#auroraStroke)" strokeWidth="2" opacity="0.6" />
            <path d="M 80,163 L 78,183" stroke="url(#auroraStroke)" strokeWidth="2" opacity="0.5" />

          </g>

        </svg>

        {/* Title Text */}
        <div 
          className={`mt-12 text-center transition-all duration-1000 delay-300 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h1 className="text-7xl font-bold mb-2 tracking-[0.3em] aurora-text norse-glow"
              style={{ fontFamily: '"Rajdhani", sans-serif' }}>
            SKÖLL-TRACK
          </h1>
          <p className="text-cyan-400 text-sm tracking-[0.4em] font-mono">
            TRACK THE SUN'S FURY
          </p>
        </div>

        {/* Begin Mission Button */}
        <button
          onClick={handleBeginMission}
          className={`
            mt-16 px-12 py-4
            bg-gradient-to-r from-green-500/20 to-cyan-500/20
            border-2 border-cyan-400
            rounded-lg
            text-cyan-400 font-bold text-xl tracking-[0.2em]
            transition-all duration-300
            hover:bg-gradient-to-r hover:from-green-500/40 hover:to-cyan-500/40
            hover:border-green-400
            hover:text-green-400
            hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]
            hover:scale-105
            cursor-pointer
            ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}
          style={{ 
            transitionDelay: '600ms',
            fontFamily: '"Rajdhani", sans-serif'
          }}
        >
          BEGIN MISSION
        </button>

        {/* Loading Hint */}
        <p className={`
          mt-8 text-cyan-400/50 text-xs font-mono
          transition-opacity duration-500 delay-1000
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}>
          Initializing Wolf Protocol...
        </p>
      </div>

      {/* Bottom Aurora Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent" 
             style={{ animationDelay: '1s' }} />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
