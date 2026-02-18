/**
 * NeuralLink Component - Fuzzy Search Bar
 * Quick search for planets and cities with auto-complete
 */

import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import Fuse from 'fuse.js';

interface NeuralLinkProps {
  planets: Array<{ name: string }>;
  cities: Array<{ name: string; lat: number; lon: number }>;
  onSelect: (item: any, type: 'planet' | 'city') => void;
}

export function NeuralLink({ planets, cities, onSelect }: NeuralLinkProps) {
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

  // Play wolf-chime on selection
  const playWolfChime = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  // Handle selection
  const handleSelect = (item: any) => {
    onSelect(item, item.type);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
    
    setTimeout(() => playWolfChime(), 500);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
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
              onFocus={() => query && setIsOpen(true)}
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
          {isOpen && results.length > 0 && (
            <div className="border-t border-cyan-500/30 max-h-64 overflow-y-auto">
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
            </div>
          )}

          {/* No Results */}
          {isOpen && query && results.length === 0 && (
            <div className="border-t border-cyan-500/30 px-4 py-6 text-center">
              <div className="text-red-400 font-bold text-sm mb-1">NO SIGNAL</div>
              <div className="text-cyan-600 text-xs">Target not found in database</div>
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

      {/* Hint */}
      {!query && !isOpen && (
        <div className="text-center mt-2 text-cyan-600 text-xs uppercase tracking-wide animate-pulse">
          Neural Link Active • Press Ctrl+K
        </div>
      )}

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
