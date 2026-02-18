/**
 * Oracle Module - The Metrics Room
 * 2D dashboard with AI predictions, metrics, and Grid Guardian scores
 */

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Wind, Zap, Thermometer, Radio } from 'lucide-react';
import { useLiveSpaceWeather } from '../hooks/useLiveSpaceWeather';
import { convertUTCToLocal, getSeverityColor } from '../utils/timeConverter';
import { isSolarFlareActive } from '../services/liveDataService';
import { DataExportButton } from './DataExportButton';

interface MetricTileProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  isHighKp: boolean;
}

function MetricTile({ icon, label, value, unit, status, isHighKp }: MetricTileProps) {
  const statusColors = {
    normal: 'border-green-500 bg-green-500/10',
    warning: 'border-yellow-500 bg-yellow-500/10',
    critical: 'border-red-500 bg-red-500/10'
  };

  return (
    <div 
      className={`
        backdrop-blur-md border-2 rounded-lg p-4 neon-glow-hover
        ${statusColors[status]}
        ${isHighKp ? 'animate-pulse' : ''}
        transition-all duration-300
      `}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-cyan-400">{icon}</div>
        <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white font-mono">{value}</span>
        <span className="text-gray-500 text-sm font-mono">{unit}</span>
      </div>
    </div>
  );
}

function GridGuardianGauge({ score }: { score: number }) {
  const getColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#fbbf24'; // Yellow
    if (score >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <div className="holo-card p-6">
      <h3 className="neon-cyan font-mono text-sm uppercase tracking-widest mb-4 text-center">
        Grid Guardian Score
      </h3>
      
      {/* Circular gauge */}
      <div className="relative w-48 h-48 mx-auto">
        <svg viewBox="0 0 200 200" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#1f2937"
            strokeWidth="20"
          />
          {/* Progress circle */}
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={getColor(score)}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 80}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - score / 100) }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 10px ${getColor(score)})`
            }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className="text-5xl font-bold text-white font-mono"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {Math.round(score)}
          </motion.span>
          <span className="text-gray-400 text-xs font-mono mt-1">RESILIENCE</span>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 font-mono">
          {score >= 80 ? '✅ OPTIMAL GRID STATUS' :
           score >= 60 ? '⚠️ MODERATE RISK' :
           score >= 40 ? '⚠️ HIGH RISK' :
           '🚨 CRITICAL THREAT'}
        </p>
      </div>
    </div>
  );
}

export function OracleModule() {
  const { data, isLoading, dataAge } = useLiveSpaceWeather();
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [gridScore, setGridScore] = useState(85);

  // Calculate API quality based on data age
  const quality = isLoading ? 'loading' : 
                  dataAge < 10 ? 'excellent' : 
                  dataAge < 60 ? 'good' : 
                  'degraded';

  useEffect(() => {
    // Generate forecast data (mock for now - will use ML model later)
    const now = Date.now();
    const historical = Array.from({ length: 12 }, (_, i) => ({
      time: new Date(now - (12 - i) * 3600000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      actual: Math.max(0, Math.min(9, (data?.kpIndex || 3) + (Math.random() - 0.5) * 2)),
      predicted: null
    }));

    const future = Array.from({ length: 6 }, (_, i) => ({
      time: new Date(now + (i + 1) * 3600000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      actual: null,
      predicted: Math.max(0, Math.min(9, (data?.kpIndex || 3) + (Math.random() - 0.5) * 3))
    }));

    setForecastData([...historical, ...future]);

    // Calculate Grid Guardian score based on current conditions
    const kp = data?.kpIndex || 0;
    const solarWind = data?.solarWind?.speed || 400;
    const score = Math.max(0, 100 - (kp * 8) - ((solarWind - 400) / 10));
    setGridScore(score);
  }, [data]);

  const kpValue = data?.kpIndex || 0;
  const isHighKp = kpValue > 5;
  const hasActiveFlare = isSolarFlareActive(data);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 lg:p-12 h-full overflow-y-auto pointer-events-auto wolf-scroll obsidian-bg">
      {/* Header */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 aurora-text">
            THE ORACLE
          </h1>
          <p className="text-cyan-400/70 font-mono tracking-wider">
            Wolf-Senses • Neural Forecast • Grid Guardian
          </p>
        </div>
        <DataExportButton
          data={{
            kpIndex: data?.kpIndex,
            solarWind: data?.solarWind,
            solar: data?.solar,
            gridScore,
            forecastData,
            timestamp: new Date().toISOString()
          }}
          filename="oracle-metrics"
          label="ORACLE DATA"
        />
      </header>

      {/* Wolf-Senses Grid */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-amber-400 mb-4 font-mono tracking-widest">
          WOLF-SENSES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="metric-panel holo-card">
            <div className="metric-label">Proton Density</div>
            <div className="metric-value">{data?.solarWind.density?.toFixed(2) || 'N/A'}</div>
            <div className="text-xs text-gray-500 mt-1">p/cm³</div>
          </div>
          <div className="metric-panel holo-card">
            <div className="metric-label">X-Ray Flux</div>
            <div className="metric-value">{data?.solar.xrayFlux || 'C1.0'}</div>
            <div className="text-xs text-gray-500 mt-1">Class</div>
          </div>
          <div className="metric-panel holo-card">
            <div className="metric-label">Magnetopause</div>
            <div className="metric-value">{(9.5 + Math.random()).toFixed(1)}</div>
            <div className="text-xs text-gray-500 mt-1">Earth Radii</div>
          </div>
        </div>
      </section>

      {/* Active Solar Prominences */}
      {hasActiveFlare && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-red-400 mb-4 font-mono tracking-widest neon-red animate-pulse">
            ⚠️ ACTIVE SOLAR PROMINENCE
          </h2>
          <div className="holo-card p-6 border-red-500/30">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-lg font-bold text-red-400">Solar Flare Detected</div>
                <div className="text-sm text-cyan-400/70 font-mono">
                  Real-time NOAA SWPC Alert
                </div>
              </div>
              <div className="px-3 py-1 rounded bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-bold">
                ACTIVE
              </div>
            </div>
            
            {data?.alerts
              .filter(alert => alert.type === 'flare' || alert.type === 'CME')
              .slice(0, 3)
              .map((alert, idx) => (
                <div key={idx} className="metric-panel mb-3 last:mb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm font-mono text-cyan-400">{alert.message}</div>
                      <div className="text-xs text-gray-500 mt-1">{alert.localTime}</div>
                    </div>
                    <div 
                      className="px-2 py-1 rounded text-xs font-bold"
                      style={{ 
                        backgroundColor: `${getSeverityColor(alert.timestamp)}22`,
                        color: getSeverityColor(alert.timestamp)
                      }}
                    >
                      {alert.severity.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Main content */}
      <div className="space-y-8">
        {/* Forecast Window */}
        <div className="holo-card p-6">
          <h2 className="aurora-text-static font-mono text-lg uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity size={20} />
            Neural Storm Forecast
          </h2>
          
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d946ef" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis 
                dataKey="time" 
                stroke="#6b7280"
                style={{ fontSize: '12px', fontFamily: 'monospace' }}
              />
              <YAxis 
                stroke="#6b7280"
                domain={[0, 9]}
                ticks={[0, 3, 5, 7, 9]}
                style={{ fontSize: '12px', fontFamily: 'monospace' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid #06b6d4',
                  borderRadius: '8px',
                  fontFamily: 'monospace'
                }}
              />
              <Legend 
                wrapperStyle={{ fontFamily: 'monospace', fontSize: '14px' }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#06b6d4"
                strokeWidth={3}
                fill="url(#actualGradient)"
                name="Actual Kp"
                dot={{ fill: '#06b6d4', r: 4 }}
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#d946ef"
                strokeWidth={3}
                strokeDasharray="5 5"
                fill="url(#predictedGradient)"
                name="AI Predicted"
                dot={{ fill: '#d946ef', r: 4 }}
              />
              {/* Storm threshold lines */}
              <line y1="5" y2="5" stroke="#f59e0b" strokeDasharray="3 3" />
              <line y1="7" y2="7" stroke="#ef4444" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Grid Guardian Gauge */}
        <div>
          <GridGuardianGauge score={gridScore} />
        </div>

        {/* Data Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricTile
            icon={<Wind size={24} />}
            label="Solar Wind Speed"
            value={data?.solarWind?.speed?.toFixed(1) || '---'}
            unit="km/s"
            status={
              (data?.solarWind?.speed || 0) > 600 ? 'critical' :
              (data?.solarWind?.speed || 0) > 500 ? 'warning' :
              'normal'
            }
            isHighKp={isHighKp}
          />
          
          <MetricTile
            icon={<Activity size={24} />}
            label="Proton Density"
            value={data?.solarWind?.density?.toFixed(1) || '---'}
            unit="p/cm³"
            status={
              (data?.solarWind?.density || 0) > 15 ? 'warning' :
              'normal'
            }
            isHighKp={isHighKp}
          />
          
          <MetricTile
            icon={<Thermometer size={24} />}
            label="Temperature"
            value={data?.solarWind?.temperature ? (data.solarWind.temperature / 1000).toFixed(0) : '---'}
            unit="×10³ K"
            status="normal"
            isHighKp={isHighKp}
          />
          
          <MetricTile
            icon={<Zap size={24} />}
            label="IMF Bz"
            value={data?.solarWind?.bz?.toFixed(1) || '---'}
            unit="nT"
            status={
              (data?.solarWind?.bz || 0) < -10 ? 'critical' :
              (data?.solarWind?.bz || 0) < -5 ? 'warning' :
              'normal'
            }
            isHighKp={isHighKp}
          />
        </div>
      </div>
    </div>
  );
}
