/**
 * Enhanced SKÖLL-TRACK Loading Screen
 * Features: Volumetric wolf head, neural calibration bar, breathing eye animation
 * UK Cambridge styling with advanced SVG effects
 */

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  progress: number; // 0-100
}

export default function LoadingScreen({ isLoading, progress }: LoadingScreenProps) {
  const [displayText, setDisplayText] = useState('INITIALISING');
  const [time, setTime] = useState(0);

  useEffect(() => {
    // UK English spellings
    if (progress < 20) setDisplayText('INITIALISING SKÖLL-TRACK');
    else if (progress < 40) setDisplayText('LOADING SOLAR SYSTEM');
    else if (progress < 60) setDisplayText('MAPPING PLANETARY ORBITS');
    else if (progress < 80) setDisplayText('CONNECTING TO NOAA SWPC');
    else if (progress < 95) setDisplayText('CALIBRATING SENSORS');
    else setDisplayText('NEURAL LINK ESTABLISHED');
  }, [progress]);

  // Animate time for effects
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setTime(t => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  // Eye pulse (red breathing effect)
  const eyePulse = 0.5 + Math.sin(time * 2) * 0.5; // 0 to 1
  const eyeColor = `rgb(${255 * eyePulse}, 0, 0)`; // #ff0000 to #550000

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-b from-black via-slate-950 to-black flex flex-col items-center justify-center overflow-hidden">
      
      {/* Starfield Background */}
      <div className="absolute inset-0 opacity-60">
        {[...Array(150)].map((_, i) => (
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

      {/* Volumetric Wolf Head SVG */}
      <svg 
        width="200" 
        height="200" 
        viewBox="0 0 100 100" 
        className="mb-8 relative z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Multi-layered Aurora Glow */}
          <filter id="aurora-glow" x="-50%" y="-50%" width="200%" height="200%">
            {/* Cyan layer */}
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur1"/>
            <feFlood floodColor="#00ffff" floodOpacity="0.6" result="color1"/>
            <feComposite in="color1" in2="blur1" operator="in" result="glow1"/>
            
            {/* Aurora Green layer */}
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur2"/>
            <feFlood floodColor="#00ff99" floodOpacity="0.4" result="color2"/>
            <feComposite in="color2" in2="blur2" operator="in" result="glow2"/>
            
            {/* Purple layer (distant) */}
            <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur3"/>
            <feFlood floodColor="#a855f7" floodOpacity="0.3" result="color3"/>
            <feComposite in="color3" in2="blur3" operator="in" result="glow3"/>
            
            {/* Merge all layers */}
            <feMerge>
              <feMergeNode in="glow3"/>
              <feMergeNode in="glow2"/>
              <feMergeNode in="glow1"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Eye Glow (Breathing Red) */}
          <filter id="eye-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Wolf Head Silhouette (Razor-thin 0.5px stroke) */}
        <g filter="url(#aurora-glow)">
          {/* Ears */}
          <path
            d="M 30 25 L 35 10 L 40 25 Z"
            fill="none"
            stroke="#00ff99"
            strokeWidth="0.5"
            strokeLinejoin="miter"
          />
          <path
            d="M 60 25 L 65 10 L 70 25 Z"
            fill="none"
            stroke="#00ff99"
            strokeWidth="0.5"
            strokeLinejoin="miter"
          />
          
          {/* Head Outline */}
          <path
            d="M 30 25 Q 25 40 28 55 L 35 70 Q 40 75 50 75 Q 60 75 65 70 L 72 55 Q 75 40 70 25 L 65 15 Q 55 12 50 12 Q 45 12 35 15 Z"
            fill="none"
            stroke="#00ff99"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          
          {/* Snout */}
          <path
            d="M 40 50 Q 45 58 50 58 Q 55 58 60 50"
            fill="none"
            stroke="#00ff99"
            strokeWidth="0.5"
          />
          <path
            d="M 48 58 L 48 62 M 52 58 L 52 62"
            stroke="#00ff99"
            strokeWidth="0.5"
          />
          
          {/* Nose */}
          <circle cx="50" cy="63" r="2" fill="#00ff99" />
        </g>

        {/* Eyes (Breathing Animation) */}
        <g filter="url(#eye-glow)">
          {/* Left Eye (Cyan) */}
          <circle 
            cx="42" 
            cy="40" 
            r="3" 
            fill="#00ffff"
            opacity="0.9"
          />
          
          {/* Right Eye (Breathing Red - Neural Link Active) */}
          <circle 
            cx="58" 
            cy="40" 
            r="3" 
            fill={eyeColor}
            opacity={eyePulse}
            className="animate-pulse"
          />
        </g>
      </svg>

      {/* SKÖLL-TRACK Title */}
      <h1 
        className="text-5xl font-bold text-cyan-400 mb-2 tracking-[0.2rem] uppercase font-rajdhani"
        style={{
          textShadow: '0 0 20px rgba(6,182,212,0.8), 0 0 40px rgba(6,182,212,0.5)',
          letterSpacing: '0.2rem'
        }}
      >
        SKÖLL-TRACK
      </h1>
      
      {/* Version */}
      <div className="text-sm text-cyan-600 mb-8 tracking-[0.2rem] uppercase font-inter">
        ALPHA v3.9.1
      </div>

      {/* Neural Calibration Bar */}
      <div className="w-96 mb-6">
        <div className="text-center text-cyan-400 text-xs mb-2 tracking-wider font-mono">
          NEURAL CALIBRATION
        </div>
        
        {/* Progress Bar Container */}
        <div className="relative w-full h-2 bg-slate-900/50 rounded-full border border-cyan-900/30 overflow-hidden backdrop-blur-sm">
          {/* Shimmer Background */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
            style={{
              transform: `translateX(${-100 + (time * 50) % 200}%)`,
              width: '100%'
            }}
          />
          
          {/* Progress Fill (Aurora Gradient) */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 via-cyan-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              boxShadow: '0 0 20px rgba(6,182,212,0.6), 0 0 40px rgba(16,185,129,0.4)'
            }}
          />
          
          {/* Leading Edge Glow */}
          <div
            className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent to-cyan-400/80 rounded-full blur-sm"
            style={{
              left: `${Math.max(0, progress - 5)}%`,
              opacity: progress > 0 ? 1 : 0
            }}
          />
        </div>
        
        {/* Percentage */}
        <div className="text-center text-cyan-500 text-xs mt-2 font-mono">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Status Text */}
      <div 
        className="text-cyan-300 text-sm tracking-widest animate-pulse font-mono"
        style={{ letterSpacing: '0.15rem' }}
      >
        {displayText}
      </div>

      {/* Floating Aurora Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${10 + (i * 3) % 80}%`,
              bottom: `${-10 + (Math.sin(time + i * 0.5) * 50 + 50)}%`,
              background: i % 3 === 0 ? '#00ff99' : i % 3 === 1 ? '#00ffff' : '#a855f7',
              opacity: 0.3 + Math.sin(time + i) * 0.3,
              boxShadow: `0 0 ${4 + Math.sin(time + i) * 2}px currentColor`,
              animation: `float ${3 + (i % 5)}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        
        .font-rajdhani {
          font-family: 'Rajdhani', sans-serif;
        }
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
