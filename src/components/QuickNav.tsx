import { useState } from 'react';
import { ChevronDown, MapPin, Globe } from 'lucide-react';

export function QuickNav({ onTravel, planets, cities }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-50 pointer-events-auto font-mono">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-black/80 border border-cyan-500 text-cyan-400 px-4 py-2 rounded hover:bg-cyan-900/50 transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)]"
      >
        <Globe className="w-4 h-4" />
        <span>WARP NAVIGATION</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 border border-white/20 rounded-lg backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* PLANETS */}
          <div className="p-2">
            <div className="text-[10px] text-gray-500 mb-1 px-2">PLANETARY SYSTEMS</div>
            <div className="grid grid-cols-2 gap-1">
              {planets.map((p: any) => (
                <button
                  key={p.name}
                  onClick={() => { onTravel(p.name); setIsOpen(false); }}
                  className="text-left px-2 py-1 text-xs text-white hover:bg-cyan-600 rounded transition-colors"
                >
                  {p.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* EARTH LOCATIONS */}
          <div className="border-t border-white/10 p-2">
            <div className="text-[10px] text-gray-500 mb-1 px-2">EARTH OUTPOSTS</div>
            <div className="flex flex-col gap-1">
              {cities.map((c: any) => (
                <button
                  key={c.name}
                  onClick={() => { onTravel('Earth', c); setIsOpen(false); }} // Travel to Earth, then City
                  className="flex items-center gap-2 text-left px-2 py-1 text-xs text-cyan-200 hover:bg-cyan-900/50 rounded transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}