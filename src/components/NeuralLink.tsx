/**
 * NeuralLink Component - Fuzzy Search Bar
 * Quick search for planets, cities, and Home Station with auto-complete.
 * Wolf-chime audio removed (user preference). Ctrl+K to focus.
 */

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import Fuse from 'fuse.js';
import type { GeoLocation, GeoPermission } from '../hooks/useGeoLocation';
import type { AuroralPeakLocation } from '../services/DataBridge';

// Confidence → colour mapping for the peak badge
const CONFIDENCE_STYLE: Record<string, string> = {
  EXTREME: 'bg-red-500/20 text-red-300 border-red-500/50',
  HIGH:    'bg-orange-500/20 text-orange-300 border-orange-500/50',
  MODERATE:'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  LOW:     'bg-gray-500/20 text-gray-400 border-gray-500/40',
};

interface NeuralLinkProps {
  planets: Array<{ name: string }>;
  cities: Array<{ name: string; lat: number; lon: number }>;
  onSelect: (item: any, type: 'planet' | 'city') => void;
  /** The user's resolved home station (geo or Cambridge fallback) */
  homeStation?: GeoLocation;
  /** Permission status from useGeoLocation */
  geoPermission?: GeoPermission;
  /** Current auroral peak location (recalculated from live Kp/Bz) */
  peakLocation?: AuroralPeakLocation;
  /** Teleport camera to the peak aurora location */
  onGoPeak?: () => void;
  /** Request GPS and persist as Home Station */
  onSetHomeStation?: () => void;
}

export function NeuralLink({ planets, cities, onSelect, homeStation, geoPermission, peakLocation, onGoPeak, onSetHomeStation }: NeuralLinkProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Combine datasets
  const searchData = [
    ...planets.map(p => ({ ...p, type: 'planet' })),
    ...cities.map(c => ({ ...c, type: 'city' }))
  ];

  // Create Fuse instance
  const fuse = new Fuse(searchData, {
    keys: ['name'],
    threshold: 0.3,
    includeScore: true
  });

  // Search on query change
  useEffect(() => {
    if (query.length > 0) {
      const searchResults = fuse.search(query).slice(0, 8);
      setResults(searchResults.map(r => r.item));
      setIsOpen(true);
      setSelectedIndex(0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  // Handle selection (wolf-chime removed)
  const handleSelect = (item: any) => {
    onSelect(item, item.type);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key !== 'Enter') return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Enter' && homeStation && query.length === 0) {
      // Empty Enter = travel to Home Station
      onSelect({ ...homeStation, type: 'city' }, 'city');
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard shortcut (Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Permission badge colour
  const permBadge =
    geoPermission === 'granted' ? 'bg-green-500/20 text-green-400 border-green-500/40' :
    geoPermission === 'denied'  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                                  'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[900] w-full max-w-md px-4 pointer-events-auto">
      <div className="relative">
        {/* Search Input */}
        <div
          className={`backdrop-blur-lg bg-black/40 border-2 rounded-lg transition-all duration-300 ${isOpen ? 'border-green-500 shadow-[0_0_30px_rgba(16,185,129,0.6)]' : 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'}`}
          style={{ opacity: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center px-4 py-3">
            <Search size={20} className={`transition-colors ${query ? 'text-green-400' : 'text-cyan-400'}`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (query) setIsOpen(true);
                else setIsOpen(true); // show home station on focus
              }}
              placeholder="Search planets & cities... (Ctrl+K)"
              className="flex-1 ml-3 bg-transparent border-none outline-none text-white placeholder-cyan-600 text-sm"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                }}
                className="text-cyan-600 hover:text-cyan-400 text-xs"
              >
                ESC
              </button>
            )}
          </div>

          {/* Results Dropdown */}
          {isOpen && (
            <div className="border-t border-cyan-500/30 max-h-64 overflow-y-auto">

              {/* ── Pinned: Home Station ── */}
              {homeStation && query.length === 0 && (
                <button
                  onClick={() => {
                    onSelect({ ...homeStation, type: 'city' }, 'city');
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left transition-all duration-150 bg-cyan-500/10 hover:bg-cyan-500/20 border-b border-cyan-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-cyan-400" />
                      <div>
                        <div className="font-bold text-sm text-cyan-300" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                          HOME STATION
                        </div>
                        <div className="text-xs text-cyan-600 uppercase tracking-wide">
                          {homeStation.name} • {homeStation.lat.toFixed(2)}°, {homeStation.lon.toFixed(2)}°
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono uppercase ${permBadge}`}>
                      {geoPermission === 'granted' ? 'GPS' : 'fallback'}
                    </span>
                  </div>
                </button>
              )}

              {/* Search results */}
              {results.map((item, index) => (
                <button
                  key={`${item.type}-${item.name}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-4 py-3 text-left transition-all duration-150 ${index === selectedIndex ? 'bg-green-500/20 border-l-4 border-green-500' : 'hover:bg-cyan-500/10'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-bold text-sm ${index === selectedIndex ? 'text-green-400' : 'text-white'}`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        {item.name}
                      </div>
                      <div className="text-xs text-cyan-600 uppercase tracking-wide">
                        {item.type === 'planet' ? '🪐 Planet' : '🌍 City'}
                        {item.lat && ` • ${item.lat.toFixed(2)}°, ${item.lon.toFixed(2)}°`}
                      </div>
                    </div>
                    {index === selectedIndex && (
                      <div className="text-green-400 text-xs">↵</div>
                    )}
                  </div>
                </button>
              ))}

              {/* No Results */}
              {query && results.length === 0 && (
                <div className="px-4 py-6 text-center">
                  <div className="text-red-400 font-bold text-sm mb-1">NO SIGNAL</div>
                  <div className="text-cyan-600 text-xs">Target not found in database</div>
                </div>
              )}
            </div>
          )}
        </div>

      {/* Pulsing Aurora Border Animation */}
        {query && (
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, #00ff99, #06b6d4, #a855f7, #00ff99)',
              backgroundSize: '200% 200%',
              animation: 'aurora-pulse 2s ease-in-out infinite',
              filter: 'blur(8px)',
              opacity: 0.3,
              zIndex: -1
            }}
          />
        )}
      </div>

      {/* ── GO TO PEAK — always visible when a peak is available ── */}
      {peakLocation && (
        <div className="mt-2 flex items-stretch gap-2">
          {/* Peak info pill */}
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-md bg-black/50 border border-green-500/30">
            <span className="text-green-400 text-base leading-none">◎</span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-green-300 font-['Rajdhani'] uppercase tracking-wide truncate">
                {peakLocation.name}
              </div>
              <div className="text-[10px] text-gray-500 font-mono">
                {peakLocation.lat.toFixed(1)}°N · {Math.abs(peakLocation.lon).toFixed(1)}°{peakLocation.lon >= 0 ? 'E' : 'W'}
              </div>
            </div>
            <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded border font-mono uppercase ${CONFIDENCE_STYLE[peakLocation.confidence]}`}>
              {peakLocation.confidence}
            </span>
          </div>

          {/* GO TO PEAK button */}
          <button
            onClick={onGoPeak}
            disabled={!onGoPeak}
            className="shrink-0 px-3 py-2 rounded-lg backdrop-blur-md bg-green-500/20 border border-green-500/50 text-green-300 text-xs font-bold font-['Rajdhani'] uppercase tracking-wider hover:bg-green-500/40 hover:text-green-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(34,197,94,0.3)]"
            title={peakLocation.reason}
          >
            GO TO<br />PEAK ◎
          </button>
        </div>
      )}

      {/* Hint row: Ctrl+K + optional SET HOME button */}
      <div className="mt-2 flex items-center justify-between gap-2">
        {!query && !isOpen && (
          <div className="text-cyan-600 text-xs uppercase tracking-wide animate-pulse">
            Neural Link Active • Ctrl+K
          </div>
        )}
        {/* One-click Home Station setter */}
        {onSetHomeStation && geoPermission !== 'granted' && (
          <button
            onClick={onSetHomeStation}
            className="ml-auto text-[11px] px-2.5 py-1 rounded backdrop-blur-sm bg-cyan-900/50 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-200 font-mono uppercase tracking-wide transition-all"
            title="Use your current GPS position as Home Station and save it"
          >
            📡 Set Home
          </button>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes aurora-pulse {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Custom scrollbar for results */
        .max-h-64::-webkit-scrollbar {
          width: 8px;
        }
        .max-h-64::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }
        .max-h-64::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #00ff99, #06b6d4);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

