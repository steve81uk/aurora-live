import { MapPin, X } from 'lucide-react';
import { SURFACE_LOCATIONS, type SurfaceLocation } from '../data/surfaceLocations';
import type { AppTheme } from '../types/mythic';

interface SurfaceViewControlsProps {
  planetName: string;
  currentLocation: SurfaceLocation | null;
  onLocationChange: (location: SurfaceLocation) => void;
  onExit: () => void;
  mythicTheme: AppTheme;
}

export function SurfaceViewControls({
  planetName,
  currentLocation,
  onLocationChange,
  onExit,
  mythicTheme,
}: SurfaceViewControlsProps) {
  const locations = SURFACE_LOCATIONS[planetName] || [];

  if (locations.length === 0) return null;

  const getLocationName = (loc: SurfaceLocation): string => {
    if (mythicTheme === 'NORSE' && loc.mythicName?.norse) {
      return loc.mythicName.norse;
    }
    return loc.name;
    return loc.name;
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl p-4 min-w-[320px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Surface View: {planetName}
            </h3>
          </div>
          <button
            onClick={onExit}
            className="text-white/50 hover:text-white transition-colors"
            title="Exit Surface View"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Location Selector */}
        <div className="space-y-2">
          <label className="text-xs text-white/50 font-semibold block">
            VIEWING LOCATION
          </label>
          <div className="grid gap-2">
            {locations.map((loc) => {
              const isActive = currentLocation?.name === loc.name;
              const displayName = getLocationName(loc);

              return (
                <button
                  key={loc.name}
                  onClick={() => onLocationChange(loc)}
                  className={`text-left p-2 rounded transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/20 border border-cyan-500/40 shadow-lg'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`mt-0.5 w-2 h-2 rounded-full ${
                        isActive ? 'bg-cyan-400' : 'bg-white/30'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-semibold ${
                          isActive ? 'text-cyan-300' : 'text-white'
                        }`}
                      >
                        {displayName}
                      </div>
                      <div className="text-xs text-white/50 mt-0.5">
                        {loc.description}
                      </div>
                      {mythicTheme !== 'SCI_FI' && displayName !== loc.name && (
                        <div className="text-xs text-white/30 mt-1 italic">
                          ({loc.name})
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <div className="text-cyan-400 text-sm">✓</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tip */}
        <div className="mt-3 pt-2 border-t border-white/10 text-xs text-white/40 text-center">
          Drag to look around · Scroll to adjust altitude
        </div>
      </div>
    </div>
  );
}
