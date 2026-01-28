import { useState, useEffect } from 'react';
import { MapPin, Activity, Wind, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import type { Location, KpIndexData, SolarWind, ForecastData, AuroraVisibility } from '../types/aurora';
import { LocationSelector } from './LocationSelector';
import { PeakTimer } from './PeakTimer';
import { ForecastTimeline } from './ForecastTimeline';
import { SolarWindDisplay } from './SolarWindDisplay';

interface HUDOverlayProps {
  selectedLocation: Location;
  onLocationChange: (location: Location) => void;
  kpData?: KpIndexData;
  solarWind?: SolarWind;
  forecast?: ForecastData;
  visibility?: AuroraVisibility;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  isOnline: boolean;
}

export function HUDOverlay({
  selectedLocation,
  onLocationChange,
  kpData,
  solarWind,
  forecast,
  visibility,
  loading,
  error,
  onRefresh,
  isOnline
}: HUDOverlayProps) {
  const [tickerText, setTickerText] = useState('');

  useEffect(() => {
    const messages = [
      '🛰️ NOAA SWPC LIVE FEED ACTIVE',
      '⚡ MONITORING GEOMAGNETIC ACTIVITY',
      '🌍 PLANETARY DEFENSE SYSTEMS ONLINE',
      '☀️ SOLAR WIND TRACKING ENGAGED',
      '📡 AURORA FORECAST UPDATING',
    ];
    let index = 0;
    const interval = setInterval(() => {
      setTickerText(messages[index]);
      index = (index + 1) % messages.length;
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getKpStatus = () => {
    const kp = kpData?.kpValue || 0;
    if (kp < 3) return { text: 'NOMINAL', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (kp < 5) return { text: 'ELEVATED', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (kp < 7) return { text: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { text: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const status = getKpStatus();

  return (
    <div className="absolute inset-0 pointer-events-none font-mono">
      <div className="absolute left-0 top-0 h-full w-80 pointer-events-auto bg-black/40 backdrop-blur-xl border-r border-cyan-500/30 flex flex-col">
        <div className="p-6 border-b border-cyan-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <h1 className="text-3xl font-black text-white tracking-wider drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
              AURORA
            </h1>
          </div>
          <h2 className="text-xl font-black text-cyan-400 tracking-widest">
            COMMAND
          </h2>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-cyan-50">STATUS:</span>
            <span className={`text-xs font-bold px-2 py-1 rounded ${status.bg} ${status.color} border border-current`}>
              {status.text}
            </span>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <section role="region" aria-label="Location Selection">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-cyan-400 tracking-wider">OBSERVATION POINT</h3>
              </div>
              <div className="text-lg font-bold text-white mb-3">
                {selectedLocation.name}
              </div>
            </div>
            <LocationSelector onLocationChange={onLocationChange} />
            <div className="mt-4 pt-4 border-t border-cyan-500/30">
              <PeakTimer location={selectedLocation} />
            </div>
          </section>

          <div className="pt-4 border-t border-cyan-500/30">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 rounded text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh data"
            >
              <Clock className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'REFRESHING...' : 'REFRESH DATA'}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-400/50 rounded animate-pulse" role="alert">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-sm font-bold text-red-400">CONNECTION ERROR</span>
              </div>
              <p className="text-xs text-white">{error}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-cyan-500/30 bg-black/60">
          <div 
            className="text-xs text-cyan-400 overflow-hidden whitespace-nowrap"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="animate-pulse">{tickerText}</div>
          </div>
        </div>
      </div>

      <div className="absolute right-0 top-0 h-full w-80 pointer-events-auto bg-black/40 backdrop-blur-xl border-l border-cyan-500/30 overflow-y-auto">
        <div className="p-6 space-y-4">
          <section 
            role="region" 
            aria-label="Kp Index Data"
            aria-live="polite"
            className={`p-4 rounded-lg border border-cyan-400/30 ${status.bg}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-cyan-400 tracking-wider">KP INDEX</h3>
            </div>
            <div className="text-5xl font-black text-white mb-2">
              {kpData?.kpValue.toFixed(1) || '0.0'}
            </div>
            <div className="text-sm text-cyan-50">
              Planetary K-Index
            </div>
            <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold ${status.color} border border-current inline-block`}>
              {status.text}
            </div>
          </section>

          <section 
            role="region" 
            aria-label="Solar Wind Speed"
            aria-live="polite"
            className="p-4 rounded-lg border border-cyan-400/30 bg-purple-500/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <Wind className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-purple-400 tracking-wider">SOLAR WIND</h3>
            </div>
            <div className="text-5xl font-black text-white mb-2">
              {solarWind?.speed || 0}
            </div>
            <div className="text-sm text-cyan-50">
              km/s
            </div>
            <div className="mt-3 text-xs text-cyan-50">
              Travel Time: {((150000000 / ((solarWind?.speed || 400) * 60 * 60 * 24))).toFixed(1)} days
            </div>
          </section>

          <section 
            role="region" 
            aria-label="Aurora Visibility"
            className="p-4 rounded-lg border border-cyan-400/30 bg-blue-500/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-blue-400 tracking-wider">VISIBILITY</h3>
            </div>
            <div className="text-5xl font-black text-white mb-2">
              {visibility?.percentage || 0}%
            </div>
            <div className="text-sm text-cyan-50">
              {visibility?.quality || 'Unknown'}
            </div>
          </section>

          <section 
            role="region" 
            aria-label="Solar Wind Details"
            className="p-4 rounded-lg border border-white/10 bg-black/40"
          >
            <h3 className="text-sm font-bold text-cyan-400 mb-4 tracking-wider">WIND PARAMETERS</h3>
            <SolarWindDisplay solarWind={solarWind} />
          </section>

          <section 
            role="region" 
            aria-label="Aurora Forecast"
            className="p-4 rounded-lg border border-white/10 bg-black/40"
          >
            <h3 className="text-sm font-bold text-cyan-400 mb-4 tracking-wider">3-DAY FORECAST</h3>
            <ForecastTimeline predictions={forecast?.prediction || []} />
          </section>

          <footer className="pt-4 border-t border-white/10 text-xs text-cyan-50/60 text-center">
            <div>🛰️ NOAA SWPC</div>
            <div className="mt-1">{kpData?.timestamp && new Date(kpData.timestamp).toLocaleString()}</div>
          </footer>
        </div>
      </div>
    </div>
  );
}
