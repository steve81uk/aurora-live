import { useState, useEffect } from 'react';
import { ChevronDown, MapPin, Activity, Wind, BarChart3, Clock, Sparkles } from 'lucide-react';
import { LOCATIONS } from './data/locations';
import { useAuroraData } from './hooks/useAuroraData';
import { useSoundFX } from './hooks/useSoundFX';
import { analyzeViewingConditions, predictPeakActivity } from './utils/predictions';
import { 
  LocationSelector, 
  DataDashboard, 
  AuroraCanvas, 
  ForecastTimeline, 
  SolarWindDisplay,
  PeakTimer,
  RecommendationDisplay
} from './components';

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const { data, loading, error, visibility, refetch } = useAuroraData(selectedLocation);
  const { playBip, checkKpIncrease } = useSoundFX();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (data.kpIndex?.kpValue) {
      checkKpIncrease(data.kpIndex.kpValue);
    }
  }, [data.kpIndex?.kpValue, checkKpIncrease]);

  const toggleDropdown = (name: string) => {
    playBip();
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const recommendation = analyzeViewingConditions(
    data.kpIndex?.kpValue || 0,
    visibility?.percentage || 0,
    selectedLocation,
    data.solarWind?.speed || 0,
    data.solarWind?.bz || 0
  );

  const peakPrediction = predictPeakActivity(data.forecast?.prediction || []);

  const getKpStatus = () => {
    const kp = data.kpIndex?.kpValue || 0;
    if (kp < 3) return { text: 'QUIET', color: 'text-green-400' };
    if (kp < 5) return { text: 'ACTIVE', color: 'text-yellow-400' };
    if (kp < 7) return { text: 'STORM', color: 'text-orange-400' };
    return { text: 'SEVERE', color: 'text-red-400' };
  };

  const status = getKpStatus();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <div className="fixed inset-0 z-0">
        <AuroraCanvas kpValue={data.kpIndex?.kpValue || 3} />
      </div>

      <div className="relative z-50 flex flex-col h-full text-white">
        <nav className="bg-black/70 backdrop-blur-xl border-b border-white/10 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between px-4 md:px-6 py-3 md:py-4 gap-2">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <h1 className="text-lg md:text-2xl font-black tracking-tight bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                AURORA LIVE
              </h1>
              <div className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold ${status.color} bg-black/50 border border-current`}>
                {status.text}
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2 flex-wrap">
              <div className="relative">
                <button onClick={() => toggleDropdown('ai')} className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/50 rounded-lg text-xs md:text-sm hover:from-purple-500/30 hover:to-pink-500/30 transition-all">
                  <Sparkles className="w-3 md:w-4 h-3 md:h-4 text-purple-400 animate-pulse" />
                  <span className="hidden md:inline font-medium">AI Predict</span>
                  <div className="px-1.5 md:px-2 py-0.5 rounded-full bg-purple-500/30 text-[10px] md:text-xs font-bold text-white">{recommendation.score}</div>
                  <ChevronDown className={`w-3 md:w-4 h-3 md:h-4 transition-transform ${activeDropdown === 'ai' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'ai' && (
                  <div className="absolute top-full mt-2 right-0 w-[90vw] md:w-[450px] bg-black/95 backdrop-blur-xl border border-purple-400/30 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-3 md:p-4 max-h-[70vh] overflow-y-auto">
                      <div className="mb-3 md:mb-4 pb-3 md:pb-4 border-b border-white/10">
                        <h3 className="text-base md:text-lg font-black text-white mb-1">AI Aurora Forecast</h3>
                        <p className="text-xs text-gray-400">Real-time analysis for {selectedLocation.name}</p>
                      </div>
                      <RecommendationDisplay recommendation={recommendation} />
                      {peakPrediction && (
                        <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-xl">
                          <div className="text-xs text-gray-400 mb-2">PREDICTED PEAK ACTIVITY</div>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <div className="text-xs md:text-sm text-white font-bold">{peakPrediction.time}</div>
                              <div className="text-xs text-gray-400">KP {peakPrediction.kp.toFixed(1)}</div>
                            </div>
                            <div className="px-2 md:px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-xs font-bold text-cyan-400">{peakPrediction.likelihood}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => toggleDropdown('location')} className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-black/50 hover:bg-black/70 border border-white/10 hover:border-cyan-400/50 rounded-lg text-xs md:text-sm transition-all">
                  <MapPin className="w-3 md:w-4 h-3 md:h-4 text-cyan-400" />
                  <span className="max-w-[100px] md:max-w-none truncate font-medium">{selectedLocation.name}</span>
                  <ChevronDown className={`w-3 md:w-4 h-3 md:h-4 transition-transform ${activeDropdown === 'location' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'location' && (
                  <div className="absolute top-full mt-2 right-0 w-[90vw] md:w-80 bg-black/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-3 md:p-4">
                      <LocationSelector onLocationChange={(loc) => { setSelectedLocation(loc); setActiveDropdown(null); playBip(); }} />
                      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/10">
                        <PeakTimer location={selectedLocation} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => toggleDropdown('telemetry')} className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-black/50 hover:bg-black/70 border border-white/10 hover:border-cyan-400/50 rounded-lg text-xs md:text-sm transition-all">
                  <Activity className="w-3 md:w-4 h-3 md:h-4 text-cyan-400" />
                  <span className="font-medium">KP {data.kpIndex?.kpValue.toFixed(1) || '0.0'}</span>
                  <ChevronDown className={`w-3 md:w-4 h-3 md:h-4 transition-transform ${activeDropdown === 'telemetry' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'telemetry' && (
                  <div className="absolute top-full mt-2 right-0 w-[90vw] md:w-[600px] bg-black/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-3 md:p-4 max-h-[70vh] overflow-y-auto">
                      <DataDashboard kpData={data.kpIndex || undefined} visibility={visibility || undefined} />
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => toggleDropdown('solar')} className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-black/50 hover:bg-black/70 border border-white/10 hover:border-cyan-400/50 rounded-lg text-xs md:text-sm transition-all">
                  <Wind className="w-3 md:w-4 h-3 md:h-4 text-cyan-400" />
                  <span className="font-medium hidden md:inline">{data.solarWind?.speed || 0} km/s</span>
                  <span className="font-medium md:hidden">{data.solarWind?.speed || 0}</span>
                  <ChevronDown className={`w-3 md:w-4 h-3 md:h-4 transition-transform ${activeDropdown === 'solar' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'solar' && (
                  <div className="absolute top-full mt-2 right-0 w-[90vw] md:w-96 bg-black/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-3 md:p-4">
                      <SolarWindDisplay solarWind={data.solarWind || undefined} />
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => toggleDropdown('forecast')} className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-black/50 hover:bg-black/70 border border-white/10 hover:border-cyan-400/50 rounded-lg text-xs md:text-sm transition-all">
                  <BarChart3 className="w-3 md:w-4 h-3 md:h-4 text-cyan-400" />
                  <span className="font-medium hidden md:inline">Forecast</span>
                  <ChevronDown className={`w-3 md:w-4 h-3 md:h-4 transition-transform ${activeDropdown === 'forecast' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'forecast' && (
                  <div className="absolute top-full mt-2 right-0 w-[90vw] md:w-[700px] bg-black/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-3 md:p-4 max-h-[70vh] overflow-y-auto">
                      <ForecastTimeline predictions={data.forecast?.prediction || []} />
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => { refetch(); playBip(); }} disabled={loading} className="px-2 md:px-4 py-1.5 md:py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 hover:border-cyan-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <Clock className={`w-3 md:w-4 h-3 md:h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 drop-shadow-[0_0_30px_rgba(0,255,255,0.5)] mb-6 md:mb-8 text-center animate-pulse">
            AURORA LIVE
          </h1>

          <div className="p-4 md:p-6 lg:p-8 border border-white/20 bg-black/50 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-2xl space-y-4 max-w-4xl w-full">
            <div className="grid grid-cols-3 gap-2 md:gap-4 lg:gap-8">
              <div className="text-center p-2 md:p-4 bg-black/40 rounded-lg md:rounded-xl border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer" onClick={() => { toggleDropdown('telemetry'); playBip(); }}>
                <div className="text-[8px] md:text-xs text-gray-400 mb-1 md:mb-2">KP INDEX</div>
                <div className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-0.5 md:mb-1">{data.kpIndex?.kpValue.toFixed(1) || '0.0'}</div>
                <div className={`text-[10px] md:text-sm font-bold ${status.color}`}>{status.text}</div>
              </div>
              <div className="text-center p-2 md:p-4 bg-black/40 rounded-lg md:rounded-xl border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer" onClick={() => { toggleDropdown('ai'); playBip(); }}>
                <div className="text-[8px] md:text-xs text-gray-400 mb-1 md:mb-2">VISIBILITY</div>
                <div className="text-2xl md:text-4xl lg:text-5xl font-black text-cyan-400 mb-0.5 md:mb-1">{visibility?.percentage || 0}%</div>
                <div className="text-[10px] md:text-sm font-bold text-cyan-300 truncate">{visibility?.quality || 'Unknown'}</div>
              </div>
              <div className="text-center p-2 md:p-4 bg-black/40 rounded-lg md:rounded-xl border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer" onClick={() => { toggleDropdown('solar'); playBip(); }}>
                <div className="text-[8px] md:text-xs text-gray-400 mb-1 md:mb-2">SOLAR WIND</div>
                <div className="text-2xl md:text-4xl lg:text-5xl font-black text-purple-400 mb-0.5 md:mb-1">{data.solarWind?.speed || 0}</div>
                <div className="text-[10px] md:text-sm font-bold text-purple-300">km/s</div>
              </div>
            </div>
            
            <div className="pt-3 md:pt-4 border-t border-white/10">
              <p className="text-sm md:text-lg lg:text-xl font-mono text-center text-cyan-400">
                🌌 SYSTEM ONLINE // {selectedLocation.name.toUpperCase()}
              </p>
              <p className="text-xs text-center text-gray-500 mt-2">Click cards above for detailed data</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-red-500/20 border border-red-500/50 rounded-lg max-w-4xl w-full animate-pulse">
              <p className="text-red-400 text-xs md:text-sm text-center font-bold">⚠️ {error}</p>
              <button onClick={() => { refetch(); playBip(); }} className="mt-2 w-full px-4 py-2 bg-red-500/30 hover:bg-red-500/40 border border-red-400/50 rounded text-xs font-bold transition-all">
                RETRY CONNECTION
              </button>
            </div>
          )}
        </div>

        <div className="bg-black/70 backdrop-blur-xl border-t border-white/10 px-3 md:px-6 py-2 md:py-3 text-[10px] md:text-xs text-gray-400 font-mono flex flex-col md:flex-row items-center justify-between gap-1 md:gap-2">
          <div className="text-center md:text-left">🛰️ NOAA SWPC // AUTO-REFRESH: 15MIN</div>
          <div className="text-center md:text-right truncate max-w-full">{data.kpIndex?.timestamp && new Date(data.kpIndex.timestamp).toISOString()}</div>
        </div>
      </div>
    </div>
  );
}