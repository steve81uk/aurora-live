import { Activity, Wind, TrendingUp, Info } from 'lucide-react';
import type { KpIndexData, SolarWind, ForecastData, AuroraVisibility } from '../types/aurora';
import { DataDashboard } from './DataDashboard';
import { SolarWindDisplay } from './SolarWindDisplay';
import { ForecastTimeline } from './ForecastTimeline';

interface DataSidebarProps {
  kpData?: KpIndexData;
  solarWind?: SolarWind;
  forecast?: ForecastData;
  visibility?: AuroraVisibility;
}

export function DataSidebar({ kpData, solarWind, forecast, visibility }: DataSidebarProps) {
  const getKpStatus = () => {
    const kp = kpData?.kpValue || 0;
    if (kp < 3) return { text: 'QUIET', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (kp < 5) return { text: 'ACTIVE', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (kp < 7) return { text: 'STORM', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { text: 'SEVERE', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const status = getKpStatus();

  return (
    <div className="h-full backdrop-blur-xl bg-black/60 border-l border-white/10 overflow-y-auto">
      <div className="p-6 space-y-6">
        <section role="region" aria-label="Primary Telemetry">
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border border-cyan-400/30 ${status.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-cyan-400 tracking-wider">KP INDEX</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color} border border-current`}>
                  {status.text}
                </span>
              </div>
              <div className="text-4xl font-black text-white mb-2">
                {kpData?.kpValue.toFixed(1) || '0.0'}
              </div>
              <div className="text-sm text-cyan-100">
                Planetary K-Index
              </div>
            </div>

            <div className="p-4 rounded-lg border border-cyan-400/30 bg-purple-500/10">
              <div className="flex items-center gap-2 mb-3">
                <Wind className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-purple-400 tracking-wider">SOLAR WIND</h3>
              </div>
              <div className="text-4xl font-black text-white mb-2">
                {solarWind?.speed || 0}
              </div>
              <div className="text-sm text-cyan-100">
                km/s
              </div>
            </div>

            <div className="p-4 rounded-lg border border-cyan-400/30 bg-blue-500/10">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-blue-400 tracking-wider">VISIBILITY</h3>
              </div>
              <div className="text-4xl font-black text-white mb-2">
                {visibility?.percentage || 0}%
              </div>
              <div className="text-sm text-cyan-100">
                {visibility?.quality || 'Unknown'}
              </div>
            </div>
          </div>
        </section>

        <section role="region" aria-label="Solar Wind Travel Information" className="p-4 rounded-lg border border-cyan-400/30 bg-cyan-500/5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-cyan-400 mb-2 tracking-wider">SOLAR WIND TRAVEL TIME</h3>
              <p className="text-xs text-cyan-100 leading-relaxed">
                Solar wind particles travel approximately 150 million km from the Sun to Earth. 
                At current speed ({solarWind?.speed || 400} km/s), the travel time is approximately{' '}
                <span className="font-bold text-cyan-400">
                  {((150000000 / ((solarWind?.speed || 400) * 60 * 60 * 24))).toFixed(1)} days
                </span>.
                Coronal Mass Ejections (CMEs) can arrive faster and trigger geomagnetic storms.
              </p>
            </div>
          </div>
        </section>

        <section role="region" aria-label="Detailed Telemetry Data">
          <div className="p-4 rounded-lg border border-white/10 bg-black/40">
            <h3 className="text-sm font-bold text-cyan-400 mb-4 tracking-wider">DETAILED DATA</h3>
            <DataDashboard kpData={kpData} visibility={visibility} />
          </div>
        </section>

        <section role="region" aria-label="Solar Wind Parameters">
          <div className="p-4 rounded-lg border border-white/10 bg-black/40">
            <h3 className="text-sm font-bold text-cyan-400 mb-4 tracking-wider">SOLAR WIND ANALYSIS</h3>
            <SolarWindDisplay solarWind={solarWind} />
          </div>
        </section>

        <section role="region" aria-label="Aurora Forecast Timeline">
          <div className="p-4 rounded-lg border border-white/10 bg-black/40">
            <h3 className="text-sm font-bold text-cyan-400 mb-4 tracking-wider">3-DAY FORECAST</h3>
            <ForecastTimeline predictions={forecast?.prediction || []} />
          </div>
        </section>

        <footer className="pt-4 border-t border-white/10 text-xs text-cyan-100/60 text-center">
          <div>🛰️ NOAA SWPC DATA FEED</div>
          <div className="mt-1">{kpData?.timestamp && new Date(kpData.timestamp).toISOString()}</div>
        </footer>
      </div>
    </div>
  );
}
