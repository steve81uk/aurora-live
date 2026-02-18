/**
 * HUD Cluster - Consolidated Circular Gauge
 * Groups Kp, Bz, and Speed into a single NASA-Elite interface
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Wind, Magnet } from 'lucide-react';

interface HUDClusterProps {
  kpIndex: number;
  bzValue: number;
  solarWindSpeed: number;
  showExplanation?: boolean;
}

interface MetricSegment {
  label: string;
  value: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
  angle: number; // Position around the circle
}

export function HUDCluster({ 
  kpIndex = 3, 
  bzValue = -2, 
  solarWindSpeed = 400,
  showExplanation = false 
}: HUDClusterProps) {
  const [rotation, setRotation] = useState(0);
  const [pulseIntensity, setPulseIntensity] = useState(1);

  // Calculate severity colors
  const getKpColor = (kp: number) => {
    if (kp >= 7) return '#ef4444'; // Red
    if (kp >= 5) return '#f97316'; // Orange
    if (kp >= 4) return '#fbbf24'; // Yellow
    return '#10b981'; // Green
  };

  const getBzColor = (bz: number) => {
    if (bz <= -10) return '#ef4444'; // Strong southward = Red
    if (bz <= -5) return '#f97316'; // Moderate southward = Orange
    if (bz < 0) return '#fbbf24'; // Weak southward = Yellow
    return '#06b6d4'; // Northward = Cyan
  };

  const getWindColor = (speed: number) => {
    if (speed >= 600) return '#ef4444'; // High-speed stream
    if (speed >= 500) return '#fbbf24'; // Elevated
    return '#10b981'; // Normal
  };

  const metrics: MetricSegment[] = [
    {
      label: 'KP',
      value: kpIndex,
      unit: '',
      color: getKpColor(kpIndex),
      icon: <Activity size={20} />,
      angle: 0 // Top
    },
    {
      label: 'BZ',
      value: bzValue,
      unit: 'nT',
      color: getBzColor(bzValue),
      icon: <Magnet size={20} />,
      angle: 120 // Bottom-left
    },
    {
      label: 'WIND',
      value: solarWindSpeed,
      unit: 'km/s',
      color: getWindColor(solarWindSpeed),
      icon: <Wind size={20} />,
      angle: 240 // Bottom-right
    }
  ];

  // Calculate overall threat level
  const threatLevel = (() => {
    if (kpIndex >= 7 || bzValue <= -10 || solarWindSpeed >= 700) return 'EXTREME';
    if (kpIndex >= 5 || bzValue <= -5 || solarWindSpeed >= 600) return 'HIGH';
    if (kpIndex >= 4 || bzValue <= -2 || solarWindSpeed >= 500) return 'MODERATE';
    return 'LOW';
  })();

  const threatColor = {
    'EXTREME': '#ef4444',
    'HIGH': '#f97316',
    'MODERATE': '#fbbf24',
    'LOW': '#10b981'
  }[threatLevel];

  useEffect(() => {
    // Slow rotation animation
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Pulse intensity based on threat
    const intensity = {
      'EXTREME': 2,
      'HIGH': 1.5,
      'MODERATE': 1.2,
      'LOW': 1
    }[threatLevel];
    setPulseIntensity(intensity);
  }, [threatLevel]);

  // Generate "Why" explanation
  const generateExplanation = () => {
    const conditions = [];
    if (kpIndex >= 5) conditions.push(`KP ${kpIndex.toFixed(1)}`);
    if (bzValue <= -5) conditions.push(`${bzValue.toFixed(1)}nT Bz (Southward)`);
    if (solarWindSpeed >= 500) conditions.push(`${solarWindSpeed.toFixed(0)} km/s Wind`);
    
    if (conditions.length === 0) return 'Conditions nominal • Low aurora probability';
    
    return `${conditions.join(' + ')} = Aurora Alert`;
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Background Frame */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <img 
          src="/assets/HUD_Frame.svg" 
          alt="HUD Frame" 
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.5))' }}
        />
      </div>

      {/* Main Circular Gauge */}
      <div className="relative aspect-square p-8">
        {/* Central Threat Display */}
        <motion.div
          className="absolute inset-0 m-auto w-48 h-48 rounded-full flex flex-col items-center justify-center"
          style={{
            background: `radial-gradient(circle, ${threatColor}15 0%, transparent 70%)`,
            border: `2px solid ${threatColor}`,
            boxShadow: `0 0 ${20 * pulseIntensity}px ${threatColor}`
          }}
          animate={{
            scale: [1, pulseIntensity, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <div 
            className="text-5xl font-bold font-mono"
            style={{ color: threatColor }}
          >
            {kpIndex.toFixed(1)}
          </div>
          <div className="text-xs text-cyan-400/70 font-mono tracking-widest mt-1">
            KP INDEX
          </div>
          <div 
            className="text-sm font-bold font-mono mt-3 px-3 py-1 rounded-full border"
            style={{ 
              color: threatColor,
              borderColor: threatColor,
              backgroundColor: `${threatColor}20`
            }}
          >
            {threatLevel}
          </div>
        </motion.div>

        {/* Rotating Outer Ring */}
        <motion.div
          className="absolute inset-0 m-auto w-64 h-64 rounded-full border-2 border-dashed opacity-20"
          style={{ borderColor: threatColor }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />

        {/* Metric Segments */}
        {metrics.map((metric, index) => {
          const radians = (metric.angle - 90) * (Math.PI / 180); // -90 to start at top
          const distance = 160; // Distance from center
          const x = Math.cos(radians) * distance;
          const y = Math.sin(radians) * distance;

          return (
            <motion.div
              key={metric.label}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              <div 
                className="metric-panel holo-card p-4 min-w-[100px] text-center relative"
                style={{
                  borderColor: metric.color,
                  boxShadow: `0 0 10px ${metric.color}40`
                }}
              >
                {/* Icon */}
                <div 
                  className="mx-auto mb-2"
                  style={{ color: metric.color }}
                >
                  {metric.icon}
                </div>
                
                {/* Label */}
                <div className="text-[10px] text-cyan-400/70 font-mono tracking-widest mb-1">
                  {metric.label}
                </div>
                
                {/* Value */}
                <div 
                  className="text-2xl font-bold font-mono leading-none"
                  style={{ color: metric.color }}
                >
                  {metric.label === 'WIND' 
                    ? Math.round(metric.value)
                    : metric.value.toFixed(1)
                  }
                </div>
                
                {/* Unit */}
                {metric.unit && (
                  <div className="text-[9px] text-gray-500 font-mono mt-1">
                    {metric.unit}
                  </div>
                )}

                {/* Connector Line */}
                <svg 
                  className="absolute pointer-events-none"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: distance,
                    height: distance,
                    transform: `translate(-50%, -50%) rotate(${metric.angle - 180}deg)`,
                    transformOrigin: 'center'
                  }}
                >
                  <line
                    x1="0"
                    y1={distance / 2}
                    x2={distance / 2}
                    y2={distance / 2}
                    stroke={metric.color}
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.3"
                  />
                </svg>
              </div>
            </motion.div>
          );
        })}

        {/* Scanline Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(6, 182, 212, 0.1) 50%, transparent 100%)'
          }}
          animate={{ y: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* "Why" Logic Explanation */}
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 metric-panel holo-card p-4 text-center"
        >
          <div className="text-xs text-cyan-400/70 font-mono tracking-wider mb-2">
            NEURAL ANALYSIS
          </div>
          <div className="text-sm text-gray-300 font-mono">
            {generateExplanation()}
          </div>
        </motion.div>
      )}

      {/* Data Attribution */}
      <div className="mt-4 text-center text-[10px] text-gray-600 font-mono">
        REAL-TIME DSCOVR SATELLITE • NOAA SWPC
      </div>
    </div>
  );
}
