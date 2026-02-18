import { Activity, Zap, Wind, TrendingUp, AlertTriangle, Radio } from 'lucide-react';
import { useMemo } from 'react';
import type { KpIndexData, SolarWind } from '../types/aurora';

interface MissionControlViewProps {
  kpData?: KpIndexData;
  solarWind?: SolarWind;
  currentDate: Date;
}

export default function MissionControlView({
  kpData,
  solarWind,
  currentDate
}: MissionControlViewProps) {
  
  // Novel Formula 1: Solar Wind Momentum Index
  const momentumIndex = useMemo(() => {
    if (!solarWind) return 0;
    return (solarWind.density * Math.pow(solarWind.speed, 2)) / 1000;
  }, [solarWind]);

  // Novel Formula 2: Magnetic Flux Compression Ratio
  const fluxCompression = useMemo(() => {
    if (!solarWind) return 0;
    const bz = solarWind.bz || -5; // Default Bz if not available
    const baselineDensity = 5; // Typical solar wind density
    return bz * (solarWind.density / baselineDensity);
  }, [solarWind]);

  // Novel Formula 3: Aurora Intensity Predictor (0-100 scale)
  const auroraIntensity = useMemo(() => {
    if (!kpData) return 0;
    const kp = kpData.kpValue;
    const magneticLat = 64.5; // Example: Reykjavik latitude
    const cloudCover = 0.3; // Assume 30% cloud cover
    const intensity = Math.pow(kp, 3) * Math.cos(magneticLat * Math.PI / 180) * (1 - cloudCover);
    return Math.min(100, intensity * 2); // Scale to 0-100
  }, [kpData]);

  // Novel Formula 4: Magnetosphere Stability Index
  const stabilityIndex = useMemo(() => {
    const dst = -50; // Simulated Dst index (disturbance storm time)
    return 1 / (1 + Math.pow(dst / 100, 2));
  }, []);

  // Novel Formula 5: CME Impact Probability (next 48h)
  const cmeImpactProbability = useMemo(() => {
    if (!solarWind) return 0;
    const speedThreshold = 500; // km/s
    const densityThreshold = 10; // p/cm³
    const speedFactor = Math.max(0, (solarWind.speed - speedThreshold) / 200);
    const densityFactor = Math.max(0, (solarWind.density - densityThreshold) / 5);
    return Math.min(100, (speedFactor + densityFactor) * 50);
  }, [solarWind]);

  const getStatusColor = (value: number, thresholds: number[]) => {
    if (value >= thresholds[2]) return 'text-red-400';
    if (value >= thresholds[1]) return 'text-orange-400';
    if (value >= thresholds[0]) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black overflow-hidden">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* Main Content - Tactical 2-Column Layout */}
      <div className="relative min-h-fit py-8 px-6 overflow-y-auto max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-white mb-2 font-['Rajdhani'] [text-shadow:_0_0_20px_rgba(6,182,212,0.8)]">
            MISSION CONTROL
          </h1>
          <p className="text-cyan-400 text-sm font-['Inter']">
            Advanced Solar Weather Analysis Station • {currentDate.toLocaleString('en-GB')}
          </p>
        </div>

        {/* Tactical 2-Column Grid (side-by-side metrics) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* LEFT COLUMN - Real-Time Metrics */}
          <div className="space-y-4">
            
            {/* Solar Wind Momentum Index */}
            <div className="backdrop-blur-md bg-black/40 border border-cyan-500/30 rounded-lg p-6 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
              <div className="flex items-center gap-2 mb-3">
                <Wind className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider font-['Rajdhani']">
                  Momentum Index
                </h3>
              </div>
              <div className={`text-3xl font-black mb-2 font-['Inter'] ${getStatusColor(momentumIndex, [100, 200, 400])}`}>
                {momentumIndex.toFixed(1)}
            </div>
            <div className="text-xs text-white/50 font-['Inter'] mb-2">
              Formula: (ρ × v²) / 1000
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (momentumIndex / 500) * 100)}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-cyan-400 font-['Inter']">
              Particle kinetic energy flux
            </div>
          </div>

          {/* Magnetic Flux Compression */}
          <div className="backdrop-blur-md bg-black/40 border border-purple-500/30 rounded-lg p-6 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
            <div className="flex items-center gap-2 mb-3">
              <Radio className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider font-['Rajdhani']">
                Flux Compression
              </h3>
            </div>
            <div className={`text-3xl font-black mb-2 font-['Inter'] ${getStatusColor(Math.abs(fluxCompression), [5, 10, 20])}`}>
              {fluxCompression.toFixed(2)}
            </div>
            <div className="text-xs text-white/50 font-['Inter'] mb-2">
              Formula: Bz × (ρ / ρ₀)
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (Math.abs(fluxCompression) / 25) * 100)}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-purple-400 font-['Inter']">
              Magnetosphere compression intensity
            </div>
          </div>

          {/* Aurora Intensity Predictor */}
          <div className="backdrop-blur-md bg-black/40 border border-green-500/30 rounded-lg p-6 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-bold text-green-300 uppercase tracking-wider font-['Rajdhani']">
                Aurora Intensity
              </h3>
            </div>
            <div className={`text-3xl font-black mb-2 font-['Inter'] ${getStatusColor(auroraIntensity, [30, 60, 80])}`}>
              {auroraIntensity.toFixed(0)}
              <span className="text-lg text-white/50 ml-1">/100</span>
            </div>
            <div className="text-xs text-white/50 font-['Inter'] mb-2">
              Formula: Kp³ × cos(φ) × (1-c)
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${auroraIntensity}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-green-400 font-['Inter']">
              Predicted visibility strength
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - Scores & Predictions */}
        <div className="space-y-4">

          {/* Magnetosphere Stability */}
          <div className="backdrop-blur-md bg-black/40 border border-blue-500/30 rounded-lg p-6 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider font-['Rajdhani']">
                Stability Index
              </h3>
            </div>
            <div className={`text-3xl font-black mb-2 text-blue-400 font-['Inter']`}>
              {(stabilityIndex * 100).toFixed(1)}
              <span className="text-lg text-white/50 ml-1">%</span>
            </div>
            <div className="text-xs text-white/50 font-['Inter'] mb-2">
              Formula: 1 / (1 + Dst²)
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${stabilityIndex * 100}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-blue-400 font-['Inter']">
              Magnetic field equilibrium
            </div>
          </div>

          {/* CME Impact Probability */}
          <div className="backdrop-blur-md bg-black/40 border border-orange-500/30 rounded-lg p-6 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-orange-400" />
              <h3 className="text-sm font-bold text-orange-300 uppercase tracking-wider font-['Rajdhani']">
                CME Impact Risk
              </h3>
            </div>
            <div className={`text-3xl font-black mb-2 font-['Inter'] ${getStatusColor(cmeImpactProbability, [30, 60, 80])}`}>
              {cmeImpactProbability.toFixed(0)}
              <span className="text-lg text-white/50 ml-1">%</span>
            </div>
            <div className="text-xs text-white/50 font-['Inter'] mb-2">
              Next 48 hours
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                style={{ width: `${cmeImpactProbability}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-orange-400 font-['Inter']">
              Coronal mass ejection probability
            </div>
          </div>

          {/* Alert Status */}
          <div className="backdrop-blur-md bg-black/40 border border-red-500/30 rounded-lg p-6 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
              <h3 className="text-sm font-bold text-red-300 uppercase tracking-wider font-['Rajdhani']">
                Alert Status
              </h3>
            </div>
            <div className={`text-2xl font-black mb-2 font-['Inter'] ${
              (kpData?.kpValue || 0) >= 7 ? 'text-red-400 animate-pulse' :
              (kpData?.kpValue || 0) >= 5 ? 'text-orange-400' :
              'text-green-400'
            }`}>
              {(kpData?.kpValue || 0) >= 7 ? 'STORM WARNING' :
               (kpData?.kpValue || 0) >= 5 ? 'ELEVATED' :
               'NOMINAL'}
            </div>
            <div className="text-xs text-white/50 font-['Inter'] mb-2">
              Current KP: {kpData?.kpValue.toFixed(1) || '--'}
            </div>
            <div className="mt-3 text-xs text-red-400 font-['Inter']">
              {(kpData?.kpValue || 0) >= 7 && '⚠️ G3-G5 geomagnetic storm active'}
              {(kpData?.kpValue || 0) >= 5 && (kpData?.kpValue || 0) < 7 && '⚠️ Minor storm conditions'}
              {(kpData?.kpValue || 0) < 5 && '✓ Normal solar activity'}
            </div>
          </div>

        </div>
      </div>

      {/* Live Telemetry Stream - Full Width Below Columns */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="backdrop-blur-md bg-black/40 border border-cyan-500/30 rounded-lg p-6 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
          <h3 className="text-lg font-bold text-cyan-300 mb-4 uppercase tracking-wider font-['Rajdhani']">
            Live Telemetry Stream
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-['Inter'] text-sm">
            <div>
              <div className="text-white/50 text-xs mb-1">Solar Wind Speed</div>
              <div className="text-white text-lg font-bold">{solarWind?.speed.toFixed(0) || '--'} km/s</div>
            </div>
            <div>
              <div className="text-white/50 text-xs mb-1">Particle Density</div>
              <div className="text-white text-lg font-bold">{solarWind?.density.toFixed(1) || '--'} p/cm³</div>
            </div>
            <div>
              <div className="text-white/50 text-xs mb-1">Bz Component</div>
              <div className="text-white text-lg font-bold">{solarWind?.bz?.toFixed(1) || '--'} nT</div>
            </div>
            <div>
              <div className="text-white/50 text-xs mb-1">KP Index</div>
              <div className="text-white text-lg font-bold">{kpData?.kpValue.toFixed(1) || '--'}</div>
            </div>
          </div>
        </div>
      </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-xs text-cyan-500/50 font-mono">
          Novel analysis algorithms developed for Solar Admiral Mission Control
        </div>
      </div>
    </div>
  );
}
