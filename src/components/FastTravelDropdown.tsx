import { Coffee, ExternalLink } from 'lucide-react';

/**
 * FastTravelDropdown - Quick navigation to planets, locations, and dates
 */
interface FastTravelProps {
  onTravelToPlanet: (planet: string) => void;
  onTravelToDate: (date: Date) => void;
  onTravelToLocation: (location: { name: string; lat: number; lon: number }) => void;
}

export function FastTravelDropdown({ onTravelToPlanet, onTravelToDate, onTravelToLocation }: FastTravelProps) {
  return (
    <div className="relative group">
      <button className="bg-gradient-to-br from-black/80 to-cyan-900/60 backdrop-blur-xl border-2 border-cyan-400/50 text-cyan-400 px-4 py-2 rounded-lg font-mono text-sm hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
        FAST TRAVEL ▼
      </button>
      
      <div className="absolute top-full left-0 mt-2 w-72 bg-gradient-to-br from-black/95 to-cyan-900/80 backdrop-blur-xl border-2 border-cyan-400/50 rounded-lg shadow-2xl shadow-cyan-500/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        
        {/* PLANETS */}
        <div className="p-3 border-b border-cyan-500/30">
          <div className="text-cyan-400 font-bold text-xs mb-2">CELESTIAL BODIES</div>
          <div className="grid grid-cols-3 gap-2">
            {['Sun', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].map(planet => (
              <button
                key={planet}
                onClick={() => onTravelToPlanet(planet)}
                className="bg-black/40 hover:bg-cyan-900/50 text-white text-[10px] px-2 py-1 rounded border border-cyan-500/30 hover:border-cyan-400 transition-all"
              >
                {planet}
              </button>
            ))}
          </div>
        </div>

        {/* EARTH LOCATIONS */}
        <div className="p-3 border-b border-cyan-500/30">
          <div className="text-cyan-400 font-bold text-xs mb-2">AURORA HOTSPOTS</div>
          <div className="space-y-1">
            {[
              { name: 'Reykjavik', lat: 64.1466, lon: -21.9426 },
              { name: 'Tromsø', lat: 69.6492, lon: 18.9553 },
              { name: 'Anchorage', lat: 61.2181, lon: -149.9003 },
              { name: 'Yellowknife', lat: 62.4540, lon: -114.3718 },
              { name: 'Abisko', lat: 68.3495, lon: 18.8312 },
              { name: 'Tasmania', lat: -41.4545, lon: 145.9707 }
            ].map(loc => (
              <button
                key={loc.name}
                onClick={() => onTravelToLocation(loc)}
                className="w-full text-left bg-black/40 hover:bg-cyan-900/50 text-white text-[10px] px-3 py-1.5 rounded border border-cyan-500/30 hover:border-cyan-400 transition-all"
              >
                📍 {loc.name}
              </button>
            ))}
          </div>
        </div>

        {/* HISTORICAL DATES */}
        <div className="p-3 border-b border-cyan-500/30">
          <div className="text-cyan-400 font-bold text-xs mb-2">HISTORIC EVENTS</div>
          <div className="space-y-1">
            {[
              { name: 'May 2024 G5 Storm', date: new Date('2024-05-10T12:00:00Z') },
              { name: 'Halloween Storm 2003', date: new Date('2003-10-29T06:00:00Z') },
              { name: 'Quebec Blackout 1989', date: new Date('1989-03-13T03:00:00Z') },
              { name: 'Carrington Event 1859', date: new Date('1859-09-01T12:00:00Z') }
            ].map(event => (
              <button
                key={event.name}
                onClick={() => onTravelToDate(event.date)}
                className="w-full text-left bg-black/40 hover:bg-orange-900/50 text-white text-[10px] px-3 py-1.5 rounded border border-orange-500/30 hover:border-orange-400 transition-all"
              >
                🔥 {event.name}
              </button>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="p-3">
          <button
            onClick={() => onTravelToDate(new Date())}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs px-3 py-2 rounded font-bold transition-all"
          >
            ⏱️ JUMP TO NOW
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * DonationButton - "Fuel the Ship" support button
 */
export function DonationButton() {
  return (
    <a
      href="https://buymeacoffee.com/yourusername" // UPDATE THIS
      target="_blank"
      rel="noopener noreferrer"
      className="bg-gradient-to-br from-orange-600/80 to-yellow-600/80 backdrop-blur-xl border-2 border-orange-400/50 text-white px-4 py-2 rounded-lg font-mono text-sm hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center gap-2"
    >
      <Coffee size={16} />
      <span>FUEL THE SHIP</span>
      <ExternalLink size={12} />
    </a>
  );
}
