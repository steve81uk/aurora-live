import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  progress: number; // 0-100
}

export default function LoadingScreen({ isLoading, progress }: LoadingScreenProps) {
  const [displayText, setDisplayText] = useState('INITIALIZING');

  useEffect(() => {
    if (progress < 20) setDisplayText('INITIALIZING SYSTEM');
    else if (progress < 40) setDisplayText('LOADING SOLAR SYSTEM');
    else if (progress < 60) setDisplayText('MAPPING PLANETARY ORBITS');
    else if (progress < 80) setDisplayText('CONNECTING TO NOAA');
    else if (progress < 95) setDisplayText('CALIBRATING SENSORS');
    else setDisplayText('READY');
  }, [progress]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      {/* Aurora Circle Animation */}
      <div className="relative">
        {/* Outer Aurora Ring */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="aurora-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#00ff88', stopOpacity: 0.8 }} />
                <stop offset="25%" style={{ stopColor: '#00d4ff', stopOpacity: 0.8 }} />
                <stop offset="50%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.8 }} />
                <stop offset="75%" style={{ stopColor: '#ec4899', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: '#fbbf24', stopOpacity: 0.8 }} />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="url(#aurora-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progress * 5.026} 502.6`} // Circumference = 2πr
              transform="rotate(-90 100 100)"
            />
          </svg>
        </div>

        {/* Inner Earth Building Animation */}
        <div className="relative w-[200px] h-[200px] flex items-center justify-center">
          <div
            className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-blue-400 via-green-400 to-blue-600 shadow-[0_0_40px_rgba(59,130,246,0.6)]"
            style={{
              transform: `scale(${progress / 100})`,
              transition: 'transform 0.3s ease-out',
            }}
          />
        </div>

        {/* Progress Text */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-center w-[300px]">
          <div className="text-cyan-400 font-mono text-lg mb-2">{displayText}</div>
          <div className="text-white/60 font-mono text-sm">{progress.toFixed(0)}%</div>
          
          {/* Progress Bar */}
          <div className="w-full h-1 bg-gray-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
