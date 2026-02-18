/**
 * Live Space Weather Data Panel
 * Displays real-time data with 60-second auto-refresh indicator
 */

import { useState } from 'react';
import { useLiveSpaceWeather } from '../hooks/useLiveSpaceWeather';
import { Activity, Radio, Sun, AlertTriangle, RefreshCw, CheckCircle, XCircle, Zap } from 'lucide-react';
import { DataExportButton } from './DataExportButton';

export function LiveDataPanel() {
  const { data, isLoading, lastUpdate, dataAge, refresh, isRefreshing } = useLiveSpaceWeather();
  const [expanded, setExpanded] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="absolute top-4 right-4 bg-black/80 border border-cyan-500/50 rounded-lg p-4 backdrop-blur-md font-mono text-cyan-400 text-xs">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Connecting to NOAA SWPC...</span>
        </div>
      </div>
    );
  }

  const getDataQualityIcon = () => {
    switch (data.dataQuality) {
      case 'excellent': return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'good': return <CheckCircle className="w-3 h-3 text-yellow-400" />;
      case 'degraded': return <AlertTriangle className="w-3 h-3 text-orange-400" />;
      case 'fallback': return <XCircle className="w-3 h-3 text-red-400" />;
    }
  };

  const getStormColor = () => {
    if (data.kpIndex >= 8) return 'text-red-600';
    if (data.kpIndex >= 6) return 'text-red-500';
    if (data.kpIndex >= 5) return 'text-orange-500';
    if (data.kpIndex >= 4) return 'text-yellow-500';
    return 'text-green-400';
  };

  const getXrayColor = (xray: string) => {
    if (xray.startsWith('X')) return 'text-red-500';
    if (xray.startsWith('M')) return 'text-orange-500';
    if (xray.startsWith('C')) return 'text-yellow-500';
    return 'text-green-400';
  };

  return (
    <div 
      className="absolute top-4 right-4 bg-black/90 border border-cyan-500/50 rounded-lg backdrop-blur-md font-mono text-xs overflow-hidden transition-all duration-300"
      style={{ width: expanded ? '380px' : '220px' }}
    >
      {/* Header - Always Visible */}
      <div 
        className="p-3 border-b border-cyan-500/30 cursor-pointer hover:bg-cyan-500/10 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-cyan-400 font-bold">LIVE DATA</span>
          </div>
          {getDataQualityIcon()}
        </div>
        
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-400">
            Updated {dataAge}s ago
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              refresh();
            }}
            disabled={isRefreshing}
            className="text-cyan-400 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Stats - Always Visible */}
      <div className="p-3 grid grid-cols-2 gap-2">
        <div>
          <div className="text-gray-500 text-[10px]">KP INDEX</div>
          <div className={`text-2xl font-bold ${getStormColor()}`}>
            {data.kpIndex.toFixed(1)}
          </div>
        </div>
        <div>
          <div className="text-gray-500 text-[10px]">SOLAR WIND</div>
          <div className="text-2xl font-bold text-yellow-400">
            {data.solarWind.speed.toFixed(0)}
            <span className="text-xs ml-1">km/s</span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <>
          {/* Geomagnetic */}
          <div className="p-3 border-t border-cyan-500/20 bg-cyan-950/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span className="text-cyan-400 font-bold">GEOMAGNETIC</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div>
                <div className="text-gray-500">Storm Level</div>
                <div className={`font-bold uppercase ${getStormColor()}`}>
                  {data.geomagnetic.stormLevel}
                </div>
              </div>
              <div>
                <div className="text-gray-500">A-Index</div>
                <div className="text-white">{data.geomagnetic.planetaryA.toFixed(0)}</div>
              </div>
              <div>
                <div className="text-gray-500">DST</div>
                <div className="text-white">{data.geomagnetic.dstIndex.toFixed(0)} nT</div>
              </div>
            </div>
          </div>

          {/* Solar Wind Details */}
          <div className="p-3 border-t border-cyan-500/20 bg-blue-950/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400 font-bold">SOLAR WIND</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <div className="text-gray-500">Density</div>
                <div className="text-white">{data.solarWind.density.toFixed(2)} p/cm³</div>
              </div>
              <div>
                <div className="text-gray-500">Temperature</div>
                <div className="text-white">{(data.solarWind.temperature / 1000).toFixed(0)}K K</div>
              </div>
              <div>
                <div className="text-gray-500">Bz (IMF)</div>
                <div className={data.solarWind.bz < 0 ? 'text-red-400' : 'text-green-400'}>
                  {data.solarWind.bz.toFixed(2)} nT
                </div>
              </div>
              <div>
                <div className="text-gray-500">Bt (IMF)</div>
                <div className="text-white">{data.solarWind.bt.toFixed(2)} nT</div>
              </div>
            </div>
          </div>

          {/* Solar Activity */}
          <div className="p-3 border-t border-cyan-500/20 bg-orange-950/20">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-3 h-3 text-orange-400" />
              <span className="text-orange-400 font-bold">SOLAR ACTIVITY</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div>
                <div className="text-gray-500">F10.7</div>
                <div className="text-white">{data.solar.solarFluxF107.toFixed(0)} SFU</div>
              </div>
              <div>
                <div className="text-gray-500">Sunspots</div>
                <div className="text-white">{data.solar.sunspotNumber}</div>
              </div>
              <div>
                <div className="text-gray-500">X-ray</div>
                <div className={getXrayColor(data.solar.xrayFlux)}>
                  {data.solar.xrayFlux}
                </div>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          {data.alerts.length > 0 && (
            <div className="p-3 border-t border-cyan-500/20 bg-red-950/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />
                <span className="text-red-400 font-bold">ACTIVE ALERTS ({data.alerts.length})</span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {data.alerts.map(alert => (
                  <div key={alert.id} className="text-[9px] p-2 bg-black/50 rounded border-l-2 border-red-500">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="uppercase font-bold text-red-400">{alert.type}</span>
                      <span className="text-gray-500">•</span>
                      <span className="uppercase text-yellow-400">{alert.severity}</span>
                    </div>
                    <div className="text-gray-300">{alert.message.slice(0, 80)}...</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Source Info */}
          <div className="p-2 border-t border-cyan-500/20 bg-black/50 text-[9px] text-gray-500 text-center">
            <div>Data: NOAA SWPC • Updated every 60s</div>
            <div className="text-cyan-400 mt-1">Quality: {data.dataQuality.toUpperCase()}</div>
          </div>
        </>
      )}
    </div>
  );
}
