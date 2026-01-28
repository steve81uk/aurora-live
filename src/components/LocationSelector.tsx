import { useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { LOCATIONS } from '../data/locations';
import type { Location } from '../types/aurora';

interface LocationSelectorProps {
  onLocationChange?: (location: Location) => void;
}

export function LocationSelector({ onLocationChange }: LocationSelectorProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location>(LOCATIONS[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Group locations by region
  const groupedLocations = useMemo(() => {
    const groups = {
      'Arctic Classics': LOCATIONS.filter(loc => 
        ['Reykjavik', 'Tromsø', 'Fairbanks', 'Yellowknife', 'Abisko', 'Svalbard'].some(name => loc.name.includes(name))
      ),
      'UK & Ireland': LOCATIONS.filter(loc => 
        loc.name.includes('England') || loc.name.includes('Scotland') || 
        loc.name.includes('Wales') || loc.name.includes('Ireland') || loc.name.includes('Tyrone')
      ),
      'Scandinavia': LOCATIONS.filter(loc => 
        (loc.name.includes('Norway') || loc.name.includes('Sweden') || 
         loc.name.includes('Finland') || loc.name.includes('Greenland')) &&
        !['Tromsø', 'Svalbard', 'Abisko'].some(name => loc.name.includes(name))
      ),
      'North America': LOCATIONS.filter(loc => 
        (loc.name.includes('USA') || loc.name.includes('Maine') || loc.name.includes('Pennsylvania') ||
         loc.name.includes('Michigan') || loc.name.includes('Minnesota') || loc.name.includes('North Dakota') ||
         loc.name.includes('Montana') || loc.name.includes('Idaho') || loc.name.includes('Washington') ||
         loc.name.includes('Canada') || loc.name.includes('Alaska') || loc.name.includes('Yukon') ||
         loc.name.includes('Manitoba')) &&
        !['Fairbanks', 'Yellowknife'].some(name => loc.name.includes(name))
      ),
      'Southern Hemisphere': LOCATIONS.filter(loc => loc.hemisphere === 'south')
    };

    return groups;
  }, []);

  // Filter locations by search term
  const filteredLocations = useMemo(() => {
    if (!searchTerm) return groupedLocations;

    const term = searchTerm.toLowerCase();
    const filtered: Record<string, Location[]> = {};

    Object.entries(groupedLocations).forEach(([region, locs]) => {
      const matches = locs.filter(loc => 
        loc.name.toLowerCase().includes(term)
      );
      if (matches.length > 0) {
        filtered[region] = matches;
      }
    });

    return filtered;
  }, [searchTerm, groupedLocations]);

  const handleLocationSelect = (locationName: string) => {
    const location = LOCATIONS.find(loc => loc.name === locationName);
    if (location) {
      setSelectedLocation(location);
      onLocationChange?.(location);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/30">
        <MapPin className="w-4 h-4 text-cyan-400" />
        <h3 className="text-[11px] font-black tracking-widest text-cyan-400">LOCATION</h3>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="SEARCH..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-2 py-1.5 bg-black/60 border border-cyan-500/30 text-cyan-400 placeholder-cyan-700 text-[10px] font-mono tracking-wide focus:outline-none focus:border-cyan-500/60 transition-colors"
        />

        <select
          id="location-select"
          value={selectedLocation.name}
          onChange={(e) => handleLocationSelect(e.target.value)}
          className="w-full px-2 py-1.5 bg-black/60 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono tracking-wide focus:outline-none focus:border-cyan-500/60 transition-colors"
        >
          {Object.entries(filteredLocations).map(([region, locations]) => (
            <optgroup key={region} label={region} className="bg-black text-cyan-500 font-bold">
              {locations.map((location) => (
                <option 
                  key={location.name} 
                  value={location.name}
                  className="bg-black text-cyan-400"
                >
                  {location.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <div className="border border-cyan-500/20 bg-black/40 p-2 grid grid-cols-2 gap-2 text-[9px] font-mono">
          <div>
            <span className="text-cyan-700">LAT:</span>
            <span className="text-cyan-400 ml-1 font-bold">{selectedLocation.lat.toFixed(2)}°</span>
          </div>
          <div>
            <span className="text-cyan-700">LON:</span>
            <span className="text-cyan-400 ml-1 font-bold">{selectedLocation.lon.toFixed(2)}°</span>
          </div>
        </div>
      </div>
    </div>
  );
}
