/**
 * WeatherHUD Component
 * Displays real-time weather conditions for aurora visibility
 * Shows cloud cover, visibility, and viewing verdict
 */

import { Cloud, CloudOff, Eye, Sun, Moon } from 'lucide-react';
import { useLocalVisibility } from '../hooks/useLocalVisibility';

interface WeatherHUDProps {
  lat: number;
  lon: number;
  locationName: string;
  kpValue: number;
}

export function WeatherHUD({ lat, lon, locationName, kpValue }: WeatherHUDProps) {
  const { weather, isLoading, error, verdict, canSeeAurora, isDark } = useLocalVisibility(lat, lon);

  if (isLoading) {
    return (
      <div className="backdrop-blur-lg bg-black/40 border-2 border-cyan-500/50 rounded-lg p-4 min-w-[280px]">
        <div className="flex items-center gap-3 animate-pulse">
          <Cloud className="w-6 h-6 text-cyan-400" />
          <div className="text-cyan-400 font-mono text-sm">CHECKING SKIES...</div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="backdrop-blur-lg bg-black/40 border-2 border-red-500/50 rounded-lg p-4 min-w-[280px]">
        <div className="flex items-center gap-3">
          <CloudOff className="w-6 h-6 text-red-400" />
          <div className="text-red-400 font-mono text-sm">WEATHER DATA UNAVAILABLE</div>
        </div>
      </div>
    );
  }

  // Determine status color
  const getStatusColor = () => {
    if (canSeeAurora && kpValue >= 5) return 'text-green-400 border-green-500';
    if (canSeeAurora && kpValue >= 3) return 'text-yellow-400 border-yellow-500';
    return 'text-red-400 border-red-500';
  };

  const getVerdictText = () => {
    if (!isDark) return 'DAYLIGHT // STANDBY';
    if (verdict === 'OVERCAST') return 'SKY OPAQUE // STAND DOWN';
    if (verdict === 'PARTLY_CLOUDY') return 'PARTLY CLOUDY // MONITOR';
    if (kpValue < 3) return 'SKY CLEAR // LOW ACTIVITY';
    if (kpValue >= 5) return 'SKY CLEAR // HUNT ACTIVE 🐺';
    return 'SKY CLEAR // POSSIBLE AURORA';
  };

  const statusColor = getStatusColor();

  return (
    <div className={`backdrop-blur-lg bg-black/40 border-2 ${statusColor} rounded-lg p-4 min-w-[280px] shadow-[0_0_30px_rgba(6,182,212,0.4)]`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-500/30">
        <div className="flex items-center gap-2">
          {isDark ? <Moon className="w-5 h-5 text-cyan-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
          <div className="text-cyan-400 font-bold text-sm font-mono">{locationName.toUpperCase()}</div>
        </div>
        <div className="text-cyan-600 text-xs font-mono">WEATHER</div>
      </div>

      {/* Cloud Density */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-xs font-mono">CLOUD DENSITY</span>
          </div>
          <span className={`font-bold font-mono text-sm ${weather.cloudCover > 70 ? 'text-red-400' : weather.cloudCover > 30 ? 'text-yellow-400' : 'text-green-400'}`}>
            {weather.cloudCover.toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${weather.cloudCover > 70 ? 'bg-gradient-to-r from-red-500 to-red-600' : weather.cloudCover > 30 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-green-500 to-green-600'}`}
            style={{ width: `${weather.cloudCover}%` }}
          />
        </div>
      </div>

      {/* Visibility */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-xs font-mono">VISIBILITY</span>
          </div>
          <span className="font-bold font-mono text-sm text-cyan-400">
            {(weather.visibility / 1000).toFixed(1)} km
          </span>
        </div>
      </div>

      {/* Status Icon */}
      <div className="mb-3 py-3 border-t border-b border-cyan-500/30 text-center">
        <div className="text-4xl mb-2">
          {!isDark ? '☀️' : verdict === 'CLEAR' ? '🌙' : verdict === 'PARTLY_CLOUDY' ? '⛅' : '☁️'}
        </div>
        <div className="text-cyan-400 text-xs font-mono uppercase">
          {weather.conditions}
        </div>
      </div>

      {/* Verdict */}
      <div className={`${statusColor} text-center font-bold font-mono text-sm py-3 rounded bg-black/30 border-2`}>
        {getVerdictText()}
      </div>

      {/* Additional Info */}
      <div className="mt-3 pt-3 border-t border-cyan-500/20 grid grid-cols-2 gap-2 text-xs">
        <div className="text-center">
          <div className="text-cyan-600 font-mono">TEMP</div>
          <div className="text-cyan-400 font-bold">{weather.temperature.toFixed(1)}°C</div>
        </div>
        <div className="text-center">
          <div className="text-cyan-600 font-mono">KP INDEX</div>
          <div className={`font-bold ${kpValue >= 5 ? 'text-green-400' : kpValue >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
            {kpValue.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Time to Clear (Mock) */}
      {verdict !== 'CLEAR' && (
        <div className="mt-3 text-center text-xs text-cyan-600 font-mono">
          ⏱️ Time to Clear: {Math.floor(Math.random() * 6) + 1}h {Math.floor(Math.random() * 60)}m
        </div>
      )}
    </div>
  );
}
