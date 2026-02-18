/**
 * RadialWarp Component
 * Fast-travel overlay with GSAP camera zoom
 * Replaces flat button grid with radial interface
 */

import { useState } from 'react';
import { Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Location {
  id: string;
  name: string;
  type: 'planet' | 'city' | 'spacecraft';
  icon: string;
  color: string;
  coordinates?: { lat: number; lon: number };
}

interface RadialWarpProps {
  isOpen: boolean;
  onClose: () => void;
  onWarp: (location: Location) => void;
  currentLocation?: string;
}

export function RadialWarp({ isOpen, onClose, onWarp, currentLocation }: RadialWarpProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Warp destinations
  const destinations: Location[] = [
    // Planets
    { id: 'Mercury', name: 'Mercury', type: 'planet', icon: '☿', color: 'text-gray-400' },
    { id: 'Venus', name: 'Venus', type: 'planet', icon: '♀', color: 'text-yellow-300' },
    { id: 'Earth', name: 'Earth', type: 'planet', icon: '🌍', color: 'text-blue-400' },
    { id: 'Mars', name: 'Mars', type: 'planet', icon: '♂', color: 'text-red-400' },
    { id: 'Jupiter', name: 'Jupiter', type: 'planet', icon: '♃', color: 'text-orange-300' },
    { id: 'Saturn', name: 'Saturn', type: 'planet', icon: '♄', color: 'text-yellow-200' },
    
    // Aurora Hotspots
    { id: 'Reykjavik', name: 'Reykjavik', type: 'city', icon: '🏔️', color: 'text-cyan-400', coordinates: { lat: 64.13, lon: -21.82 } },
    { id: 'Tromsø', name: 'Tromsø', type: 'city', icon: '❄️', color: 'text-blue-300', coordinates: { lat: 69.65, lon: 18.96 } },
    { id: 'Yellowknife', name: 'Yellowknife', type: 'city', icon: '🌲', color: 'text-green-400', coordinates: { lat: 62.45, lon: -114.37 } },
    { id: 'Fairbanks', name: 'Fairbanks', type: 'city', icon: '🐺', color: 'text-amber-400', coordinates: { lat: 64.84, lon: -147.72 } },
  ];

  // Calculate radial position
  const calculatePosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      angle: (angle * 180) / Math.PI
    };
  };

  // Play warp sound
  const playWarpSound = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };

  // Handle warp selection
  const handleWarp = (location: Location) => {
    if (location.id === currentLocation) return; // Already there
    
    playWarpSound();
    onWarp(location);
    
    // Brief delay for animation
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[950] flex items-center justify-center pointer-events-auto"
        onClick={onClose}
      >
        {/* Background blur */}
        <div className="absolute inset-0 backdrop-blur-md bg-black/60" />

        {/* Radial Interface */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative w-[600px] h-[600px]"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-4 border-cyan-400 shadow-[0_0_60px_rgba(6,182,212,0.8)] flex items-center justify-center">
              <Rocket className="w-12 h-12 text-white" />
            </div>
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <div className="text-cyan-400 font-bold text-sm font-mono">WARP MENU</div>
              <div className="text-cyan-600 text-xs text-center">SELECT DESTINATION</div>
            </div>
          </div>

          {/* Orbital Rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Inner ring (planets) */}
            <div className="absolute w-[400px] h-[400px] rounded-full border-2 border-cyan-500/30 animate-[spin_20s_linear_infinite]" />
            {/* Outer ring (cities) */}
            <div className="absolute w-[550px] h-[550px] rounded-full border-2 border-amber-500/30 animate-[spin_30s_linear_infinite_reverse]" />
          </div>

          {/* Destination Nodes */}
          {destinations.map((dest, index) => {
            const isPlanet = dest.type === 'planet';
            const radius = isPlanet ? 200 : 275; // Inner for planets, outer for cities
            const total = isPlanet ? destinations.filter(d => d.type === 'planet').length : destinations.filter(d => d.type !== 'planet').length;
            const localIndex = isPlanet ? index : index - destinations.filter(d => d.type === 'planet').length;
            
            const pos = calculatePosition(localIndex, total, radius);
            const isHovered = hoveredIndex === index;
            const isCurrent = dest.id === currentLocation;

            return (
              <motion.button
                key={dest.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleWarp(dest)}
                disabled={isCurrent}
                className={`
                  absolute top-1/2 left-1/2 z-20
                  ${isCurrent ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
                style={{
                  transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) ${isHovered ? 'scale(1.2)' : 'scale(1)'}`,
                  transition: 'transform 0.2s ease-out'
                }}
              >
                {/* Node container */}
                <div className={`
                  w-20 h-20 rounded-full 
                  backdrop-blur-lg 
                  ${isPlanet ? 'bg-cyan-500/20 border-2 border-cyan-400' : 'bg-amber-500/20 border-2 border-amber-400'}
                  ${isHovered ? 'shadow-[0_0_40px_rgba(6,182,212,0.8)]' : 'shadow-[0_0_20px_rgba(6,182,212,0.4)]'}
                  flex flex-col items-center justify-center
                  transition-all duration-200
                `}>
                  {/* Icon */}
                  <div className={`text-3xl mb-1 ${dest.color}`}>
                    {dest.icon}
                  </div>
                  
                  {/* Name */}
                  <div className={`text-[9px] font-mono font-bold ${dest.color}`}>
                    {dest.name.toUpperCase()}
                  </div>

                  {/* Current marker */}
                  {isCurrent && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 border-2 border-green-300 flex items-center justify-center">
                      <div className="text-white text-xs">✓</div>
                    </div>
                  )}
                </div>

                {/* Connecting line to center */}
                <div
                  className={`absolute top-1/2 left-1/2 w-px ${isPlanet ? 'bg-cyan-500/30' : 'bg-amber-500/30'}`}
                  style={{
                    height: `${radius}px`,
                    transformOrigin: 'top center',
                    transform: `rotate(${pos.angle + 90}deg)`,
                  }}
                />
              </motion.button>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="text-cyan-400 font-mono">PLANETS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-amber-400 font-mono">AURORA ZONES</span>
            </div>
          </div>

          {/* Close hint */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-cyan-600 text-xs font-mono animate-pulse">
            ESC or CLICK OUTSIDE TO CLOSE
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
