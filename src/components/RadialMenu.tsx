/**
 * RadialMenu Component - Circular Navigation
 * Right-click or long-press to open radial planet/city selector
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RadialMenuProps {
  planets: Array<{ name: string; color?: string }>;
  cities: Array<{ name: string; lat: number; lon: number }>;
  isOpen: boolean;
  onClose: () => void;
  currentLocation?: string;
  onPlanetSelect: (planet: { name: string; color?: string }) => void;
  onCitySelect: (city: { name: string; lat: number; lon: number }) => void;
}

export function RadialMenu({ planets, cities, isOpen, onClose, onPlanetSelect, onCitySelect }: RadialMenuProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const _longPressTimer = useRef<number>(0);

  // Play wolf-chime on hover
  const playWolfChime = () => {
    const AudioCtx = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  // Handle right-click - No longer needed, controlled by parent
  useEffect(() => {
    // Position tracking only
    const handleContextMenu = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClick = () => onClose();
    if (isOpen) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [isOpen, onClose]);

  // Calculate positions for radial layout
  const calculatePosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  };

  // Top 6 aurora hotspots (simplified)
  const auroraHotspots = cities.slice(0, 6);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[950] pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          {/* Backdrop with dampening effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Radial Menu Container */}
          <div
            className="absolute"
            style={{
              left: position.x,
              top: position.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Center Hub */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="absolute w-20 h-20 rounded-full backdrop-blur-lg bg-black/60 border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.8)]"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <div className="text-cyan-400 font-bold text-xs text-center" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                WARP<br/>MENU
              </div>
            </motion.div>

            {/* Inner Ring - Planets */}
            {planets.map((planet, index) => {
              const pos = calculatePosition(index, planets.length, 100);
              return (
                <motion.button
                  key={planet.name}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ scale: 1, x: pos.x, y: pos.y }}
                  exit={{ scale: 0, x: 0, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: index * 0.05
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlanetSelect(planet);
                  }}
                  onMouseEnter={() => {
                    setHoveredIndex(index);
                    playWolfChime();
                  }}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`absolute w-16 h-16 rounded-full backdrop-blur-lg bg-white/5 border-2 flex items-center justify-center transition-all duration-200 ${hoveredIndex === index ? 'scale-110 shadow-[0_0_30px_rgba(6,182,212,0.8)]' : 'shadow-[0_0_15px_rgba(6,182,212,0.4)]'}`}
                  style={{
                    borderColor: planet.color,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div
                    className="font-bold text-[10px] text-center uppercase tracking-wide"
                    style={{
                      color: planet.color,
                      fontFamily: 'Rajdhani, sans-serif'
                    }}
                  >
                    {planet.name}
                  </div>
                </motion.button>
              );
            })}

            {/* Outer Ring - Aurora Hotspots */}
            {auroraHotspots.map((city, index) => {
              const pos = calculatePosition(index, auroraHotspots.length, 180);
              const globalIndex = planets.length + index;
              return (
                <motion.button
                  key={city.name}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ scale: 1, x: pos.x, y: pos.y }}
                  exit={{ scale: 0, x: 0, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: (planets.length + index) * 0.05
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCitySelect(city);
                  }}
                  onMouseEnter={() => {
                    setHoveredIndex(globalIndex);
                    playWolfChime();
                  }}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`absolute w-14 h-14 rounded-full backdrop-blur-lg bg-white/5 border-2 border-green-500 flex items-center justify-center transition-all duration-200 ${hoveredIndex === globalIndex ? 'scale-110 shadow-[0_0_30px_rgba(16,185,129,0.8)]' : 'shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
                  style={{ transform: 'translate(-50%, -50%)' }}
                >
                  <div className="text-green-400 font-bold text-[9px] text-center uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {city.name}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
