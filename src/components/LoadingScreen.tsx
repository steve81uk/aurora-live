/**
 * Aurora Wave Loading Screen
 * Beautiful animated aurora borealis effect with wave motion
 */

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  progress: number; // 0-100
}

export default function LoadingScreen({ isLoading, progress }: LoadingScreenProps) {
  const [displayText, setDisplayText] = useState('INITIALIZING');
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (progress < 20) setDisplayText('INITIALIZING SKÖLL-TRACK');
    else if (progress < 40) setDisplayText('LOADING SOLAR SYSTEM');
    else if (progress < 60) setDisplayText('MAPPING PLANETARY ORBITS');
    else if (progress < 80) setDisplayText('CONNECTING TO NOAA SWPC');
    else if (progress < 95) setDisplayText('CALIBRATING SENSORS');
    else setDisplayText('SKÖLL-TRACK - READY');
  }, [progress]);

  // Animate time for wave motion
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setTime(t => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  // Generate aurora wave path (3 waves)
  const generateAuroraWave = (waveIndex: number, offsetY: number) => {
    const points: string[] = [];
    const width = 800;
    const segments = 60;
    const amplitude = 40 + waveIndex * 15;
    const frequency = 0.015 + waveIndex * 0.005;
    const speed = time + waveIndex * 0.5;
    
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      const y = offsetY + Math.sin(x * frequency + speed) * amplitude + Math.sin(x * frequency * 2 + speed * 1.5) * (amplitude * 0.3);
      points.push(`${x},${y}`);
    }
    
    // Close the path at bottom
    points.push(`${width},400`);
    points.push(`0,400`);
    
    return `M ${points.join(' L ')} Z`;
  };

  // Aurora colors for different waves
  const auroraColors = [
    { gradient: 'from-green-400/40 via-emerald-500/30 to-green-600/20', glow: 'rgba(16, 185, 129, 0.4)' },
    { gradient: 'from-cyan-400/30 via-blue-500/20 to-purple-600/15', glow: 'rgba(59, 130, 246, 0.3)' },
    { gradient: 'from-purple-400/25 via-pink-500/15 to-purple-600/10', glow: 'rgba(168, 85, 247, 0.25)' }
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center overflow-hidden">
      
      {/* Starfield Background */}
      <div className="absolute inset-0 opacity-60">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${2 + Math.random() * 3}s infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Aurora Wave Animation */}
      <svg 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-90"
        width="800" 
        height="400" 
        viewBox="0 0 800 400"
        style={{ filter: 'blur(1px)' }}
      >
        <defs>
          {/* Glowing effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Aurora gradients */}
          {auroraColors.map((_, i) => (
            <linearGradient key={i} id={`aurora-gradient-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={i === 0 ? '#10b981' : i === 1 ? '#3b82f6' : '#a855f7'} stopOpacity="0.6"/>
              <stop offset="50%" stopColor={i === 0 ? '#34d399' : i === 1 ? '#60a5fa' : '#c084fc'} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={i === 0 ? '#059669' : i === 1 ? '#7c3aed' : '#9333ea'} stopOpacity="0.1"/>
            </linearGradient>
          ))}
        </defs>

        {/* Three aurora wave layers */}
        {auroraColors.map((color, i) => (
          <path
            key={i}
            d={generateAuroraWave(i, 150 + i * 40)}
            fill={`url(#aurora-gradient-${i})`}
            filter="url(#glow)"
            opacity={0.8 - i * 0.15}
          />
        ))}
      </svg>

      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Wolf Head Aurora Logo */}
        <div className="relative mb-8">
          {/* Pulsing glow effect */}
          <div className="absolute inset-0 animate-ping opacity-20">
            <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-[0_0_60px_rgba(16,185,129,0.8)]">
              <path
                d="M 100 30 L 85 50 L 75 45 L 70 60 L 65 55 L 60 70 L 55 65 L 50 85 L 45 90 L 40 110 L 45 130 L 55 145 L 70 155 L 85 160 L 100 165 L 115 160 L 130 155 L 145 145 L 155 130 L 160 110 L 155 90 L 150 85 L 145 65 L 140 70 L 135 55 L 130 60 L 125 45 L 115 50 Z"
                fill="url(#wolf-gradient)"
              />
            </svg>
          </div>
          
          {/* Main Wolf Head with Aurora colors */}
          <svg 
            width="200" 
            height="200" 
            viewBox="0 0 200 200" 
            className="relative drop-shadow-[0_0_60px_rgba(16,185,129,0.6)]"
          >
            <defs>
              <linearGradient id="wolf-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.9"/>
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9"/>
              </linearGradient>
              <linearGradient id="wolf-eyes" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06D6A0"/>
                <stop offset="100%" stopColor="#10b981"/>
              </linearGradient>
            </defs>
            
            {/* Wolf silhouette - ears, head outline */}
            <path
              d="M 100 30 
                 L 85 50 L 75 45 L 70 60 L 65 55 L 60 70 L 55 65 L 50 85 L 45 90 L 40 110 
                 L 45 130 L 55 145 L 70 155 L 85 160 L 100 165 
                 L 115 160 L 130 155 L 145 145 L 155 130 L 160 110 
                 L 155 90 L 150 85 L 145 65 L 140 70 L 135 55 L 130 60 L 125 45 L 115 50 
                 Z"
              fill="none"
              stroke="url(#wolf-gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.8))',
                animation: 'pulse 3s ease-in-out infinite'
              }}
            />
            
            {/* Snout detail */}
            <path
              d="M 100 140 L 90 150 L 100 155 L 110 150 Z"
              fill="none"
              stroke="url(#wolf-gradient)"
              strokeWidth="2"
              opacity="0.8"
            />
            
            {/* Glowing eyes */}
            <circle cx="80" cy="95" r="4" fill="url(#wolf-eyes)" className="animate-pulse">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="120" cy="95" r="4" fill="url(#wolf-eyes)" className="animate-pulse">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
            </circle>
            
            {/* Aurora particle effects around wolf */}
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const radius = 90;
              const x = 100 + Math.cos(angle) * radius;
              const y = 100 + Math.sin(angle) * radius;
              return (
                <circle 
                  key={i} 
                  cx={x} 
                  cy={y} 
                  r="2" 
                  fill={i % 3 === 0 ? '#10b981' : i % 3 === 1 ? '#06b6d4' : '#a855f7'}
                  opacity="0.6"
                >
                  <animate 
                    attributeName="r" 
                    values="1;3;1" 
                    dur={`${2 + i * 0.2}s`} 
                    repeatCount="indefinite"
                  />
                  <animate 
                    attributeName="opacity" 
                    values="0.3;0.8;0.3" 
                    dur={`${2 + i * 0.2}s`} 
                    repeatCount="indefinite"
                  />
                </circle>
              );
            })}
          </svg>
        </div>

        {/* Progress Text */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2 animate-pulse">
            SKÖLL-TRACK
          </div>
          <div className="text-cyan-400 font-mono text-sm tracking-wider mb-1">
            {displayText}
          </div>
          <div className="text-white/40 font-mono text-xs">
            {progress.toFixed(0)}% COMPLETE
          </div>
        </div>

        {/* Aurora Wave Progress Bar */}
        <div className="w-80 h-3 bg-black/50 rounded-full overflow-hidden border border-green-500/30 relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/20 to-transparent animate-pulse"></div>
          
          {/* Progress fill with wave effect */}
          <div
            className="h-full relative overflow-hidden transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          >
            {/* Animated gradient */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-green-400 via-cyan-400 to-purple-500"
              style={{
                animation: 'shimmer 2s linear infinite',
                backgroundSize: '200% 100%'
              }}
            ></div>
            
            {/* Wave overlay */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <path
                d={`M0,1.5 ${[...Array(20)].map((_, i) => 
                  `L${(i / 19) * 100},${1.5 + Math.sin((i / 19) * Math.PI * 4 + time * 3) * 0.8}`
                ).join(' ')} L100,3 L0,3 Z`}
                fill="rgba(255,255,255,0.3)"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          
          {/* Glow at progress edge */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{ left: `${progress}%`, transition: 'left 0.5s ease-out' }}
          ></div>
        </div>

        {/* Loading Dots */}
        <div className="flex gap-2 mt-6">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-cyan-400"
              style={{
                animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                opacity: 0.6
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Aurora Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                ['#10b981', '#3b82f6', '#a855f7'][i % 3]
              }, transparent)`,
              animation: `float-aurora ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.6
            }}
          />
        ))}
      </div>

      {/* Styles */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes float-aurora {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.6;
          }
          25% {
            transform: translateY(-30px) translateX(15px);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-10px) translateX(-15px);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-40px) translateX(10px);
            opacity: 0.7;
          }
        }
        
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
