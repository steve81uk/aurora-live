import { useState } from 'react';
import { ChevronUp, ChevronDown, Activity, Wind, Gauge, MapPin } from 'lucide-react';
import { type HUDTheme, themeColors } from './HelmetHUD';
import type { KpIndexData, SolarWind, Location } from '../types/aurora';

interface MobileDataPanelProps {
  theme: HUDTheme;
  kpData?: KpIndexData;
  solarWind?: SolarWind;
  selectedLocation: Location;
  isMobile?: boolean;
}

export default function MobileDataPanel({
  theme,
  kpData,
  solarWind,
  selectedLocation,
  isMobile = false
}: MobileDataPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoHideTimeout, setAutoHideTimeout] = useState<number | null>(null);

  const handleExpand = () => {
    setIsExpanded(true);
    
    // Auto-collapse after 5 seconds of inactivity
    if (autoHideTimeout) clearTimeout(autoHideTimeout);
    const timeout = setTimeout(() => {
      setIsExpanded(false);
    }, 5000);
    setAutoHideTimeout(timeout);
  };

  const handleCollapse = () => {
    if (autoHideTimeout) clearTimeout(autoHideTimeout);
    setIsExpanded(false);
  };

  const colors = themeColors[theme];

  if (!isMobile) return null;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-auto w-[90vw] max-w-sm">
      {/* Collapse/Expand Button */}
      <button
        onClick={isExpanded ? handleCollapse : handleExpand}
        className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-t-lg border border-b-0 border-white/20 transition-all duration-300 ${
          isExpanded 
            ? `${colors.bg} backdrop-blur-lg` 
            : 'bg-black/60 backdrop-blur-md'
        }`}
      >
        <Activity className={`${colors.text}`} size={16} />
        <span className="text-xs font-bold text-white/90 font-mono">DATA</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-white/70" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/70" />
        )}
      </button>

      {/* Expandable Panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-b-lg p-4 space-y-4">
          {/* KP Index */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Gauge className={colors.text} size={16} />
              <span className="text-xs text-white/70 font-mono">KP INDEX</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {kpData?.kpValue.toFixed(1) || '--'}
              </span>
              <span className="text-sm text-white/50 font-mono">/ 9.0</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full ${colors.bg} transition-all duration-500`}
                style={{ width: `${((kpData?.kpValue || 0) / 9) * 100}%` }}
              />
            </div>
          </div>

          {/* Solar Wind */}
          <div className="space-y-2 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <Wind className={colors.text} size={16} />
              <span className="text-xs text-white/70 font-mono">SOLAR WIND</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-white/50 font-mono">SPEED</div>
                <div className="text-lg font-bold text-white font-mono">
                  {solarWind?.speed.toFixed(0) || '--'}
                  <span className="text-xs text-white/50 ml-1">km/s</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-white/50 font-mono">DENSITY</div>
                <div className="text-lg font-bold text-white font-mono">
                  {solarWind?.density.toFixed(1) || '--'}
                  <span className="text-xs text-white/50 ml-1">p/cm³</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <MapPin className={colors.text} size={16} />
              <span className="text-xs text-white/70 font-mono">LOCATION</span>
            </div>
            <div className="text-sm font-bold text-white font-mono">
              {selectedLocation.name}
            </div>
            <div className="text-xs text-white/50 font-mono">
              {selectedLocation.lat.toFixed(2)}°, {selectedLocation.lon.toFixed(2)}°
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
